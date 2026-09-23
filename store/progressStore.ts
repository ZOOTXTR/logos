import { create } from 'zustand';
import {
  addGems as addGemsStorage, spendGems as spendGemsStorage,
  getGems, isPremium, setPremium,
  getXP, addXP as addXPStorage,
  getStreak, updateStreak,
  getStats, updateStats,
  getUnlockedAchievements, unlockAchievement,
  getUnlockedCategories, unlockCategory as unlockCategoryStorage,
  hasDoneDaily,
  addScore, ScoreEntry,
} from '../services/storage.service';
import { submitScore } from '../services/leaderboard.service';
import { getLevelFromXP, LevelInfo, XP_REWARDS } from '../constants/levels';
import { getNewAchievements, Achievement, AchievementStats } from '../constants/achievements';

export interface RecordWinOptions {
  guesses: number;
  mode: string;
  difficulty: string;
  category: string;
  isSpeed: boolean;
  isExpert: boolean;
  isPerfect: boolean;
  isDaily: boolean;
  elapsedSeconds: number;
  xpEarned: number;
  gemsEarned?: number;
}

interface ProgressState {
  gems: number;
  premium: boolean;
  xp: number;
  levelInfo: LevelInfo | null;
  streak: { current: number; max: number };
  unlockedAchievements: string[];
  unlockedCategories: string[];
  newAchievement: Achievement | null;
  dailyDone: boolean;
  hydrated: boolean;
  hydrationError: boolean;
  hydrate: () => Promise<void>;
  addGems: (amount: number) => Promise<number>;
  spendGems: (amount: number) => Promise<boolean>;
  earnXP: (amount: number) => Promise<number>;
  unlockPremium: () => Promise<void>;
  unlockCategory: (cat: string) => Promise<string[]>;
  purchaseCategory: (cat: string, cost: number) => Promise<boolean>;
  recordWin: (opts: RecordWinOptions) => Promise<void>;
  recordLoss: () => Promise<void>;
  clearNewAchievement: () => void;
  refreshDaily: () => Promise<void>;
}

let hydrationStarted = false;

