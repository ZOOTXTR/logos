export interface Achievement {
  id: string;
  title: string;
  description: string;
  titleEn?: string;
  descriptionEn?: string;
  emoji: string;
  condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  gems: number;
  level: number;
  isPremium: boolean;
  speedModeWins: number;
  expertModeWins: number;
  perfectGames: number; // 1 tahminde kazanma
  dailyChallengesCompleted: number;
  categoriesWon: Set<string>;
  lateNightGames: number; // 00:00-06:00 arası
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    title: 'İlk Adım',
    titleEn: 'First Step',
    description: 'İlk oyununu tamamla',
    descriptionEn: 'Complete your first game',
    emoji: '🎉',
    condition: (s) => s.gamesPlayed >= 1,
  },
  {
    id: 'first_win',
    title: 'İlk Zafer',
    titleEn: 'First Win',
    description: 'İlk kez kazan',
    descriptionEn: 'Win your first game',
    emoji: '🏆',
    condition: (s) => s.gamesWon >= 1,
  },
  {
    id: 'speed_win',
    title: 'Hızlı Düşünür',
    titleEn: 'Fast Thinker',
    description: 'Hızlı modda kazan',
    descriptionEn: 'Win in Speed mode',
    emoji: '⚡',
    condition: (s) => s.speedModeWins >= 1,
  },
  {
    id: 'perfect_game',
    title: 'Nişancı',
    titleEn: 'Sharpshooter',
    description: '1. tahminde doğru bil',
    descriptionEn: 'Solve on the 1st attempt',
    emoji: '🎯',
    condition: (s) => s.perfectGames >= 1,
  },
  {
    id: 'streak_3',
    title: 'Alev Başlıyor',
    titleEn: 'Spark Ignited',
    description: '3 günlük kazanma serisi',
    descriptionEn: 'Maintain a 3-day streak',
    emoji: '🔥',
    condition: (s) => s.currentStreak >= 3,
  },
  {
    id: 'streak_7',
    title: 'Yakıcı Seri',
    titleEn: 'Hot Streak',
    description: '7 günlük kazanma serisi',
    descriptionEn: 'Reach a 7-day streak',
    emoji: '🌋',
    condition: (s) => s.maxStreak >= 7,
  },
  {
    id: 'streak_30',
    title: 'Efsane Seri',
    titleEn: 'Legendary Streak',
    description: '30 günlük seri — efsanesin!',
    descriptionEn: 'Reach a 30-day streak - legend!',
    emoji: '👑',
    condition: (s) => s.maxStreak >= 30,
  },
  {
    id: 'gem_collector',
    title: 'Gem Koleksiyoncusu',
    titleEn: 'Gem Collector',
    description: '1000 Gem biriktir',
    descriptionEn: 'Accumulate 1000 Gems',
    emoji: '💎',
    condition: (s) => s.gems >= 1000,
  },
  {
    id: 'encyclopedia',
    title: 'Ansiklopedi',
    titleEn: 'Encyclopedia',
    description: 'Her kategoride en az 1 kazan',
    descriptionEn: 'Win in every category at least once',
    emoji: '📚',
    condition: (s) => s.categoriesWon.size >= 6,
  },
  {
    id: 'premium',
    title: 'VIP Üye',
    titleEn: 'VIP Member',
    description: 'Premium satın al',
    descriptionEn: 'Purchase Premium membership',
    emoji: '✨',
    condition: (s) => s.isPremium,
  },
  {
    id: 'night_owl',
    title: 'Gece Kuşu',
    titleEn: 'Night Owl',
    description: 'Gece yarısı sonra oyna',
    descriptionEn: 'Play after midnight',
    emoji: '🌙',
    condition: (s) => s.lateNightGames >= 1,
  },
  {
    id: 'expert_win',
    title: 'Uzman',
    titleEn: 'Expert Solver',
    description: 'Uzman zorluğunda kazan',
    descriptionEn: 'Win a game on Expert difficulty',
    emoji: '💪',
    condition: (s) => s.expertModeWins >= 1,
  },
  {
    id: 'daily_hero',
    title: 'Günlük Kahraman',
    titleEn: 'Daily Hero',
    description: '7 günlük kelimeyi tamamla',
    descriptionEn: 'Complete 7 daily challenges',
    emoji: '🌟',
    condition: (s) => s.dailyChallengesCompleted >= 7,
  },
  {
    id: 'veteran',
    title: 'Kıdemli',
    titleEn: 'Veteran',
    description: '50 oyun kazan',
    descriptionEn: 'Win 50 games',
    emoji: '🏅',
    condition: (s) => s.gamesWon >= 50,
  },
  {
    id: 'genius',
    title: 'Dahi',
    titleEn: 'Genius',
    description: '10 mükemmel oyun (1. tahminde)',
    descriptionEn: '10 perfect games (on 1st attempt)',
    emoji: '🧠',
    condition: (s) => s.perfectGames >= 10,
  },
  {
    id: 'level_20',
    title: 'Usta Oyuncu',
    titleEn: 'Master Player',
    description: 'Level 20\'ye ulaş',
    descriptionEn: 'Reach Level 20',
    emoji: '🚀',
    condition: (s) => s.level >= 20,
  },
];

export const getNewAchievements = (
  stats: AchievementStats,
  unlockedIds: string[]
): Achievement[] => {
  return ACHIEVEMENTS.filter(
    (a) => !unlockedIds.includes(a.id) && a.condition(stats)
  );
};
