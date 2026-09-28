import { useEffect, useSyncExternalStore } from 'react';
import {
  getGems, addGems as addGemsStorage, spendGems as spendGemsStorage,
  isPremium, setPremium, getXP, addXP as addXPStorage,
  getStreak, updateStreak, getStats, updateStats, getUnlockedAchievements,
  getUnlockedCategories, unlockCategory as unlockCategoryStorage,
  unlockAchievement, addScore, ScoreEntry,
} from '../services/storage.service';
import { submitScore } from '../services/leaderboard.service';
import { getLevelFromXP, LevelInfo } from '../constants/levels';
import { getNewAchievements, Achievement, AchievementStats } from '../constants/achievements';
import { incrementQuestProgress } from '../services/dailyQuests.service';

export interface ProgressState {
  gems: number;
  premium: boolean;
  xp: number;
  levelInfo: LevelInfo | null;
  streak: { current: number; max: number };
  unlockedAchievements: string[];
  unlockedCategories: string[];
  newAchievement: Achievement | null;
  loading: boolean;
}

// ── Paylaşılan (tekil) store ──────────────────────────────────────────────
// useProgress daha önce her çağrıldığında ayrı bir state tutuyordu; bu yüzden
// bir ekranda kazanılan gem diğer ekranlarda (mağaza, ana ekran) ANINDA
// görünmüyordu. Artık tüm ekranlar aynı store'a abone.
let state: ProgressState = {
  gems: 150,
  premium: false,
  xp: 0,
  levelInfo: null,
  streak: { current: 0, max: 0 },
  unlockedAchievements: [],
  unlockedCategories: ['random', 'hayvanlar', 'yiyecek', 'spor'],
  newAchievement: null,
  loading: true,
};

const listeners = new Set<() => void>();
const emit = () => { listeners.forEach((l) => l()); };
const setState = (patch: Partial<ProgressState>) => { state = { ...state, ...patch }; emit(); };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const getSnapshot = () => state;

let loadPromise: Promise<void> | null = null;
function loadOnce(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const [g, p, x, s, ua, uc] = await Promise.all([
        getGems(), isPremium(), getXP(), getStreak(), getUnlockedAchievements(), getUnlockedCategories(),
      ]);
      setState({ gems: g, premium: p, xp: x, levelInfo: getLevelFromXP(x), streak: s, unlockedAchievements: ua, unlockedCategories: uc });
    } catch (e) {
      console.error('Failed to load progress:', e);
    } finally {
      setState({ loading: false });
    }
  })();
  return loadPromise;
}

const addGems = async (amount: number): Promise<number> => {
  try {
    const next = await addGemsStorage(amount);
    setState({ gems: next });
    return next;
  } catch (e) {
    console.error('addGems failed:', e);
    return state.gems;
  }
};

const spendGems = async (amount: number): Promise<boolean> => {
  try {
    const result = await spendGemsStorage(amount);
    if (result.success) setState({ gems: result.remaining });
    return result.success;
  } catch (e) {
    console.error('spendGems failed:', e);
    return false;
  }
};

const earnXP = async (amount: number): Promise<number> => {
  try {
    const next = await addXPStorage(amount);
    setState({ xp: next, levelInfo: getLevelFromXP(next) });
    return next;
  } catch (e) {
    console.error('earnXP failed:', e);
    return state.xp;
  }
};

const unlockPremium = async (): Promise<void> => {
  try {
    // Zaten premium ise 500 gem bonusunu TEKRAR verme (restore ile gem üretimini önler).
    const already = await isPremium();
    await setPremium(true);
    setState({ premium: true });
    if (!already) await addGems(500);
  } catch (e) {
    console.error('unlockPremium failed:', e);
  }
};

const recordWin = async (opts: {
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
}): Promise<void> => {
  try {
    const streakResult = await updateStreak(true);
    setState({ streak: { current: streakResult.current, max: streakResult.max } });

    if (streakResult.bonusGems > 0) {
      const freshGems = await getGems();
      setState({ gems: freshGems });
    }

    // Tek yazıcı: taban XP ve gem burada bir kez eklenir
    if (opts.xpEarned > 0) {
      const nx = await addXPStorage(opts.xpEarned);
      setState({ xp: nx, levelInfo: getLevelFromXP(nx) });
    }
    if (opts.gemsEarned && opts.gemsEarned > 0) {
      const ng = await addGemsStorage(opts.gemsEarned);
      setState({ gems: ng });
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
      gamesPlayedByDifficulty: {
        ...stats.gamesPlayedByDifficulty,
        [opts.difficulty]: (stats.gamesPlayedByDifficulty[opts.difficulty] || 0) + 1,
      },
      gamesWonByDifficulty: {
        ...stats.gamesWonByDifficulty,
        [opts.difficulty]: (stats.gamesWonByDifficulty[opts.difficulty] || 0) + 1,
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
      let rewardGems = 0;
      let rewardXP = 0;
      for (const a of newlyUnlocked) {
        await unlockAchievement(a.id);
        rewardGems += a.rewardGems ?? 0;
        rewardXP += a.rewardXP ?? 0;
      }
      if (rewardGems > 0) {
        const ng = await addGemsStorage(rewardGems);
        setState({ gems: ng });
      }
      if (rewardXP > 0) {
        const nx = await addXPStorage(rewardXP);
        setState({ xp: nx, levelInfo: getLevelFromXP(nx) });
      }
      const ua = [...currentUnlocked, ...newlyUnlocked.map(a => a.id)];
      setState({ unlockedAchievements: ua, newAchievement: newlyUnlocked[0] });
    }

    try {
      const entry: ScoreEntry = {
        date: new Date().toISOString(),
        mode: opts.mode || 'classic',
        category: opts.category || 'random',
        guesses: opts.guesses,
        timeSeconds: opts.elapsedSeconds,
        xpEarned: opts.xpEarned,
        difficulty: opts.difficulty,
      };
      await addScore(entry);
      await submitScore(entry);
    } catch {
      // bulut skoru başarısız olsa da yerel kayıt tutuldu
    }

    try {
      await incrementQuestProgress('quest-words');
      await incrementQuestProgress('quest-win');
      if (opts.isSpeed) await incrementQuestProgress('quest-blitz');
    } catch {
      // görev ilerlemesi kritik değil
    }
  } catch (e) {
    console.error('recordWin failed:', e);
  }
};

const recordLoss = async (difficulty: string = 'normal'): Promise<void> => {
  try {
    await updateStreak(false);
    setState({ streak: { ...state.streak, current: 0 } });
    const stats = await getStats();
    await updateStats({
      gamesPlayed: stats.gamesPlayed + 1,
      gamesPlayedByDifficulty: {
        ...stats.gamesPlayedByDifficulty,
        [difficulty]: (stats.gamesPlayedByDifficulty[difficulty] || 0) + 1,
      },
    });
  } catch (e) {
    console.error('recordLoss failed:', e);
  }
};

const clearNewAchievement = () => setState({ newAchievement: null });

const unlockCategory = async (cat: string): Promise<string[]> => {
  try {
    const uc = await unlockCategoryStorage(cat);
    setState({ unlockedCategories: uc });
    return uc;
  } catch (e) {
    console.error('unlockCategory failed:', e);
    return state.unlockedCategories;
  }
};

export function useProgress() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => { loadOnce(); }, []);
  return {
    ...s,
    addGems,
    spendGems,
    earnXP,
    unlockPremium,
    unlockCategory,
    recordWin,
    recordLoss,
    clearNewAchievement,
  };
}
