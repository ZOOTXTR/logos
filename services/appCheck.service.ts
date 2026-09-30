import { Platform } from 'react-native';
import appCheck from '@react-native-firebase/app-check';
import { initializeAppCheck, CustomProvider } from 'firebase/app-check';
import { getFirebaseApp } from '../config/firebase';

// Firebase App Check — Android'de Google Play Integrity, iOS'ta App Attest
// (DeviceCheck fallback) sağlayıcısıyla çalışır. Zorunlu (enforced) Firebase
// istekleri doğrulanır ve sahte istemciler engellenir.
//
// ÖNEMLİ: Uygulama Firestore/Auth/Functions için Firebase **JS SDK** kullanır,
// App Check ise RNFirebase (native) ile sağlanır. JS SDK isteklerine token
// eklenmezse enforcement istekleri reddeder ("Missing or insufficient
// permissions"). Bu yüzden native token, JS SDK'ya bir CustomProvider köprüsü
// ile bağlanır.
//
// Gereksinimler:
//  - Cloud projesinde Play Integrity API etkin (logos-game-c82f3 ✓)
//  - Firebase Android uygulamasında imza SHA-1/SHA-256 kayıtlı (✓)
//  - Uygulamanın Google Play'den kurulu olması (Play Integrity şartı)
let initialized = false;

export async function initAppCheck(): Promise<void> {
  if (initialized) return;
  if (Platform.OS === 'web') return;
  initialized = true;
  try {
    // 1) Native sağlayıcı (Play Integrity / App Attest)
    const provider = appCheck().newReactNativeFirebaseAppCheckProvider();
    provider.configure({
      android: { provider: __DEV__ ? 'debug' : 'playIntegrity' },
      apple: { provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback' },
    });
    await appCheck().initializeAppCheck({ provider, isTokenAutoRefreshEnabled: true });

    // 2) JS SDK köprüsü: native token'ı JS SDK (Firestore/Auth/Functions)
    //    isteklerine ekle. Böylece App Check enforcement etkin olduğunda da
    //    istekler geçerli bir token taşır.
    const jsProvider = new CustomProvider({
      getToken: async () => {
        const { token } = await appCheck().getToken();
        // RNFirebase son kullanma zamanını vermez; App Check token'ları ~1 saat
        // geçerlidir. Erken yenileme için 30 dk'lık güvenli bir pencere kullan.
        return { token, expireTimeMillis: Date.now() + 30 * 60 * 1000 };
      },
    });
    initializeAppCheck(getFirebaseApp(), {
      provider: jsProvider,
      isTokenAutoRefreshEnabled: true,
    });

    // Token'ı önden al (ilk Firebase isteğinde gecikme olmasın).
    try { await appCheck().getToken(false); } catch { /* önemsiz */ }
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
