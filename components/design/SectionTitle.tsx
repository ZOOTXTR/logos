import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../CustomText';
import { SPACING } from '../../constants/theme';
import { Theme } from '../../constants/themes';

interface SectionTitleProps {
  theme: Theme;
  title: string;
  icon?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
  line?: boolean;
}

export function SectionTitle({ theme, title, icon, right, style, line }: SectionTitleProps) {
  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {icon ? `${icon}  ` : ''}{title}
      </Text>
      {line ? <View style={[styles.line, { backgroundColor: theme.colors.border }]} /> : null}
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  title: {
    fontWeight: '800',
    fontSize: 15,
  },
  line: { flex: 1, height: 1 },
});

export const cardStyles = {
  base: (theme: Theme): ViewStyle => ({
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: SPACING.md,
  }),
};
