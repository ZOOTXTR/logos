import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import { defineSecret } from "firebase-functions/params";

admin.initializeApp();
const db = admin.firestore();

const PLAY_SERVICE_ACCOUNT = defineSecret("PLAY_SERVICE_ACCOUNT");
const PACKAGE_NAME = "com.zovtex.logos";

// Sunucu tarafı ürün beyaz listesi (istemciye güvenilmez)
const ALLOWED_PRODUCTS = new Set<string>([
  "gems_100", "gems_250", "gems_500", "gems_1200", "gems_3000", "premium_monthly",
]);

// 1. Liderlik tablosu için sunucu tarafı skor hesaplama (temel anti-cheat)
export const submitScore = functions.onCall({ region: "us-central1" }, async (request) => {
  const { auth, data } = request;
  if (!auth) throw new functions.HttpsError("unauthenticated", "Giriş yapmalısınız.");

  const guesses = Number(data?.guesses);
  const timeSeconds = Number(data?.timeSeconds);
  const xpEarned = Number(data?.xpEarned);
  const mode = typeof data?.mode === "string" ? data.mode.slice(0, 24) : "classic";
  const category = typeof data?.category === "string" ? data.category.slice(0, 24) : "random";

  // Tip ve aralık doğrulaması (NaN/sonsuz/negatif reddedilir)
  if (!Number.isFinite(guesses) || guesses < 0 || guesses > 20) {
    throw new functions.HttpsError("invalid-argument", "Geçersiz tahmin sayısı.");
  }
  if (!Number.isFinite(timeSeconds) || timeSeconds < 0 || timeSeconds > 3600) {
    throw new functions.HttpsError("invalid-argument", "Geçersiz süre.");
  }
  if (!Number.isFinite(xpEarned) || xpEarned < 0 || xpEarned > 2000) {
    throw new functions.HttpsError("invalid-argument", "Geçersiz XP.");
  }

  let points = Math.round(xpEarned);
  if (guesses > 0) points += Math.max(0, 6 - guesses) * 10;
  if (timeSeconds > 0 && timeSeconds < 30) points += 50;

  if (points > 5000) throw new functions.HttpsError("out-of-range", "Geçersiz skor.");

  const playerName = `Player_${auth.uid.slice(0, 6)}`;
  await db.collection("scores").add({
    uid: auth.uid,
    score: points,
    mode,
    category,
    guesses,
    timeSeconds,
    xpEarned,
    // Hem eski hem yeni şema alan adları yazılır (istemci uyumu)
    playerName,
    displayName: playerName,
    date: new Date().toISOString(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, score: points };
});

// 2. Zaman yolculuğunu engellemek için sunucu saati (Time-Travel Protection)
export const getServerTime = functions.onCall({ region: "us-central1" }, (request) => {
  if (!request.auth) throw new functions.HttpsError("unauthenticated", "Giriş yapmalısınız.");
  return {
    serverDateString: new Date().toDateString(),
    timestamp: Date.now(),
  };
});

// 3. Güvenli referans sistemi (davet eden ve davet edilen kazanır) — atomik
export const claimReferral = functions.onCall({ region: "us-central1" }, async (request) => {
  const { auth, data } = request;
  if (!auth) throw new functions.HttpsError("unauthenticated", "Giriş yapmalısınız.");

  const rawCode = data?.code;
  if (typeof rawCode !== "string") {
    throw new functions.HttpsError("invalid-argument", "Referans kodu eksik.");
  }
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,16}$/.test(code)) {
    throw new functions.HttpsError("invalid-argument", "Geçersiz referans kodu.");
  }

  const usersRef = db.collection("users");
  const q = usersRef.where("referralCode", "==", code).limit(1);
  const snap = await q.get();
  if (snap.empty) throw new functions.HttpsError("not-found", "Geçersiz referans kodu.");

  const referrer = snap.docs[0];
  if (referrer.id === auth.uid) {
    throw new functions.HttpsError("already-exists", "Kendi kodunuzu kullanamazsınız.");
  }

  // Referans doc id deterministik → yarış koşullarında bile tek kayıt
  const referralRef = db.collection("referrals").doc(`${referrer.id}_${auth.uid}`);

  await db.runTransaction(async (tx) => {
    const existing = await tx.get(referralRef);
    if (existing.exists) {
      throw new functions.HttpsError("already-exists", "Kod zaten kullanıldı.");
    }
    tx.set(referralRef, {
      referrerId: referrer.id,
      claimerId: auth.uid,
      claimedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Ödül dokümanları da deterministik id ile (çift ödül imkânsız)
    const claimerReward = db.collection("users").doc(auth.uid).collection("rewards").doc(`ref_claim_${referrer.id}`);
    tx.set(claimerReward, { type: "gems", amount: 50, reason: "referral_claimed", createdAt: admin.firestore.FieldValue.serverTimestamp() });
    const referrerReward = db.collection("users").doc(referrer.id).collection("rewards").doc(`ref_bonus_${auth.uid}`);
    tx.set(referrerReward, { type: "gems", amount: 75, reason: "referral_bonus", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });

  return { success: true, message: "Referans başarılı! Ödüller hesaplara bırakıldı." };
});

// 4. Güvenli IAP fiş doğrulaması (Google Play) — replay korumalı
export const verifyPurchase = functions.onCall(
  { region: "us-central1", secrets: [PLAY_SERVICE_ACCOUNT] },
  async (request) => {
    const { auth, data } = request;
    if (!auth) throw new functions.HttpsError("unauthenticated", "Giriş yapmalısınız.");

    const productId = data?.productId;
    const purchaseToken = data?.purchaseToken;
    const isSubscription = !!data?.isSubscription;

    if (typeof productId !== "string" || typeof purchaseToken !== "string" || !productId || !purchaseToken) {
      throw new functions.HttpsError("invalid-argument", "productId ve purchaseToken zorunludur.");
    }
    if (!ALLOWED_PRODUCTS.has(productId)) {
      throw new functions.HttpsError("invalid-argument", "Bilinmeyen ürün.");
    }

    // Replay koruması: aynı token daha önce işlendiyse reddet
    const receiptRef = db.collection("iap_receipts").doc(purchaseToken.slice(0, 256));
    const receiptSnap = await receiptRef.get();
    if (receiptSnap.exists) {
      throw new functions.HttpsError("already-exists", "Bu satın alma zaten işlendi.");
    }

    const credentials = PLAY_SERVICE_ACCOUNT.value();
    if (!credentials) {
      console.error("CRITICAL: PLAY_SERVICE_ACCOUNT secret bulunamadı.");
      throw new functions.HttpsError("internal", "Sunucu doğrulama yapılandırması eksik.");
    }

    try {
      const authClient = new google.auth.GoogleAuth({
        credentials: JSON.parse(credentials),
        scopes: ["https://www.googleapis.com/auth/androidpublisher"],
      });
      const play = google.androidpublisher({ version: "v3", auth: authClient });

      let verified = false;
      if (isSubscription) {
        const res = await play.purchases.subscriptionsv2.get({ packageName: PACKAGE_NAME, token: purchaseToken });
        verified = res.data.subscriptionState === "SUBSCRIPTION_STATE_ACTIVE";
      } else {
        const res = await play.purchases.products.get({ packageName: PACKAGE_NAME, productId, token: purchaseToken });
        verified = res.data.purchaseState === 0;
      }

      if (verified) {
        await receiptRef.set({
          uid: auth.uid,
          productId,
          isSubscription,
          verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return { success: true, verified };
    } catch (err) {
      // İç hata detayını istemciye sızdırma
      console.error("IAP doğrulama hatası:", err);
      throw new functions.HttpsError("internal", "Doğrulama başarısız.");
    }
  }
);
