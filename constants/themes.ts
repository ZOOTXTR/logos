export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  card: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  correct: string;
  present: string;
  absent: string;
  empty: string;
  gem: string;
  gemDark: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  error: string;
  warning: string;
}

export interface Theme {
  id: string;
  name: string;
  nameEn?: string;
  emoji: string;
  description: string;
  descEn?: string;
  gemCost: number;    // 0 = ücretsiz, -1 = premium
  preview: [string, string];
  colors: ThemeColors;
}

// Birebir AI Studio paletleri. accent = tema vurgusu = gem rengi (AI Studio'daki gibi).
// present (#F59E0B) ve correct (#22C55E) oyun rengi olarak sabittir.
const TXT = { text: '#F4F4F5', textSecondary: '#A1A1AA', textMuted: '#71717A' };

export const THEMES: Theme[] = [
  {
    id: 'obsidian',
    name: 'Obsidian Mor',
    nameEn: 'Obsidian',
    emoji: '🖤',
    description: 'Klasik, sakin ve odaklanmış mor & camgöbeği',
    descEn: 'Classic, calm violet & cyan',
    gemCost: 0,
    preview: ['#0B0C10', '#7C5CFF'],
    colors: {
      background: '#0B0C10', surface: '#121317', surfaceLight: '#17181D',
      card: '#17181D', primary: '#7C5CFF', primaryLight: '#A78BFA',
      primaryDark: '#6e4ef5', accent: '#38BDF8', accentLight: '#7DD3FC',
      correct: '#22C55E', present: '#F59E0B', absent: '#26272B',
      empty: '#1E1F24', gem: '#38BDF8', gemDark: '#0EA5E9',
      text: TXT.text, textSecondary: TXT.textSecondary, textMuted: TXT.textMuted,
      border: '#26272B', borderLight: '#32333A', error: '#EF4444', warning: '#F59E0B',
    },
  },
  {
    id: 'midnight',
    name: 'Gece Mavisi',
    nameEn: 'Midnight',
    emoji: '🌌',
    description: 'Derin okyanus laciverti ve kobalt gökyüzü',
    descEn: 'Deep navy and cobalt',
    gemCost: 100,
    preview: ['#080E1A', '#3B82F6'],
    colors: {
      background: '#080E1A', surface: '#0F172A', surfaceLight: '#16213A',
      card: '#1E293B', primary: '#3B82F6', primaryLight: '#60A5FA',
      primaryDark: '#2563EB', accent: '#38BDF8', accentLight: '#7DD3FC',
      correct: '#22C55E', present: '#F59E0B', absent: '#1E293B',
      empty: '#16213A', gem: '#38BDF8', gemDark: '#0EA5E9',
      text: TXT.text, textSecondary: TXT.textSecondary, textMuted: TXT.textMuted,
      border: '#334155', borderLight: '#475569', error: '#EF4444', warning: '#F59E0B',
    },
  },
  {
    id: 'forest',
    name: 'Orman Yeşili',
    nameEn: 'Forest',
    emoji: '🌿',
    description: 'Taze zümrüt, çam ormanı ve ferah nane',
    descEn: 'Fresh emerald and mint',
    gemCost: 200,
    preview: ['#07150E', '#10B981'],
    colors: {
      background: '#07150E', surface: '#0B2016', surfaceLight: '#0E271A',
      card: '#132E20', primary: '#10B981', primaryLight: '#34D399',
      primaryDark: '#059669', accent: '#34D399', accentLight: '#6EE7B7',
      correct: '#22C55E', present: '#F59E0B', absent: '#132E20',
      empty: '#0E271A', gem: '#34D399', gemDark: '#10B981',
      text: TXT.text, textSecondary: TXT.textSecondary, textMuted: TXT.textMuted,
      border: '#1F4A34', borderLight: '#2A5C40', error: '#EF4444', warning: '#F59E0B',
    },
  },
  {
    id: 'sunset',
    name: 'Gün Batımı',
    nameEn: 'Sunset',
    emoji: '🌇',
    description: 'Sıcak akşam kızıllığı, yakut ve kehribar',
    descEn: 'Warm ruby sunset',
    gemCost: 200,
    preview: ['#160B0E', '#F43F5E'],
    colors: {
      background: '#160B0E', surface: '#211015', surfaceLight: '#2A1419',
      card: '#2E161E', primary: '#F43F5E', primaryLight: '#FB7185',
      primaryDark: '#E11D48', accent: '#FB923C', accentLight: '#FDBA74',
      correct: '#22C55E', present: '#F59E0B', absent: '#2E161E',
      empty: '#2A1419', gem: '#FB923C', gemDark: '#F97316',
      text: TXT.text, textSecondary: TXT.textSecondary, textMuted: TXT.textMuted,
      border: '#48232F', borderLight: '#5A2C3A', error: '#EF4444', warning: '#F59E0B',
    },
  },
  {
    id: 'cyber',
    name: 'Siber Neon',
    nameEn: 'Cyber',
    emoji: '💜',
    description: 'Fütüristik neon pembe ve siberpunk mavisi',
    descEn: 'Neon pink cyberpunk',
    gemCost: 300,
    preview: ['#0D0B14', '#EC4899'],
    colors: {
      background: '#0D0B14', surface: '#151221', surfaceLight: '#1B1526',
      card: '#1F1A30', primary: '#EC4899', primaryLight: '#F472B6',
      primaryDark: '#DB2777', accent: '#06B6D4', accentLight: '#22D3EE',
      correct: '#22C55E', present: '#F59E0B', absent: '#1F1A30',
      empty: '#1B1526', gem: '#06B6D4', gemDark: '#0891B2',
      text: TXT.text, textSecondary: TXT.textSecondary, textMuted: TXT.textMuted,
      border: '#352C52', borderLight: '#463A66', error: '#EF4444', warning: '#F59E0B',
    },
  },
  {
    id: 'gold',
    name: 'Kozmik Altın',
    nameEn: 'Gold',
    emoji: '👑',
    description: 'Görkemli kraliyet altını ve sıcak bronz',
    descEn: 'Royal cosmic gold',
    gemCost: -1, // Premium only
    preview: ['#120E06', '#F59E0B'],
    colors: {
      background: '#120E06', surface: '#1C160B', surfaceLight: '#241C0D',
      card: '#271F10', primary: '#F59E0B', primaryLight: '#FBBF24',
      primaryDark: '#D97706', accent: '#FBBF24', accentLight: '#FDE047',
      correct: '#22C55E', present: '#F59E0B', absent: '#271F10',
      empty: '#241C0D', gem: '#FBBF24', gemDark: '#F59E0B',
      text: TXT.text, textSecondary: TXT.textSecondary, textMuted: TXT.textMuted,
      border: '#3D311A', borderLight: '#4E4022', error: '#EF4444', warning: '#F59E0B',
    },
  },
];

export const getThemeById = (id: string): Theme =>
  THEMES.find(t => t.id === id) ?? THEMES[0];
