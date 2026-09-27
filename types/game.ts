export type GameMode = 'klasik' | 'hizli' | 'gunluk' | 'turnuva';

export type CategoryId = 'karisik' | 'hayvanlar' | 'sehirler' | 'yiyecek' | 'meslekler' | 'doga' | 'spor';

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  locked?: boolean;
  requiredLevel?: number;
  wordCount?: number;
}

export type DifficultyId = 'kolay' | 'normal' | 'zor' | 'uzman';

export interface Difficulty {
  id: DifficultyId;
  label: string;
  letters: number;
  multiplier: string;
  maxAttempts: number;
}

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

export interface EvaluatedLetter {
  char: string;
  status: LetterStatus;
}

export interface PlayerStats {
  level: number;
  currentXP: number;
  maxXP: number;
  streak: number;
  bestStreak: number;
  gems: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  distribution: { [attempts: number]: number };
  isPremium?: boolean;
  dailyExtraGemsClaimed?: boolean;
  selectedAvatar?: string;
  selectedFrame?: string;
  unlockedAvatars?: string[];
  unlockedFrames?: string[];
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  iconName: 'book' | 'trophy' | 'zap' | 'flame' | 'sparkles';
  currentProgress: number;
  targetProgress: number;
  rewardGems: number;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badgeColor: string;
  badgeBg: string;
  currentProgress: number;
  targetProgress: number;
  unlocked: boolean;
  rewardGems: number;
}

export type ActiveTab = 'klasik' | 'modlar' | 'skor' | 'ayarlar' | 'profil';

export interface IAPProduct {
  id: string;
  name: string;
  gems?: number;
  price: string;
  type: 'consumable' | 'subscription';
  bonusText?: string;
}
