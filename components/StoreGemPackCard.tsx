import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { GemPackage } from '../constants/products';
import { Theme } from '../constants/themes';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface StoreGemPackCardProps {
  gemPackage: GemPackage;
  onPurchase: (pkg: GemPackage) => void;
  isPurchasing: boolean;
  theme: Theme;
  language: 'tr' | 'en';
}

export function StoreGemPackCard({
  gemPackage: pkg,
  onPurchase,
  isPurchasing,
  theme,
  language,
}: StoreGemPackCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.gemCard,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        pkg.popular && styles.popularCard,
      ]}
      onPress={() => onPurchase(pkg)}
      activeOpacity={0.8}
      disabled={isPurchasing}
      accessibilityLabel={pkg.gems ? `Buy ${pkg.gems} gems for ${pkg.price}` : 'Purchase item'}
    >
      {pkg.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>
            {language === 'en' ? 'BEST VALUE' : 'EN POPÜLER'}
          </Text>
        </View>
      )}
      <Text style={styles.gemIcon}>{pkg.icon}</Text>
      <View style={styles.gemInfo}>
        <Text style={[styles.gemAmount, { color: theme.colors.text }]}>
          {pkg.gems} Gem
        </Text>
        {pkg.bonus && <Text style={styles.gemBonus}>{pkg.bonus}</Text>}
      </View>
      {isPurchasing ? (
        <ActivityIndicator color={COLORS.gem} />
      ) : (
        <Text style={styles.gemPrice}>{pkg.price}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    position: 'relative',
  },
  popularCard: {
    borderColor: COLORS.gem,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: SPACING.md,
    backgroundColor: COLORS.gem,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  popularText: {
    fontSize: FONTS.size.xs,
    fontWeight: '800',
    color: '#000',
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
});
