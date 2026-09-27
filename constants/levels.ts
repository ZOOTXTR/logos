export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  color: string;
}

export const LEVELS: LevelInfo[] = [
  { level: 1,  title: 'Çaylak',           minXP: 0,     maxXP: 100,   color: '#9CA3AF' },
  { level: 2,  title: 'Meraklı',          minXP: 100,   maxXP: 250,   color: '#9CA3AF' },
  { level: 3,  title: 'Öğrenci',          minXP: 250,   maxXP: 450,   color: '#60A5FA' },
  { level: 4,  title: 'Kelime Sevdalısı', minXP: 450,   maxXP: 700,   color: '#60A5FA' },
  { level: 5,  title: 'Kelime Avcısı',   minXP: 700,   maxXP: 1000,  color: '#34D399' },
  { level: 6,  title: 'Dil Ustası',       minXP: 1000,  maxXP: 1400,  color: '#34D399' },
  { level: 7,  title: 'Söz Cambazı',      minXP: 1400,  maxXP: 1900,  color: '#A78BFA' },
  { level: 8,  title: 'Kelime Savaşçısı', minXP: 1900,  maxXP: 2500,  color: '#A78BFA' },
  { level: 9,  title: 'Dil Profesörü',    minXP: 2500,  maxXP: 3200,  color: '#F59E0B' },
  { level: 10, title: 'Usta',             minXP: 3200,  maxXP: 4000,  color: '#F59E0B' },
  { level: 11, title: 'Usta II',          minXP: 4000,  maxXP: 4900,  color: '#F97316' },
  { level: 12, title: 'Usta III',         minXP: 4900,  maxXP: 5900,  color: '#F97316' },
  { level: 13, title: 'Bilge',            minXP: 5900,  maxXP: 7000,  color: '#EF4444' },
  { level: 14, title: 'Bilge II',         minXP: 7000,  maxXP: 8200,  color: '#EF4444' },
  { level: 15, title: 'Büyük Usta',       minXP: 8200,  maxXP: 9500,  color: '#EF4444' },
  { level: 16, title: 'Büyük Usta II',    minXP: 9500,  maxXP: 11000, color: '#DC2626' },
  { level: 17, title: 'Büyük Usta III',   minXP: 11000, maxXP: 12500, color: '#DC2626' },
  { level: 18, title: 'Efsane',           minXP: 12500, maxXP: 14500, color: '#B91C1C' },
  { level: 19, title: 'Efsane II',        minXP: 14500, maxXP: 17000, color: '#B91C1C' },
  { level: 20, title: 'Efsane III',       minXP: 17000, maxXP: 20000, color: '#B91C1C' },
  { level: 25, title: 'Destan',           minXP: 20000, maxXP: 30000, color: '#7C3AED' },
  { level: 30, title: 'Tanrı Seviyesi',   minXP: 30000, maxXP: 50000, color: '#7C3AED' },
  { level: 40, title: 'İmparator',        minXP: 50000, maxXP: 100000,color: '#6D28D9' },
  { level: 50, title: 'Logos Şampiyonu', minXP: 100000, maxXP: 999999999, color: '#F59E0B' },
];

export const XP_REWARDS = {
  WIN_BASE: 50,
  PERFECT_GAME: 200,        // 1. tahminde doğru
  SPEED_MODE_MULTIPLIER: 2, // Hızlı modda 2x
  DIFFICULTY_BONUS: {
    easy: 0,
    normal: 25,
    hard: 50,
    expert: 100,
  },
  DAILY_CHALLENGE: 100,
  STREAK_BONUS: {
    3:  25,
    7:  75,
    30: 300,
  },
};

export const getLevelFromXP = (xp: number): LevelInfo => {
  const match = LEVELS.find(l => xp >= l.minXP && xp < l.maxXP);
  if (match) return match;

  let level = 1;
  let accumulated = 0;
  while (accumulated + level * 150 <= xp) {
    accumulated += level * 150;
    level++;
    if (level >= 50) break;
  }
  const minXP = accumulated;
  const maxXP = accumulated + level * 150;
  return {
    level,
    title: `Level ${level}`,
    minXP,
    maxXP,
    color: '#F59E0B',
  };
};

export const getXPProgress = (xp: number): { current: number; needed: number; percent: number } => {
  const info = getLevelFromXP(xp);
  const current = xp - info.minXP;
  const needed = info.maxXP - info.minXP;
  return { current, needed, percent: Math.min(current / needed, 1) };
};
