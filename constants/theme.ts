export const COLORS = {
  // Arka plan — nötr, mavi-mor karışımı yok
  background: '#0B0C10',
  surface: '#121317',
  surfaceLight: '#17181D',
  card: '#17181D',

  // Birincil — elektrik menekşe
  primary: '#7C5CFF',
  primaryLight: '#A78BFA',
  primaryDark: '#6e4ef5',

  // Vurgu — tema vurgusu = gem rengi (AI Studio ile birebir)
  accent: '#38BDF8',
  accentLight: '#7DD3FC',

  // Oyun renkleri
  correct: '#22C55E',
  present: '#F59E0B',
  absent: '#26272B',
  empty: '#1E1F24',

  // Gem rengi
  gem: '#38BDF8',
  gemDark: '#0EA5E9',

  // Metin
  text: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',

  // Durum
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#38BDF8',

  // Sınır
  border: '#26272B',
  borderLight: '#32333A',
} as const;

// NOT: Android'de geçersiz fontFamily ('System') Text içindeki emoji gliflerini
// düşürüp "??"/gri kutu olarak gösterir. Bu yüzden fontFamily VERMİYORUZ
// (undefined) ve sistem fontunu (emoji fallback dahil) kullanıyoruz.
export const FONTS = {
  regular: undefined,
  medium: undefined,
  semibold: undefined,
  bold: undefined,
  extrabold: undefined,
  display: undefined,
  displayMedium: undefined,
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    xxxl: 34,
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
  sm: 8,
  md: 14,
  lg: 18,
  xl: 26,
  full: 9999,
} as const;
