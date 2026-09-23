import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../CustomText';
import { FONTS, SPACING } from '../../constants/theme';
import { Theme } from '../../constants/themes';

interface ScreenHeaderProps {
  theme: Theme;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  eyebrow?: string;
}

export function ScreenHeader({ theme, title, subtitle, right, eyebrow }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textWrap}>
        {eyebrow ? (
          <View style={styles.eyebrowRow}>
            <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>{eyebrow}</Text>
            <View style={[styles.eyebrowLine, { backgroundColor: theme.colors.primaryLight }]} />
          </View>
        ) : null}
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  textWrap: { flex: 1 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 6 },
  eyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  eyebrowLine: { flex: 1, height: 1, opacity: 0.6 },
  title: {
    fontFamily: FONTS.display,
    fontSize: 28,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  right: { marginTop: 4 },
});
