import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Text } from './CustomText';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { Achievement } from '../constants/achievements';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  language?: 'tr' | 'en';
}

export function AchievementToast({ achievement, onDismiss, language = 'tr' }: AchievementToastProps) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (achievement) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, { toValue: -120, duration: 400, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start(() => onDismiss());
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [achievement]);

  if (!achievement) return null;

  const title = language === 'en' && achievement.titleEn ? achievement.titleEn : achievement.title;
  const desc = language === 'en' && achievement.descriptionEn ? achievement.descriptionEn : achievement.description;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${language === 'en' ? 'Achievement unlocked' : 'Başarım açıldı'}: ${title}`}
    >
      <TouchableOpacity accessibilityRole="button" style={styles.inner} onPress={onDismiss} activeOpacity={0.9}>
        <Text style={styles.emoji}>{achievement.emoji}</Text>
        <View style={styles.text}>
          <Text style={styles.unlocked}>{language === 'en' ? '🏅 Achievement Unlocked!' : '🏅 Başarım Açıldı!'}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{desc}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 999,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E3A',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  emoji: { fontSize: 36 },
  text: { flex: 1 },
  unlocked: {
    color: COLORS.accent,
    fontSize: FONTS.size.xs,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    color: COLORS.text,
    fontSize: FONTS.size.md,
    fontWeight: '800',
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.xs,
    marginTop: 2,
  },
});
