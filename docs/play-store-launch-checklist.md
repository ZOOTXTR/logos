# Play Store Production Terfi — Kontrol Listesi (Logos)

Sürüm: **2.0.0 (versionCode 100)** · Target SDK **36**

## 1. Sürüm & Derleme
- [ ] `app.json` → `version: "2.0.0"`, `android.versionCode: 100` doğru
- [ ] `expo-build-properties` → `compileSdkVersion/targetSdkVersion = 36`
- [ ] Release AAB imzalı üretildi (`app-release.aab`, ~35 MB)
- [ ] `patch-package` patch'leri uygulandı (`patches/react-native-iap+12.16.4.patch`)
- [ ] Billing Library sürümü 8.0.0 (`plugins/withPlayBillingVersion.js`)

## 2. İmzalama
- [ ] Upload key ile imzalandı (Play App Signing aktif)
- [ ] `keystore` dosyaları repoda **değil** (`.gitignore`)

## 3. Mağaza Listesi (Store Listing)
- [ ] Uygulama adı, kısa açıklama (≤80), tam açıklama (≤4000)
- [ ] Uygulama ikonu (512×512 PNG)
- [ ] Feature graphic (1024×500)
- [ ]En az 2 telefon ekran görüntüsü (16:9 veya 9:16)
- [ ] Sürüm notları `tr-TR` ve `en-US` (`release-notes/`)

## 4. Politika & Uyum
- [ ] Veri güvenliği (Data safety) formu dolduruldu
- [ ] İçerik derecelendirmesi anketi tamamlandı
- [ ] Gizlilik politikası URL'si girildi
- [ ] Hedef kitle ve içerik (çocuk politikası) beyanı
- [ ] Reklam/analitik beyanları (Firebase Crashlytics kullanılıyorsa)

## 5. Ürün İçi Satın Alımlar (IAP)
- [ ] `gem_pack_1..5` ürünleri aktif ve fiyatlandırılmış
- [ ] `premium_monthly` aboneliği aktif
- [ ] Lisans test kullanıcıları tanımlı
- [ ] Restore akışı cihazda test edildi (çift gem yok)

## 6. Test Track'leri
- [ ] Internal test: sürüm 100 yüklendi ve doğrulandı
- [ ] Kapalı test (alpha) → test edenler geri bildirim verdi
- [ ] Pre-launch report (otomatik) incelendi, çökme yok
- [ ] Açık test (beta) — opsiyonel

## 7. Production'a Terfi
- [ ] Internal/closed track sürümü "Promote to production"
- [ ] Kademeli yayın (staged rollout) yüzdesi belirlendi (örn. %10 → %50 → %100)
- [ ] Eski/hatalı track sürümleri temizlendi (internal'deki 100 dahil)

## 8. Yayın Sonrası
- [ ] Crashlytics panosu izleniyor (çökme oranı)
- [ ] ANR / performans metrikleri kontrol edildi
- [ ] Geri alma (halt rollout) planı hazır
- [ ] Kullanıcı yorumları/geri bildirim akışı takip ediliyor

## 9. Ön Koşul — Otomasyon Yeşil
- [ ] `npm run typecheck` → 0 hata
- [ ] `npm run lint` → 0 hata
- [ ] `npm test` → tüm testler geçiyor
- [ ] CI pipeline (`.github/workflows/ci.yml`) yeşil
