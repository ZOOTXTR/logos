# Logos (GemQuest)

Logos, React Native ve Expo altyap�s� kullan�larak geli�tirilmi�, �ok dilli (T�rk�e/�ngilizce) ve rekabet�i bir mobil kelime bulmaca platformudur. Temel Wordle mekaniklerinin �zerine in�a edilen proje; ger�ek zamanl� liderlik tablolar�, bulut tabanl� ilerleme senkronizasyonu ve �e�itli oyun modlar� sunar.

## Teknoloji Y���n�

- **Framework:** React Native, Expo (SDK 52), Expo Router v4
- **Dil:** TypeScript (Strict mode)
- **Backend & Servisler:** Firebase (Firestore, Cloud Functions, Authentication, Crashlytics)
- **�deme Altyap�s�:** RevenueCat / Expo In-App Purchases (IAP)
- **Depolama:** SecureStore (�ifrelenmi� yerel depolama) ve AsyncStorage

## Oyun Modlar� ve �zellikler

Oyun, farkl� zorluk seviyelerinde ve kurgularda 5 temel mod i�erir:
- **Klasik Mod:** 5 harfli kelimeleri 6 tahminde bulma mekani�i.
- **Dordle:** �ki farkl� kelimeyi ayn� anda, yan yana 7 tahminde ��zme.
- **Anagram:** Kar���k verilen harfleri do�ru s�raya dizme.
- **Word Chain (Kelime Zinciri):** Bir �nceki kelimenin son harfiyle ba�layan yeni kelimeler t�retme.
- **H�zl� Mod (Blitz):** 60 saniyelik s�re s�n�r�nda art arda kelime bilme (do�ru cevaplar s�re kazand�r�r).

### �ne ��kan Mimari ��z�mler
- **Anti-Cheat & G�venlik:** �stemci taraf�nda skora m�dahale edilmesini �nlemek amac�yla Firestore kurallar� kat�la�t�r�lm�� ve skor/IAP do�rulama i�lemleri tamamen Firebase Cloud Functions (Server-side) �zerine ta��nm��t�r.
- **�oklu Dil & Tema:** Tam entegre i18n altyap�s� ve 7 farkl� dinamik tema deste�i.
- **Eri�ilebilirlik (a11y):** Disleksi dostu font se�enekleri, renk k�r� modu ve ekran okuyucu (screen reader) optimizasyonlar�.
- **Performans:** Animasyonlarda y�ksek kare h�zlar� i�in `useNativeDriver` kullan�lm��, `React.memo` ve `useRef` ile gereksiz re-render d�ng�leri ve bellek s�z�nt�lar� (memory leak) optimize edilmi�tir.

## Kurulum ve Geli�tirme

Projeyi yerel ortam�n�zda �al��t�rmak i�in a�a��daki ad�mlar� izleyin. (Projeyi derleyebilmek i�in ortam�n�zda Node.js kurulu olmal�d�r).

```bash
# Depoyu klonlay�n ve klas�re girin
git clone https://github.com/ZOOTXTR/logos.git
cd logos

# Ba��ml�l�klar� y�kleyin
npm install

# Geli�tirme sunucusunu ba�lat�n
npx expo start --clear
```
*Geli�tirme a�amas�nda Expo Go uygulamas�n� kullanarak iOS veya Android cihaz�n�zda QR kodu tarat�p an�nda test edebilirsiniz.*

## Derleme ve Yay�nlama (Deployment)

Projenin derleme s�re�leri Expo Application Services (EAS) �zerinden otomatize edilmi�tir. 

**Test Build (APK) Almak ��in:**
```bash
eas build --platform android --profile preview
```

**Production Build (AAB) Almak ��in:**
```bash
eas build --platform android --profile production
```

**Firebase Functions Da��t�m�:**
Skorlar�n ve sat�n al�mlar�n g�venli bir �ekilde i�lenebilmesi i�in sunucu fonksiyonlar�n�n g�ncel olmas� gerekir:
```bash
firebase deploy --only functions
```

---
*Geli�tirici:* ZOVTEX
