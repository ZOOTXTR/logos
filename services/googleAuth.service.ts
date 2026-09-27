import { Platform } from 'react-native';
import GooglePlayGames, { GooglePlayGamesPlayer } from 'react-native-google-play-games';

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
