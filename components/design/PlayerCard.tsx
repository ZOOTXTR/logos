import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from '../CustomText';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { LevelInfo, getXPProgress } from '../../constants/levels';
import { Theme } from '../../constants/themes';

interface PlayerCardProps {
  theme: Theme;
  language: 'tr' | 'en';
  xp: number;
  levelInfo: LevelInfo | null;
  streak: number;
  streakBonus?: number;
  gems: number;
  right?: React.ReactNode;
}

const getStreakFlame = (streak: number): [string, string] | null => {
  if (streak >= 30) return ['#7C3AED', '#4F46E5'];
  if (streak >= 7) return ['#EF4444', '#DC2626'];
  if (streak >= 3) return ['#F59E0B', '#D97706'];
  if (streak >= 2) return ['#D9B65A', '#8A5E22'];
  return null;
};

const getStreakLabel = (streak: number, language: 'tr' | 'en') => {
  if (streak >= 30) return language === 'en' ? 'Legendary Streak!' : '👑 Efsane Seri!';
  if (streak >= 7) return language === 'en' ? 'Burning Streak!' : '🌋 Yakıcı Seri!';
  if (streak >= 3) return language === 'en' ? 'Great Streak!' : '🔥 Harika Seri!';
  return language === 'en' ? '🔥 Streak Alive!' : '🔥 Seri Devam Ediyor!';
};

export function PlayerCard({ theme, language, xp, levelInfo, streak, streakBonus, gems, right }: PlayerCardProps) {
  const { current, needed, percent } = getXPProgress(xp);
  const animWidth = useRef(new Animated.Value(0)).current;
  const flame = getStreakFlame(streak);

  useEffect(() => {
    Animated.spring(animWidth, {
      toValue: percent,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
  }, [percent]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {flame && (
        <LinearGradient
          colors={flame}
          style={styles.flameStrip}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}

      <View style={styles.topRow}>
        <View style={styles.levelWrap}>
          <View style={[styles.levelBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.levelNum}>Lv.{levelInfo?.level ?? 1}</Text>
          </View>
          <Text style={[styles.levelTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {levelInfo?.title ?? ''}
          </Text>
        </View>
        {right ? <View style={styles.rightSlot}>{right}</View> : null}
      </View>

      <View style={[styles.track, { backgroundColor: theme.colors.surface }]}>
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: levelInfo?.color ?? theme.colors.primaryLight,
              transform: [{ scaleX: animWidth }],
              transformOrigin: 'left',
            },
          ]}
        />
      </View>
      <Text style={[styles.xpText, { color: theme.colors.textMuted }]}>
        {current} / {needed} XP
      </Text>

      <View style={[styles.statsRow, { borderTopColor: theme.colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
            {language === 'en' ? 'Streak' : 'Seri'}
          </Text>
          <Text style={[styles.statValue, { color: streak >= 2 ? theme.colors.primaryLight : theme.colors.text }]}>
            🔥 {streak}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Gem</Text>
          <Text style={[styles.statValue, { color: theme.colors.gem }]}>◆ {gems}</Text>
        </View>
      </View>

      {flame && (
        <View style={styles.streakLine}>
          <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>
            {getStreakLabel(streak, language)}
          </Text>
          {streakBonus ? <Text style={styles.streakBonus}>+{streakBonus} 💎</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  flameStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  levelWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  levelBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  levelNum: {
    color: '#FFF8EC',
    fontSize: FONTS.size.sm,
    fontWeight: '900',
  },
  levelTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: FONTS.size.lg,
    flexShrink: 1,
  },
  rightSlot: { marginLeft: 'auto' },
  track: {
    height: 6,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: BORDER_RADIUS.full },
  xpText: {
    fontSize: FONTS.size.xs,
    fontWeight: '600',
    marginTop: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 6 },
  statLabel: { fontSize: FONTS.size.xs, fontWeight: '600' },
  statValue: { fontSize: FONTS.size.lg, fontWeight: '900' },
  statDivider: { width: 1, height: 20 },
  streakLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  streakLabel: { fontFamily: FONTS.semibold, fontSize: FONTS.size.xs },
  streakBonus: {
    color: '#FFF',
    fontSize: FONTS.size.xs,
    fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
});
