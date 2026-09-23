import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Text } from '../CustomText';
import { FONTS, BORDER_RADIUS } from '../../constants/theme';
import { Theme } from '../../constants/themes';

interface AppButtonProps {
  theme: Theme;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'dark' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const HEIGHTS = { sm: 36, md: 46, lg: 54 } as const;

export function AppButton({
  theme, label, onPress, variant = 'primary', size = 'md',
  loading, disabled, icon, style, accessibilityLabel,
}: AppButtonProps) {
  const bg = {
    primary: theme.colors.primary,
    accent: theme.colors.accent,
    dark: '#2A241C',
    outline: 'transparent',
  }[variant];
  const fg = {
    primary: theme.id === 'light' ? '#FBF7EE' : '#FFF8EC',
    accent: '#FFF8EC',
    dark: '#F3E9D2',
    outline: theme.colors.primaryLight,
  }[variant];
  const borderColor = {
    primary: theme.colors.primaryDark,
    accent: theme.colors.primaryDark,
    dark: '#171310',
    outline: theme.colors.primary,
  }[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.base,
        { height: HEIGHTS[size], backgroundColor: bg, borderColor },
        variant === 'outline' && { borderWidth: 1.5 },
        variant === 'primary' && { shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 4 },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.label, { color: fg, fontSize: size === 'sm' ? 12 : 14 }]}>
          {icon ? `${icon}  ` : ''}{label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  label: {
    fontFamily: FONTS.extrabold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
