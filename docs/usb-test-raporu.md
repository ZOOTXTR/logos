# USB Kapsamlı Test Raporu — Logos v2.0.1

Tarih: 2026-09-28 · Cihaz: Xiaomi 2407FPN8EG (Android 16) · Build: `2.0.1` / `versionCode 101`
Yöntem: `adb` (USB) + `screencap` (görsel doğrulama) + `logcat`

> Düzeltmeler bu rapordan önce yapıldı: Firebase açılış çökmesi, ürün fiyatları (kod + Play Console), WordConnect sürükleme.

---

## 1. ✅ Tamamlanan Testler

### Temel akış
| Alan | Senaryo | Sonuç |
|------|---------|-------|
| Açılış | Soğuk başlatma | ✅ Çökme yok |
| Onboarding | 4 slayt, İleri/Geç, "Gemleri Al ve Başla" | ✅ |
| Ana ekran | Seviye/Gem/Seri, mod/kategori/zorluk, turnuva banner, liderlik | ✅ |
| Sekmeler | Klasik / Modlar / Skor / Ayarlar / Profil | ✅ |
| Sürüm metni | Ayarlar | ✅ "v2.0.1 (Play Store)" |

### Oyun (Klasik)
- Harf girme + Gönder → tahmin geçmişi ✅
- İpucu (Harf Aç) → gem düştü ✅
- **Kazanma** → "Harika Bir Zafer!" + ödüller ✅
- **Kaybetme** → "Hakların Tükendi" + hedef açıldı ✅
- **İkinci Şans (revive)** → gem -50, tahta +1 satır, aynı kelime ✅

### Modlar
| Mod | Sonuç |
|-----|-------|
| Anagram | ✅ Diz→Onayla→kazanma (+20💎 +75XP) |
| Çift Kelime (Dordle) | ✅ Tek tahmin iki tahtaya, bağımsız renk |
| **Kelime Zinciri** | ✅ SUCUK→**KALEM** kabul; Skor 50, Zincir 2, sıradaki harf M |
| **Kelime Başı (WordConnect)** | ✅ **Sürükleme (K→A→L→E→M) KALEM kabul** (kırmızı-bağlantı çizgili) |
| **Blitz** | ✅ Açılıyor; 90 sn dolunca **kaybetme** ekranı (hedef açıldı) |
| **Günlük** | ✅ Açılıyor ("Günlük · Normal") |
| **Turnuva** | ✅ "Turnuvaya Başla (2.5x)" → oyun açıldı |
| 1v1 Düello | ✅ Bahis→başlat→tahmin→bot yanıtı |

### Mağaza / Ayarlar / Diğer
- **Mağaza**: gem paketleri (gerçek fiyatlar), Premium, **Restore** butonu ✅
- **Kelime paketi satın alma**: Şehirler 100💎 → onay → **"Kilit Açık"** (gem 111→11) ✅; yetersiz bakiyede "Yetersiz Gem" uyarısı ✅
- **Avatar kuşanma (ücretsiz)**: "Kelime Sihirbazı" → **"Kuşanıldı"** + toast ✅
- **Avatar satın alma**: ücretli (50💎) → "Yetersiz elmas! 50 💎 gerekiyor." ✅ (yetersiz yol; başarılı yol kategori paketiyle doğrulandı)
- **Gem paylaşımı (fix)**: kazanç tüm ekranlara restart olmadan yansıyor ✅
- **Bildirim (fix)**: Ayarlar → **"Günlük Bildirim"** anahtarı → izin isteği + günlük bildirim planlama; `POST_NOTIFICATIONS=granted` ✅
- **Geri bildirim hata yönetimi (fix)**: gönderim başarısızsa artık **"Gönderilemedi"** uyarısı gösteriliyor (sessiz kalmıyor)
- **Hesap silme**: onay diyaloğu ("Tüm kayıtlı oyun verileriniz... VAZGEÇ/SİL") ✅ (silme uygulanmadı, iptal edildi)
- **Günlük Çark**: +50💎, günlük limit ("Yarın tekrar gel") ✅
- **Ayarlar**: 8 tema, ses/haptik anahtarları, ses seviyesi kaydırıcısı ✅
- **Tema değiştirme + kalıcılık**: "Gece Mavisi" uygulandı ve **yeniden başlatma sonrası korundu** ✅
- **Zor Mod kalıcılığı**: kapat-aç sonrası açık kaldı ✅
- **Zor Mod canlı kural**: ihlal eden tahmin reddedildi (geçmiş artmadı) ✅
- **Gem kalıcılığı**: kazanç (111) yeniden başlatmada korundu ✅
- **Çevrimdışı (uçak modu)**: oyun oynanabiliyor, çökme yok ✅
- **Deeplink** (`logos://`): uygulama açıldı ✅

### Stabilite
- Oturum boyunca FATAL / JS exception yok ✅

---

## 2. 🚧 Kalan / Test Edilemeyen

- [ ] **IAP gerçek satın alma** — ücretlendirdiği için test edilemedi (mağaza/paketler görüntülendi, satın alma yapılmadı)
- [ ] **Geri bildirim gönderimi** — başarısızsa sessiz döner (`cloudService.submitFeedback`); Firestore offline olduğundan "teşekkür" durumu gözlenemedi
- [ ] **Cloud sync** (online stats) — dolaylı
- [ ] Klavye dışı (sistem) — ses çıkışı, gerçek haptik

---

## 3. Bilinen Durumlar / Bulgular
- **`useProgress` paylaşılan değildi → ÇÖZÜLDÜ**: her ekran kendi anlık kopyasını tutuyordu (mağaza, ana ekranın bayat gem değerini görüyordu). `useProgress` artık `useSyncExternalStore` ile **tekil (paylaşılan) store**; cihazda doğrulandı: anagram kazancı (11→31) **restart olmadan** ana ekrana yansıdı.
- **Firestore "client is offline"** uyarısı (kritik değil; offline çalışıyor).
- Oyun üst sayacı **artarak** ilerliyor (geçen süre).
- `expo-updates` yerel build'de kapalı; üretim kararı verilmeli.
- **Bildirim izni → ÇÖZÜLDÜ**: `notificationService` hiç çağrılmıyordu; Ayarlar'a "Günlük Bildirim" anahtarı eklendi (izin + günlük planlama). Cihazda açıldı, `POST_NOTIFICATIONS=granted`.
- **Geri bildirim**: `submitFeedback` başarısızsa artık uyarı gösteriyor; ancak Firestore offline olduğundan çağrı askıda kalıyor (ne başarı ne hata) — ortam kaynaklı.

---

## 4. Test Metodu Notları
- Görsel doğrulama: `adb shell screencap -p /sdcard/s.png` + `adb pull` (PowerShell `>` binary'yi bozar).
- `uiautomator` animasyonlu ekranlarda "could not get idle state" verir; eski dump yanıltır.
- Oyun klavyesi koordinatla; WordConnect'te sürükle (`input swipe`).
- `keyevent 4` (BACK) uygulamadan çıkarabilir; ekrandaki **Geri** (≈108,213) kullan.
- TextInput için: tap → `input text` (önce tam koordinat dump'tan alınmalı).

---

## 5. Ön Koşul — Otomasyon
- [x] `tsc` 0 · `lint` 0 · `jest` 84/84 · çalışma ağacı temiz
