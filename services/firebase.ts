import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseFunctions,
  FIRESTORE_COLLECTIONS,
} from '../config/firebase';
import { PlayerStats } from '../types/game';

// Bizim gerÃ§ek Firebase projesine (config/firebase.ts â†’ EXPO_PUBLIC_FIREBASE_*) baÄŸlanÄ±r.
// Lazy: auth/db yalnÄ±z Ã§aÄŸrÄ±ldÄ±ÄŸÄ±nda baÅŸlatÄ±lÄ±r (web statik export'ta Ã§Ã¶kmesin).
export const app = getFirebaseApp();

const getAuth = () => getFirebaseAuth();
const getDb = () => getFirebaseDb();

const isConfigValid = Boolean(process.env.EXPO_PUBLIC_FIREBASE_API_KEY && process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);

// Anonim giriÅŸ (kalÄ±cÄ± oturum â€” config/firebase.ts persistence kullanÄ±r)
export async function ensureAnonymousAuth(): Promise<User | null> {
  if (!isConfigValid) return null;
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      unsubscribe();
      if (user) resolve(user);
      else {
        try {
          const cred = await signInAnonymously(getAuth());
          resolve(cred.user);
        } catch (e) {
          console.warn('Firebase anonymous sign in error:', e);
          resolve(null);
        }
      }
    });
  });
}

// â”€â”€ Cloud save (Firestore) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function syncStatsToCloud(stats: PlayerStats): Promise<boolean> {
  if (!isConfigValid) return false;
  try {
    const user = getAuth().currentUser;
    if (!user) return false;
    await Promise.all([
      setDoc(doc(getDb(), FIRESTORE_COLLECTIONS.USERS, user.uid), {
        uid: user.uid,
        level: stats.level,
        gems: stats.gems,
        streak: stats.streak,
        updatedAt: serverTimestamp(),
      }, { merge: true }),
      setDoc(doc(getDb(), FIRESTORE_COLLECTIONS.CLOUD_SAVES, user.uid), {
        stats,
        syncedAt: serverTimestamp(),
      }, { merge: true }),
    ]);
    return true;
  } catch (e) {
    console.warn('Sync to cloud error:', e);
    return false;
  }
}

export async function fetchStatsFromCloud(): Promise<PlayerStats | null> {
  if (!isConfigValid) return null;
  try {
    const user = getAuth().currentUser;
    if (!user) return null;
    const snap = await getDoc(doc(getDb(), FIRESTORE_COLLECTIONS.CLOUD_SAVES, user.uid));
    if (snap.exists()) return snap.data().stats as PlayerStats;
  } catch (e) {
    console.warn('Fetch from cloud error:', e);
  }
  return null;
}

// â”€â”€ Callable Cloud Functions (sunucu-doÄŸrulamalÄ±) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function submitScore(score: number, mode: string): Promise<boolean> {
  if (!isConfigValid) return false;
  try {
    const fn = httpsCallable<
      { guesses: number; timeSeconds: number; xpEarned: number; mode: string; category: string; playerName: string },
      { success: boolean; score: number }
    >(getFirebaseFunctions(), 'submitScore');
    await fn({ guesses: 0, timeSeconds: 0, xpEarned: score, mode, category: 'random', playerName: 'Player' });
    return true;
  } catch (e) {
    console.warn('submitScore error:', e);
    return false;
  }
}

export async function getServerTime(): Promise<number> {
  try {
    const fn = httpsCallable<Record<string, never>, { timestamp: number }>(getFirebaseFunctions(), 'getServerTime');
    const res = await fn({});
    return res.data.timestamp;
  } catch {
    return Date.now();
  }
}

export async function claimReferral(code: string): Promise<{ success: boolean; gemsGranted: number }> {
  try {
    const fn = httpsCallable<{ code: string }, { success: boolean; message: string }>(getFirebaseFunctions(), 'claimReferral');
    const res = await fn({ code });
    return { success: res.data.success, gemsGranted: 50 };
  } catch {
    return { success: false, gemsGranted: 0 };
  }
}

export async function verifyPurchase(productId: string, purchaseToken?: string): Promise<boolean> {
  if (!purchaseToken) return false;
  try {
    const fn = httpsCallable<
      { productId: string; purchaseToken: string; isSubscription: boolean },
      { success: boolean; verified: boolean }
    >(getFirebaseFunctions(), 'verifyPurchase');
    const res = await fn({ productId, purchaseToken, isSubscription: productId === 'premium_monthly' });
    return Boolean(res.data.verified);
  } catch (e) {
    console.warn('verifyPurchase error:', e);
    return false;
  }
}

export async function claimWeeklyReward(): Promise<{ success: boolean; gems: number }> {
  try {
    const fn = httpsCallable<Record<string, never>, { success: boolean; prize: number; rank: number }>(getFirebaseFunctions(), 'claimWeeklyReward');
    const res = await fn({});
    return { success: res.data.success, gems: res.data.prize };
  } catch {
    return { success: false, gems: 0 };
  }
}

export async function deleteAccount(): Promise<boolean> {
  try {
    const fn = httpsCallable<Record<string, never>, { success: boolean }>(getFirebaseFunctions(), 'deleteAccount');
    await fn({});
    await getAuth().currentUser?.delete();
    return true;
  } catch (e) {
    console.warn('deleteAccount error:', e);
    return false;
  }
}
