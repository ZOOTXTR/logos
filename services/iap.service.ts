import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { PRODUCT_IDS as STORE_PRODUCT_IDS, GEM_PACKAGES } from '../constants/products';

// Re-export from products.ts for backward compatibility
export const PRODUCT_IDS = STORE_PRODUCT_IDS;

/** Maps product ID to gem amount (0 = premium upgrade) */
export const PRODUCT_GEM_AMOUNTS: Record<string, number> = {
  [PRODUCT_IDS.GEM_PACK_1]: 100,
  [PRODUCT_IDS.GEM_PACK_2]: 250,
  [PRODUCT_IDS.GEM_PACK_3]: 500,
  [PRODUCT_IDS.GEM_PACK_4]: 1200,
  [PRODUCT_IDS.GEM_PACK_5]: 3000,
  [PRODUCT_IDS.PREMIUM_MONTHLY]: 0,
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
    const gemIds = GEM_PACKAGES.map(p => p.id);
    const products = await RNIap.getProducts({ skus: gemIds });
    return products as RNIap.Product[];
  } catch (e) {
    console.warn('[IAP] fetchProducts failed:', e);
    return [];
  }
}

/** Request a purchase — returns productId on success, null on failure/cancel */
export async function purchaseProduct(productId: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.warn('[IAP] Purchases not available on web platform.');
    return null;
  }
  if (!connectionEstablished) {
    console.warn('[IAP] Connection not established. Call initIAP() first.');
    return null;
  }
  try {
    const purchase = await RNIap.requestPurchase({ sku: productId });
    if (purchase && (purchase as any).transactionId) {
      try {
        await RNIap.finishTransaction({ purchase: purchase as any, isConsumable: productId !== PRODUCT_IDS.PREMIUM_MONTHLY });
      } catch (finishErr) {
        console.warn('[IAP] finishTransaction failed:', finishErr);
      }
    }
    return productId;
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err.code === 'E_USER_CANCELLED') {
      return null;
    }
    console.warn('[IAP] requestPurchase failed:', err.message);
    return null;
  }
}

/** Restore previous purchases */
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
