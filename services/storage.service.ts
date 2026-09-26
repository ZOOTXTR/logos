import AsyncStorage from '@react-native-async-storage/async-storage';

let mutexPromise = Promise.resolve();

async function mutex<T>(fn: () => Promise<T>): Promise<T> {
  const prev = mutexPromise;
  let release: () => void;
  mutexPromise = new Promise<void>(resolve => { release = resolve; });
  await prev;
  try {
    return await fn();
  } finally {
    release!();
  }
}

const KEYS = {
  GEMS: 'gq_gems',
  PREMIUM: 'gq_premium',
  XP: 'gq_xp',
  STATS: 'gq_stats',
  ACHIEVEMENTS: 'gq_achievements',
  DAILY_DATE: 'gq_daily_date',
  DAILY_DONE: 'gq_daily_done',
  STREAK_DATE: 'gq_streak_date',
  STREAK_COUNT: 'gq_streak',
  MAX_STREAK: 'gq_max_streak',
  SCORES: 'gq_scores',
} as const;

export interface FullStats {
  gamesPlayed: number;
  gamesWon: number;
  speedModeWins: number;
  expertModeWins: number;
  perfectGames: number;
  dailyChallengesCompleted: number;
  categoriesWon: string[];
  lateNightGames: number;
  totalXP: number;
  guessDistribution: Record<number, number>;
  gamesPlayedByDifficulty: Record<string, number>;
  gamesWonByDifficulty: Record<string, number>;
}

export interface ScoreEntry {
  date: string;
  mode: string;
  category: string;
  guesses: number;
  timeSeconds?: number;
  xpEarned: number;
  difficulty?: string;
}

const DEFAULT_STATS: FullStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  speedModeWins: 0,
  expertModeWins: 0,
  perfectGames: 0,
  dailyChallengesCompleted: 0,
  categoriesWon: [],
  lateNightGames: 0,
  totalXP: 0,
  guessDistribution: {},
  gamesPlayedByDifficulty: {},
  gamesWonByDifficulty: {},
};

import * as SecureStore from 'expo-secure-store';

const SECURE_KEYS = {
  GEMS: 'gq_secure_gems',
  PREMIUM: 'gq_secure_premium',
  XP: 'gq_secure_xp',
  STREAK_COUNT: 'gq_secure_streak',
  MAX_STREAK: 'gq_secure_max_streak',
  CATEGORIES: 'gq_secure_categories',
};

// ── Gem ──────────────────────────────────────────────────
export const getGems = async (): Promise<number> => {
  try {
    const s = await SecureStore.getItemAsync(SECURE_KEYS.GEMS);
    if (s) return parseInt(s, 10);
  } catch {}
  const v = await AsyncStorage.getItem(KEYS.GEMS);
  const gems = v ? parseInt(v, 10) : 150;
  if (v) {
    try {
      await SecureStore.setItemAsync(SECURE_KEYS.GEMS, String(gems));
      await AsyncStorage.removeItem(KEYS.GEMS);
    } catch {}
  }
  return gems;
};
export const setGems = async (n: number) => {
  try {
    await SecureStore.setItemAsync(SECURE_KEYS.GEMS, String(n));
    await AsyncStorage.removeItem(KEYS.GEMS);
  } catch {
    await AsyncStorage.setItem(KEYS.GEMS, String(n));
  }
};
export const addGems = async (n: number): Promise<number> => mutex(async () => {
  const cur = await getGems(); const next = cur + n;
  await setGems(next); return next;
});
export const spendGems = async (n: number): Promise<{ success: boolean; remaining: number }> => mutex(async () => {
  const cur = await getGems();
  if (cur < n) return { success: false, remaining: cur };
  await setGems(cur - n);
  return { success: true, remaining: cur - n };
});

// ── Premium ──────────────────────────────────────────────
export const isPremium = async (): Promise<boolean> => {
  try {
    const s = await SecureStore.getItemAsync(SECURE_KEYS.PREMIUM);
    if (s) return s === 'true';
  } catch {}
  const v = await AsyncStorage.getItem(KEYS.PREMIUM);
  const premium = v === 'true';
  if (v) {
    try {
      await SecureStore.setItemAsync(SECURE_KEYS.PREMIUM, String(premium));
      await AsyncStorage.removeItem(KEYS.PREMIUM);
    } catch {}
  }
  return premium;
};
export const setPremium = async (v: boolean) => {
  try {
    await SecureStore.setItemAsync(SECURE_KEYS.PREMIUM, String(v));
    await AsyncStorage.removeItem(KEYS.PREMIUM);
  } catch {
    await AsyncStorage.setItem(KEYS.PREMIUM, String(v));
  }
};

