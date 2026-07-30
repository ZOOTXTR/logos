import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface StreakBannerProps {
  streak: number;
  bonusGems?: number;
}

export function StreakBanner({ streak, bonusGems }: StreakBannerProps) {
  if (streak < 2) return null;

  const getStreakColor = (): [string, string] => {
    if (streak >= 30) return ['#7C3AED', '#4F46E5'];
    if (streak >= 7)  return ['#EF4444', '#DC2626'];
    if (streak >= 3)  return ['#F59E0B', '#D97706'];
    return ['#374151', '#1F2937'];
  };

  const getStreakLabel = () => {
    if (streak >= 30) return '👑 Efsane Seri!';
    if (streak >= 7)  return '🌋 Yakıcı Seri!';
    if (streak >= 3)  return '🔥 Harika Seri!';
    return '🔥 Seri Devam Ediyor!';
  };

  return (
    <LinearGradient
      colors={getStreakColor()}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Text style={styles.label}>{getStreakLabel()}</Text>
      <Text style={styles.count}>{streak} GÜN</Text>
      {bonusGems && bonusGems > 0 && (
        <Text style={styles.bonus}>+{bonusGems} 💎 Bonus!</Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  label: {
    color: COLORS.text,
    fontSize: FONTS.size.sm,
    fontWeight: '700',
  },
  count: {
    color: COLORS.text,
    fontSize: FONTS.size.lg,
    fontWeight: '900',
  },
  bonus: {
    color: '#FFF',
    fontSize: FONTS.size.sm,
    fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
});
