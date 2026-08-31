import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseDb, FIRESTORE_COLLECTIONS } from '../config/firebase';
import { getGems, getXP, getStats, getStreak, getUnlockedAchievements, getScores, getUnlockedCategories, isPremium } from './storage.service';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface UserProgressData {
  gems: number;
  xp: number;
  level: number;
  unlockedThemes: string[];
  isPremium: boolean;
  unlockedAchievements: string[];
  lastSavedAt: string;
}

export interface CloudScoreEntry {
  id: string;
  playerName?: string;
  photoURL?: string;
  mode: string;
  category?: string;
  score: number;
}

class CloudService {
  private getDb() {
    return getFirebaseDb();
  }

  async syncToCloud(userId: string, data: UserProgressData): Promise<boolean> {
    try {
      const db = this.getDb();
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.CLOUD_SAVES, userId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Firestore syncToCloud failed, falling back to AsyncStorage:', error);
      try {
        await AsyncStorage.setItem(`gq_cloud_db_${userId}`, JSON.stringify(data));
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      } catch (fallbackError) {
        console.error('AsyncStorage fallback also failed:', fallbackError);
        return false;
      }
    }
  }

  async restoreFromCloud(userId: string): Promise<UserProgressData | null> {
    try {
      const db = this.getDb();
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.CLOUD_SAVES, userId));
      if (snap.exists()) {
        return snap.data() as UserProgressData;
      }
      return null;
    } catch (error) {
      console.error('Firestore restoreFromCloud failed, falling back to AsyncStorage:', error);
      try {
        const val = await AsyncStorage.getItem(`gq_cloud_db_${userId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return val ? JSON.parse(val) as UserProgressData : null;
      } catch (fallbackError) {
        console.error('AsyncStorage fallback also failed:', fallbackError);
        return null;
      }
    }
  }

  async syncStorageToCloud(email: string): Promise<boolean> {
    const isChild = await AsyncStorage.getItem('gq_age_gate_passed');
    if (isChild === 'child') return false; // COPPA block

    try {
      const [gems, premium, xp, stats, streakResult, achievements, scores, categories] = await Promise.all([
        getGems(),
        isPremium(),
        getXP(),
        getStats(),
        getStreak(),
        getUnlockedAchievements(),
        getScores(),
        getUnlockedCategories(),
      ]);

      const payload = {
        gems,
        isPremium: premium,
        xp,
        level: 1,
        unlockedThemes: categories,
        unlockedAchievements: achievements,
        stats,
        streak: streakResult.current,
        maxStreak: streakResult.max,
        scores,
        lastSavedAt: new Date().toISOString(),
      };

      try {
        const db = this.getDb();
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.CLOUD_SAVES, email), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        return true;
      } catch (firestoreError) {
        console.error('Firestore syncStorageToCloud failed, falling back to AsyncStorage:', firestoreError);
        await AsyncStorage.setItem(`gq_cloud_db_${email}`, JSON.stringify(payload));
        await new Promise(resolve => setTimeout(resolve, 800));
        return true;
      }
    } catch (e) {
      console.error('syncStorageToCloud failed:', e);
      return false;
    }
  }

  async restoreStorageFromCloud(email: string): Promise<boolean> {
    let data: Record<string, unknown>;
    try {
      const db = this.getDb();
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.CLOUD_SAVES, email));
      if (!snap.exists()) return false;
      data = snap.data() as Record<string, unknown>;
    } catch (error) {
      console.error('Firestore restoreStorageFromCloud failed, falling back to AsyncStorage:', error);
      try {
        const val = await AsyncStorage.getItem(`gq_cloud_db_${email}`);
        if (!val) return false;
        data = JSON.parse(val);
      } catch (fallbackError) {
        console.error('AsyncStorage fallback also failed:', fallbackError);
        return false;
      }
    }

    try {
      await Promise.all([
        AsyncStorage.setItem('gq_gems', String(data.gems ?? 150)),
        AsyncStorage.setItem('gq_premium', String(!!data.isPremium)),
        AsyncStorage.setItem('gq_xp', String(data.xp ?? 0)),
        AsyncStorage.setItem('gq_achievements', JSON.stringify(data.unlockedAchievements ?? [])),
        AsyncStorage.setItem('gq_unlocked_categories', JSON.stringify(data.unlockedThemes ?? [])),
      ]);
      if (data.stats) await AsyncStorage.setItem('gq_stats', JSON.stringify(data.stats));
      if (typeof data.streak === 'number') await AsyncStorage.setItem('gq_streak', String(data.streak));
      if (typeof data.maxStreak === 'number') await AsyncStorage.setItem('gq_max_streak', String(data.maxStreak));
      if (data.scores) await AsyncStorage.setItem('gq_scores', JSON.stringify(data.scores));
      return true;
    } catch (e) {
      console.error('Restore storage from cloud failed:', e);
      return false;
    }
  }

  async submitFeedback(email: string, message: string, rating: number): Promise<boolean> {
    const isChild = await AsyncStorage.getItem('gq_age_gate_passed');
    if (isChild === 'child') return false; // COPPA block

    try {
      const db = this.getDb();
      await addDoc(collection(db, FIRESTORE_COLLECTIONS.FEEDBACK), {
        email,
        message,
        rating,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Firestore submitFeedback failed:', error);
      try {
        const key = `gq_feedback_${Date.now()}`;
        await AsyncStorage.setItem(key, JSON.stringify({ email, message, rating, createdAt: new Date().toISOString() }));
        await new Promise(resolve => setTimeout(resolve, 800));
        return true;
      } catch (fallbackError) {
        console.error('AsyncStorage fallback failed:', fallbackError);
        return false;
      }
    }
  }

  async submitScore(score: number, mode: string = 'classic', category: string = 'random'): Promise<boolean> {
    try {
      const db = this.getDb();
      await addDoc(collection(db, FIRESTORE_COLLECTIONS.SCORES), {
        score,
        mode,
        category,
        playerName: 'Anonim',
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (e) {
      console.warn('submitScore failed:', e);
      return false;
    }
  }

  async getTopScores(limitCount: number = 20): Promise<CloudScoreEntry[]> {
    try {
      const db = this.getDb();
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.SCORES),
        orderBy('score', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const entries: CloudScoreEntry[] = [];
      snapshot.forEach(d => {
        const data = d.data();
        entries.push({
          id: d.id,
          playerName: data.playerName || data.displayName || 'Anonim',
          photoURL: data.photoURL,
          mode: data.mode || 'classic',
          category: data.category || 'random',
          score: data.score || 0,
        });
      });
      return entries;
    } catch (e) {
      console.warn('getTopScores failed:', e);
      return [];
    }
  }
}

export const cloudService = new CloudService();
