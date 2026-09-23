import React from 'react';
import { View, TouchableOpacity, StyleSheet,  } from 'react-native';
import { Text } from './CustomText';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../constants/themes';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';

interface StorePremiumCardProps {
  isPremium: boolean;
  onPurchasePremium: () => void;
  theme: Theme;
  language: 'tr' | 'en';
  price?: string;
}

export function StorePremiumCard({
  isPremium,
  onPurchasePremium,
  theme,
  language,
  price,
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
              language === 'en' ? '✅ +50% daily spin reward' : '✅ Günlük çark ödülü +50%',
              language === 'en' ? '✅ Unlimited free hints' : '✅ Sınırsız ücretsiz ipucu',
              language === 'en' ? '✅ Free keyboard sweep' : '✅ Ücretsiz klavye süpürme',
              language === 'en' ? '✅ Exclusive premium modes' : '✅ Özel premium modlar',
              language === 'en' ? '✅ Exclusive premium themes' : '✅ Özel premium temalar',
            ].map((f, i) => (
              <Text key={i} style={styles.premiumFeature}>{f}</Text>
            ))}
          </View>
          <Text style={styles.premiumPrice}>{price ?? t.pricePromo}</Text>
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
