import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../constants/themes';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';

interface StorePremiumCardProps {
  isPremium: boolean;
  onPurchasePremium: () => void;
  theme: Theme;
  language: 'tr' | 'en';
}

export function StorePremiumCard({
  isPremium,
  onPurchasePremium,
  theme,
  language,
}: StorePremiumCardProps) {
  const t = TRANSLATIONS[language];

  if (isPremium) {
    return (
      <View
        style={[
          styles.premiumActive,
          { borderColor: theme.colors.accent, backgroundColor: theme.colors.card },
        ]}
      >
        <Text style={styles.premiumActiveText}>👑 {t.premiumMember}!</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>👑 Premium</Text>
      <TouchableOpacity onPress={onPurchasePremium} activeOpacity={0.8}>
        <LinearGradient
          colors={[COLORS.accent, '#D97706']}
          style={styles.premiumCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.premiumTitle}>{t.upgradePremium}</Text>
          <View style={styles.premiumFeatures}>
            {[
              language === 'en' ? '✅ Ad-free hints' : '✅ Reklamsız ipucu',
              language === 'en' ? '✅ Unlimited games' : '✅ Sınırsız oyun',
              language === 'en' ? '✅ Special themes' : '✅ Özel temalar',
              language === 'en' ? '✅ 2x Gem multiplier' : '✅ 2x Gem kazanma',
              language === 'en' ? '✅ 500 Gems bonus' : '✅ 500 Gem hediye',
            ].map((f, i) => (
              <Text key={i} style={styles.premiumFeature}>{f}</Text>
            ))}
          </View>
          <Text style={styles.premiumPrice}>{t.pricePromo}</Text>
        </LinearGradient>
      </TouchableOpacity>
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
  premiumCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  premiumTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: '800',
    color: '#000',
    marginBottom: SPACING.sm,
  },
  premiumFeatures: { gap: 4, marginBottom: SPACING.md },
  premiumFeature: {
    fontSize: FONTS.size.md,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  premiumPrice: {
    fontSize: FONTS.size.lg,
    fontWeight: '800',
    color: '#000',
  },
  premiumActive: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  premiumActiveText: {
    fontSize: FONTS.size.lg,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
