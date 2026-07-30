import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface TimerProps {
  timeLeft: number;
  totalTime?: number;
}

export function Timer({ timeLeft, totalTime = 90 }: TimerProps) {
  const animWidth = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const percent = timeLeft / totalTime;
  const isWarning = timeLeft <= 20;
  const isDanger = timeLeft <= 10;

  const barColor = isDanger ? COLORS.error : isWarning ? COLORS.warning : COLORS.correct;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: percent,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  useEffect(() => {
    if (isDanger) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 300, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isDanger]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : `${seconds}`;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>⚡ Süre</Text>
        <Animated.Text style={[
          styles.time,
          { color: barColor, transform: [{ scale: pulseAnim }] }
        ]}>
          {timeStr}
        </Animated.Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: barColor,
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
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.sm,
    fontWeight: '700',
  },
  time: {
    fontSize: FONTS.size.xl,
    fontWeight: '900',
  },
  track: {
    height: 8,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
});
