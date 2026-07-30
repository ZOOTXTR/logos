import { collection, query, orderBy, limit, getDocs, addDoc, where, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb, FIRESTORE_COLLECTIONS } from '../config/firebase';
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

    const db = getFirebaseDb();
    const points = calculateScore(entry);

    await addDoc(collection(db, FIRESTORE_COLLECTIONS.SCORES), {
      uid: user.uid,
      displayName: `Player_${user.uid.slice(0, 6)}`,
      score: points,
      mode: entry.mode,
      guesses: entry.guesses,
      timeSeconds: entry.timeSeconds ?? 0,
      xpEarned: entry.xpEarned,
      date: entry.date,
      createdAt: serverTimestamp(),
    });

    return true;
  } catch (e) {
    console.warn('Failed to submit score:', e);
    return false;
  }
}

function calculateScore(entry: ScoreEntry): number {
  let points = entry.xpEarned;
  if (entry.guesses > 0) points += Math.max(0, 6 - entry.guesses) * 10;
  if (entry.timeSeconds && entry.timeSeconds < 30) points += 50;
  return points;
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