// ── XP ───────────────────────────────────────────────────
export const getXP = async (): Promise<number> => {
  try {
    const s = await SecureStore.getItemAsync(SECURE_KEYS.XP);
    if (s) return parseInt(s, 10);
  } catch {}
  const v = await AsyncStorage.getItem(KEYS.XP);
  const xp = v ? parseInt(v, 10) : 0;
  if (v) {
    try {
      await SecureStore.setItemAsync(SECURE_KEYS.XP, String(xp));
      await AsyncStorage.removeItem(KEYS.XP);
    } catch {}
  }
  return xp;
};
export const setXP = async (n: number) => {
  try {
    await SecureStore.setItemAsync(SECURE_KEYS.XP, String(n));
    await AsyncStorage.removeItem(KEYS.XP);
  } catch {
    await AsyncStorage.setItem(KEYS.XP, String(n));
  }
};
export const addXP = async (n: number): Promise<number> => mutex(async () => {
  const cur = await getXP(); const next = cur + n;
  await setXP(next); return next;
});

// ── Stats ────────────────────────────────────────────────
export const getStats = async (): Promise<FullStats> => {
  const v = await AsyncStorage.getItem(KEYS.STATS);
  if (!v) return DEFAULT_STATS;
  try {
    return { ...DEFAULT_STATS, ...JSON.parse(v) };
  } catch {
    console.warn('[Storage] Corrupt stats data, resetting to defaults');
    await AsyncStorage.removeItem(KEYS.STATS);
    return DEFAULT_STATS;
  }
};
export const updateStats = async (patch: Partial<FullStats>): Promise<FullStats> => mutex(async () => {
  const cur = await getStats();
  const next = { ...cur, ...patch };
  await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(next));
  return next;
});

// ── Streak ───────────────────────────────────────────────
export const getStreak = async (): Promise<{ current: number; max: number }> => {
  let current = 0;
  let max = 0;
  let curMigrated = false;
  let maxMigrated = false;

  try {
    const sCur = await SecureStore.getItemAsync(SECURE_KEYS.STREAK_COUNT);
    const sMax = await SecureStore.getItemAsync(SECURE_KEYS.MAX_STREAK);
    if (sCur) { current = parseInt(sCur, 10); curMigrated = true; }
    if (sMax) { max = parseInt(sMax, 10); maxMigrated = true; }
  } catch {}

  const [aCur, aMax] = await Promise.all([
    AsyncStorage.getItem(KEYS.STREAK_COUNT),
    AsyncStorage.getItem(KEYS.MAX_STREAK),
  ]);

  if (!curMigrated && aCur) {
    current = parseInt(aCur, 10);
    try {
      await SecureStore.setItemAsync(SECURE_KEYS.STREAK_COUNT, String(current));
      await AsyncStorage.removeItem(KEYS.STREAK_COUNT);
    } catch {}
  }
  if (!maxMigrated && aMax) {
    max = parseInt(aMax, 10);
    try {
      await SecureStore.setItemAsync(SECURE_KEYS.MAX_STREAK, String(max));
      await AsyncStorage.removeItem(KEYS.MAX_STREAK);
    } catch {}
  }

  return { current, max };
};

export const setStreak = async (current: number, max: number) => {
  try {
    await Promise.all([
      SecureStore.setItemAsync(SECURE_KEYS.STREAK_COUNT, String(current)),
      SecureStore.setItemAsync(SECURE_KEYS.MAX_STREAK, String(max)),
    ]);
    await Promise.all([
      AsyncStorage.removeItem(KEYS.STREAK_COUNT),
      AsyncStorage.removeItem(KEYS.MAX_STREAK),
    ]);
  } catch {
    await Promise.all([
      AsyncStorage.setItem(KEYS.STREAK_COUNT, String(current)),
      AsyncStorage.setItem(KEYS.MAX_STREAK, String(max)),
    ]);
  }
};

