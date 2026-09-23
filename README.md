<h1 align="center">Logos (GemQuest)</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</p>

> Modern bir yaklaşımla geliştirilmiş, çok dilli ve rekabetçi kelime bulmaca oyunu. Günlük kelimeleri çözerek beynini çalıştır veya Hızlı Mod'da saniyelere karşı yarış.

## Neler Var?

**Beş Farklı Oyun Modu**
* **Günlük Bulmaca:** Her güne özel tek bir kelimeyi 6 tahminde bul (Wordle tarzı).
* **Dordle:** İki farklı kelimeyi aynı anda çözme mücadelesi.
* **Hızlı Mod:** Saniyelerle yarış, doğru kelime bildikçe ek süre kazan.
* **Kelime Zinciri:** Bir önceki kelimenin son harfiyle yeni kelimeler türeterek seriyi devam ettir.
* **Anagram:** Karışık harfleri doğru sıraya dizip gizli kelimeyi ortaya çıkar.

**Kişiselleştirme & Özellikler**
* Türkçe ve İngilizce olarak tamamen çift dil desteği.
* Karanlık, Aydınlık, Neon, Doğa gibi 7 farklı görsel tema.
* Firebase altyapısıyla desteklenen global liderlik tablosu ve seviye/XP sistemi.
* Herkes için oyun: Renk körleri ve disleksi için özel ayarlar.

## Geliştirici Notları

Logos, başından sonuna kadar **TypeScript** ile katı tip güvenliği (strict mode) gözetilerek yazılmıştır. Oyun içi ekonomiyi (XP, Gem) ve skorları güvende tutmak için tüm doğrulama işlemleri doğrudan sunucuda, **Firebase Cloud Functions** üzerinde koşmaktadır. Uygulama genelinde 60 FPS akıcılığı korumak adına \`useNativeDriver\` animasyonları ve \`React.memo\` optimizasyonları tercih edilmiştir.

### Lokal Kurulum

Projeyi kendi bilgisayarında çalıştırmak istersen:

```bash
npm install
npx expo start
```

*Not: Hile koruması modüllerinin çalışması için arka plan fonksiyonlarını \`firebase deploy --only functions\` komutuyla sunucuya yüklemeniz gerekir.*

---
**ZOVTEX** tarafından hayata geçirilmiştir.