export const useProgressStore = create<ProgressState>((set, get) => ({
  gems: 150,
  premium: false,
  xp: 0,
  levelInfo: null,
  streak: { current: 0, max: 0 },
  unlockedAchievements: [],
  unlockedCategories: ['random', 'hayvanlar', 'yiyecek', 'spor'],
  newAchievement: null,
  dailyDone: false,
  hydrated: false,
  hydrationError: false,

  hydrate: async () => {
    if (hydrationStarted) return;
    hydrationStarted = true;
    try {
      const [g, p, x, s, ua, uc, daily] = await Promise.all([
        getGems(), isPremium(), getXP(), getStreak(),
        getUnlockedAchievements(), getUnlockedCategories(), hasDoneDaily(),
      ]);
      set({
        gems: g,
        premium: p,
        xp: x,
        levelInfo: getLevelFromXP(x),
        streak: s,
        unlockedAchievements: ua,
        unlockedCategories: uc,
        dailyDone: daily,
      });
    } catch (e) {
      console.error('Failed to hydrate progress store:', e);
      set({ hydrationError: true });
    } finally {
      set({ hydrated: true });
    }
  },

  addGems: async (amount) => {
    try {
      const next = await addGemsStorage(amount);
      set({ gems: next });
      return next;
    } catch (e) {
      console.error('addGems failed:', e);
      return get().gems;
    }
  },

  spendGems: async (amount) => {
    try {
      const result = await spendGemsStorage(amount);
      if (result.success) set({ gems: result.remaining });
      return result.success;
    } catch (e) {
      console.error('spendGems failed:', e);
      return false;
    }
  },

  earnXP: async (amount) => {
    try {
      const next = await addXPStorage(amount);
      set({ xp: next, levelInfo: getLevelFromXP(next) });
      return next;
    } catch (e) {
      console.error('earnXP failed:', e);
      return get().xp;
    }
  },

  unlockPremium: async () => {
    try {
      await setPremium(true);
      const next = await addGemsStorage(500);
      set({ premium: true, gems: next });
    } catch (e) {
      console.error('unlockPremium failed:', e);
    }
  },

  unlockCategory: async (cat) => {
    try {
      const uc = await unlockCategoryStorage(cat);
      set({ unlockedCategories: uc });
      return uc;
    } catch (e) {
      console.error('unlockCategory failed:', e);
      return get().unlockedCategories;
    }
  },

  purchaseCategory: async (cat, cost) => {
    try {
      const spent = await spendGemsStorage(cost);
      if (!spent.success) return false;
      const uc = await unlockCategoryStorage(cat);
      set({ gems: spent.remaining, unlockedCategories: uc });
      return true;
    } catch (e) {
      console.error('purchaseCategory failed:', e);
      return false;
    }
  },

  recordWin: async (opts) => {
    try {
      const streakResult = await updateStreak(true);
      const currentStreak = { current: streakResult.current, max: streakResult.max };
      set({ streak: currentStreak });

      if (streakResult.bonusGems > 0) {
        const freshGems = await getGems();
        set({ gems: freshGems });
      }

      const streakXpBonus = streakResult.bonusGems > 0
        ? (XP_REWARDS.STREAK_BONUS[streakResult.current as keyof typeof XP_REWARDS.STREAK_BONUS] ?? 0)
        : 0;
      if (streakXpBonus > 0) {
        const freshXP = await addXPStorage(streakXpBonus);
        set({ xp: freshXP, levelInfo: getLevelFromXP(freshXP) });
      }

      // Tek yazıcı: taban XP ve gem burada bir kez eklenir
      if (opts.xpEarned > 0) {
        const freshXP = await addXPStorage(opts.xpEarned);
        set({ xp: freshXP, levelInfo: getLevelFromXP(freshXP) });
      }
      if (opts.gemsEarned && opts.gemsEarned > 0) {
        const freshGems = await addGemsStorage(opts.gemsEarned);
        set({ gems: freshGems });
      }

      const stats = await getStats();
      const categoriesWon = [...new Set([...stats.categoriesWon, opts.category])];
      const hour = new Date().getHours();
      const isNight = hour < 6;

      await updateStats({
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: stats.gamesWon + 1,
        speedModeWins: stats.speedModeWins + (opts.isSpeed ? 1 : 0),
        expertModeWins: stats.expertModeWins + (opts.isExpert ? 1 : 0),
        perfectGames: stats.perfectGames + (opts.isPerfect ? 1 : 0),
        dailyChallengesCompleted: stats.dailyChallengesCompleted + (opts.isDaily ? 1 : 0),
        categoriesWon,
        lateNightGames: stats.lateNightGames + (isNight ? 1 : 0),
        totalXP: stats.totalXP + opts.xpEarned + streakXpBonus,
        guessDistribution: {
          ...stats.guessDistribution,
          [opts.guesses]: (stats.guessDistribution[opts.guesses] || 0) + 1,
        },
      });

      const [updatedStats, currentGems, currentPremium, currentXP, currentUnlocked] = await Promise.all([
        getStats(), getGems(), isPremium(), getXP(), getUnlockedAchievements(),
      ]);

      const currentLevelInfo = getLevelFromXP(currentXP);
      const achievementStats: AchievementStats = {
        ...updatedStats,
        gems: currentGems,
        level: currentLevelInfo.level,
        isPremium: currentPremium,
        categoriesWon: new Set(updatedStats.categoriesWon),
        currentStreak: streakResult.current,
        maxStreak: streakResult.max,
      };
      const newlyUnlocked = getNewAchievements(achievementStats, currentUnlocked);
      if (newlyUnlocked.length > 0) {
        let rewardGems = 0;
        let rewardXP = 0;
        for (const a of newlyUnlocked) {
          await unlockAchievement(a.id);
          rewardGems += a.rewardGems ?? 0;
          rewardXP += a.rewardXP ?? 0;
        }
        if (rewardGems > 0) await addGemsStorage(rewardGems);
        if (rewardXP > 0) await addXPStorage(rewardXP);
        const [freshGems, freshXP] = await Promise.all([getGems(), getXP()]);
        set({
          gems: freshGems,
          xp: freshXP,
          levelInfo: getLevelFromXP(freshXP),
          unlockedAchievements: [...currentUnlocked, ...newlyUnlocked.map(a => a.id)],
          newAchievement: newlyUnlocked[0],
        });
      }
      
      try {
        const entry: ScoreEntry = {
          date: new Date().toISOString(),
          mode: opts.mode || 'classic',
          category: opts.category || 'random',
          guesses: opts.guesses,
          timeSeconds: opts.elapsedSeconds,
          xpEarned: opts.xpEarned + streakXpBonus,
        };
        await addScore(entry);
        await submitScore(entry);
      } catch {
        // yerel kayıt tutuldu; bulut skoru başarısız olsa da oyunu etkilemez
      }
    } catch (e) {
      console.error('recordWin failed:', e);
    }
  },

  recordLoss: async () => {
    try {
      const stats = await getStats();
      await updateStats({ gamesPlayed: stats.gamesPlayed + 1 });
      // Reset streak on loss
      const streakResult = await updateStreak(false);
      set({ streak: { current: streakResult.current, max: streakResult.max } });
    } catch (e) {
      console.error('recordLoss failed:', e);
    }
  },

  clearNewAchievement: () => set({ newAchievement: null }),

  refreshDaily: async () => {
    const daily = await hasDoneDaily();
    set({ dailyDone: daily });
  },
}));
