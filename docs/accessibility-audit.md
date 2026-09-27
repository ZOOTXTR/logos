# Erişilebilirlik (a11y) Denetim Raporu — Logos

Tarih: 2026-09-27 · Kapsam: `components/`, `app/` ekranları · Hedef: WCAG 2.1 AA (mobil)

## 1. Yöntem
- Otomatik tarama: Tüm `.tsx` dosyalarında `<Pressable>` / `<TouchableOpacity>` ve `accessibilityLabel` / `accessibilityRole` kullanımı sayıldı.
- Manuel inceleme: İkon-only (metin çocuğu olmayan) kontroller, dokunma hedefi boyutları ve renk kontrastı.

## 2. Özet Bulgular
- Toplam etkileşimli öğe: **110**
- Explicit `accessibilityLabel` içermeyen: **100 (%91)**
- `accessibilityRole` atanmış: çoğu ekranda var, ancak `ProfileScreen`, `SettingsScreen`, `LeaderboardScreen`, `TopBar`, `ThemeSelector` gibi bazılarında hiç yok.

> Not: React Native'de metin çocuğu bulunan `Pressable`/`TouchableOpacity` öğeleri ekran okuyucuda çocuk metninden otomatik ad alır. Bu yüzden asıl **kritik ihlaller ikon-only kontrollerdir** (adı olmayan butonlar).

## 3. WCAG Eşlemesi
| Bulgu | Kriter | Önem |
|-------|--------|------|
| İkon-only butonlarda erişilebilir ad yok | 4.1.2 Name, Role, Value | Yüksek |
| Bazı butonlarda `accessibilityRole` yok | 4.1.2 | Orta |
| `iconBtn` 40×40 (GameArena) dokunma hedefi | 2.5.8 Target Size (Minimum, AA=24px) → geçer; 2.5.5 (AAA=44px) → altında | Düşük |
| Renk körü modu | Renk dışında sembol (✓/●) var | Geçer |

## 4. Düzeltilenler
| Dosya | Konum | Düzeltme |
|-------|-------|----------|
| `components/GameArena.tsx` | geri butonu | `accessibilityLabel="Geri" / "Back"` |
| `components/ProfileScreen.tsx` | avatar | `accessibilityRole="button"`, `accessibilityLabel="Avatarı özelleştir"` |
| `components/ProfileScreen.tsx` | kapat (X) | `accessibilityRole="button"`, `accessibilityLabel="Kapat"` |
| `components/DuelModal.tsx` | kapat (X) | `accessibilityRole="button"`, `accessibilityLabel="Kapat"` |
| `components/WheelModal.tsx` | kapat (X) | `accessibilityRole="button"`, `accessibilityLabel="Kapat"` |
| `components/TournamentBanner.tsx` | kapat (X) | `accessibilityLabel="Kapat"/"Close"` |
| `components/WeeklyLeaderboardCard.tsx` | kapat (X) | `accessibilityLabel="Kapat"/"Close"` |
| `components/SettingsScreen.tsx` | ses kaydırıcısı | `accessibilityRole="adjustable"` + `accessibilityValue` |
| `components/SettingsScreen.tsx` | Switch bileşeni | `accessibilityRole="switch"` + `accessibilityState.checked` + `label` prop (Ses/Titreşim/Zor mod) |
| `components/design/WidgetCard.tsx` | generik kart | opsiyonel `accessibilityLabel` prop'u + `accessibilityState.disabled` |

Test: `__tests__/a11y.keyboard.test.tsx` (Keyboard rol/ad doğrulaması).

## 5. Kalan Öncelikli Bulgular (ikon-only / rol eksik)
Otomatik tarama ile tespit edilen, incelenmesi gereken ilk noktalar:

- `components/TopBar.tsx:…` — ikon butonları
- `components/ThemeSelector.tsx:…` — rol/label yok
- `components/TournamentBanner.tsx` (4) / `components/WeeklyLeaderboardCard.tsx` (4) — ikon-only olabilir
- `components/WheelModal.tsx` (2) — kapat/çevir
- `components/ModeSelector.tsx` (6) — rol var, label yok
- `components/SettingsScreen.tsx` (10) — rol/label yok
- `components/ProfileScreen.tsx` — kalan ikon-only öğeler
- `app/*.tsx` (tutorial, wordconnect, anagram…) — bazıları

## 6. Önerilen Düzeltme Örüntüsü
```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel={t('close')}          // ikon-only ise ZORUNLU
  accessibilityHint={t('closesDialog')}     // (opsiyonel)
  accessibilityState={{ disabled, selected }}
  onPress={onPress}
>
  <X size={16} color={c.text} />
</Pressable>
```
- Metin çocuğu olan butonlarda label'a gerek yok; yine de kritik akışlarda net etiket önerilir.
- İkon-only dokunma hedeflerini en az **44×44** yap (GameArena `iconBtn` şu an 40×40).
- Diyaloglarda `accessibilityViewIsModal` kullan.

## 7. Yeniden Test
- Birim: `@testing-library/react-native` ile `getByRole('button', { name: … })` sorguları ekle.
- Manuel: Android TalkBack + iOS VoiceOver ile ana akışlar (oyun, mağaza, onboarding).
- Renk kontrastı: WCAG AA metin 4.5:1, büyük metin 3:1.
