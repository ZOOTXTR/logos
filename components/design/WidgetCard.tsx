import React from 'react';
import { StyleSheet, Pressable, ViewStyle, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, BORDER_RADIUS } from '../../constants/theme';
import { Theme } from '../../constants/themes';

interface WidgetCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  theme: Theme;
  disabled?: boolean;
  variant?: 'primary' | 'surface' | 'glass';
  span?: 1 | 2; // 1 = square, 2 = wide rectangle
}

export function WidgetCard({ children, onPress, style, theme, disabled, variant = 'surface', span = 1 }: WidgetCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (disabled || !onPress) return;
    scale.value = withSpring(0.95, { damping: 12, stiffness: 200 });
  };

  const handlePressOut = () => {
    if (disabled || !onPress) return;
    scale.value = withSpring(1, { damping: 10, stiffness: 150 });
  };

  let bgColor = theme.colors.card;
  let borderColor = theme.colors.border;

  if (variant === 'primary') {
    bgColor = theme.colors.primary;
    borderColor = theme.colors.primaryDark;
  } else if (variant === 'glass') {
    bgColor = theme.colors.card + '88'; // 50% opacity
    borderColor = theme.colors.border + '55';
  }

  return (
    <Animated.View style={[
      styles.container,
      { backgroundColor: bgColor, borderColor },
      span === 2 ? styles.span2 : styles.span1,
      style,
      animatedStyle
    ]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={styles.pressable}
      >
        {variant === 'glass' && (
          <View style={[styles.glossy, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
        )}
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24, // Very rounded for Bento style
    borderWidth: 1,
    borderBottomWidth: 3, // 3D depth
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
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
  glossy: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  }
});

