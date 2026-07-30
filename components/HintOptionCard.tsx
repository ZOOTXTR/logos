import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface HintOptionCardProps {
  emoji: string;
  title: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  theme?: any;
}

export function HintOptionCard({
  emoji,
  title,
  description,
  onPress,
  disabled,
  loading,
  theme,
}: HintOptionCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.option,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={styles.optionIcon}>{emoji}</Text>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDesc}>{description}</Text>
      </View>
      {loading && (
        <Text style={styles.badge}>...</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabled: {
    opacity: 0.6,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    color: COLORS.text,
    fontSize: FONTS.size.md,
    fontWeight: '700',
  },
  optionDesc: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.sm,
    marginTop: 2,
  },
  badge: {
    backgroundColor: COLORS.gem,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    fontSize: FONTS.size.xs,
    fontWeight: '800',
    color: '#000',
  },
});
