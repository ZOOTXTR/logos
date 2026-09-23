import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseDb, getFirebaseFunctions, FIRESTORE_COLLECTIONS } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { getXP, setXP, getStats, getStreak, setStreak, getUnlockedAchievements, getScores, getUnlockedCategories, setUnlockedCategories, setPremium } from './storage.service';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getCurrentUser, getUserProfile } from './auth.service';

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

  async syncStorageToCloud(_email?: string): Promise<boolean> {
    const userId = getCurrentUser()?.uid;
    if (!userId) return false;
    const isChild = await AsyncStorage.getItem('gq_age_gate_passed');
    if (isChild === 'child') return false; // COPPA block

    try {
      const [xp, stats, streakResult, achievements, scores, categories] = await Promise.all([
        getXP(),
        getStats(),
        getStreak(),
        getUnlockedAchievements(),
        getScores(),
        getUnlockedCategories(),
      ]);

      // NOT: Ekonomi alanları (gems/isPremium) bilinçli olarak buluta YAZILMAZ.
      // Bunlar sunucu otoritesindedir; cloud_saves üzerinden forge edilemez.
      const payload = {
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
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.CLOUD_SAVES, userId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        return true;
      } catch (firestoreError) {
        console.error('Firestore syncStorageToCloud failed, falling back to AsyncStorage:', firestoreError);
        await AsyncStorage.setItem(`gq_cloud_db_${userId}`, JSON.stringify(payload));
        await new Promise(resolve => setTimeout(resolve, 800));
        return true;
      }
    } catch (e) {
      console.error('syncStorageToCloud failed:', e);
      return false;
    }
  }

  async restoreStorageFromCloud(_email?: string): Promise<boolean> {
    const userId = getCurrentUser()?.uid;
    if (!userId) return false;
    let data: Record<string, unknown>;
    try {
      const db = this.getDb();
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.CLOUD_SAVES, userId));
      if (!snap.exists()) return false;
      data = snap.data() as Record<string, unknown>;
    } catch (error) {
      console.error('Firestore restoreStorageFromCloud failed, falling back to AsyncStorage:', error);
      try {
        const val = await AsyncStorage.getItem(`gq_cloud_db_${userId}`);
        if (!val) return false;
        data = JSON.parse(val);
      } catch (fallbackError) {
        console.error('AsyncStorage fallback also failed:', fallbackError);
        return false;
      }
    }

    try {
      // Ekonomi (gems) buluttan geri YÜKLENMEZ — yalnızca yerel değer geçerlidir.
      // Premium ise yalnızca sunucudaki users/{uid}.isPremium true ise YÜKSELTİLİR
      // (asla düşürülmez; böylece mevcut aboneler etkilenmez, forge ise imkânsızdır).
      const profile = await getUserProfile(userId);
      if (profile && (profile as { isPremium?: boolean }).isPremium === true) {
        await setPremium(true);
      }
      if (typeof data.xp === 'number') await setXP(data.xp);
      await setUnlockedCategories((data.unlockedThemes as string[]) ?? []);
      if (Array.isArray(data.unlockedAchievements)) {
        await AsyncStorage.setItem('gq_achievements', JSON.stringify(data.unlockedAchievements));
      }
      if (data.stats) {
        const cloudStats = data.stats as Record<string, any>;
        const local = await getStats();
        const cats = [...new Set([...local.categoriesWon, ...((cloudStats.categoriesWon as string[]) ?? [])])];
        const cloudDist = (cloudStats.guessDistribution as Record<string, number>) ?? {};
        const distKeys = new Set<string>([...Object.keys(local.guessDistribution), ...Object.keys(cloudDist)]);
        const dist: Record<number, number> = {};
        distKeys.forEach(k => {
          dist[Number(k)] = (local.guessDistribution[Number(k)] || 0) + (cloudDist[k] || 0);
        });
        const merged = {
          ...local,
          ...cloudStats,
          categoriesWon: cats,
          guessDistribution: dist,
          gamesPlayed: Math.max(local.gamesPlayed, (cloudStats.gamesPlayed as number) ?? 0),
          gamesWon: Math.max(local.gamesWon, (cloudStats.gamesWon as number) ?? 0),
          totalXP: Math.max(local.totalXP, (cloudStats.totalXP as number) ?? 0),
        };
        await AsyncStorage.setItem('gq_stats', JSON.stringify(merged));
      }
      if (typeof data.streak === 'number') {
        await setStreak(data.streak, (typeof data.maxStreak === 'number' ? data.maxStreak : data.streak));
      }
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
      const submitFn = httpsCallable<
        { guesses: number; timeSeconds: number; xpEarned: number; mode: string; category: string; playerName: string },
        { success: boolean; score: number }
      >(getFirebaseFunctions(), 'submitScore');
      await submitFn({ guesses: 0, timeSeconds: 0, xpEarned: score, mode, category, playerName: 'Anonim' });
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
