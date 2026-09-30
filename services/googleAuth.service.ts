import { Platform } from 'react-native';
import GooglePlayGames, { GooglePlayGamesPlayer } from 'react-native-google-play-games';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, linkWithCredential, signInWithCredential } from 'firebase/auth';
import { getFirebaseAuth } from '../config/firebase';

// Firebase projesindeki Google Web OAuth client (google.com IdP yapılandırmasından).
const GOOGLE_WEB_CLIENT_ID =
  '478040450778-81ic3fm5ugqv7deqm6snoa9pvhgt2h8h.apps.googleusercontent.com';

let googleConfigured = false;
function ensureGoogleConfigured() {
  if (googleConfigured) return;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: false });
  googleConfigured = true;
}

export interface SocialSignInResult {
  ok: boolean;
  displayName?: string;
  email?: string;
}

// Google ile giriş (native Google Sign-In -> Firebase credential).
// Anonim oturum varsa uid korunacak şekilde BAĞLAR (linkWithCredential).
export async function signInWithGoogleFirebase(): Promise<SocialSignInResult> {
  if (Platform.OS === 'web') return { ok: false };
  try {
    ensureGoogleConfigured();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();
    const idToken = result?.data?.idToken ?? (result as unknown as { idToken?: string })?.idToken;
    if (!idToken) return { ok: false };

    const credential = GoogleAuthProvider.credential(idToken);
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (user && user.isAnonymous) {
      await linkWithCredential(user, credential);
    } else {
      await signInWithCredential(auth, credential);
    }
    return {
      ok: true,
      displayName: result?.data?.user?.name ?? undefined,
      email: result?.data?.user?.email ?? undefined,
    };
  } catch (e) {
    console.warn('Google sign-in failed:', e);
    return { ok: false };
  }
}

// Google Play Games (mevcut; Play Games Services yapılandırması gerektirir).
export async function signInWithGooglePlayGames(): Promise<GooglePlayGamesPlayer | null> {
  if (Platform.OS !== 'android') return null;

  try {
    const alreadyAuthenticated = await GooglePlayGames.isAuthenticated();
    if (!alreadyAuthenticated) {
      await GooglePlayGames.signIn();
    }
    const player = await GooglePlayGames.getPlayer();
    return player;
  } catch (error) {
    console.warn('Google Play Games giriş hatası:', error);
    return null;
  }
}

export async function submitLeaderboardScore(leaderboardId: string, score: number) {
  if (Platform.OS !== 'android') return;
  try {
    await GooglePlayGames.submitScore(leaderboardId, score);
  } catch (e) {
    console.warn('Skor gönderilemedi:', e);
  }
}
