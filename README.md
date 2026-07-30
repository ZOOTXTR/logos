# 💎 Logos — Mobil Kelime Oyunu Platformu

Logos; eğlenceli, öğretici, yüksek görselliğe sahip ve yayınlanmaya hazır, hepsi bir arada bir kelime bulmaca platformudur. Proje **ZOVTEX** tarafından yayınlanmaktadır, **React Native**, **Expo SDK 52** ve **TypeScript** kullanılarak sıfırdan inşa edilmiştir.

---

## 🎮 Oyun Özellikleri & Modlar

1. **🎯 Klasik / Günlük Mod (Wordle):** 5 harfli kelimeleri 6 tahminde bulma. Her gün yenilenen "Günlük Kelime" ödülü (+100 Gem).
2. **🎭 Çift Kelime (Dordle):** Aynı anda yan yana iki kelimeyi 7 tahminde bulma yarışı.
3. **🔀 Anagram:** Karışık olarak verilmiş harfleri sürükle/dokun yöntemiyle doğru sıraya dizme.
4. **⚡ Hızlı Mod (Blitz):** 60 saniye süre sınırı içinde ardı ardına kelimeler çözme. Her doğru kelime +5 saniye kazandırır.
5. **⛓️ Kelime Zinciri:** Önceki kelimenin son harfiyle başlayan kelimeler türetme maratonu.

### 🌟 Diğer Özellikler
* **🎨 7 Farklı Tema:** Karanlık, Aydınlık, Neon, Doğa, Ateş, Okyanus ve Kristal temalarıyla uygulamayı tamamen kişiselleştirin.
* **👁️ Renk Körü Modu:** Renkleri yüksek kontrastlı mavi/turuncu tonlarına dönüştüren ve hücrelere Unicode sembolleri (✓/●) ekleyen kapsayıcı mod.
* **🔊 Ses ve Titreşim:** Tuş vuruşları, zafer fanfarları ve hata uyarı sesleri / dokunsal geri bildirimleri (Haptic).
* **🏆 Seviye & Başarımlar:** XP kazandıkça seviye atlama, 16 farklı özel başarım kartı kilidi açma.
* **🏪 Gelişmiş Mağaza:** Gem paketleri alımı, Premium üyelik ve tema mağazası.

---

## 🏗️ Proje Mimarisi

* `/app`: Expo Router v4 tabanlı yönlendirme katmanı.
  * `/app/(tabs)/index.tsx`: Ana sayfa, Klasik mod ve menü akışı.
  * `/app/(tabs)/modes.tsx`: Oyun modları seçicisi.
  * `/app/(tabs)/leaderboard.tsx`: Filtrelenebilir skor geçmişi.
  * `/app/(tabs)/settings.tsx`: Tema ve tercih ayarları, Gizlilik Politikası ve Hakkında modalleri.
  * `/app/(tabs)/profile.tsx`: Kullanıcı seviyesi, Gem, istatistikler ve başarımlar.
  * `/app/onboarding.tsx`: İlk açılış eğitimi (Tutorial).
* `/components`: Yeniden kullanılabilir UI bileşenleri (Konfeti, Tahtalar, Klavye, Seviye Çubuğu vb.).
* `/hooks`: Oyun durumlarını yöneten özel React Hook'lar (`useGame`, `useProgress`, `useTheme`, `useDordle`, `useAnagram`, `useBlitz`, `useWordChain`).
* `/services`: `storage.service.ts` (yerel veri kayıtları), `audio.service.ts` (ses ve titreşim tetikleyicileri).
* `/constants`: Oyun verileri, kelime bankası, başarımlar ve temalar.

---

## 🛠️ Yerel Test ve Çalıştırma

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```
2. **Sunucuyu Başlatın:**
   ```bash
   npx expo start --clear
   ```
3. **Cihazda Açın:**
   * Telefonunuza Google Play Store veya App Store'dan **Expo Go** uygulamasını indirin.
   * Terminaldeki QR kodu telefon kamerasıyla taratın.

---

## 📦 Google Play Store'da Yayınlama Rehberi

Logos, **EAS (Expo Application Services)** build sistemine uygun şekilde yapılandırılmıştır.

### Adım 1: EAS CLI Kurulumu ve Giriş
Terminalde küresel olarak EAS aracını kurun ve Expo hesabınızla giriş yapın:
```bash
npm install -g eas-cli
eas login
```

### Adım 2: Projeyi Yapılandırma
Projenizi Expo hesabınıza bağlamak için kök dizinde çalıştırın:
```bash
eas project:init
```

### Adım 3: Test APK'sı Üretme (Cihaza Direkt Kurulum İçin)
Mağazaya göndermeden önce kendi telefonunuzda tam sürüm olarak denemek için bir `.apk` çıktısı alın:
```bash
eas build --platform android --profile preview
```
*Build işlemi tamamlandığında terminalde bir QR kod belirecektir. Telefonunuzla tarayarak APK'yı indirebilirsiniz.*

### Adım 4: Production AAB Üretme (Play Store İçin)
Play Store'a yüklenecek olan resmi `.aab` paketini derleyin:
```bash
eas build --platform android --profile production
```
*EAS, uygulamanızı imzalamak için gereken Android Keystore dosyasını sizin adınıza otomatik oluşturur ve güvenle saklar.*

### Adım 5: Google Play Console'a Yükleme
1. **Google Play Console** hesabı açın (25$ tek seferlik ücret).
2. Yeni uygulama oluşturun, başlık, kısa ve uzun açıklamaları girin.
3. `/assets` klasöründeki ikon görsellerini mağaza kartına yükleyin.
4. **Production** (Üretim) veya **Internal Testing** (Dahili Test) kanalına oluşturduğunuz `.aab` dosyasını sürükleyip bırakın.
5. Fiyatlandırma, Gizlilik Politikası (Uygulama içindeki metni kopyalayabilirsiniz) ve Yaş Derecelendirmesini doldurup incelemeye gönderin!

---

*Google Deepmind & Antigravity iş birliğiyle geliştirilmiştir.*
