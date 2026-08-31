import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';

// Product IDs must match App Store Connect / Google Play Console exactly
export const PRODUCT_IDS = {
  PREMIUM: Platform.OS === 'ios' ? 'com.logos.premium' : 'com.logos.premium',
  GEMS_100:  Platform.OS === 'ios' ? 'com.logos.gems100'  : 'com.logos.gems100',
  GEMS_500:  Platform.OS === 'ios' ? 'com.logos.gems500'  : 'com.logos.gems500',
  GEMS_1200: Platform.OS === 'ios' ? 'com.logos.gems1200' : 'com.logos.gems1200',
  GEMS_3000: Platform.OS === 'ios' ? 'com.logos.gems3000' : 'com.logos.gems3000',
} as const;

export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

/** Maps product ID to gem amount (0 = premium upgrade) */
export const PRODUCT_GEM_AMOUNTS: Record<string, number> = {
  [PRODUCT_IDS.PREMIUM]:   0,
  [PRODUCT_IDS.GEMS_100]:  100,
  [PRODUCT_IDS.GEMS_500]:  500,
  [PRODUCT_IDS.GEMS_1200]: 1200,
  [PRODUCT_IDS.GEMS_3000]: 3000,
};

let connectionEstablished = false;

/** Initialize IAP connection — call once at app startup */
export async function initIAP(): Promise<boolean> {
  if (Platform.OS === 'web') return false; // IAP not available on web
  try {
    await RNIap.initConnection();
    connectionEstablished = true;
    return true;
  } catch (e) {
    console.warn('[IAP] initConnection failed:', e);
    return false;
  }
}

/** Fetch available products from the store */
export async function fetchProducts(): Promise<RNIap.Product[]> {
  if (!connectionEstablished || Platform.OS === 'web') return [];
  try {
    const products = await RNIap.getProducts({ skus: Object.values(PRODUCT_IDS) });
    return products;
  } catch (e) {
    console.warn('[IAP] fetchProducts failed:', e);
    return [];
  }
}

/** Request a purchase — returns productId on success, null on failure/cancel */
export async function purchaseProduct(productId: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    // On web: simulate for development only
    console.warn('[IAP] Purchases not available on web platform.');
    return null;
  }
  if (!connectionEstablished) {
    console.warn('[IAP] Connection not established. Call initIAP() first.');
    return null;
  }
  try {
    const purchase = await RNIap.requestPurchase({ sku: productId });
    // Acknowledge the purchase to prevent refund by the store
    if (purchase && (purchase as RNIap.ProductPurchase).transactionId) {
      try {
        await RNIap.finishTransaction({ purchase: purchase as RNIap.ProductPurchase, isConsumable: productId !== PRODUCT_IDS.PREMIUM });
      } catch (finishErr) {
        console.warn('[IAP] finishTransaction failed:', finishErr);
      }
    }
    return productId;
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err.code === 'E_USER_CANCELLED') {
      return null; // User cancelled — not an error
    }
    console.warn('[IAP] requestPurchase failed:', err.message);
    return null;
  }
}

/** Restore previous purchases (for iOS) */
export async function restorePurchases(): Promise<string[]> {
  if (Platform.OS === 'web') return [];
  if (!connectionEstablished) return [];
  try {
    const purchases = await RNIap.getAvailablePurchases();
    return purchases.map(p => p.productId);
  } catch (e) {
    console.warn('[IAP] restorePurchases failed:', e);
    return [];
  }
}

/** Clean up IAP connection */
export async function endIAP(): Promise<void> {
  if (Platform.OS === 'web' || !connectionEstablished) return;
  try {
    await RNIap.endConnection();
    connectionEstablished = false;
  } catch (e) {
    console.warn('[IAP] endConnection failed:', e);
  }
}
