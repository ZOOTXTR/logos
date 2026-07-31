import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { GEM_PACKAGES, GemPackage, PRODUCT_IDS } from '../constants/products';
import { Theme } from '../constants/themes';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import { StoreGemPackCard } from './StoreGemPackCard';
import { StorePremiumCard } from './StorePremiumCard';

export interface CategoryProduct {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  cost: number;
}

const CATEGORY_PRODUCTS: CategoryProduct[] = [
  { id: 'sehirler', name: 'Şehirler', nameEn: 'Cities', emoji: '🏙️', cost: 100 },
  { id: 'meslekler', name: 'Meslekler', nameEn: 'Jobs', emoji: '👨‍⚕️', cost: 100 },
  { id: 'doga', name: 'Doğa', nameEn: 'Nature', emoji: '🌲', cost: 100 },
];

interface StorePackListProps {
  isPremium: boolean;
  unlockedCategories: string[];
  onUnlockCategory: (prod: CategoryProduct) => void;
  onPremium: () => void;
  onPurchaseGem: (pkg: GemPackage) => void;
  purchasing: string | null;
  prices?: Record<string, string>;
  theme: Theme;
  language: 'tr' | 'en';
}

export function StorePackList({
  isPremium,
  unlockedCategories,
  onUnlockCategory,
  onPremium,
  onPurchaseGem,
  purchasing,
  prices,
  theme,
  language,
}: StorePackListProps) {
  const t = TRANSLATIONS[language];

  return (
    <View>
      <StorePremiumCard
        isPremium={isPremium}
        onPurchasePremium={onPremium}
        price={prices?.[PRODUCT_IDS.PREMIUM_MONTHLY]}
        theme={theme}
        language={language}
      />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          🔤 {language === 'en' ? 'Category Word Packs' : 'Kelime Paketleri'}
        </Text>
        {CATEGORY_PRODUCTS.map((prod) => {
          const isUnlocked = unlockedCategories.includes(prod.id);
          return (
            <TouchableOpacity
              key={prod.id}
              style={[styles.gemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => !isUnlocked && onUnlockCategory(prod)}
              activeOpacity={0.8}
              disabled={isUnlocked}
            >
              <Text style={styles.gemIcon}>{prod.emoji}</Text>
              <View style={styles.gemInfo}>
                <Text style={[styles.gemAmount, { color: theme.colors.text }]}>
                  {language === 'en' ? prod.nameEn : prod.name}
                </Text>
                <Text style={[styles.gemBonus, { color: theme.colors.textSecondary }]}>
                  {isUnlocked
                    ? (language === 'en' ? 'Unlocked' : 'Kilit Açık')
                    : (language === 'en' ? 'Expand Category Pool' : 'Kelime Haznesini Genişlet')}
                </Text>
              </View>
              {isUnlocked ? (
                <Text style={{ color: theme.colors.correct, fontWeight: '800', fontSize: FONTS.size.sm }}>✓</Text>
              ) : (
                <Text style={styles.gemPrice}>{prod.cost} 💎</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>💎 {t.buyGems}</Text>
        {GEM_PACKAGES.map((pkg) => (
          <StoreGemPackCard
            key={pkg.id}
            gemPackage={pkg}
            onPurchase={onPurchaseGem}
            isPurchasing={purchasing === pkg.id}
            price={prices?.[pkg.id]}
            theme={theme}
            language={language}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
          {language === 'en'
            ? 'All purchases are processed securely through Google Play Billing.'
            : 'Tüm satın alımlar Google Play üzerinden güvenli şekilde işlenir.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  gemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    position: 'relative',
  },
  gemIcon: { fontSize: 32, marginRight: SPACING.md },
  gemInfo: { flex: 1 },
  gemAmount: {
    fontSize: FONTS.size.lg,
    fontWeight: '700',
  },
  gemBonus: {
    fontSize: FONTS.size.sm,
    fontWeight: '600',
  },
  gemPrice: {
    fontSize: FONTS.size.md,
    fontWeight: '700',
    color: COLORS.accent,
  },
  footer: {
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  footerText: {
    fontSize: FONTS.size.xs,
    textAlign: 'center',
  },
});
