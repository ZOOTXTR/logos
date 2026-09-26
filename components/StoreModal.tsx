import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Text } from './CustomText';
import { Gem, X, Crown } from 'lucide-react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
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
  onUnlockCategory: (cat: string) => Promise<unknown>;
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
  const { alert, showAlert, hideAlert } = useCustomAlert();
  const [tab, setTab] = useState<'elmas' | 'premium'>('elmas');

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
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
              <View style={styles.headerLeft}>
                <View style={[styles.headerIcon, { backgroundColor: theme.colors.accent + '33', borderColor: theme.colors.border }]}>
                  <Gem size={16} color={theme.colors.accent} />
                </View>
                <View>
                  <Text style={[styles.storeTitle, { color: theme.colors.text }]}>{language === 'en' ? 'Shop & Premium' : 'Mağaza & Premium'}</Text>
                  <Text style={[styles.storeSub, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Top up gems or go Premium' : 'Elmas yükle veya Premium\'a geç'}</Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <View style={[styles.gemBadge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <Gem size={12} color={theme.colors.accent} />
                  <Text style={[styles.gemBadgeText, { color: theme.colors.accent }]}>{gems}</Text>
                </View>
                <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} accessibilityRole="button" accessibilityLabel="Kapat" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} onPress={onClose}>
                  <X size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.segmented, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setTab('elmas')}
                style={[styles.segBtn, tab === 'elmas' && { backgroundColor: theme.colors.accent }]}
              >
                <Gem size={14} color={tab === 'elmas' ? '#0B0C10' : theme.colors.textMuted} />
                <Text style={[styles.segText, { color: tab === 'elmas' ? '#0B0C10' : theme.colors.textMuted }]}>
                  {language === 'en' ? 'Gem Packs' : 'Elmas Paketleri'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setTab('premium')}
                style={[styles.segBtn, tab === 'premium' && { backgroundColor: '#F59E0B' }]}
              >
                <Crown size={14} color={tab === 'premium' ? '#0B0C10' : theme.colors.present} />
                <Text style={[styles.segText, { color: tab === 'premium' ? '#0B0C10' : theme.colors.textMuted }]}>Premium VIP</Text>
                {isPremium && <View style={[styles.segDot, { backgroundColor: '#22C55E' }]} />}
              </TouchableOpacity>
            </View>

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
                tab={tab}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerIcon: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  storeTitle: {
    fontSize: FONTS.size.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  storeSub: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  gemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  gemBadgeText: {
    fontWeight: '700',
    fontSize: FONTS.size.sm,
  },
  segmented: { flexDirection: 'row', marginHorizontal: SPACING.md, marginTop: SPACING.sm, borderRadius: 14, borderWidth: 1, padding: 4, gap: 4 },
  segBtn: { flex: 1, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  segText: { fontSize: 12, fontWeight: '700' },
  segDot: { width: 6, height: 6, borderRadius: 3 },
  scroll: { padding: SPACING.md },
});
