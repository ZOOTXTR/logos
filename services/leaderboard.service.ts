import { httpsCallable } from 'firebase/functions';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { getFirebaseDb, getFirebaseFunctions, FIRESTORE_COLLECTIONS } from '../config/firebase';
import { ScoreEntry } from './storage.service';
import { getCurrentUser } from './auth.service';

export interface LeaderboardEntry {
  id: string;
  uid: string;
  displayName: string;
  score: number;
  mode: string;
  date: string;
  rank?: number;
}

export async function submitScore(entry: ScoreEntry): Promise<boolean> {
  try {
    const user = getCurrentUser();
    if (!user) return false;

    // Skor sunucuda hesaplanır ve doğrulanır (Firestore kuralları istemci yazımına kapalıdır).
    const submitFn = httpsCallable<
      {
        guesses: number;
        timeSeconds: number;
        xpEarned: number;
        mode: string;
        category: string;
        playerName: string;
      },
      { success: boolean; score: number }
    >(getFirebaseFunctions(), 'submitScore');

    await submitFn({
      guesses: entry.guesses,
      timeSeconds: entry.timeSeconds ?? 0,
      xpEarned: entry.xpEarned,
      mode: entry.mode,
      category: entry.category,
      playerName: `Player_${user.uid.slice(0, 6)}`,
    });

    return true;
  } catch (e) {
    console.warn('Failed to submit score:', e);
    return false;
  }
}

export async function getGlobalLeaderboard(limitCount: number = 50): Promise<LeaderboardEntry[]> {
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, FIRESTORE_COLLECTIONS.SCORES),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    let rank = 1;
    snapshot.forEach(doc => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        uid: data.uid,
        displayName: data.displayName ?? 'Unknown',
        score: data.score,
        mode: data.mode,
        date: data.date,
        rank,
      });
      rank++;
    });
    return entries;
  } catch (e) {
    console.warn('Failed to get leaderboard:', e);
    return [];
  }
}

export async function getMyBestScores(): Promise<LeaderboardEntry[]> {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    const db = getFirebaseDb();
    const q = query(
      collection(db, FIRESTORE_COLLECTIONS.SCORES),
      where('uid', '==', user.uid),
      orderBy('score', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        uid: data.uid,
        displayName: data.displayName ?? 'Unknown',
        score: data.score,
        mode: data.mode,
        date: data.date,
      });
    });
    return entries;
  } catch (e) {
    console.warn('Failed to get my scores:', e);
    return [];
  }
}
