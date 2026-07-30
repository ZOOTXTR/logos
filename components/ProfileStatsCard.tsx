import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { Theme } from '../constants/themes';

interface ProfileStatsCardProps {
  emoji: string;
  value: string | number;
  label: string;
  theme: Theme;
}

export function ProfileStatsCard({ emoji, value, label, theme }: ProfileStatsCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '30%',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  emoji: { fontSize: 20, marginBottom: 2 },
  value: { fontSize: FONTS.size.xl, fontWeight: '900' },
  label: { fontSize: FONTS.size.xs, fontWeight: '600' },
});
