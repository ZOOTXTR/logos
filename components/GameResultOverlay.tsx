import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

export interface ResultButton {
  label: string;
  onPress: () => void;
  primary?: boolean;
}

export interface GameResultOverlayProps {
  visible: boolean;
  title: string;
  emoji: string;
  message: string;
  word?: string;
  gemsAwarded?: number;
  xpAwarded?: number;
  buttons: ResultButton[];
  theme: any;
  language: string;
  onClose?: () => void;
}

export function GameResultOverlay({
  visible, title, emoji, message, word,
  gemsAwarded, xpAwarded, buttons,
  theme, language, onClose,
}: GameResultOverlayProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1, damping: 12, stiffness: 120, useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.emojiRow}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>

          {(gemsAwarded !== undefined || xpAwarded !== undefined) && (
            <View style={styles.rewards}>
              {gemsAwarded !== undefined && gemsAwarded > 0 && (
                <View style={[styles.rewardPill, { backgroundColor: theme.colors.card, borderColor: theme.colors.gem }]}>
                  <Text style={[styles.rewardText, { color: theme.colors.gem }]}>+{gemsAwarded} 💎</Text>
                </View>
              )}
              {xpAwarded !== undefined && xpAwarded > 0 && (
                <View style={[styles.rewardPill, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]}>
                  <Text style={[styles.rewardText, { color: theme.colors.accent }]}>+{xpAwarded} XP</Text>
                </View>
              )}
            </View>
          )}

          {word && (
            <Text style={[styles.wordReveal, { color: theme.colors.primaryLight }]}>
              {language === 'en' ? 'Answer:' : 'Cevap:'} {word.toUpperCase()}
            </Text>
          )}

          <View style={styles.buttonRow}>
            {buttons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.button,
                  btn.primary ? styles.buttonPrimary : { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
                onPress={btn.onPress}
                activeOpacity={0.8}
              >
                {btn.primary ? (
                  <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.buttonGrad}>
                    <Text style={styles.buttonPrimaryText}>{btn.label}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>{btn.label}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: SPACING.xl,
  },
  content: {
    width: '100%', maxWidth: 340, borderRadius: BORDER_RADIUS.xl, borderWidth: 1.5,
    padding: SPACING.lg, alignItems: 'center',
  },
  emojiRow: { marginBottom: SPACING.xs },
  emoji: { fontSize: 56 },
  title: { fontSize: FONTS.size.xxl, fontWeight: '900', marginBottom: SPACING.xs, textAlign: 'center' },
  message: { fontSize: FONTS.size.sm, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.md },
  rewards: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md, justifyContent: 'center' },
  rewardPill: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  rewardText: { fontWeight: '800', fontSize: FONTS.size.md },
  wordReveal: { fontSize: FONTS.size.lg, fontWeight: '800', marginBottom: SPACING.md, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: SPACING.sm, width: '100%', justifyContent: 'center', flexWrap: 'wrap' },
  button: { borderRadius: BORDER_RADIUS.full, overflow: 'hidden', minWidth: 100, borderWidth: 1 },
  buttonGrad: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, alignItems: 'center' },
  buttonText: { fontWeight: '700', fontSize: FONTS.size.sm, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  buttonPrimary: { borderWidth: 0 },
  buttonPrimaryText: { color: '#fff', fontWeight: '800', fontSize: FONTS.size.sm },
});
