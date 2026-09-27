import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './CustomText';
import { Target, BookOpen, Trophy, Zap, Gem, Check } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Theme } from '../constants/themes';
import { DAILY_QUESTS, QuestState, getDailyQuestState, claimQuest } from '../services/dailyQuests.service';
import { audioService } from '../services/audio.service';

interface DailyQuestsCardProps {
  theme: Theme;
  language: 'tr' | 'en';
  onClaimGems: (amount: number) => Promise<number> | void;
}

const ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  trophy: Trophy,
  zap: Zap,
};

const ICON_COLORS: Record<string, string> = {
  book: '#7C5CFF',
  trophy: '#F59E0B',
  zap: '#38BDF8',
};

export function DailyQuestsCard({ theme, language, onClaimGems }: DailyQuestsCardProps) {
  const [state, setState] = useState<QuestState | null>(null);

  const refresh = useCallback(async () => {
    const s = await getDailyQuestState();
    setState(s);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleClaim = async (id: string) => {
    audioService.play('click');
    const res = await claimQuest(id);
    if (res.ok) {
      await onClaimGems(res.reward);
      refresh();
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Target size={16} color={theme.colors.primary} />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{language === 'en' ? 'DAILY QUESTS' : 'GÜNLÜK GÖREVLER'}</Text>
        </View>
        <Text style={[styles.resetBadge, { color: theme.colors.textMuted, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {language === 'en' ? 'Resets daily' : 'Her gün yenilenir'}
        </Text>
      </View>

      {DAILY_QUESTS.map((quest) => {
        const Icon = ICONS[quest.iconName] || BookOpen;
        const color = ICON_COLORS[quest.iconName] || theme.colors.primary;
        const progress = state?.progress[quest.id] || 0;
        const claimed = state?.claimed.includes(quest.id) ?? false;
        const completed = progress >= quest.target;
        const pct = Math.min(100, Math.round((progress / quest.target) * 100));

        return (
          <View key={quest.id} style={[styles.questRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.iconTile, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Icon size={16} color={color} />
            </View>

            <View style={styles.questBody}>
              <View style={styles.questTop}>
                <Text style={[styles.questTitle, { color: theme.colors.text }]} numberOfLines={1}>{quest.title}</Text>
                <Text style={[styles.questCount, { color: theme.colors.textSecondary }]}>
                  {progress}/{quest.target}
                </Text>
              </View>
              <View style={[styles.track, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={[styles.fill, { width: `${pct}%`, backgroundColor: completed ? theme.colors.correct : theme.colors.primary }]} />
              </View>
            </View>

            {claimed ? (
              <View style={[styles.claimedBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Check size={12} color={theme.colors.correct} />
                <Text style={[styles.claimedText, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Done' : 'Alındı'}</Text>
              </View>
            ) : completed ? (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => handleClaim(quest.id)}
                style={[styles.claimBtn, { backgroundColor: theme.colors.primary }]}
              >
                <Gem size={12} color={theme.colors.accent} />
                <Text style={styles.claimText}>+{quest.reward} {language === 'en' ? 'Get' : 'Al'}</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.rewardBadge, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Gem size={12} color={theme.colors.accent} />
                <Text style={[styles.rewardText, { color: theme.colors.accent }]}>+{quest.reward}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  resetBadge: { fontSize: 10, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  questRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, padding: 10 },
  iconTile: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  questBody: { flex: 1, minWidth: 0 },
  questTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 },
  questTitle: { fontSize: 12, fontWeight: '700', flexShrink: 1 },
  questCount: { fontSize: 10, fontWeight: '600' },
  track: { height: 6, borderRadius: 3, borderWidth: 1, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  claimedBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  claimedText: { fontSize: 11, fontWeight: '600' },
  claimBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  claimText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  rewardBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  rewardText: { fontSize: 11, fontWeight: '800' },
});
