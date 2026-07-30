import { COLORS } from './theme';

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
  emoji: string;
  description: string;
  gemCost: number;    // 0 = ücretsiz, -1 = premium
  preview: [string, string]; // gradient önizleme renkleri
  colors: ThemeColors;
}

export const THEMES: Theme[] = [
  {
    id: 'dark',
    name: 'Karanlık',
    emoji: '🌙',
    description: 'Varsayılan koyu tema',
    gemCost: 0,
    preview: ['#0D0D1A', '#1A1A2E'],
    colors: {
      background: '#0D0D1A', surface: '#1A1A2E', surfaceLight: '#16213E',
      card: '#1E1E3A', primary: '#7C3AED', primaryLight: '#A78BFA',
      primaryDark: '#5B21B6', accent: '#F59E0B', accentLight: '#FCD34D',
      correct: '#10B981', present: '#F59E0B', absent: '#374151',
      empty: '#1F2937', gem: '#38BDF8', gemDark: '#0284C7',
      text: '#F9FAFB', textSecondary: '#9CA3AF', textMuted: '#6B7280',
      border: '#374151', borderLight: '#4B5563', error: '#EF4444', warning: '#F59E0B',
    },
  },
  {
    id: 'light',
    name: 'Aydınlık',
    emoji: '☀️',
    description: 'Temiz beyaz tema',
    gemCost: 100,
    preview: ['#F8FAFC', '#E2E8F0'],
    colors: {
      background: '#F8FAFC', surface: '#FFFFFF', surfaceLight: '#F1F5F9',
      card: '#FFFFFF', primary: '#6D28D9', primaryLight: '#8B5CF6',
      primaryDark: '#4C1D95', accent: '#D97706', accentLight: '#F59E0B',
      correct: '#059669', present: '#D97706', absent: '#9CA3AF',
      empty: '#E5E7EB', gem: '#0284C7', gemDark: '#0369A1',
      text: '#111827', textSecondary: '#6B7280', textMuted: '#9CA3AF',
      border: '#E5E7EB', borderLight: '#F3F4F6', error: '#DC2626', warning: '#D97706',
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    emoji: '🌈',
    description: 'Parlak neon renkler',
    gemCost: 250,
    preview: ['#0A0A0F', '#0D0D1A'],
    colors: {
      background: '#0A0A0F', surface: '#0D0D1A', surfaceLight: '#111118',
      card: '#12121E', primary: '#FF00FF', primaryLight: '#FF66FF',
      primaryDark: '#CC00CC', accent: '#00FFFF', accentLight: '#66FFFF',
      correct: '#00FF88', present: '#FFD700', absent: '#222230',
      empty: '#1A1A28', gem: '#00FFFF', gemDark: '#00CCCC',
      text: '#FFFFFF', textSecondary: '#CCCCFF', textMuted: '#8888AA',
      border: '#FF00FF44', borderLight: '#FF00FF22', error: '#FF0055', warning: '#FFD700',
    },
  },
  {
    id: 'nature',
    name: 'Doğa',
    emoji: '🌿',
    description: 'Sakin yeşil tonlar',
    gemCost: 200,
    preview: ['#0A1A0A', '#0F2A0F'],
    colors: {
      background: '#0A1A0A', surface: '#0F2A0F', surfaceLight: '#122712',
      card: '#163016', primary: '#22C55E', primaryLight: '#4ADE80',
      primaryDark: '#15803D', accent: '#FACC15', accentLight: '#FDE047',
      correct: '#16A34A', present: '#CA8A04', absent: '#2D4A2D',
      empty: '#1A3A1A', gem: '#67E8F9', gemDark: '#22D3EE',
      text: '#F0FDF4', textSecondary: '#86EFAC', textMuted: '#4ADE80',
      border: '#166534', borderLight: '#15803D', error: '#EF4444', warning: '#FACC15',
    },
  },
  {
    id: 'fire',
    name: 'Ateş',
    emoji: '🔥',
    description: 'Yakıcı kırmızı tonlar',
    gemCost: 300,
    preview: ['#1A0A00', '#2A0F00'],
    colors: {
      background: '#1A0A00', surface: '#2A0F00', surfaceLight: '#2D1100',
      card: '#3A1500', primary: '#EF4444', primaryLight: '#F87171',
      primaryDark: '#B91C1C', accent: '#F97316', accentLight: '#FB923C',
      correct: '#EF4444', present: '#F97316', absent: '#4A2000',
      empty: '#2A1500', gem: '#FCD34D', gemDark: '#F59E0B',
      text: '#FFF7ED', textSecondary: '#FED7AA', textMuted: '#FDBA74',
      border: '#7C2D12', borderLight: '#9A3412', error: '#DC2626', warning: '#F97316',
    },
  },
  {
    id: 'ocean',
    name: 'Okyanus',
    emoji: '🌊',
    description: 'Derin mavi tonlar',
    gemCost: 200,
    preview: ['#020C1B', '#0A192F'],
    colors: {
      background: '#020C1B', surface: '#0A192F', surfaceLight: '#0D2137',
      card: '#112240', primary: '#64FFDA', primaryLight: '#A8FFEE',
      primaryDark: '#00BFA5', accent: '#FFD700', accentLight: '#FFE55C',
      correct: '#64FFDA', present: '#FFD700', absent: '#1E3A5F',
      empty: '#0D2137', gem: '#64FFDA', gemDark: '#00BFA5',
      text: '#CCD6F6', textSecondary: '#8892B0', textMuted: '#495670',
      border: '#1E3A5F', borderLight: '#233554', error: '#FF6B6B', warning: '#FFD700',
    },
  },
  {
    id: 'crystal',
    name: 'Obsidian',
    emoji: '🖤',
    description: '👑 Özel Premium Karanlık Tema',
    gemCost: -1, // Premium only
    preview: ['#050508', '#0C0C14'],
    colors: {
      background:    '#050508',   // Near-black, deepest void
      surface:       '#0C0C14',   // Very dark navy-black
      surfaceLight:  '#111120',   // Slightly lifted dark
      card:          '#13131F',   // Dark card surface
      primary:       '#C8A96E',   // Antique gold
      primaryLight:  '#E2C98A',   // Pale gold highlight
      primaryDark:   '#9A7A42',   // Deep gold shadow
      accent:        '#5B8DEF',   // Sapphire blue
      accentLight:   '#89ADFF',   // Light sapphire
      correct:       '#4ADE80',   // Vivid emerald
      present:       '#FBBF24',   // Warm amber
      absent:        '#1C1C2E',   // Very dark void
      empty:         '#111120',   // Empty cell dark
      gem:           '#C8A96E',   // Gold gem
      gemDark:       '#9A7A42',   // Dark gold gem
      text:          '#F0EDE8',   // Warm off-white
      textSecondary: '#B8A98A',   // Aged parchment
      textMuted:     '#6B6055',   // Dark muted tone
      border:        '#2A2A3E',   // Subtle dark border
      borderLight:   '#38384E',   // Slightly lighter border
      error:         '#FF4D6D',   // Vivid red
      warning:       '#FBBF24',   // Gold warning
    },
  },
];

export const getThemeById = (id: string): Theme =>
  THEMES.find(t => t.id === id) ?? THEMES[0];
