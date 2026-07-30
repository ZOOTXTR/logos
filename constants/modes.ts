export interface GameModeCard {
  id: string;
  title: string;
  description: string;
  emoji: string;
  gradient: [string, string];
  route: string;
  badge?: string;
  isPremium?: boolean;
}

export function ALL_MODES(t: Record<string, string>, language: string): GameModeCard[] {
  return [
    {
      id: 'wordle',
      title: t.modeClassicTitle,
      description: t.modeClassicDesc,
      emoji: '🎯',
      gradient: ['#7C3AED', '#4F46E5'],
      route: '/(tabs)',
    },
    {
      id: 'anagram',
      title: t.modeAnagramTitle,
      description: t.modeAnagramDesc,
      emoji: '🔀',
      gradient: ['#10B981', '#059669'],
      route: '/anagram',
    },
    {
      id: 'blitz',
      title: t.modeBlitzTitle,
      description: t.modeBlitzDesc,
      emoji: '⚡',
      gradient: ['#F59E0B', '#D97706'],
      route: '/blitz',
      badge: '2x Gem!',
    },
    {
      id: 'chain',
      title: t.modeChainTitle,
      description: t.modeChainDesc,
      emoji: '⛓️',
      gradient: ['#3B82F6', '#1D4ED8'],
      route: '/chain',
    },
    {
      id: 'dordle',
      title: t.modeDordleTitle,
      description: t.modeDordleDesc,
      emoji: '🎭',
      gradient: ['#8B5CF6', '#6D28D9'],
      route: '/dordle',
      badge: language === 'en' ? 'New!' : 'Yeni!',
    },
    {
      id: 'wordconnect',
      title: t.modeConnectTitle,
      description: t.modeConnectDesc,
      emoji: '🌀',
      gradient: ['#EC4899', '#BE185D'],
      route: '/wordconnect',
      badge: language === 'en' ? 'New Mode!' : 'Yeni Mod!',
    },
    {
      id: 'duel',
      title: t.modeDuelTitle,
      description: t.modeDuelDesc,
      emoji: '⚔️',
      gradient: ['#6366F1', '#4F46E5'],
      route: '/duel',
      badge: language === 'en' ? 'VS Mode!' : '1v1 Savaş!',
    },
  ];
}
