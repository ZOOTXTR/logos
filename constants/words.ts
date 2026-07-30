import { WORD_BANK_EN, ALL_WORDS_EN } from './words_en';
export { ALL_WORDS_EN } from './words_en';

// Kategorize edilmiş Türkçe kelime listesi (TÜMÜ KESİNLİKLE 5 HARFLİ)

export type Category = 'random' | 'hayvanlar' | 'sehirler' | 'yiyecek' | 'meslekler' | 'doga' | 'spor';

export const CATEGORY_INFO: Record<Category, { label: string; emoji: string; color: string }> = {
  random:    { label: 'Karışık',    emoji: '🎲', color: '#7C3AED' },
  hayvanlar: { label: 'Hayvanlar',  emoji: '🐾', color: '#10B981' },
  sehirler:  { label: 'Şehirler',   emoji: '🏙️', color: '#3B82F6' },
  yiyecek:   { label: 'Yiyecek',    emoji: '🍎', color: '#F59E0B' },
  meslekler: { label: 'Meslekler',  emoji: '👔', color: '#8B5CF6' },
  doga:      { label: 'Doğa',       emoji: '🌿', color: '#059669' },
  spor:      { label: 'Spor',       emoji: '⚽', color: '#EF4444' },
};

export const WORD_BANK: Record<Exclude<Category, 'random'>, string[]> = {
  hayvanlar: [
    'ASLAN', 'ZEBRA', 'BALIK', 'KOYUN', 'HOROZ', 'DOMUZ', 'TAVUK', 'KARGA',
    'MARTI', 'TİLKİ', 'KİRPİ', 'GEYİK', 'ÇAKAL', 'VAŞAK', 'PANDA', 'KOBRA',
    'KUZGU', 'YILAN', 'BÖCEK', 'GUGUK', 'ÖRDEK', 'SERÇE', 'SÜLÜN', 'KÖPEK',
    'SİNEK', 'MİDYE', 'SIĞIR', 'AYGIR', 'KATIR', 'AKREP', 'ŞAHİN', 'HAMSİ',
    'HÜTHÜT', 'KELER', 'TAVUS', 'KEKLİ', 'DOĞAN',
    'AYI', 'KEDİ', 'KURT', 'FARE', 'DEVE', 'TEKE', 'KUZU', 'BOĞA', 'DANA', 'MORS',
    'KAPLAN', 'MAYMUN', 'SİNCAP', 'KUNDUZ', 'LEOPAR', 'BALİNA', 'SIRTLAN', 'PENGUEN', 'TIMSAH', 'BAYKUŞ'
  ],
  sehirler: [
    'İZMİR', 'BURSA', 'ADANA', 'KONYA', 'SİVAS', 'DÜZCE', 'HATAY', 'SİNOP',
    'TOKAT', 'AFYON', 'AYDIN', 'BİTLİS', 'MUĞLA', 'NİĞDE', 'ÇORUM', 'KİLİS',
    'SİİRT', 'MARAŞ', 'ANTEP',
    'BOLU', 'UŞAK', 'KARS', 'ORDU', 'RİZE', 'AĞRI',
    'ANKARA', 'EDİRNE', 'MANİSA', 'SAMSUN', 'YALOVA', 'ELAZIĞ', 'BİNGÖL', 'AMASYA', 'ISPARTA'
  ],
  yiyecek: [
    'ARMUT', 'KAVUN', 'KEBAP', 'PİLAV', 'BÖREK', 'HELVA', 'ÇORBA', 'SALÇA',
    'BİBER', 'SOĞAN', 'SUCUK', 'SİMİT', 'CACIK', 'HAVUÇ', 'LİMON', 'MEYVE',
    'SEBZE', 'HURMA', 'VİŞNE', 'ÇİLEK', 'İNCİR', 'CEVİZ', 'BADEM', 'KAŞAR',
    'YUFKA', 'MANTI', 'TURŞU', 'TUZLU', 'ŞEKER', 'BALIK',
    'ELMA', 'ERİK', 'KOLA', 'SODA', 'TUZU', 'BALI',
    'PEYNİR', 'ZEYTİN', 'BUĞDAY', 'REÇEL', 'PİRİNÇ', 'YOĞURT', 'MANTAR', 'KARPUZ', 'KAYISI'
  ],
  meslekler: [
    'HAKİM', 'PİLOT', 'POLİS', 'KASAP', 'YAZAR', 'AKTÖR', 'TERZİ', 'MİMAR',
    'MANAV', 'MÜDÜR', 'ŞOFÖR', 'BEKÇİ', 'SAVCI', 'DİŞÇİ', 'MEMUR', 'ÇOBAN',
    'CASUS', 'ASKER',
    'POSTA', 'KURYE', 'ÇIRAK', 'KALFA',
    'İŞÇİ', 'AŞÇI', 'KRAL', 'OZAN',
    'DOKTOR', 'RESSAM', 'AVUKAT', 'BERBER', 'GARSON', 'ECZACI', 'ÇİFTÇİ', 'KAPTAN'
  ],
  doga: [
    'ORMAN', 'NEHİR', 'GÖLET', 'ÇAYIR', 'DENİZ', 'BUZUL', 'DELTA', 'GÜNEŞ',
    'BULUT', 'ÇİÇEK', 'KAVAK', 'IRMAK', 'TUFAN', 'KUTUP', 'DERYA', 'KIRAÇ',
    'AYAZ', 'DALGA', 'İKLİM', 'YAYLA', 'KUMUL', 'GÖLGE',
    'AĞAÇ', 'DERE', 'KAYA', 'KARI', 'SUYU', 'ATEŞ',
    'TOPRAK', 'RÜZGAR', 'ŞELALE', 'YAPRAK', 'KANYON', 'YAĞMUR', 'VOLKAN', 'KUMSAL', 'KAYAÇ'
  ],
  spor: [
    'TENİS', 'YÜZME', 'GÜREŞ', 'YARIŞ', 'DARTS', 'KÜREK', 'KAYAK', 'ATLET',
    'MEKİK', 'RAKET', 'PASÖR', 'SMAÇ', 'JOKEY', 'HAKEM', 'SEANS',
    'RAGBİ', 'HOKEY', 'DALIŞ',
    'KALE', 'POTA', 'PASI', 'TOPU', 'KANO', 'SKOR',
    'FUTBOL', 'BOKSÖR', 'KOŞUCU', 'YÜZÜCÜ', 'SÖRFÇÜ', 'KORNER'
  ],
};

