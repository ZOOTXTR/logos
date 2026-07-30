export interface Sticker {
  id: string;
  emoji: string;
  nameTr: string;
  nameEn: string;
  rarity: 'common' | 'rare' | 'legendary';
  descTr: string;
  descEn: string;
}

export const STICKERS: Sticker[] = [
  { id: 'st1', emoji: '🦁', nameTr: 'Aslan Kral', nameEn: 'Lion King', rarity: 'common', descTr: 'Ormanların hakimi, asil lider.', descEn: 'Ruler of the jungle, noble leader.' },
  { id: 'st2', emoji: '🍔', nameTr: 'Kozmik Burger', nameEn: 'Cosmic Burger', rarity: 'common', descTr: 'Uzay boşluğunda süzülen lezzet.', descEn: 'Tasty burger floating in deep space.' },
  { id: 'st3', emoji: '🏛️', nameTr: 'Antik Tapınak', nameEn: 'Ancient Temple', rarity: 'rare', descTr: 'Kayıp medeniyetlerin gizli tapınağı.', descEn: 'Hidden temple of lost civilizations.' },
  { id: 'st4', emoji: '📐', nameTr: 'Gizemli Piramit', nameEn: 'Mystic Pyramid', rarity: 'rare', descTr: 'Çöl kumlarında yükselen sırlar.', descEn: 'Secrets rising in the desert sands.' },
  { id: 'st5', emoji: '🐱', nameTr: 'Neon Kedicik', nameEn: 'Neon Kitty', rarity: 'common', descTr: 'Siber sokakların şirin kedisi.', descEn: 'Cute kitty of cyber streets.' },
  { id: 'st6', emoji: '🐉', nameTr: 'Altın Ejderha', nameEn: 'Golden Dragon', rarity: 'legendary', descTr: 'Büyük bilgeliğin koruyucu efsanesi.', descEn: 'Guardian legend of ancient wisdom.' },
  { id: 'st7', emoji: '🎈', nameTr: 'Uçan Balon', nameEn: 'Hot Air Balloon', rarity: 'common', descTr: 'Bulutların üstünde macera dolu bir yolculuk.', descEn: 'Adventurous trip above the clouds.' },
  { id: 'st8', emoji: '🏙️', nameTr: 'Siber Şehir', nameEn: 'Cyber City', rarity: 'rare', descTr: 'Geleceğin neon ışıklı metropolü.', descEn: 'Neon-lit metropolis of the future.' },
  { id: 'st9', emoji: '🎁', nameTr: 'Gizemli Kutu', nameEn: 'Mystery Box', rarity: 'common', descTr: 'İçinde ne olduğu bilinmeyen tatlı hediye.', descEn: 'A sweet gift with unknown contents.' },
  { id: 'st10', emoji: '☄️', nameTr: 'Kozmik Astroit', nameEn: 'Cosmic Asteroid', rarity: 'rare', descTr: 'Evrende hızla yol alan parlak kayaç.', descEn: 'Bright rock traveling fast in space.' },
  { id: 'st11', emoji: '🐧', nameTr: 'Buzul Penguen', nameEn: 'Glacial Penguin', rarity: 'common', descTr: 'Kutup soğuğunun neşeli dansçısı.', descEn: 'Cheerful dancer of polar cold.' },
  { id: 'st12', emoji: '🌌', nameTr: 'Kutup Işıkları', nameEn: 'Aurora Borealis', rarity: 'legendary', descTr: 'Gökyüzünü süsleyen büyülü dans.', descEn: 'Magical dance decorating the night sky.' },
  { id: 'st13', emoji: '🌋', nameTr: 'Volkan Patlaması', nameEn: 'Volcano Eruption', rarity: 'rare', descTr: 'Yerin derinliklerinden gelen lav patlaması.', descEn: 'Lava blast from the depths of the earth.' },
  { id: 'st14', emoji: '🪸', nameTr: 'Mercan Yuvası', nameEn: 'Coral Reef', rarity: 'common', descTr: 'Okyanus derinliklerinde renkli yaşam.', descEn: 'Colorful life in ocean depths.' },
  { id: 'st15', emoji: '⏳', nameTr: 'Zaman Makinesi', nameEn: 'Time Machine', rarity: 'legendary', descTr: 'Zaman boyutları arasında geçiş kapısı.', descEn: 'Gateway between time dimensions.' },
];

export function getStickerById(id: string): Sticker | undefined {
  return STICKERS.find(s => s.id === id);
}

export function rollRandomStickers(count: number): Sticker[] {
  const rolled: Sticker[] = [];
  for (let i = 0; i < count; i++) {
    const rnd = Math.random() * 100;
    let filterRarity: 'common' | 'rare' | 'legendary' = 'common';
    if (rnd > 90) filterRarity = 'legendary';
    else if (rnd > 55) filterRarity = 'rare';
    const pool = STICKERS.filter(s => s.rarity === filterRarity);
    rolled.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return rolled;
}
