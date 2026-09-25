# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Sürüm/Yayın politikası (çok fazla AAB çıkmasın)

- `versionCode`/`versionName` YALNIZ "anlamlı bir yığın" birikince artırılır ve AAB derlenir. Her düzeltme için AAB/Play yüklemesi YAPMA.
- "Anlamlı yığın" eşiği: en az ~3-4 düzeltme, VEYA bir kritik hata, VEYA üretime geçiş öncesi.
- Geliştirme/test döngüsü sürüm üretmez: `tsc --noEmit`, `jest --ci`, `eslint .`, ve gerekirse `expo export --platform web` + ekran görüntüsü.
- Play yükleme akışı: önce `internal` track (inceleme yok), sonra `alpha`. `production` elle.
- CI (`workflow_dispatch`) varsayılan olarak `internal` track'e yükler.
- Açık işler `FIXES.md` içinde biriktirilir; yayın öncesi topluca gözden geçirilir.

