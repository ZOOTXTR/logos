import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'YOUR_PROJECT.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'YOUR_PROJECT_ID',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'YOUR_PROJECT.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID ?? '000000000000',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:000000000000:web:xxxxxxxxxxxxxx',
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    // Oturum kalıcılığı: AsyncStorage ile persist. Aksi halde her açılışta
    // anonim UID değişir ve sunucu tarafı veri (premium/gem/skor) tutarsız olur.
    auth = initializeAuth(getFirebaseApp(), {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    // RN'de "client is offline" hatasını önlemek için uzun yoklama (XHR) kullan.
    db = initializeFirestore(getFirebaseApp(), {
      experimentalForceLongPolling: true,
    });
  }
  return db;
}

let functionsInstance: Functions | undefined;
export function getFirebaseFunctions(): Functions {
  if (!functionsInstance) {
    functionsInstance = getFunctions(getFirebaseApp());
  }
  return functionsInstance;
}

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  SCORES: 'scores',
  FEEDBACK: 'feedback',
  REFERRALS: 'referrals',
  CLOUD_SAVES: 'cloud_saves',
  DUELS: 'duels',
} as const;