// Tüm kelimeleri birleştir
export const ALL_WORDS: string[] = Object.values(WORD_BANK).flat();

export const WORD_LENGTH = 5;
export const DIFFICULTY_MAX_GUESSES: Record<Difficulty, number> = {
  easy:   7,
  normal: 6,
  hard:   5,
  expert: 4,
};

export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';
export const DIFFICULTY_INFO: Record<Difficulty, { label: string; emoji: string; color: string; xpBonus: number }> = {
  easy:   { label: 'Kolay',  emoji: '🟢', color: '#10B981', xpBonus: 0  },
  normal: { label: 'Normal', emoji: '🟡', color: '#F59E0B', xpBonus: 25 },
  hard:   { label: 'Zor',    emoji: '🔴', color: '#EF4444', xpBonus: 50 },
  expert: { label: 'Uzman',  emoji: '💀', color: '#7C3AED', xpBonus: 100},
};

export type GameMode = 'classic' | 'speed' | 'daily';
export const GAME_MODE_INFO: Record<GameMode, { label: string; emoji: string; description: string }> = {
  classic: { label: 'Klasik',   emoji: '🎯', description: 'Süresiz, klasik kelime oyunu' },
  speed:   { label: 'Hızlı',    emoji: '⚡', description: '90 sn sayaç, 2x Gem & XP!' },
  daily:   { label: 'Günlük',   emoji: '🌟', description: 'Bugünün özel kelimesi, +100 Gem!' },
};

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';
export interface Letter { char: string; status: LetterStatus; }
export type Board = Letter[][];

export const createEmptyBoard = (maxGuesses: number, wordLength: number = 5): Board =>
  Array(maxGuesses).fill(null).map(() =>
    Array(wordLength).fill(null).map(() => ({ char: '', status: 'empty' as LetterStatus }))
  );

export const getRandomWord = (category: Category = 'random', lang: 'tr' | 'en' = 'tr'): string => {
  const bank = lang === 'en' ? WORD_BANK_EN : WORD_BANK;
  const all = lang === 'en' ? ALL_WORDS_EN : ALL_WORDS;
  const pool = category === 'random' ? all : bank[category];
  const validWords = pool.filter(w => {
    const len = w.replace(/\s/g, '').length;
    return len >= 4 && len <= 6;
  });
  const words = validWords.length > 0 ? validWords : all.filter(w => w.length >= 4 && w.length <= 6);
  const selected = words[Math.floor(Math.random() * words.length)];
  return lang === 'tr'
    ? selected.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR')
    : selected.toUpperCase();
};

// Günlük kelime - tarih bazlı deterministik (4, 5, veya 6 harfli)
export const getDailyWord = (lang: 'tr' | 'en' = 'tr'): string => {
  const date = new Date();
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const all = lang === 'en' ? ALL_WORDS_EN : ALL_WORDS;
  const words = all.filter(w => w.length >= 4 && w.length <= 6);
  const selected = words[seed % words.length];
  return lang === 'tr'
    ? selected.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR')
    : selected.toUpperCase();
};
