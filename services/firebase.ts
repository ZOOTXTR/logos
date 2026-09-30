import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { getFirebaseAuth, getFirebaseFunctions } from '../config/firebase';

// Firebase JS SDK köprüsü. Firestore/liderlik/bulut işlemleri:
//   config/firebase.ts + services/*.service.ts
// Bu dosyada yalnızca: anonim giriş + hesap silme (callable).

const isConfigValid = Boolean(
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY && process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
);

const getAuth = () => getFirebaseAuth();

// Anonim giriş (kalıcı oturum — config/firebase.ts persistence kullanır).
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

// Sunucu tarafında tüm kişisel veriyi silen callable (Admin SDK).
export async function deleteAccount(): Promise<boolean> {
  try {
    const fn = httpsCallable<Record<string, never>, { success: boolean }>(
      getFirebaseFunctions(),
      'deleteAccount'
    );
    await fn({});
    await getAuth().currentUser?.delete();
    return true;
  } catch (e) {
    console.warn('deleteAccount error:', e);
    return false;
  }
}
