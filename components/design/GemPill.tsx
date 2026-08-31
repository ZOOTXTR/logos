import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { FONTS, BORDER_RADIUS } from '../../constants/theme';
import { Theme } from '../../constants/themes';

interface GemPillProps {
  theme: Theme;
  gems: number;
  style?: ViewStyle;
}

export function GemPill({ theme, gems, style }: GemPillProps) {
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.primaryLight,
        },
        style,
      ]}
    >
      <Text style={styles.gem}>◆</Text>
      <Text style={[styles.count, { color: theme.colors.primaryLight }]}>{gems}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  gem: { color: '#D9B65A', fontSize: 11 },
  count: {
    fontFamily: FONTS.extrabold,
    fontSize: 14,
  },
});
