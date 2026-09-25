# FIXES — Açık İşler / Yayın Biriktirme Listesi

Sürüm politikası: burada yeterli "anlamlı yığın" birikince tek seferde `versionCode` artır + AAB derle + `internal` → `alpha` yükle. (Kural: AGENTS.md)

## Bekleyen düzeltmeler / iyileştirmeler
- [ ] A11y sweep (kalan): tüm butonlara `accessibilityLabel`, kalan <44dp dokunma hedefleri.
- [ ] Perf: liderlik/sticker listeleri `FlatList`; Firestore offline cache (RN uyumlu yöntem).
- [ ] İçerik: TR kelime havuzunu daha da genişlet (sözlükle doğrulanmış), ekonomi dengesi (kalan modlar), WordConnect ek seviyeler.
- [ ] App Check (Firebase, Play Integrity): monitor → enforce.
- [ ] OTA güncelleme indirme hatası (`UpdateFailedToLoad`) — EAS Update kanal/branch incele.
- [ ] Play Billing SDK sürümünü config plugin'e taşı (prebuild --clean sonrası kaybolmasın).
- [ ] Cihaz testi: `.dev` uygulama kimliği + Metro (Play sürümüne dokunmadan).

## Yayın öncesi (production için)
- [ ] Tester ekleme (12+/50) → 14 gün kapalı test.
- [ ] Üretime başvuru (Play Console).

---
Son yayınlanan: v1.0.97 (versionCode 97).
