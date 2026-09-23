# Logos (GemQuest)

Logos, klasik kelime bulmaca deneyimini modern bir tasar�mla bulu�turan, oynamas� �cretsiz ve rekabet�i bir mobil oyundur. �ster g�nl�k kelimeyi ��zerek beynini �al��t�r, ister H�zl� Mod'da zamana kar�� yar��.

## Oyun Modlar�

- **G�nl�k Bulmaca:** Her g�ne �zel yeni bir kelimeyi 6 tahminde bul (Wordle tarz�).
- **Dordle:** Ayn� anda iki farkl� kelimeyi ��zmeye �al��arak s�n�rlar�n� zorla.
- **H�zl� Mod (Blitz):** 60 saniye i�inde bulabildi�in kadar kelime bul, do�ru bildik�e ek s�re kazan.
- **Kelime Zinciri:** �nceki kelimenin son harfiyle ba�layan yeni kelimeler t�reterek hayatta kal.
- **Anagram:** Sana verilen kar���k harflerden anlaml� kelimeler ��kar.

## �zellikler

- **�ift Dil Deste�i:** �ster T�rk�e, ister �ngilizce oyna.
- **Ki�iselle�tirme:** Karanl�k, Ayd�nl�k, Neon, Do�a gibi 7 farkl� g�rsel tema.
- **Eri�ilebilirlik:** Herkes i�in tasarland�; Renk k�r� modu ve disleksi dostu �zel font se�ene�i.
- **Rekabet:** Global liderlik tablosu ile di�er oyuncularla yar�� (Firebase destekli).
- **�lerleme Sistemi:** XP kazan, seviye atla, gizli ba�ar�mlar� ve rozetleri a�.

## Geli�tiriciler ��in

Proje, **React Native (Expo)** ve **Firebase** mimarisiyle s�f�rdan geli�tirilmi�tir. Temiz kod prensipleri ve kat� tip g�venli�i (Strict TypeScript) merkeze al�nm��t�r.

Projeyi kendi bilgisayar�n�zda �al��t�rmak i�in:

```bash
# Ba��ml�l�klar� y�kle
npm install

# Expo sunucusunu ba�lat
npx expo start
```

*Not:* Hile korumas� (anti-cheat) ve IAP do�rulamalar� Firebase Cloud Functions �zerinde �al���r. Kendi projenizde denemek isterseniz `firebase deploy --only functions` komutuyla backend'i aya�a kald�rmay� unutmay�n.

---
**ZOVTEX** taraf�ndan geli�tirilmi�tir.
