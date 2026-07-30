import { useState, useEffect, useCallback } from 'react';
import {
  getGems, addGems as addGemsStorage, spendGems as spendGemsStorage,
  isPremium, setPremium, getXP, addXP as addXPStorage,
  getStreak, updateStreak, getStats, updateStats, getUnlockedAchievements,
  getUnlockedCategories, unlockCategory as unlockCategoryStorage,
  unlockAchievement,
} from '../services/storage.service';
import { getLevelFromXP, LevelInfo } from '../constants/levels';
import { getNewAchievements, Achievement, AchievementStats } from '../constants/achievements';

export function useProgress() {
  const [gems, setGems] = useState(150);
  const [premium, setPremiumState] = useState(false);
  const [xp, setXP] = useState(0);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [streak, setStreak] = useState({ current: 0, max: 0 });
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [unlockedCategories, setUnlockedCategories] = useState<string[]>(['random', 'hayvanlar', 'yiyecek', 'spor']);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [g, p, x, s, ua, uc] = await Promise.all([
          getGems(), isPremium(), getXP(), getStreak(), getUnlockedAchievements(), getUnlockedCategories(),
        ]);
        setGems(g);
        setPremiumState(p);
        setXP(x);
        setLevelInfo(getLevelFromXP(x));
        setStreak(s);
        setUnlockedAchievements(ua);
        setUnlockedCategories(uc);
      } catch (e) {
        console.error('Failed to load progress:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addGems = useCallback(async (amount: number) => {
    try {
      const next = await addGemsStorage(amount);
      setGems(next);
      return next;
    } catch (e) {
      console.error('addGems failed:', e);
      return gems;
    }
  }, [gems]);

  const spendGems = useCallback(async (amount: number) => {
    try {
      const result = await spendGemsStorage(amount);
      if (result.success) setGems(result.remaining);
      return result.success;
    } catch (e) {
      console.error('spendGems failed:', e);
      return false;
    }
  }, []);

  const earnXP = useCallback(async (amount: number) => {
    try {
      const next = await addXPStorage(amount);
      setXP(next);
      setLevelInfo(getLevelFromXP(next));
      return next;
    } catch (e) {
      console.error('earnXP failed:', e);
      return xp;
    }
  }, [xp]);

  const unlockPremium = useCallback(async () => {
    try {
      await setPremium(true);
      setPremiumState(true);
      await addGems(500);
    } catch (e) {
      console.error('unlockPremium failed:', e);
    }
  }, [addGems]);

  const recordWin = useCallback(async (opts: {
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
  }) => {
    try {
      const streakResult = await updateStreak(true);
      setStreak({ current: streakResult.current, max: streakResult.max });

      if (streakResult.bonusGems > 0) {
        const freshGems = await getGems();
        setGems(freshGems);
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
        totalXP: stats.totalXP + opts.xpEarned,
        guessDistribution: {
          ...stats.guessDistribution,
          [opts.guesses]: (stats.guessDistribution[opts.guesses] || 0) + 1,
        },
      });

      const [updatedStats, currentGems, currentPremium, currentXP, currentUnlocked] = await Promise.all([
        getStats(),
        getGems(),
        isPremium(),
        getXP(),
        getUnlockedAchievements()
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
        for (const a of newlyUnlocked) {
          await unlockAchievement(a.id);
        }
        const ua = [...currentUnlocked, ...newlyUnlocked.map(a => a.id)];
        setUnlockedAchievements(ua);
        setNewAchievement(newlyUnlocked[0]);
      }
    } catch (e) {
      console.error('recordWin failed:', e);
    }
  }, []);

  const recordLoss = useCallback(async () => {
    try {
      await updateStreak(false);
      setStreak(prev => ({ ...prev, current: 0 }));
      const stats = await getStats();
      await updateStats({ gamesPlayed: stats.gamesPlayed + 1 });
    } catch (e) {
      console.error('recordLoss failed:', e);
    }
  }, []);

  const clearNewAchievement = useCallback(() => setNewAchievement(null), []);

  const unlockCategory = useCallback(async (cat: string) => {
    try {
      const uc = await unlockCategoryStorage(cat);
      setUnlockedCategories(uc);
      return uc;
    } catch (e) {
      console.error('unlockCategory failed:', e);
      return unlockedCategories;
    }
  }, [unlockedCategories]);

  return {
    gems, premium, xp, levelInfo, streak, unlockedAchievements, unlockedCategories,
    newAchievement, loading,
    addGems, spendGems, earnXP, unlockPremium, unlockCategory,
    recordWin, recordLoss, clearNewAchievement,
  };
}
