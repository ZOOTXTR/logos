import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REQUIRED_ENV_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

const missingKeys = REQUIRED_ENV_KEYS.filter((k) => !process.env[k]);
if (missingKeys.length > 0) {
  // Sessiz bozulma yerine net hata: .env doldurulmalı ve build'e dahil edilmeli.
  throw new Error(`Firebase yapılandırması eksik: ${missingKeys.join(', ')}. .env dosyasını doldurun.`);
}

const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID as string,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
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
    // Oturum kalıcılığı: web'de tarayıcı, native'de AsyncStorage.
    const persistence = Platform.OS === 'web'
      ? browserLocalPersistence
      : getReactNativePersistence(AsyncStorage);
    auth = initializeAuth(getFirebaseApp(), { persistence });
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
