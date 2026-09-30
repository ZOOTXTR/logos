# Logos — Test Raporu (2.0.4 → 2.0.8)

Tarih: 2026-09-30
Hazırlayan: geliştirme/test oturumu

---

## 1. Test Ortamı

| Alan | Değer |
|------|-------|
| Cihaz | Xiaomi 2407FPN8EG (kod adı `rothko_tr`), Android 16, MIUI |
| Ekran | 1220×2712 px, density override 390 |
| Ağ | Wi-Fi |
| Firebase projesi | `logos-game-c82f3` (proje no 478040450778) |
| Cloud Functions | `us-central1` (2nd gen, Node 22) |
| Kurulum yöntemleri | **Play** (vc 102, 104) ve **sideload APK** (vc 105, 106, 107, 108) |

> **Önemli:** Sideload edilmiş APK'da **Google Play Integrity / App Check** ve **Google Play Billing** çalışmaz (Google Play tarafından kurulmuş olma şartı). Bu nedenle IAP'nin gerçek ödeme ekranı ve App Check enforcement yalnızca **Play kurulumunda** doğrulanabilir.

Test edilen sürümler: **2.0.2/102, 2.0.4/104, 2.0.5/105, 2.0.6/106, 2.0.7/107, 2.0.8/108**

---

## 2. Test EDİLENLER (özet tablo)

