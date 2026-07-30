import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { FONTS, SPACING } from '../constants/theme';
import { audioService } from '../services/audio.service';

interface SettingColors {
  text: string;
  primaryLight: string;
  textMuted: string;
  border: string;
  primary: string;
}

interface SettingToggleProps {
  label: string;
  emoji: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  description?: string;
  colors: SettingColors;
  language: string;
}

export function SettingToggle({ label, emoji, value, onToggle, description, colors, language }: SettingToggleProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => {
        audioService.triggerHaptic('light');
        onToggle(!value);
      }}
      activeOpacity={0.7}
      accessibilityLabel={`Toggle ${label}`}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
        )}
      </View>
      <Text style={{
        color: value ? colors.primaryLight : colors.textMuted,
        fontSize: FONTS.size.sm,
        fontWeight: '800',
        marginRight: SPACING.sm
      }}>
        {value ? (language === 'en' ? 'ON' : 'AÇIK') : (language === 'en' ? 'OFF' : 'KAPALI')}
      </Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.text}
        style={{ pointerEvents: 'none' }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  emoji: { fontSize: 20, width: 28 },
  labelContainer: { flex: 1 },
  label: { fontSize: FONTS.size.md, fontWeight: '500' },
  description: { fontSize: FONTS.size.xs, marginTop: 2 },
});
