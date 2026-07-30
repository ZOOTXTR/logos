import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { audioService } from '../services/audio.service';
import { Theme } from '../constants/themes';

interface ModeCardProps {
  mode: string;
  icon: string;
  title: string;
  description: string;
  gemCost: number;
  isUnlocked: boolean;
  premium: boolean;
  onSelect: (mode: string) => void;
  theme: Theme;
  language: 'tr' | 'en';
}

export function ModeCard({
  mode, icon, title, description, gemCost,
  isUnlocked, premium, onSelect, theme, language,
}: ModeCardProps) {
  const locked = !isUnlocked;
  const handlePress = () => {
    if (locked) return;
    audioService.triggerHaptic('light');
    onSelect(mode);
  };

  return (
    <TouchableOpacity
      style={[styles.wrapper, locked && styles.locked]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={locked}
      accessibilityLabel={`Play ${mode} mode`}
    >
      <LinearGradient
        colors={[theme.colors.card, locked ? theme.colors.absent : theme.colors.surfaceLight]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.icon}>{locked ? '🔒' : icon}</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.desc, { color: theme.colors.textMuted }]} numberOfLines={2}>
          {description}
        </Text>
        <View style={styles.badgeRow}>
          {premium && (
            <View style={[styles.badge, { backgroundColor: theme.colors.accent + '33' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.accent }]}>👑 Premium</Text>
            </View>
          )}
          {!locked && gemCost > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.gem + '33' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.gem }]}>💎 {gemCost}</Text>
            </View>
          )}
          {locked && (
            <View style={[styles.badge, { backgroundColor: theme.colors.textMuted + '33' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.textMuted }]}>
                🔒 {language === 'en' ? 'Locked' : 'Kilitli'}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '48%', marginBottom: SPACING.sm },
  locked: { opacity: 0.6 },
  gradient: {
    borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, alignItems: 'center',
    borderWidth: 1, borderColor: 'transparent', minHeight: 130,
  },
  icon: { fontSize: 28, marginBottom: 4 },
  title: { fontSize: FONTS.size.sm, fontWeight: '800', textAlign: 'center', marginBottom: 2 },
  desc: { fontSize: 9, textAlign: 'center', lineHeight: 12, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm },
  badgeText: { fontSize: 8, fontWeight: '800' },
});
