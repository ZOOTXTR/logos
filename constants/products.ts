// Google Play Store Product IDs (SKUs)
// Bu ID'ler Play Console'daki ürün kimlikleriyle birebir eşleşmelidir

export const PRODUCT_IDS = {
  // Consumable - Tüketilebilir Gem Paketleri
  GEM_PACK_1: 'gem_pack_1',    // 100 Gem - ₺12.99
  GEM_PACK_2: 'gem_pack_2',    // 250 Gem - ₺24.99
  GEM_PACK_3: 'gem_pack_3',    // 500 Gem - ₺39.99
  GEM_PACK_4: 'gem_pack_4',    // 1200 Gem - ₺79.99
  GEM_PACK_5: 'gem_pack_5',    // 3000 Gem - ₺149.99

  // Subscription - Aylık Premium
  PREMIUM_MONTHLY: 'premium_monthly',   // ₺49.99/ay
} as const;

export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

export interface GemPackage {
  id: ProductId;
  gems: number;
  price: string;
  bonus?: string;
  popular?: boolean;
  icon: string;
}

export const GEM_PACKAGES: GemPackage[] = [
  {
    id: PRODUCT_IDS.GEM_PACK_1,
    gems: 100,
    price: '₺12.99',
    icon: '💎',
  },
  {
    id: PRODUCT_IDS.GEM_PACK_2,
    gems: 250,
    price: '₺24.99',
    bonus: '+25 Bonus!',
    icon: '💎💎',
  },
  {
    id: PRODUCT_IDS.GEM_PACK_3,
    gems: 500,
    price: '₺39.99',
    bonus: '+50 Bonus!',
    popular: true,
    icon: '💎💎💎',
  },
  {
    id: PRODUCT_IDS.GEM_PACK_4,
    gems: 1200,
    price: '₺79.99',
    bonus: '+200 Bonus!',
    icon: '👑',
  },
  {
    id: PRODUCT_IDS.GEM_PACK_5,
    gems: 3000,
    price: '₺149.99',
    bonus: '+500 Bonus!',
    icon: '🏆',
  },
];

export const HINT_GEM_COST = 50; // Bir ipucu için harcanan gem miktarı
