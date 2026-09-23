import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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
        await createUserProfile(result.user);
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
  const auth = getFirebaseAuth();
  try {
    const user = auth.currentUser;
    if (user && !user.isAnonymous) {
      // Zaten kalıcı bir hesap: yalnızca giriş yap
      await signInWithEmailAndPassword(auth, email, password);
      notifyListeners(auth.currentUser);
      return true;
    }
    if (user) {
      // Anonim kullanıcıya e-posta kimliğini BAĞLA (uid, XP ve ilerleme korunur)
      const credential = EmailAuthProvider.credential(email, password);
      const linked = await linkWithCredential(user, credential);
      await storageSet(AUTH_UID_KEY, linked.user.uid);
      notifyListeners(linked.user);
      return true;
    }
    const created = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(created.user);
    await storageSet(AUTH_UID_KEY, created.user.uid);
    notifyListeners(created.user);
    return true;
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    // E-posta zaten bir hesaba bağlıysa mevcut hesaba giriş yap
    if (code === 'auth/email-already-in-use') {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        notifyListeners(auth.currentUser);
        return true;
      } catch {
        return false;
      }
    }
    return false;
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

export async function deleteAccount(): Promise<boolean> {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (user) {
      const db = getFirebaseDb();
      // Sunucu tarafı kişisel verileri (best-effort) sil
      try { await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.CLOUD_SAVES, user.uid)); } catch { /* yoksay */ }
      try { await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, user.uid)); } catch { /* yoksay */ }
      try { await user.delete(); } catch { /* yeniden kimlik doğrulama gerekebilir */ }
    }
    await storageRemove(AUTH_UID_KEY);
    notifyListeners(null);
    return true;
  } catch (e) {
    console.warn('deleteAccount failed:', e);
    return false;
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
