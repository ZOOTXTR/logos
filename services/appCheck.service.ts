import { Platform } from 'react-native';
import appCheck from '@react-native-firebase/app-check';

// Firebase App Check — Android'de Google Play Integrity, iOS'ta App Attest
// (DeviceCheck fallback) sağlayıcısıyla çalışır. Etkinleştirildiğinde Firebase
// istekleri (Firestore/Functions) doğrulanır ve sahte istemciler engellenir.
//
// Gereksinimler:
//  - Cloud projesinde Play Integrity API etkin (logos-game-c82f3 ✓)
//  - Uygulamanın Google Play'den kurulu olması (üretim). Sideload/dev'de debug
//    sağlayıcısı kullanılır (Firebase Console'da debug token onaylanmalı).
let initialized = false;

export async function initAppCheck(): Promise<void> {
  if (initialized) return;
  if (Platform.OS === 'web') return;
  initialized = true;
  try {
    const provider = appCheck().newReactNativeFirebaseAppCheckProvider();
    provider.configure({
      android: { provider: __DEV__ ? 'debug' : 'playIntegrity' },
      apple: { provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback' },
    });
    await appCheck().initializeAppCheck({ provider, isTokenAutoRefreshEnabled: true });
    if (!__DEV__) {
      // Token'ı önden al (ilk Firebase isteğinde gecikme olmasın)
      try { await appCheck().getToken(false); } catch { /* önemsiz */ }
    }
  } catch (e) {
    // Play Integrity sideload build'de başarısız olabilir; uygulamayı bloklamayız.
    console.warn('App Check init failed:', e);
  }
}

export async function getAppCheckToken(): Promise<string | null> {
  try {
    const { token } = await appCheck().getToken();
    return token;
  } catch (e) {
    console.warn('App Check token failed:', e);
    return null;
  }
}
