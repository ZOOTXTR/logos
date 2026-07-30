import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Sticker } from '../constants/stickers';

const RARITY_COLORS = {
  common: { text: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.1)', border: '#4B5563' },
  rare: { text: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', border: '#2563EB' },
  legendary: { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: '#D97706' },
};

interface StickerGridCardProps {
  sticker: Sticker;
  isUnlocked: boolean;
  language: string;
  theme: any;
}

export function StickerGridCard({ sticker, isUnlocked, language, theme }: StickerGridCardProps) {
  const colors = RARITY_COLORS[sticker.rarity];
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: isUnlocked ? colors.border : theme.colors.border,
          opacity: isUnlocked ? 1 : 0.45,
        },
      ]}
    >
      <Text style={[styles.emoji, !isUnlocked && { opacity: 0.1 }]}>
        {isUnlocked ? sticker.emoji : '❓'}
      </Text>
      <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
        {isUnlocked ? (language === 'en' ? sticker.nameEn : sticker.nameTr) : '???'}
      </Text>
      {isUnlocked ? (
        <View style={[styles.rarityPill, { backgroundColor: colors.bg }]}>
          <Text style={[styles.rarityText, { color: colors.text }]}>{sticker.rarity.toUpperCase()}</Text>
        </View>
      ) : (
        <Text style={[styles.locked, { color: theme.colors.textMuted }]}>
          {language === 'en' ? 'Locked' : 'Kilitli'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '31%',
    aspectRatio: 0.85,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  emoji: { fontSize: 28 },
  name: { fontSize: 10, fontWeight: '800', textAlign: 'center' },
  rarityPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  rarityText: { fontSize: 8, fontWeight: '900' },
  locked: { fontSize: 9, fontWeight: '800' },
});
