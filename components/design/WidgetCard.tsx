import React from 'react';
import { StyleSheet, Pressable, ViewStyle, View } from 'react-native';
import { BORDER_RADIUS } from '../../constants/theme';
import { Theme } from '../../constants/themes';

interface WidgetCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  theme: Theme;
  disabled?: boolean;
  variant?: 'primary' | 'surface' | 'glass';
  span?: 1 | 2 | 'auto'; // 1 = square, 2 = wide rectangle, auto = content height
}

// Temiz, düz kart: yarı saydam "cam" ve 3B alt kenar yerine düz zemin +
// ince kenarlık. Tüm ekranlarda tutarlı görünüm sağlar.
export function WidgetCard({ children, onPress, style, theme, disabled, variant = 'surface', span = 'auto' }: WidgetCardProps) {
  let bg = theme.colors.card;
  let border = theme.colors.border;

  if (variant === 'primary') {
    bg = theme.colors.primary;
    border = theme.colors.primary;
  } else if (variant === 'surface') {
    bg = theme.colors.surface;
    border = theme.colors.border;
  } else if (variant === 'glass') {
    bg = theme.colors.card;
    border = theme.colors.border;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bg, borderColor: border },
        span === 1 && styles.span1,
        span === 2 && styles.span2,
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        style={styles.pressable}
      >
        {children}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  span1: {
    flex: 1,
    aspectRatio: 1,
  },
  span2: {
    width: '100%',
    aspectRatio: 2.1,
  },
});
