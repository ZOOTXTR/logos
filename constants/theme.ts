export const COLORS = {
  // Arka plan
  background: '#0D0D1A',
  surface: '#1A1A2E',
  surfaceLight: '#16213E',
  card: '#1E1E3A',

  // Birincil
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',

  // Vurgu
  accent: '#F59E0B',
  accentLight: '#FCD34D',

  // Oyun renkleri
  correct: '#10B981',   // Yeşil - doğru yerde
  present: '#F59E0B',   // Sarı - var ama yanlış yerde
  absent: '#374151',    // Gri - yok
  empty: '#1F2937',     // Boş hücre

  // Gem rengi
  gem: '#38BDF8',
  gemDark: '#0284C7',

  // Metin
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',

  // Durum
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Sınır
  border: '#374151',
  borderLight: '#4B5563',
} as const;

export const FONTS = {
  regular: 'System',
  bold: 'System',
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
    huge: 48,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
