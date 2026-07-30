import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Prize } from './SpinWheelCanvas';

interface SpinPrizeTableProps {
  prizes: Prize[];
  theme: any;
  language: string;
}

export function SpinPrizeTable({ prizes, theme, language }: SpinPrizeTableProps) {
  const prob = (100 / prizes.length).toFixed(0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {language === 'en' ? '🏆 Available Prizes' : '🏆 Mevcut Ödüller'}
      </Text>
      {prizes.map((prize, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.prizeInfo}>
            <View style={[styles.colorDot, { backgroundColor: prize.color }]} />
            <Text style={[styles.prizeLabel, { color: theme.colors.text }]}>
              {prize.label}
            </Text>
          </View>
          <View style={[styles.probBadge, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.probText, { color: theme.colors.primaryLight }]}>
              {language === 'en' ? `${prob}% chance` : `%${prob} şans`}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  title: {
    fontSize: FONTS.size.sm,
    fontWeight: '700',
    padding: SPACING.sm,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  prizeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  prizeLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: '600',
  },
  probBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  probText: {
    fontSize: FONTS.size.sm,
    fontWeight: '700',
  },
});
