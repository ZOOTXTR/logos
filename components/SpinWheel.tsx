import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { SpinWheelCanvas, Prize } from './SpinWheelCanvas';

interface SpinWheelProps {
  theme: any;
  language: string;
  prizes: Prize[];
  spinning: boolean;
  canSpin: boolean;
  cooldownText: string;
  spinAnim: Animated.Value;
  onPressSpin: () => void;
}

export function SpinWheel({
  theme, language, prizes, spinning, canSpin, cooldownText, spinAnim, onPressSpin,
}: SpinWheelProps) {
  return (
    <>
      <View style={styles.wheelArea}>
        <SpinWheelCanvas theme={theme} prizes={prizes} spinAnim={spinAnim} />
      </View>
      <View style={styles.controlArea}>
        {canSpin ? (
          <TouchableOpacity
            style={[styles.spinBtn, spinning && { opacity: 0.7 }]}
            onPress={onPressSpin}
            disabled={spinning}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[theme.colors.accent, theme.colors.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.spinGrad}
            >
              <Text style={styles.spinText}>
                {spinning
                  ? (language === 'en' ? '⏳ Spinning...' : '⏳ Dönüyor...')
                  : (language === 'en' ? '🎯 SPIN NOW!' : '🎯 DÖNDÜR!')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={[styles.cooldownContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.cooldownLabel, { color: theme.colors.textMuted }]}>
              {language === 'en' ? '✅ Already Spun Today' : '✅ Bugün Zaten Döndürdünüz'}
            </Text>
            <Text style={[styles.cooldownTime, { color: theme.colors.primaryLight }]}>
              {cooldownText}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wheelArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    position: 'relative',
  },
  controlArea: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  spinBtn: {
    width: '100%',
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  spinGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinText: {
    color: 'white',
    fontWeight: '900',
    fontSize: FONTS.size.md,
    letterSpacing: 1,
  },
  cooldownContainer: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  cooldownLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: '600',
  },
  cooldownTime: {
    fontSize: FONTS.size.md,
    fontWeight: '800',
    marginTop: 4,
  },
});
