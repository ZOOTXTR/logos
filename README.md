# 📱 Logos - React Native (Expo) Mobil Uygulaması

Bu proje, **Logos Türkçe Kelime Bulmacası** uygulamasının **Expo SDK (TypeScript + expo-router)** ile baştan sona birebir dönüştürülmüş native mobil versiyonudur. **Google Play Store** (.aab) ve **Apple App Store** (iOS) dağıtımına hazır olarak yapılandırılmıştır.

---

## 🚀 Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin
```bash
cd expo-logos
npm install
# veya
npx expo install
```

### 2. Ortam Değişkenlerini Tanımlayın
`.env.example` dosyasını `.env` olarak kopyalayın ve Firebase bilgilerinizi girin:
```bash
cp .env.example .env
```

### 3. Geliştirici Sunucusunu Başlatın
```bash
# Metro geliştirme sunucusunu başlat
npx expo start

# Android Emülatör / Cihaz
npx expo run:android

# iOS Simülatör (macOS)
npx expo run:ios
```

---

## 📂 Proje Yapısı

```
expo-logos/
├── app.json                  # Proje kimliği (com.zovtex.logos, v1.0.99, versionCode: 99)
├── package.json              # Expo SDK bağımlılıkları (lucide-react-native, reanimated, vb.)
├── babel.config.js           # Reanimated plugin ayarı
├── tsconfig.json             # Expo TypeScript yapılandırması
├── .env.example              # Firebase ortam değişkenleri şablonu
├── app/                      # expo-router (File-based Routing)
│   ├── _layout.tsx           # Kök Stack & GestureHandler & ThemeProvider
│   ├── (tabs)/
│   │   ├── _layout.tsx       # 5 sekmeli alt navigasyon (Klasik, Modlar, Skor, Ayarlar, Profil)
│   │   ├── index.tsx         # Klasik Mod & HomeScreen
│   │   ├── modes.tsx         # Modlar Ekranı (Hızlı Blitz, Turnuva, Günlük Kelime)
│   │   ├── leaderboard.tsx   # Liderlik Tablosu & Lig Podyumu
│   │   ├── settings.tsx      # Ayarlar (Ses, Haptik, Tema Seçici, Geri Bildirim)
│   │   └── profile.tsx       # Oyuncu Profili, Performans Grafiği, Başarımlar
│   └── game.tsx              # Tam Ekran Oyun Arenası (GameArena)
├── components/
│   ├── TopBar.tsx            # Üst Bar (Logo, Elmas Bakiyesi)
│   ├── BottomNavBar.tsx      # Özel Tab Çubuğu
│   ├── HomeScreen.tsx        # Ana Ekran & Görevler & Hızlı Aksiyonlar
│   ├── GameArena.tsx         # Kelime Izgarası & Türkçe Klavye & İpuçları
│   ├── ModesScreen.tsx       # Oyun Modları Kartları
│   ├── LeaderboardScreen.tsx # Podyum & Sıralama Listesi
│   ├── SettingsScreen.tsx    # Ses/Haptik Ayarları & Test Paneli
│   ├── ProfileScreen.tsx     # Profil Kartı & Başarımlar
│   ├── PerformanceTrendChart.tsx # Native SVG Performans Grafiği
│   ├── StoreModal.tsx        # IAP Elmas Paketleri & Kozmetikler & VIP
│   ├── WheelModal.tsx        # Şans Çarkı Ödül Modalı
│   ├── DuelModal.tsx         # 1v1 Düello Eşleşme Modalı
│   └── ThemeSelector.tsx     # 8 Canlı Renk Paleti Seçici
├── context/
│   └── ThemeContext.tsx      # Tema durum yönetimi & AsyncStorage kalıcılığı
├── data/
│   └── wordBank.ts           # Türkçe kelime bankası & TDK uyumlu ipuçları
├── types/
│   └── game.ts               # Ortak TypeScript tip tanımları
├── utils/
│   ├── sound.ts              # expo-av tabanlı prosedürel ses sentezleyici
│   └── haptics.ts            # expo-haptics tabanlı dokunsal titreşim motoru
└── services/
    └── firebase.ts           # Firebase Web SDK (Auth, Firestore, Cloud Functions)
```

---

## 🛠️ Dönüştürülen Teknolojiler (Web → React Native)

| Özellik / Katman | Web (Kaynak) | React Native (Expo) |
|---|---|---|
| **Layout & Öğeler** | `<div>`, `<span>`, `<p>`, `<button>` | `<View>`, `<Text>`, `<Pressable>` |
| **Stil Sistemi** | Tailwind CSS v4 class'ları | `StyleSheet.create` (tam renk ve piksel eşleşmesi) |
| **İkonlar** | `lucide-react` | `lucide-react-native` (aynı ikon adları) |
| **Ses Efektleri** | Web Audio API (`AudioContext`) | `expo-av` (`Audio.Sound` WAV sentezleyici) |
| **Haptik / Titreşim** | `navigator.vibrate` | `expo-haptics` (`impactAsync`, `notificationAsync`) |
| **Veri Saklama** | `localStorage` | `@react-native-async-storage/async-storage` |
| **Güvenli Saklama** | - | `expo-secure-store` |
| **Grafik Çizimi** | D3 / SVG HTML | `react-native-svg` (`Svg`, `Path`, `Circle`, `LinearGradient`) |
| **Yönlendirme** | State tabanlı sekme değişimi | `expo-router` (File-based router) |
| **PWA / Çevrimdışı** | Service Worker, Manifest | Native offline çalışma altyapısı |

---

## 💎 IAP (Uygulama İçi Satın Alma) Tanımları

`app.json` ve `StoreModal.tsx` içerisinde tanımlanan IAP ürünleri:
* `gem_pack_1`: 100 Elmas (₺19.99)
* `gem_pack_2`: 250 Elmas (₺44.99)
* `gem_pack_3`: 500 Elmas (₺79.99) - Popüler
* `gem_pack_4`: 1200 Elmas (₺169.99)
* `gem_pack_5`: 3000 Elmas (₺349.99)
* `premium_monthly`: VIP Aylık Abonelik (₺49.99/ay)

---

## 📦 Mağazalara Derleme (EAS Build)

```bash
# EAS CLI kurulumu
npm install -g eas-cli
eas login
eas build:configure

# Google Play Store için .aab üretimi
eas build -p android --profile production

# Apple App Store için .ipa üretimi
eas build -p ios --profile production
```
