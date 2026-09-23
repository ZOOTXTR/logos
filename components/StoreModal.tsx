import React from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Text } from './CustomText';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { TRANSLATIONS } from '../constants/translations';
import { CustomAlert } from './CustomAlert';
import { StorePackList, CategoryProduct } from './StorePackList';
import { StoreRestoreButton } from './StoreRestoreButton';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { useIAPManager } from '../hooks/useIAPManager';

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
  const { alert, showAlert, hideAlert } = useCustomAlert();

  const {
    prices,
    purchasing,
    handleBuyGems,
    handlePremium,
    handleRestore,
  } = useIAPManager({
    visible,
    onPurchase,
    onPurchasePremium,
    language,
    showAlert,
  });

  const handleUnlockCategory = async (prod: CategoryProduct) => {
    if (gems < prod.cost) {
      showAlert(
        '💎',
        language === 'en' ? 'Insufficient Gems!' : 'Yetersiz Gem bakiyesi!'
      );
      return;
    }

    showAlert(
      language === 'en' ? '🔓 Unlock Category' : '🔓 Kategori Kilidini Aç',
      language === 'en'
        ? `Unlock "${prod.nameEn}" category pack for ${prod.cost} Gems?`
        : `"${prod.name}" kelime paketinin kilidini ${prod.cost} Gem karşılığında açmak istiyor musunuz?`,
      [
        {
          text: language === 'en' ? 'Cancel' : 'İptal',
          style: 'cancel',
          onPress: hideAlert
        },
        {
          text: language === 'en' ? 'Unlock' : 'Kilidi Aç',
          onPress: async () => {
            hideAlert();
            const ok = await onUnlockCategory(prod.id);
            if (ok) {
              setTimeout(() => {
                showAlert('✅', language === 'en' ? 'Category pack unlocked!' : 'Kategori paketi başarıyla açıldı!');
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
          <View style={[styles.container, { backgroundColor: theme.colors.surface }]} accessibilityViewIsModal={true}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Kapat" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} onPress={onClose}>
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
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={hideAlert}
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
