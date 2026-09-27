import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../CustomText';
import { BORDER_RADIUS } from '../../constants/theme';
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
          borderColor: theme.colors.gem,
        },
        style,
      ]}
    >
      <Text style={[styles.gem, { color: theme.colors.gem }]}>◆</Text>
      <Text style={[styles.count, { color: theme.colors.text }]}>{gems}</Text>
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
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  gem: { fontSize: 11 },
  count: {
    fontWeight: '800',
    fontSize: 14,
  },
});
