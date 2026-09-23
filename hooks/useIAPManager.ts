import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initConnection,
  endConnection,
  getProducts,
  getSubscriptions,
  requestPurchase,
  requestSubscription,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getAvailablePurchases,
} from 'react-native-iap';
import { GEM_PACKAGES, PRODUCT_IDS, GemPackage } from '../constants/products';
import { getFunctions, httpsCallable } from 'firebase/functions';

const getLocalizedPrice = (item: any): string => {
  if (item.displayPrice) {
    return item.displayPrice;
  }
  if ('localizedPrice' in item) {
    return (item as any).localizedPrice || (item as any).price || '';
  }
  const offer = (item as any).subscriptionOffers?.[0]?.pricingPhases?.[0];
  return offer?.formattedPrice ?? item.price ?? '';
};

export function useIAPManager({
  visible,
  onPurchase,
  onPurchasePremium,
  language,
  showAlert,
}: {
  visible: boolean;
  onPurchase: (productId: string, gems: number) => Promise<void>;
  onPurchasePremium: () => Promise<void>;
  language: string;
  showAlert: (title: string, msg: string, buttons?: any[]) => void;
}) {
  const [prices, setPrices] = useState<Record<string, string> | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const onPurchaseRef = useRef(onPurchase);
  onPurchaseRef.current = onPurchase;
  const onPurchasePremiumRef = useRef(onPurchasePremium);
  onPurchasePremiumRef.current = onPurchasePremium;
  const languageRef = useRef(language);
  languageRef.current = language;
  const showAlertRef = useRef(showAlert);
  showAlertRef.current = showAlert;

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    const initIAP = async () => {
      try {
        await initConnection();
        const gemIds = GEM_PACKAGES.map(p => p.id);
        const [productResults, subscriptionResults] = await Promise.all([
          getProducts({ skus: gemIds }),
          getSubscriptions({ skus: [PRODUCT_IDS.PREMIUM_MONTHLY] }),
        ]);
        if (!cancelled) {
          setPrices(
            [...(productResults || []), ...(subscriptionResults || [])].reduce<Record<string, string>>(
              (acc, item) => {
                const price = getLocalizedPrice(item);
                if (price) acc[(item as any).productId] = price;
                return acc;
              },
              {}
            )
          );
        }
      } catch {
        // IAP not available
      }
    };

    initIAP();

    const handlePurchase = async (purchase: any) => {
      try {
        const isGem = GEM_PACKAGES.some(p => p.id === purchase.productId);
        if (!purchase.isAcknowledgedAndroid) {
          
          try {
            const functions = getFunctions();
            const verifyPurchaseFn = httpsCallable(functions, 'verifyPurchase');
            const validationResult = await verifyPurchaseFn({
              productId: purchase.productId,
              purchaseToken: purchase.purchaseToken,
              isSubscription: !isGem,
            });
            const data = validationResult.data as any;
            if (!data.success || !data.verified) {
              throw new Error('Verification failed');
            }
          } catch (verifyErr) {
            console.error('Validation error:', verifyErr);
            showAlertRef.current(
              '⚠️',
              languageRef.current === 'en' ? 'Receipt validation failed.' : 'Satın alma doğrulanamadı. (Sahte satın alım veya ağ hatası)'
            );
            return; // Abort granting gems!
          }

          const pkg = GEM_PACKAGES.find(p => p.id === purchase.productId);
          if (isGem && pkg) {
            await onPurchaseRef.current(purchase.productId, pkg.gems);
          } else if (!isGem && purchase.productId === PRODUCT_IDS.PREMIUM_MONTHLY) {
            await onPurchasePremiumRef.current();
          }
          await finishTransaction({ purchase, isConsumable: isGem });
          showAlertRef.current(
            '✅',
            languageRef.current === 'en' ? 'Purchase successful!' : 'Satın alma başarılı!'
          );
        }
      } catch {
        showAlertRef.current(
          '❌',
          languageRef.current === 'en' ? 'Purchase failed!' : 'Satın alma başarısız!'
        );
      }
    };

    const purchaseSub = purchaseUpdatedListener(handlePurchase);
    const errorSub = purchaseErrorListener(() => {
      setPurchasing(null);
    });

    return () => {
      cancelled = true;
      purchaseSub.remove();
      errorSub.remove();
      endConnection();
    };
  }, [visible]);

  const handleBuyGems = async (pkg: GemPackage) => {
    const isChild = await AsyncStorage.getItem('gq_age_gate_passed');
    if (isChild === 'child') {
      showAlertRef.current('👶', languageRef.current === 'en' ? 'In-app purchases are disabled for children.' : 'Uygulama içi satın alımlar çocuklar için kapalıdır.');
      return;
    }
    setPurchasing(pkg.id);
    try {
      await requestPurchase({ sku: pkg.id });
    } catch {
      showAlertRef.current(
        '❌',
        languageRef.current === 'en' ? 'Purchase cancelled or failed.' : 'Satın alma iptal edildi veya başarısız oldu.'
      );
    }
    setPurchasing(null);
  };

  const handlePremium = async () => {
    const isChild = await AsyncStorage.getItem('gq_age_gate_passed');
    if (isChild === 'child') {
      showAlertRef.current('👶', languageRef.current === 'en' ? 'In-app purchases are disabled for children.' : 'Uygulama içi satın alımlar çocuklar için kapalıdır.');
      return;
    }
    setPurchasing('premium');
    try {
      await requestSubscription({ sku: PRODUCT_IDS.PREMIUM_MONTHLY });
    } catch {
      showAlertRef.current(
        '❌',
        languageRef.current === 'en' ? 'Premium purchase cancelled or failed.' : 'Premium satın alma iptal edildi veya başarısız oldu.'
      );
    }
    setPurchasing(null);
  };

  const verifiedTokensRef = useRef<Set<string>>(new Set());

  const verifyReceipt = async (purchase: any, isSubscription: boolean): Promise<boolean> => {
    const token: string | undefined = purchase?.purchaseToken;
    if (token && verifiedTokensRef.current.has(token)) return true;
    const verifyPurchaseFn = httpsCallable(getFunctions(), 'verifyPurchase');
    const validationResult = await verifyPurchaseFn({
      productId: purchase.productId,
      purchaseToken: token,
      isSubscription,
    });
    const data = validationResult.data as any;
    if (data?.success && data?.verified) {
      if (token) verifiedTokensRef.current.add(token);
      return true;
    }
    return false;
  };

  const handleRestore = async () => {
    try {
      const purchases = await getAvailablePurchases();
      let restored = 0;
      // Yalnızca KALICI yetkiler (premium/abonelik) geri yüklenir.
      // Tüketilebilir gem paketleri asla yeniden verilmez (elmas çoğaltmayı önler).
      for (const purchase of purchases) {
        if (purchase.productId === PRODUCT_IDS.PREMIUM_MONTHLY) {
          if (!(await verifyReceipt(purchase, true))) continue;
          await onPurchasePremiumRef.current();
          restored++;
        }
      }
      showAlertRef.current(
        '✅',
        restored
          ? (languageRef.current === 'en' ? 'Purchases restored!' : 'Satın alımlar geri yüklendi!')
          : (languageRef.current === 'en' ? 'No purchases to restore.' : 'Geri yüklenecek satın alma bulunamadı.')
      );
    } catch {
      showAlertRef.current(
        '❌',
        languageRef.current === 'en' ? 'Could not restore purchases.' : 'Satın alımlar geri yüklenemedi.'
      );
    }
  };

  return {
    prices,
    purchasing,
    handleBuyGems,
    handlePremium,
    handleRestore,
  };
}