| # | Alan | Test | Sonuç |
|---|------|------|-------|
| 1 | Kararlılık | Açılış / çökme taraması (`logcat`) | ✅ Çökme/ANR yok |
| 2 | Onboarding | "İleri/Geç" akışı | ✅ |
| 3 | Ana ekran | Seviye/seri/elmas, mod sekmeleri, turnuva, kategori/zorluk, OYNA | ✅ |
| 4 | Liderlik kartı (ana ekran) | Sahte veri kaldırıldı mı? Boş/gerçek durum | ✅ Sahte isimler yok; gerçek veri ("TestOyuncu 380 XP") |
| 5 | Skor sekmesi | Anonim → CTA; girişli → sıralama | ✅ "Oturum aç" CTA; girişli "Senin Sıralaman" |
| 6 | Klasik oyun | Daktilo, GÖNDER, renk geri bildirimi, tahmin geçmişi, ipuçları | ✅ (K/A/L/E/M; geçmiş 1/6) |
| 7 | Modlar ekranı | 7 mod listesi | ✅ Tümü görünüyor |
| 8 | Anagram modu | Açılış, kategori, harfler, ipucu/hak | ✅ |
| 9 | Mağaza (görsel) | Ürünler, fiyatlar, kategori paketleri | ✅ (fiyatlar doğru) |
| 10 | **IAP ödeme ekranı** | Play ödeme sayfası açılıyor mu? | ✅✅ Google Play ödeme ekranı + `₺12,99` + test kartı |
| 11 | Profil ekranı | İstatistikler, başarımlar, tahmin dağılımı | ✅ |
| 12 | Ayarlar | Tema, ses, haptik, günlük bildirim, sürüm metni | ✅ |
| 13 | Hesap — e-posta | Bağlama (`linkEmail`) | ✅ "Hesap Bağlandı ✓" |
| 14 | Hesap — Google | Hesap seçici açılıyor mu? | ✅ `AccountPickerActivity` açıldı |
| 15 | Argo/küfür filtresi | "Siktir" → kaydet | ✅ "Uygun olmayan kelime" reddi |
| 16 | Giriş kalıcılığı | Kapat-aç sonrası oturum | ✅ (2.0.8'de düzeltildi) |
| 17 | Sunucu `submitScore` (anonim) | Çağrı | ✅ `PERMISSION_DENIED` |
| 18 | Sunucu `submitScore` (girişli) | Çağrı | ✅ `{success:true, score:380}` |
| 19 | Liderlik okuma | Uygulamada skor görünüyor mu? | ✅ "TestOyuncu 380 XP" |
| 20 | Firestore | Doküman yazımı | ✅ `scores` içinde `displayName=TestOyuncu` |

---

## 3. Test EDİLENLER (detay)

### 3.1 IAP (satın alma) — düzeltme doğrulaması
- Önce: bir pakete dokununca **"Satın alma iptal edildi veya başarısız oldu"** (Play ekranı açılmıyordu).
- Kök neden: `react-native-iap@12.16.4` **Android** tarafında `requestPurchase` **`skus` (dizi)** beklerken kod **`sku`** gönderiyordu; abonelikte de **`subscriptionOffers`** gerekiyordu.
- Düzeltme sonrası (Play kurulumu, vc104+): **Google Play ödeme ekranı açıldı**:
  - "100 Gems — ₺12,99", "Test kartı, her zaman onaylanır", "1 tıkla satın al".
- Not: Satın alma, geri tuşuyla iptal edildi → doğru şekilde "iptal edildi" uyarısı geldi.

### 3.2 Liderlik kimliği
- Anonim kullanıcı: Skor sekmesinde **"Sıralamaya girmek için oturum açın" + "Giriş yap"**.
- Giriş yapan kullanıcı: CTA kaybolur, **"Senin Sıralaman"** kapsülü görünür; liderlik gerçek skorları listeler.
- Ana ekran kartı: hardcoded sahte isimler (Zeynep/Burak/Ayşe) ve sabit "#14" kaldırıldı.

### 3.3 Giriş & oturum
- E-posta/şifre: Firebase Auth sağlayıcısı açıldı; `linkWithCredential` ile anonim oturuma bağlama başarılı.
- Google: `@react-native-google-signin/google-signin` ile native akış; hesap seçici açıldı.
- **Kalıcılık (kritik):** II. testte kapat-aç sonrası oturum kayboluyordu; `initAuth` düzeltildikten sonra (2.0.8) **korunuyor**.

### 3.4 Argo/küfür filtresi
- İstemci (`utils/displayName.ts`) + sunucu (`gq/functions/src/profanity.ts`) normalize + blocklist + rezerve ad + uzunluk.
- "Siktir" → **"Uygun olmayan bir kelime içeriyor. Başka bir ad dene."**

### 3.5 Sunucu (Cloud Functions) doğrulaması
- `submitScore` **anonim** → `{"error":{"message":"Sıralamaya girmek için oturum açmalısınız.","status":"PERMISSION_DENIED"}}`
- `submitScore` **girişli** → `{"result":{"success":true,"score":380}}`
- Firestore `scores`: `displayName="TestOyuncu"`, `score=380`
- Uygulama liderliği: **"TestOyuncu — 380 XP"**

---

## 4. Test EDİLMEYENLER (ve nedeni / nasıl test edilir)

| Alan | Neden test edilmedi | Nasıl test edilir |
|------|---------------------|-------------------|
| IAP **tam satın alma** (ödeme → `verifyPurchase` → elmas yükleme) | Sideload'da Play Billing çalışmaz; yalnızca ödeme ekranının açıldığı doğrulandı | Play'den kur, test kartıyla satın al, elmasın arttığını ve `iap_receipts` kaydını doğrula |
| **App Check enforcement** | Şu an **UNENFORCED** (etkin değil) | Play'de token alındığı doğrulandıktan sonra `ENFORCED` yapıp test et |
| **Play Games girişi** | Play Games Services yapılandırılmamış + kütüphane `serverAuthCode` sunmuyor | Play Games Services kurulumu (APP_ID/OAuth) + server-side destekli akış |
| **iOS** | Yalnızca Android test edildi; iOS hiç derlenmedi | iOS build + App Attest/DeviceCheck doğrulaması |
| **Production** yayını | Track boş; alpha/internal'da | Production'a terfi + sahada doğrulama |
| **Çok oyunculu/düello tam akış** | Aynı anda iki cihaz/oturum gerekir | İki cihazda eşleşme + senkron testi |
| **Bulut yedek/geri yükleme** | `useCloudSync` bulut akışı uçtan uca denenmedi | Girişli kullanıcıda "Buluta Yedekle" → sil → "Geri Yükle" |
| **Push/günlük bildirim** | Bildirim tetikleme/teslim doğrulanmadı | İzin + zamanlanmış bildirim testi |
| **Çevrimdışı mod (tam)** | Uçak modu senaryosu ayrık test edilmedi | Uçak modunda oynanış + senkron kuyruğu |
| **E-posta/Google girişini tamamlama (hesap seçme/şifre)** | Otomasyon kısıtı; akışın başladığı doğrulandı | Elle giriş + ilerleme/elmas eşleşmesi |

---

## 5. Bulunan ve Düzeltilen Hatalar

| # | Hata | Etki | Düzeltme | Sürüm |
|---|------|------|----------|-------|
| 1 | Firebase Android app'te **SHA kayıtlı değildi** (App Check "App not registered") | App Check token alınamıyor | Play + upload SHA-1/SHA-256 eklendi | — |
| 2 | API anahtarında **yanlış SHA** + `playintegrity.googleapis.com` yok | Play Integrity "blocked" | Doğru SHA + servis eklendi | — |
| 3 | Uygulama **JS SDK** + App Check **RNFirebase** uyumsuzluğu | Enforcement açıkken istekler reddediliyordu | JS SDK'ya `CustomProvider` köprüsü eklendi | 2.0.3/103 |
| 4 | `requestPurchase({sku})` / `requestSubscription({sku})` | **IAP hiç açılmıyordu** | `{skus:[…]}` + `{subscriptionOffers:[…]}` | 2.0.4/104 |
| 5 | Ana ekran liderlik kartında **sahte veri** | Yanıltıcı | Kaldırıldı, gerçek veri/boş durum | 2.0.6/106 |
| 6 | **Anonim kontrolü yanlış fonksiyona** (`verifyPurchase`) eklenmiş | Anonim kullanıcıların satın alma doğrulamasını bloklardı | `submitScore`'a taşındı; `verifyPurchase` düzeltildi (deploy edildi) | backend |
| 7 | **`initAuth` her açılışta `signInAnonymously`** ile kalıcı oturumu eziyordu | E-posta/Google girişi kapat-aç sonrası kayboluyordu | Önce persist edilmiş oturum kullanılıyor | 2.0.8/108 |
| 8 | Açılış yarışı: auth hazır olmadan Firestore okuma | Liderlik `permission-denied` | `whenAuthReady()` + auth'u bekletmeme | 2.0.5/105 |

---

## 6. Yayınlanan Sürümler & Kayıtlar

- Play (alpha + internal): **2.0.2/102, 2.0.4/104, 2.0.5/105, 2.0.6/106, 2.0.7/107, 2.0.8/108**
- logos repo commit'leri: `a85aaec, 2fbf395, b3b4a90, fce2b71, b775398, 4eb5bab, a8be126, 4e0b0dc, b5e44d6, 3683e99, 08b3b6b, 05f64b4`
- gq (backend) commit'leri: `submitScore/displayName/profanity`, `submitScore anonim reddi düzeltmesi`

---

## 7. Sonraki Adımlar (öneriler)

1. **108'i Play'den kur** → IAP **tam satın alma** + **App Check enforcement** doğrulaması.
2. **App Check enforcement**'ı aç (Play'de token çalıştığı doğrulandıktan sonra).
3. **Play Games Services** kurulumu (istenirse) + server-side akış.
4. **iOS** build + App Attest.
5. **Production** track'e terfi.
6. Play Games dışı: **isim kullanımı** testleri (giriş → kazan → liderlikte ad), **bulut yedek/geri yükleme**, **push bildirim**.
