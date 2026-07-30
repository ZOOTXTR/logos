import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { LevelInfo, getXPProgress } from '../constants/levels';

interface LevelBarProps {
  xp: number;
  levelInfo: LevelInfo;
}

export function LevelBar({ xp, levelInfo }: LevelBarProps) {
  const { current, needed, percent } = getXPProgress(xp);
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animWidth, {
      toValue: percent,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [percent]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNum}>Lv.{levelInfo.level}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{levelInfo.title}</Text>
          <Text style={styles.xpText}>{current} / {needed} XP</Text>
        </View>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: levelInfo.color,
              width: animWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  levelBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  levelNum: {
    color: COLORS.text,
    fontSize: FONTS.size.sm,
    fontWeight: '900',
  },
  info: { flex: 1 },
  title: {
    color: COLORS.text,
    fontSize: FONTS.size.sm,
    fontWeight: '700',
  },
  xpText: {
    color: COLORS.textMuted,
    fontSize: FONTS.size.xs,
  },
  track: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
});
