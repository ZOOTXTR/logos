import { doc, getDoc, setDoc, collection, query, where, getDocs, increment, serverTimestamp } from 'firebase/firestore';
import { Share, Platform } from 'react-native';
import { getFirebaseDb, FIRESTORE_COLLECTIONS } from '../config/firebase';
import { getCurrentUser, getUserProfile } from './auth.service';
import { addGems } from './storage.service';

const REFERRAL_BONUS_GEMS = 50;
const REFERRER_BONUS_GEMS = 75;

export async function getMyReferralCode(): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;

  try {
    const profile = await getUserProfile(user.uid);
    return (profile?.referralCode as string) ?? null;
  } catch {
    return null;
  }
}

export async function shareReferralLink(): Promise<boolean> {
  const code = await getMyReferralCode();
  if (!code) return false;

  const link = `https://zovtex.com/join?ref=${code}`;
  const message = `🎮 Join me on Logos! Use my invite code: ${code}\n${link}\n💎 You get ${REFERRAL_BONUS_GEMS} free gems!`;

  try {
    await Share.share({ message, title: 'Logos Invite' });
    return true;
  } catch {
    return false;
  }
}

export async function claimReferral(code: string): Promise<{ success: boolean; message: string }> {
  const user = getCurrentUser();
  if (!user) return { success: false, message: 'Sign in first!' };

  try {
    const db = getFirebaseDb();

    const usersRef = collection(db, FIRESTORE_COLLECTIONS.USERS);
    const q = query(usersRef, where('referralCode', '==', code.toUpperCase()));
    const snap = await getDocs(q);

    if (snap.empty) return { success: false, message: 'Invalid referral code!' };

    const referrer = snap.docs[0];
    if (referrer.id === user.uid) return { success: false, message: "You can't use your own code!" };

    const referralRef = doc(db, FIRESTORE_COLLECTIONS.REFERRALS, `${referrer.id}_${user.uid}`);
    const existing = await getDoc(referralRef);
    if (existing.exists()) return { success: false, message: 'Code already claimed!' };

    await setDoc(referralRef, {
      referrerId: referrer.id,
      claimerId: user.uid,
      claimedAt: serverTimestamp(),
      bonusGiven: true,
    });

    await addGems(REFERRAL_BONUS_GEMS);
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, user.uid), {
      referredBy: referrer.id,
    }, { merge: true });

    return { success: true, message: `🎉 You got ${REFERRAL_BONUS_GEMS} free gems!` };
  } catch (e) {
    console.warn('Referral claim failed:', e);
    return { success: false, message: 'Something went wrong. Try again!' };
  }
}