export const updateStreak = async (won: boolean): Promise<{ current: number; max: number; bonusGems: number }> => mutex(async () => {
  const today = new Date().toDateString();
  const lastDate = await AsyncStorage.getItem(KEYS.STREAK_DATE);
  const { current, max } = await getStreak();

  let newCurrent = current;
  let bonusGems = 0;

  if (won) {
    if (lastDate === today) {
      // Bugün zaten oynadı, streak değişmez
    } else {
      const y = new Date(); y.setDate(y.getDate() - 1); const yesterday = y.toDateString();
      newCurrent = lastDate === yesterday ? current + 1 : 1;
      await AsyncStorage.setItem(KEYS.STREAK_DATE, today);

      // Streak bonusları
      if (newCurrent === 3)  bonusGems = 50;
      if (newCurrent === 7)  bonusGems = 150;
      if (newCurrent === 30) bonusGems = 500;
      if (bonusGems > 0) { const g = await getGems(); await setGems(g + bonusGems); }
    }
  } else {
    newCurrent = 0;
    await AsyncStorage.setItem(KEYS.STREAK_DATE, today);
  }

  const newMax = Math.max(max, newCurrent);
  await setStreak(newCurrent, newMax);

  return { current: newCurrent, max: newMax, bonusGems };
});

// ── Achievements ─────────────────────────────────────────
export const getUnlockedAchievements = async (): Promise<string[]> => {
  const v = await AsyncStorage.getItem(KEYS.ACHIEVEMENTS);
  if (!v) return [];
  try { return JSON.parse(v); } catch { return []; }
};
export const unlockAchievement = async (id: string) => mutex(async () => {
  const cur = await getUnlockedAchievements();
  if (!cur.includes(id)) {
    await AsyncStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify([...cur, id]));
  }
});

// ── Daily ────────────────────────────────────────────────
export const hasDoneDaily = async (): Promise<boolean> => {
  const [date, done] = await Promise.all([
    AsyncStorage.getItem(KEYS.DAILY_DATE),
    AsyncStorage.getItem(KEYS.DAILY_DONE),
  ]);
  const today = new Date().toDateString();
  return date === today && done === 'true';
};
export const markDailyDone = async () => {
  const today = new Date().toDateString();
  await Promise.all([
    AsyncStorage.setItem(KEYS.DAILY_DATE, today),
    AsyncStorage.setItem(KEYS.DAILY_DONE, 'true'),
  ]);
};

// ── Scores ───────────────────────────────────────────────
export const getScores = async (): Promise<ScoreEntry[]> => {
  const v = await AsyncStorage.getItem(KEYS.SCORES);
  if (!v) return [];
  try { return JSON.parse(v); } catch { return []; }
};
export const addScore = async (entry: ScoreEntry) => mutex(async () => {
  const scores = await getScores();
  const next = [entry, ...scores].slice(0, 100);
  await AsyncStorage.setItem(KEYS.SCORES, JSON.stringify(next));
});

// ── Generic key-value helpers ────────────────────────────
export const storageGet = async (key: string): Promise<string | null> => {
  return AsyncStorage.getItem(key);
};

export const storageSet = async (key: string, value: string): Promise<void> => {
  await AsyncStorage.setItem(key, value);
};

export const storageRemove = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(key);
};

export const storageGetJSON = async <T>(key: string): Promise<T | null> => {
  const v = await AsyncStorage.getItem(key);
  if (!v) return null;
  try { return JSON.parse(v); } catch { return null; }
};

export const storageSetJSON = async (key: string, value: unknown): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

// ── Categories ───────────────────────────────────────────
export const getUnlockedCategories = async (): Promise<string[]> => {
  const defaultCats = ['random', 'hayvanlar', 'yiyecek', 'spor'];
  try {
    const s = await SecureStore.getItemAsync(SECURE_KEYS.CATEGORIES);
    if (s) {
      try { return JSON.parse(s); } catch {}
    }
  } catch {}

  const v = await AsyncStorage.getItem('gq_unlocked_categories');
  let cats = defaultCats;
  if (v) {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) cats = parsed;
      try {
        await SecureStore.setItemAsync(SECURE_KEYS.CATEGORIES, JSON.stringify(cats));
        await AsyncStorage.removeItem('gq_unlocked_categories');
      } catch {}
    } catch {}
  }
  return cats;
};

export const setUnlockedCategories = async (cats: string[]) => {
  const val = JSON.stringify(cats);
  try {
    await SecureStore.setItemAsync(SECURE_KEYS.CATEGORIES, val);
    await AsyncStorage.removeItem('gq_unlocked_categories');
  } catch {
    await AsyncStorage.setItem('gq_unlocked_categories', val);
  }
};

export const unlockCategory = async (cat: string): Promise<string[]> => mutex(async () => {
  const cur = await getUnlockedCategories();
  if (!cur.includes(cat)) {
    const next = [...cur, cat];
    await setUnlockedCategories(next);
    return next;
  }
  return cur;
});
