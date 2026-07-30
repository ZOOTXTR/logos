import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Achievement } from '../constants/achievements';
import { Theme } from '../constants/themes';
import { SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';

interface ProfileAchievementListProps {
  achievements: Achievement[];
  unlockedIds: string[];
  theme: Theme;
  language: string;
}

export function ProfileAchievementList({ achievements, unlockedIds, theme, language }: ProfileAchievementListProps) {
  return (
    <View style={styles.grid}>
      {achievements.map(a => {
        const unlocked = unlockedIds.includes(a.id);
        return (
          <View
            key={a.id}
            style={[
              styles.card,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              !unlocked && styles.locked,
            ]}
          >
            <Text style={[styles.emoji, !unlocked && styles.lockedEmoji]}>
              {unlocked ? a.emoji : '🔒'}
            </Text>
            <Text
              style={[
                styles.title,
                { color: theme.colors.text },
                !unlocked && { color: theme.colors.textMuted },
              ]}
            >
              {unlocked ? (language === 'en' && a.titleEn ? a.titleEn : a.title) : '???'}
            </Text>
            {unlocked && (
              <Text style={[styles.desc, { color: theme.colors.textMuted }]}>
                {language === 'en' && a.descriptionEn ? a.descriptionEn : a.description}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  card: {
    width: '47%',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  locked: { opacity: 0.4 },
  emoji: { fontSize: 28, marginBottom: 4 },
  lockedEmoji: { opacity: 0.5 },
  title: { fontSize: FONTS.size.xs, fontWeight: '700', textAlign: 'center' },
  desc: { fontSize: 9, textAlign: 'center', marginTop: 2 },
});
