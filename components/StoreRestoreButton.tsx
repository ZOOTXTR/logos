import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Theme } from '../constants/themes';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface StoreRestoreButtonProps {
  onRestore?: () => void;
  theme: Theme;
  language: 'tr' | 'en';
}

export function StoreRestoreButton({
  onRestore,
  theme,
  language,
}: StoreRestoreButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.restoreBtn, { borderColor: theme.colors.border }]}
      onPress={onRestore}
      activeOpacity={0.7}
    >
      <Text style={[styles.restoreText, { color: theme.colors.textSecondary }]}>
        {language === 'en' ? 'Restore Purchases' : 'Satın Alımları Geri Yükle'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  restoreBtn: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginVertical: SPACING.lg,
    marginHorizontal: SPACING.md,
  },
  restoreText: {
    fontSize: FONTS.size.sm,
    fontWeight: '600',
  },
});
