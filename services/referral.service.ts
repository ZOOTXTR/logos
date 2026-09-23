import { doc, getDoc, setDoc, collection, query, where, getDocs, increment, serverTimestamp } from 'firebase/firestore';
import { Share, Platform } from 'react-native';
import { getFirebaseDb, FIRESTORE_COLLECTIONS, getFirebaseFunctions } from '../config/firebase';
import { getCurrentUser, getUserProfile } from './auth.service';
import { addGems } from './storage.service';
import { httpsCallable } from 'firebase/functions';

const REFERRAL_BONUS_GEMS = 50;

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
    const claimFn = httpsCallable<{code: string}, {success: boolean, message: string}>(getFirebaseFunctions(), 'claimReferral');
    const result = await claimFn({ code: code.toUpperCase() });
    return result.data;
  } catch (e: any) {
    console.warn('Referral claim failed:', e);
    const msg = e.message || 'Something went wrong. Try again!';
    return { success: false, message: msg };
  }
}
