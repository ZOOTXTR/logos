// Görünen ad doğrulama + argo/küfür filtresi (istemci tarafı).
// Aynı mantık sunucuda da vardır: gq/functions/src/profanity.ts — senkron tutulmalı.

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 20;

// Rezerve/ayrılmış adlar (normalize edilmiş, küçük harf)
export const RESERVED_NAMES = [
  'admin', 'administrator', 'yonetici', 'moderator', 'mod', 'root', 'system',
  'logos', 'oyuncu', 'player', 'destek', 'support', 'official', 'zovtex',
];

// TR + EN küfür/argo kökleri (normalize edilmiş; substring kontrolü yapılır).
export const BLOCKED_WORDS = [
  // TR
  'amk', 'aq', 'orospu', 'oruspu', 'piç', 'pic', 'siktir', 'sikeyim', 'sik',
  'yarrak', 'yarak', 'göt', 'got', 'amcik', 'amcık', 'yavsak', 'yavşak',
  'pezevenk', 'kahpe', 'sürtük', 'surtuk', 'ibne', 'gavat', 'salak', 'aptal',
  'gerizekali', 'gerizekalı', 'şerefsiz', 'serefsiz', 'hain', 'beyinsiz',
  'okuz', 'öküz', 'eşek', 'esek', 'domuz', 'kaltak', 'fahise', 'fahişe',
  // EN
  'fuck', 'fuk', 'shit', 'bitch', 'bastard', 'asshole', 'arsehole', 'dick',
  'pussy', 'cunt', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'retard',
  'rape', 'nazi', 'hitler', 'porn', 'sex',
];

const TR_MAP: Record<string, string> = {
  ı: 'i', i̇: 'i', ş: 's', ğ: 'g', ü: 'u', ö: 'o', ç: 'c',
};
const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b',
  '@': 'a', '$': 's', '!': 'i', '|': 'i',
};

// Küçük harfe indir, TR karakter/leetspeak sadeleştir, alfanümerik dışını at,
// tekrar eden harfleri teke indir (ör. "siiiktir" -> "siktir").
export function normalizeForCheck(input: string): string {
  let s = (input || '').toLowerCase();
  s = s.replace(/[ışğüöç]/g, (ch) => TR_MAP[ch] ?? ch);
  s = s.replace(/[0134578@$!|]/g, (ch) => LEET_MAP[ch] ?? ch);
  s = s.replace(/[^a-z0-9]/g, '');
  s = s.replace(/(.)\1+/g, '$1');
  return s;
}

export type DisplayNameError = 'empty' | 'short' | 'long' | 'charset' | 'reserved' | 'profanity';

export interface DisplayNameResult {
  ok: boolean;
  value: string;
  error?: DisplayNameError;
}

// Görünen adı doğrular ve temizler. `value` her zaman trims'lenmiş orijinaldir.
export function validateDisplayName(raw: string): DisplayNameResult {
  const value = (raw || '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
  if (!value) return { ok: false, value, error: 'empty' };
  if (value.length < DISPLAY_NAME_MIN) return { ok: false, value, error: 'short' };
  if (value.length > DISPLAY_NAME_MAX) return { ok: false, value, error: 'long' };
  // Harf/rakam/boşluk/alt çizgi + temel emoji dışına izin verme (kaba filtre).
  if (!/^[\p{L}\p{N} _.-]+$/u.test(value)) return { ok: false, value, error: 'charset' };

  const norm = normalizeForCheck(value);
  if (!norm) return { ok: false, value, error: 'charset' };
  if (RESERVED_NAMES.includes(norm)) return { ok: false, value, error: 'reserved' };
  if (BLOCKED_WORDS.some((w) => norm.includes(w))) return { ok: false, value, error: 'profanity' };

  return { ok: true, value };
}

// UI'da göstermek için hata -> mesaj (tr/en).
export function displayNameErrorText(error: DisplayNameError | undefined, lang: 'tr' | 'en'): string {
  const tr: Record<DisplayNameError, string> = {
    empty: 'Bir oyuncu adı gir.',
    short: `Ad en az ${DISPLAY_NAME_MIN} karakter olmalı.`,
    long: `Ad en fazla ${DISPLAY_NAME_MAX} karakter olabilir.`,
    charset: 'Yalnızca harf, rakam, boşluk ve _ . - kullanabilirsin.',
    reserved: 'Bu ad kullanılamaz.',
    profanity: 'Uygun olmayan bir kelime içeriyor. Başka bir ad dene.',
  };
  const en: Record<DisplayNameError, string> = {
    empty: 'Please enter a player name.',
    short: `Name must be at least ${DISPLAY_NAME_MIN} characters.`,
    long: `Name can be at most ${DISPLAY_NAME_MAX} characters.`,
    charset: 'Only letters, numbers, spaces and _ . - are allowed.',
    reserved: 'This name is not available.',
    profanity: 'Contains inappropriate language. Please choose another name.',
  };
  return (lang === 'en' ? en : tr)[error ?? 'empty'];
}
