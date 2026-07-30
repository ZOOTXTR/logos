import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { GAME_MODE_INFO, CATEGORY_INFO } from '../constants/words';
import { ScoreEntry } from '../services/storage.service';

interface Props {
  score: ScoreEntry;
  theme: any;
  language: string;
}

function getModeInfo(mode: string) {
  return GAME_MODE_INFO[mode as keyof typeof GAME_MODE_INFO] || { label: mode, emoji: '🎮' };
}

function getCatInfo(category: string) {
  return CATEGORY_INFO[category as keyof typeof CATEGORY_INFO] || { label: category, emoji: '🎲' };
}

export function ScoreRow({ score, theme }: Props) {
  const modeInfo = getModeInfo(score.mode);
  const catInfo = getCatInfo(score.category);
  const date = new Date(score.date);
  const dateStr = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

  return (
    <View style={[styles.scoreRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.scoreLeft}>
        <Text style={styles.scoreEmojis}>
          {modeInfo.emoji} {catInfo.emoji}
        </Text>
        <View>
          <Text style={[styles.scoreMode, { color: theme.colors.text }]}>
            {modeInfo.label} · {catInfo.label}
          </Text>
          <Text style={[styles.scoreDate, { color: theme.colors.textMuted }]}>{dateStr}</Text>
        </View>
      </View>
      <View style={styles.scoreRight}>
        <Text style={[styles.scoreGuesses, { color: theme.colors.text }]}>{score.guesses} 🎯</Text>
        <Text style={[styles.scoreXP, { color: theme.colors.accent }]}>+{score.xpEarned} XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.xs, borderWidth: 1,
  },
  scoreLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  scoreEmojis: { fontSize: 20 },
  scoreMode: { fontSize: FONTS.size.sm, fontWeight: '600' },
  scoreDate: { fontSize: FONTS.size.xs },
  scoreRight: { alignItems: 'flex-end' },
  scoreGuesses: { fontSize: FONTS.size.md, fontWeight: '700' },
  scoreXP: { fontSize: FONTS.size.xs, fontWeight: '700' },
});
