// Google Play Store Product IDs (SKUs)
// Bu ID'leri Play Console'da da aynı şekilde tanımlamalısınız

export const PRODUCT_IDS = {
  // Consumable - Tüketilebilir Gem Paketleri
  GEM_SMALL: 'com.zovtex.logos.gems.small',      // 100 Gem - ₺29.99
  GEM_MEDIUM: 'com.zovtex.logos.gems.medium',    // 500 Gem - ₺99.99
  GEM_LARGE: 'com.zovtex.logos.gems.large',      // 1500 Gem - ₺249.99

  // Non-consumable - Kalıcı Premium
  PREMIUM_LIFETIME: 'com.zovtex.logos.premium.lifetime', // ₺149.99

  // Subscription - Aylık Premium
  PREMIUM_MONTHLY: 'com.zovtex.logos.premium.monthly',   // ₺29.99/ay
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
    id: PRODUCT_IDS.GEM_SMALL,
    gems: 100,
    price: '₺29.99',
    icon: '💎',
  },
  {
    id: PRODUCT_IDS.GEM_MEDIUM,
    gems: 500,
    price: '₺99.99',
    bonus: '+50 Bonus!',
    popular: true,
    icon: '💎💎',
  },
  {
    id: PRODUCT_IDS.GEM_LARGE,
    gems: 1500,
    price: '₺249.99',
    bonus: '+300 Bonus!',
    icon: '💎💎💎',
  },
];

export const HINT_GEM_COST = 50; // Bir ipucu için harcanan gem miktarı
