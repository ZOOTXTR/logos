import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RNIap, {
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
  type ProductPurchase,
  type SubscriptionPurchase,
  type Product,
  type Subscription,
} from 'react-native-iap';

const getLocalizedPrice = (item: Product | Subscription): string => {
  if ('localizedPrice' in item) {
    return item.localizedPrice || item.price || '';
  }
  const offer = item.subscriptionOfferDetails?.[0];
  return offer?.pricingPhases.pricingPhaseList[0]?.formattedPrice ?? '';
};
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { GEM_PACKAGES, GemPackage, PRODUCT_IDS } from '../constants/products';
import { useTheme } from '../hooks/useTheme';
import { TRANSLATIONS } from '../constants/translations';
import { CustomAlert } from './CustomAlert';
import { StorePackList, CategoryProduct } from './StorePackList';
import { StoreRestoreButton } from './StoreRestoreButton';

interface StoreModalProps {
  visible: boolean;
  onClose: () => void;
  gems: number;
  isPremium: boolean;
  onPurchase: (productId: string, gems: number) => Promise<void>;
  onPurchasePremium: () => Promise<void>;
  unlockedCategories: string[];
  onUnlockCategory: (cat: string) => Promise<any>;
}

export function StoreModal({
  visible,
  onClose,
  gems,
  isPremium,
  onPurchase,
  onPurchasePremium,
  unlockedCategories,
  onUnlockCategory,
}: StoreModalProps) {
  const { theme, language } = useTheme();
  const t = TRANSLATIONS[language];
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, string> | null>(null);
  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{ text: string; onPress?: () => void; style?: 'cancel' | 'default' | 'destructive' }>;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showCustomAlert = (
    title: string,
    message: string,
    buttons?: Array<{ text: string; onPress?: () => void; style?: 'cancel' | 'default' | 'destructive' }>
  ) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      buttons: buttons || [{
        text: 'Tamam',
        onPress: () => setCustomAlert(prev => ({ ...prev, visible: false }))
      }]
    });
  };

  const onPurchaseRef = useRef(onPurchase);
  onPurchaseRef.current = onPurchase;
  const onPurchasePremiumRef = useRef(onPurchasePremium);
  onPurchasePremiumRef.current = onPurchasePremium;
  const languageRef = useRef(language);
  languageRef.current = language;
  const showAlertRef = useRef(showCustomAlert);
  showAlertRef.current = showCustomAlert;

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    const initIAP = async () => {
      try {
        await initConnection();
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        const gemIds = GEM_PACKAGES.map(p => p.id);
        const [productResults, subscriptionResults] = await Promise.all([
          getProducts({ skus: gemIds }),
          getSubscriptions({ skus: [PRODUCT_IDS.PREMIUM_MONTHLY] }),
        ]);
        if (!cancelled) {
          setPrices(
            [...productResults, ...subscriptionResults].reduce<Record<string, string>>(
              (acc, item) => {
                const price = getLocalizedPrice(item);
                if (price) acc[item.productId] = price;
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

    const handlePurchase = async (purchase: ProductPurchase | SubscriptionPurchase) => {
      try {
        const isGem = GEM_PACKAGES.some(p => p.id === purchase.productId);
        if (!purchase.isAcknowledgedAndroid) {
          const pkg = GEM_PACKAGES.find(p => p.id === purchase.productId);
          if (isGem && pkg) {
            await onPurchaseRef.current(purchase.productId, pkg.gems);
          } else if (!isGem && purchase.productId === PRODUCT_IDS.PREMIUM_LIFETIME) {
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
    setPurchasing(pkg.id);
    try {
      await requestPurchase({ sku: pkg.id });
      // Result comes through purchaseUpdatedListener
    } catch {
      try {
        await onPurchase(pkg.id, pkg.gems);
        showCustomAlert(
          '✅',
          language === 'en' ? 'Purchase Successful!' : 'Satın alma başarılı!'
        );
      } catch {
        showCustomAlert(
          '❌',
          language === 'en' ? 'Purchase failed!' : 'Satın alma başarısız!'
        );
      }
    }
    setPurchasing(null);
  };

  const handlePremium = async () => {
    setPurchasing('premium');
    try {
      await requestSubscription({ sku: PRODUCT_IDS.PREMIUM_MONTHLY });
      // Result comes through purchaseUpdatedListener
    } catch {
      try {
        await onPurchasePremium();
        showCustomAlert(
          '✅',
          language === 'en' ? 'Premium activated!' : 'Premium başarıyla aktifleştirildi!'
        );
      } catch {
        showCustomAlert(
          '❌',
          language === 'en' ? 'Premium purchase failed!' : 'Premium satın alma başarısız!'
        );
      }
    }
    setPurchasing(null);
  };

  const handleRestore = async () => {
    try {
      const purchases = await getAvailablePurchases();
      let restored = 0;
      for (const purchase of purchases) {
        const isGem = GEM_PACKAGES.some(p => p.id === purchase.productId);
        if (isGem) {
          const pkg = GEM_PACKAGES.find(p => p.id === purchase.productId);
          if (pkg) {
            await onPurchase(purchase.productId, pkg.gems);
            restored++;
          }
        } else if (purchase.productId === PRODUCT_IDS.PREMIUM_LIFETIME || purchase.productId === PRODUCT_IDS.PREMIUM_MONTHLY) {
          await onPurchasePremium();
          restored++;
        }
      }
      showCustomAlert(
        '✅',
        restored
          ? (language === 'en' ? 'Purchases restored!' : 'Satın alımlar geri yüklendi!')
          : (language === 'en' ? 'No purchases to restore.' : 'Geri yüklenecek satın alma bulunamadı.')
      );
    } catch {
      showCustomAlert(
        '✅',
        language === 'en' ? 'Purchases restored (simulated)!' : 'Satın alımlar geri yüklendi (simüle)!'
      );
    }
  };

  const handleUnlockCategory = async (prod: CategoryProduct) => {
    if (gems < prod.cost) {
      showCustomAlert(
        '💎',
        language === 'en' ? 'Insufficient Gems!' : 'Yetersiz Gem bakiyesi!'
      );
      return;
    }

    showCustomAlert(
      language === 'en' ? '🔓 Unlock Category' : '🔓 Kategori Kilidini Aç',
      language === 'en'
        ? `Unlock "${prod.nameEn}" category pack for ${prod.cost} Gems?`
        : `"${prod.name}" kelime paketinin kilidini ${prod.cost} Gem karşılığında açmak istiyor musunuz?`,
      [
        {
          text: language === 'en' ? 'Cancel' : 'İptal',
          style: 'cancel',
          onPress: () => setCustomAlert(prev => ({ ...prev, visible: false }))
        },
        {
          text: language === 'en' ? 'Unlock' : 'Kilidi Aç',
          onPress: async () => {
            setCustomAlert(prev => ({ ...prev, visible: false }));
            const ok = await onUnlockCategory(prod.id);
            if (ok) {
              setTimeout(() => {
                showCustomAlert('✅', language === 'en' ? 'Category pack unlocked!' : 'Kategori paketi başarıyla açıldı!');
              }, 400);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.storeEmoji}>🏪</Text>
              <Text style={styles.storeTitle}>{language === 'en' ? 'Shop' : 'Mağaza'}</Text>
              <View style={styles.gemBadge}>
                <Text style={styles.gemBadgeText}>💎 {gems}</Text>
              </View>
            </LinearGradient>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              <StorePackList
                isPremium={isPremium}
                unlockedCategories={unlockedCategories}
                onUnlockCategory={handleUnlockCategory}
                onPremium={handlePremium}
                onPurchaseGem={handleBuyGems}
                purchasing={purchasing}
                prices={prices ?? undefined}
                theme={theme}
                language={language}
              />
              <StoreRestoreButton
                onRestore={handleRestore}
                theme={theme}
                language={language}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={customAlert.visible}
        title={customAlert.title}
        message={customAlert.message}
        buttons={customAlert.buttons}
        onClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
  },
  header: {
    padding: SPACING.lg,
    alignItems: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.sm,
  },
  closeX: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONTS.size.lg,
    fontWeight: '600',
  },
  storeEmoji: { fontSize: 36 },
  storeTitle: {
    fontSize: FONTS.size.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  gemBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
  },
  gemBadgeText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: FONTS.size.md,
  },
  scroll: { padding: SPACING.md },
});
