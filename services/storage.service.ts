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
}

export interface ScoreEntry {
  date: string;
  mode: string;
  category: string;
  guesses: number;
  timeSeconds?: number;
  xpEarned: number;
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
};

// ── Gem ──────────────────────────────────────────────────
export const getGems = async (): Promise<number> => {
  const v = await AsyncStorage.getItem(KEYS.GEMS);
  return v ? parseInt(v) : 150;
};
const setGems = async (n: number) => AsyncStorage.setItem(KEYS.GEMS, String(n));
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
  const v = await AsyncStorage.getItem(KEYS.PREMIUM); return v === 'true';
};
export const setPremium = async (v: boolean) => AsyncStorage.setItem(KEYS.PREMIUM, String(v));

// ── XP ───────────────────────────────────────────────────
export const getXP = async (): Promise<number> => {
  const v = await AsyncStorage.getItem(KEYS.XP); return v ? parseInt(v) : 0;
};
export const addXP = async (n: number): Promise<number> => mutex(async () => {
  const cur = await getXP(); const next = cur + n;
  await AsyncStorage.setItem(KEYS.XP, String(next)); return next;
});

// ── Stats ────────────────────────────────────────────────
export const getStats = async (): Promise<FullStats> => {
  const v = await AsyncStorage.getItem(KEYS.STATS);
  return v ? { ...DEFAULT_STATS, ...JSON.parse(v) } : DEFAULT_STATS;
};
export const updateStats = async (patch: Partial<FullStats>): Promise<FullStats> => mutex(async () => {
  const cur = await getStats();
  const next = { ...cur, ...patch };
  await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(next));
  return next;
});

// ── Streak ───────────────────────────────────────────────
export const getStreak = async (): Promise<{ current: number; max: number }> => {
  const [cur, max] = await Promise.all([
    AsyncStorage.getItem(KEYS.STREAK_COUNT),
    AsyncStorage.getItem(KEYS.MAX_STREAK),
  ]);
  return { current: cur ? parseInt(cur) : 0, max: max ? parseInt(max) : 0 };
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
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      newCurrent = lastDate === yesterday ? current + 1 : 1;
      await AsyncStorage.setItem(KEYS.STREAK_DATE, today);

      // Streak bonusları
      if (newCurrent === 3)  bonusGems = 50;
      if (newCurrent === 7)  bonusGems = 150;
      if (newCurrent === 30) bonusGems = 500;
      if (bonusGems > 0) await addGems(bonusGems);
    }
  } else {
    newCurrent = 0;
  }

  const newMax = Math.max(max, newCurrent);
  await Promise.all([
    AsyncStorage.setItem(KEYS.STREAK_COUNT, String(newCurrent)),
    AsyncStorage.setItem(KEYS.MAX_STREAK, String(newMax)),
  ]);

  return { current: newCurrent, max: newMax, bonusGems };
});

// ── Achievements ─────────────────────────────────────────
export const getUnlockedAchievements = async (): Promise<string[]> => {
  const v = await AsyncStorage.getItem(KEYS.ACHIEVEMENTS);
  return v ? JSON.parse(v) : [];
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
  return v ? JSON.parse(v) : [];
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
  return v ? JSON.parse(v) : null;
};

export const storageSetJSON = async (key: string, value: unknown): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

// ── Categories ───────────────────────────────────────────
export const getUnlockedCategories = async (): Promise<string[]> => {
  const v = await AsyncStorage.getItem('gq_unlocked_categories');
  return v ? JSON.parse(v) : ['random', 'hayvanlar', 'yiyecek', 'spor'];
};

export const unlockCategory = async (cat: string): Promise<string[]> => mutex(async () => {
  const cur = await getUnlockedCategories();
  if (!cur.includes(cat)) {
    const next = [...cur, cat];
    await AsyncStorage.setItem('gq_unlocked_categories', JSON.stringify(next));
    return next;
  }
  return cur;
});
