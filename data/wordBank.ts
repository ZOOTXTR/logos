export interface WordEntry {
  word: string;
  category: string;
  hint: string;
}

export const TURKISH_WORDS: Record<number, WordEntry[]> = {
  4: [
    { word: 'KALE', category: 'karisik', hint: 'Tarihi savunma yapısı veya futboldaki hedef' },
    { word: 'KEDİ', category: 'hayvanlar', hint: 'Mırıldayan sevimli evcil hayvan' },
    { word: 'ELMA', category: 'yiyecek', hint: 'Kırmızı veya yeşil sevilen bir meyve' },
    { word: 'ORAN', category: 'karisik', hint: 'İki büyüklük arasındaki bağıntı' },
    { word: 'KURT', category: 'hayvanlar', hint: 'Ormanların yırtıcı sürü lideri' },
    { word: 'KARS', category: 'sehirler', hint: 'Doğu Anadolu’da tarihi kale şehri' },
    { word: 'BOLU', category: 'sehirler', hint: 'Aşçıları ve Yedigöller’i ile ünlü il' },
    { word: 'ORDU', category: 'sehirler', hint: 'Karadeniz’in fındık diyarı sahil kenti' },
    { word: 'PİLA', category: 'yiyecek', hint: 'Geleneksel pirinç veya bulgur yemeği' },
    { word: 'SPOR', category: 'spor', hint: 'Beden eğitimi ve fiziksel mücadele' },
    { word: 'GÖLÜ', category: 'doga', hint: 'Karalar üzerindeki durgun su birikintisi' },
    { word: 'DAĞI', category: 'doga', hint: 'Yüksek yer kabuğu kabartısı' },
    { word: 'AĞAÇ', category: 'doga', hint: 'Kökü, gövdesi ve dalları olan bitki' },
    { word: 'AYIK', category: 'karisik', hint: 'Uyanık ve bilinci yerinde olan' },
    { word: 'YAZI', category: 'meslekler', hint: 'Düşüncelerin harflerle tespiti' }
  ],
  5: [
    { word: 'KELAM', category: 'karisik', hint: 'Söz, konuşma veya felsefi ifade' },
    { word: 'KALEM', category: 'karisik', hint: 'Yazı yazmaya veya çizmeye yarayan araç' },
    { word: 'ASLAN', category: 'hayvanlar', hint: 'Ormanların kralı olarak bilinen yırtıcı' },
    { word: 'KÖPEK', category: 'hayvanlar', hint: 'İnsanın en sadık dostu' },
    { word: 'TİLKİ', category: 'hayvanlar', hint: 'Kurnazlığı ile masallara konu olan hayvan' },
    { word: 'İZMİR', category: 'sehirler', hint: 'Ege’nin incisi, kordonu ile meşhur kent' },
    { word: 'BURSA', category: 'sehirler', hint: 'Uludağ eteklerindeki yeşil Osmanlı başkenti' },
    { word: 'SİVAS', category: 'sehirler', hint: 'İç Anadolu’nun tarihi Selçuklu şehri' },
    { word: 'MANTI', category: 'yiyecek', hint: 'Yoğurt ve sosla servis edilen hamur yemeği' },
    { word: 'BÖREK', category: 'yiyecek', hint: 'Yufka arasına peynir veya kıyma konularak pişirilen lezzet' },
    { word: 'PİZZA', category: 'yiyecek', hint: 'Fırında pişen yuvarlak İtalyan hamuru' },
    { word: 'MİMAR', category: 'meslekler', hint: 'Binaları ve yapıları tasarlayan uzman' },
    { word: 'YAZAR', category: 'meslekler', hint: 'Kitap ve edebi metin üreten sanatçı' },
    { word: 'PİLOT', category: 'meslekler', hint: 'Hava taşıtlarını sevk ve idare eden kişi' },
    { word: 'DENİZ', category: 'doga', hint: 'Yer kabuğunun çukur bölümlerini kaplayan su kütlesi' },
    { word: 'GÜNEŞ', category: 'doga', hint: 'Gezegenimize ısı ve ışık veren yıldız' },
    { word: 'GÜREŞ', category: 'spor', hint: 'Ata sporumuz olan minder ve çayır sporu' },
    { word: 'KÜREK', category: 'spor', hint: 'Su üzerinde tekne ile yapılan yarış sporu' },
    { word: 'PETEK', category: 'doga', hint: 'Arıların bal depoladığı altıgen balmumu yuvalar' },
    { word: 'SEVGİ', category: 'karisik', hint: 'İnsanı bir şeye karşı yakın ilgi duymaya yönelten duygu' },
    { word: 'BİLGİ', category: 'karisik', hint: 'Öğrenme, araştırma veya gözlem yolu ile elde edilen gerçek' },
    { word: 'GÖREV', category: 'karisik', hint: 'Bir kimsenin yapması gereken iş, vazife' }
  ],
  6: [
    { word: 'KARTAL', category: 'hayvanlar', hint: 'Yükseklerde uçan yırtıcı kuş' },
    { word: 'KAPLAN', category: 'hayvanlar', hint: 'Çizgili desenleriyle ünlü büyük kedi' },
    { word: 'ANKARA', category: 'sehirler', hint: 'Türkiye Cumhuriyeti’nin başkenti' },
    { word: 'EDİRNE', category: 'sehirler', hint: 'Selimiye Camii ile ünlü sınır kenti' },
    { word: 'YAPRAK', category: 'doga', hint: 'Ağaçların fotosentez yapan yeşil organı' },
    { word: 'TOPRAK', category: 'doga', hint: 'Bitkilerin kök saldığı bereketli örtü' },
    { word: 'DOKTOR', category: 'meslekler', hint: 'Hastalıkları teşhis ve tedavi eden hekim' },
    { word: 'RESSAM', category: 'meslekler', hint: 'Tuval üzerine resim yapan sanatçı' },
    { word: 'BAKLAVA', category: 'yiyecek', hint: 'İnce yufkalı fıstıklı şerbetli tatlı' },
    { word: 'BASKET', category: 'spor', hint: 'Potalı saha sporu terimi' }
  ],
  7: [
    { word: 'İSTANBUL', category: 'sehirler', hint: 'İki kıtayı birleştiren mega şehir' },
    { word: 'ANTALYA', category: 'sehirler', hint: 'Akdeniz’in turizm başkenti' },
    { word: 'ZÜRAFA', category: 'hayvanlar', hint: 'Dünyanın en uzun boylu memeli hayvanı' },
    { word: 'GÜVERCİN', category: 'hayvanlar', hint: 'Barışın simgesi kanatlı kuş' },
    { word: 'ENGİNAR', category: 'yiyecek', hint: 'Karaciğer dostu şifalı sebze' },
    { word: 'ÖĞRETMEN', category: 'meslekler', hint: 'Gelecek nesilleri yetiştiren eğitim neferi' },
    { word: 'ŞELALE', category: 'doga', hint: 'Yüksekten çağlayarak dökülen akarsu' },
    { word: 'MARATON', category: 'spor', hint: '42 kilometrelik uzun mesafe koşusu' }
  ]
};

export function toTurkishUpper(str: string): string {
  return str
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .toUpperCase();
}

export function getRandomWord(length: number, category: string = 'karisik'): WordEntry {
  const pool = TURKISH_WORDS[length] || TURKISH_WORDS[5];
  let filtered = pool;
  if (category !== 'karisik') {
    const matched = pool.filter((w) => w.category === category);
    if (matched.length > 0) {
      filtered = matched;
    }
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
}
