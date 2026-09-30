import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, EmailAuthProvider, linkWithCredential, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getFirebaseAuth, getFirebaseDb, getFirebaseFunctions, FIRESTORE_COLLECTIONS } from '../config/firebase';
import { storageSet, storageRemove } from './storage.service';
import { setUserContext, clearUserContext } from './error-reporting.service';

const AUTH_UID_KEY = 'gq_auth_uid';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

let currentUser: User | null = null;
let authListeners: Array<(user: User | null) => void> = [];

// Auth hazır olana kadar bekleyen tüketiciler (ör. Firestore okumaları).
let resolveAuthReady: (() => void) | null = null;
const authReadyPromise = new Promise<void>((res) => { resolveAuthReady = res; });

export function whenAuthReady(timeoutMs = 6000): Promise<void> {
  return Promise.race([
    authReadyPromise,
    new Promise<void>((res) => setTimeout(res, timeoutMs)),
  ]);
}

export function onAuthStateChanged(callback: (user: User | null) => void) {
  authListeners.push(callback);
  return () => { authListeners = authListeners.filter(l => l !== callback); };
}

function notifyListeners(user: User | null) {
  currentUser = user;
  // Hata raporlamada yalnızca anonim uid bağlanır (PII gönderilmez).
  if (user) { setUserContext(user.uid); resolveAuthReady?.(); } else clearUserContext();
  authListeners.forEach(l => l(user));
}

export async function initAuth(): Promise<User | null> {
  try {
    const auth = getFirebaseAuth();

    // 1) Persist edilmiş oturumu bekle. Varsa onu KULLAN (e-posta/Google girişini koru).
    //    (Eskiden her açılışta signInAnonymously çağrılıp kalıcı oturum eziliyordu.)
    const existing = await new Promise<User | null>((resolve) => {
      const unsub = firebaseOnAuthStateChanged(auth, (u) => { unsub(); resolve(u); });
    });
    if (existing) {
      await createUserProfile(existing);
      notifyListeners(existing);
      return existing;
    }

    // 2) Oturum yoksa anonim oluştur.
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

export type EmailAuthError =
  | 'email-in-use'
  | 'weak-password'
  | 'invalid-email'
  | 'wrong-credentials'
  | 'unknown';

export interface EmailAuthResult {
  ok: boolean;
  error?: EmailAuthError;
}

function mapEmailError(e: unknown): EmailAuthError {
  const code = (e as { code?: string })?.code;
  if (code === 'auth/email-already-in-use') return 'email-in-use';
  if (code === 'auth/weak-password') return 'weak-password';
  if (code === 'auth/invalid-email') return 'invalid-email';
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
    return 'wrong-credentials';
  }
  return 'unknown';
}

// Yeni hesap: anonim oturum varsa onu bağlar (uid + yerel ilerleme korunur).
export async function registerWithEmail(email: string, password: string): Promise<EmailAuthResult> {
  const auth = getFirebaseAuth();
  try {
    const user = auth.currentUser;
    if (user && user.isAnonymous) {
      const credential = EmailAuthProvider.credential(email, password);
      const linked = await linkWithCredential(user, credential);
      await storageSet(AUTH_UID_KEY, linked.user.uid);
      await createUserProfile(linked.user);
      notifyListeners(linked.user);
      return { ok: true };
    }
    const created = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(created.user);
    await storageSet(AUTH_UID_KEY, created.user.uid);
    notifyListeners(created.user);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapEmailError(e) };
  }
}

// Mevcut hesaba giriş (anonim oturumu değiştirir → bulut ilerlemesi kullanıcıya ait).
export async function signInWithEmail(email: string, password: string): Promise<EmailAuthResult> {
  const auth = getFirebaseAuth();
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    await createUserProfile(res.user);
    await storageSet(AUTH_UID_KEY, res.user.uid);
    notifyListeners(res.user);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapEmailError(e) };
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
      // Sunucu tarafında tüm kişisel veriyi (profil, bulut kaydı, IAP makbuzları,
      // referanslar ve auth kaydı) silen callable. Firestore kuralları istemci
      // silmesini engellediği için yalnızca Admin SDK ile mümkündür.
      try {
        const deleteFn = httpsCallable(getFirebaseFunctions(), 'deleteAccount');
        await deleteFn({});
      } catch (e) {
        console.warn('Server-side deleteAccount failed:', e);
        return false;
      }
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

// Gerçek oturum (anonim DEĞİL): e-posta/Google/Play Games bağlanmış mı?
// Sıralamaya girmek için gereklidir.
export function isSignedIn(): boolean {
  const u = currentUser ?? (getFirebaseAuth().currentUser as User | null);
  return Boolean(u && !u.isAnonymous);
}

export function getAuthProviderId(): string | null {
  const u = currentUser ?? (getFirebaseAuth().currentUser as User | null);
  if (!u) return null;
  return u.providerData[0]?.providerId ?? (u.isAnonymous ? 'anonymous' : null);
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
