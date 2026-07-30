import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb, FIRESTORE_COLLECTIONS } from '../config/firebase';
import { storageGet, storageSet, storageRemove } from './storage.service';

const AUTH_UID_KEY = 'gq_auth_uid';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

let currentUser: User | null = null;
let authListeners: Array<(user: User | null) => void> = [];

export function onAuthStateChanged(callback: (user: User | null) => void) {
  authListeners.push(callback);
  return () => { authListeners = authListeners.filter(l => l !== callback); };
}

function notifyListeners(user: User | null) {
  currentUser = user;
  authListeners.forEach(l => l(user));
}

export async function initAuth(): Promise<User | null> {
  try {
    const auth = getFirebaseAuth();
    const savedUid = await storageGet(AUTH_UID_KEY);

    if (savedUid) {
      try {
        const result = await signInAnonymously(auth);
        notifyListeners(result.user);
        return result.user;
      } catch {
        await storageRemove(AUTH_UID_KEY);
      }
    }

    const result = await signInAnonymously(auth);
    await storageSet(AUTH_UID_KEY, result.user.uid);
    await createUserProfile(result.user);
    notifyListeners(result.user);
    return result.user;
  } catch (e) {
    console.warn('Auth init failed:', e);
    notifyListeners(null);
    return null;
  }
}

async function createUserProfile(user: User) {
  try {
    const db = getFirebaseDb();
    const ref = doc(db, FIRESTORE_COLLECTIONS.USERS, user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        displayName: `Player_${user.uid.slice(0, 6)}`,
        totalXP: 0,
        gamesPlayed: 0,
        referralCode: generateReferralCode(user.uid),
      });
    }
  } catch (e) {
    console.warn('Failed to create user profile:', e);
  }
}

function generateReferralCode(uid: string): string {
  return uid.slice(0, 8).toUpperCase();
}

export async function linkEmail(email: string, password: string): Promise<boolean> {
  try {
    const auth = getFirebaseAuth();
    await createUserWithEmailAndPassword(auth, email, password);
    notifyListeners(auth.currentUser);
    return true;
  } catch {
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      notifyListeners(auth.currentUser);
      return true;
    } catch {
      return false;
    }
  }
}

export async function logout(): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    await signOut(auth);
    await storageRemove(AUTH_UID_KEY);
    notifyListeners(null);
  } catch (e) {
    console.warn('Logout failed:', e);
  }
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export async function getUserProfile(uid: string) {
  try {
    const db = getFirebaseDb();
    const ref = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}
