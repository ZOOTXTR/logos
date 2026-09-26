import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './CustomText';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Theme } from '../constants/themes';
import { GAME_MODE_INFO, CATEGORY_INFO } from '../constants/words';
import { ScoreEntry } from '../services/storage.service';
import { TRANSLATIONS } from '../constants/translations';

interface Props {
  score: ScoreEntry;
  theme: Theme;
  language: string;
}

const MODE_LABEL_KEY: Record<string, 'modeLabelClassic' | 'modeLabelSpeed' | 'modeLabelDaily'> = {
  classic: 'modeLabelClassic',
  speed: 'modeLabelSpeed',
  daily: 'modeLabelDaily',
};

const CAT_LABEL_KEY: Record<string, 'catRandom' | 'catAnimals' | 'catCities' | 'catFood' | 'catJobs' | 'catNature' | 'catSports'> = {
  random: 'catRandom',
  hayvanlar: 'catAnimals',
  sehirler: 'catCities',
  yiyecek: 'catFood',
  meslekler: 'catJobs',
  doga: 'catNature',
  spor: 'catSports',
};

function getModeInfo(mode: string) {
  return GAME_MODE_INFO[mode as keyof typeof GAME_MODE_INFO] || { label: mode, emoji: '🎮' };
}

function getCatInfo(category: string) {
  return CATEGORY_INFO[category as keyof typeof CATEGORY_INFO] || { label: category, emoji: '🎲' };
}

function ScoreRowComponent({ score, theme, language }: Props) {
  const t = TRANSLATIONS[language === 'en' ? 'en' : 'tr'];
  const modeInfo = getModeInfo(score.mode);
  const catInfo = getCatInfo(score.category);
  const modeKey = MODE_LABEL_KEY[score.mode];
  const catKey = CAT_LABEL_KEY[score.category];
  const modeLabel = modeKey ? t[modeKey] : modeInfo.label;
  const catLabel = catKey ? t[catKey] : catInfo.label;
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
            {modeLabel} · {catLabel}
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

export const ScoreRow = React.memo(ScoreRowComponent);

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
