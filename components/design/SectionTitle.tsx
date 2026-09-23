import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../CustomText';
import { FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
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
      <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
        {icon ? `${icon}  ` : ''}{title}
      </Text>
      {line ? <View style={[styles.line, { backgroundColor: theme.colors.primaryLight }]} /> : null}
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
    fontFamily: FONTS.extrabold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  line: { flex: 1, height: 1, opacity: 0.5 },
});

export const cardStyles = {
  base: (theme: Theme): ViewStyle => ({
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  }),
};
