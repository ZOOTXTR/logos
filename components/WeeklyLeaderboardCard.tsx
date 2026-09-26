import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from './CustomText';
import { Medal, ChevronRight } from 'lucide-react-native';
import { Theme } from '../constants/themes';
import { getWeeklyLeaderboard, LeaderboardEntry } from '../services/leaderboard.service';

interface WeeklyLeaderboardCardProps {
  theme: Theme;
  language: 'tr' | 'en';
  onViewAll: () => void;
}

export function WeeklyLeaderboardCard({ theme, language, onViewAll }: WeeklyLeaderboardCardProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getWeeklyLeaderboard(3).then((entries) => {
      if (!cancelled) { setLeaders(entries); setLoading(false); }
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const top3 = leaders.slice(0, 3);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconTile, { backgroundColor: '#F59E0B26' }]}>
            <Medal size={16} color={theme.colors.present} />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>{language === 'en' ? 'WEEKLY LEADERBOARD' : 'HAFTALIK LİDERLİK TABLOSU'}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Resets Sunday 23:59' : 'Her Pazar 23:59\'da sıfırlanır'}</Text>
          </View>
        </View>
        <TouchableOpacity accessibilityRole="button" onPress={onViewAll} style={styles.viewAllBtn}>
          <Text style={[styles.viewAllText, { color: theme.colors.primaryLight }]}>{language === 'en' ? 'View All' : 'Tümünü Gör'}</Text>
          <ChevronRight size={14} color={theme.colors.primaryLight} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : top3.length === 0 ? (
        <View style={[styles.empty, { borderColor: theme.colors.border }]}>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>{language === 'en' ? 'No scores yet this week' : 'Bu hafta henüz puan yok'}</Text>
        </View>
      ) : (
        <View style={styles.podium}>
          {top3.map((leader, i) => (
            <View key={leader.id} style={[styles.podiumItem, { backgroundColor: theme.colors.surface, borderColor: i === 0 ? '#F59E0B66' : theme.colors.border }]}>
              <Text style={styles.podiumEmoji}>{i === 0 ? '👑' : i === 1 ? '🥈' : '🥉'}</Text>
              <Text style={[styles.podiumName, { color: theme.colors.text }]} numberOfLines={1}>
                {(leader.displayName ?? '').split('_')[0]}
              </Text>
              <Text style={[styles.podiumScore, { color: theme.colors.present }]}>{leader.score} XP</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconTile: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { fontSize: 10, marginTop: 1 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText: { fontSize: 11, fontWeight: '700' },
  loadingWrap: { paddingVertical: 12, alignItems: 'center' },
  empty: { padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  emptyText: { fontSize: 11 },
  podium: { flexDirection: 'row', gap: 6 },
  podiumItem: { flex: 1, borderRadius: 14, borderWidth: 1, paddingVertical: 10, alignItems: 'center', gap: 2 },
  podiumEmoji: { fontSize: 14 },
  podiumName: { fontSize: 11, fontWeight: '700', maxWidth: '90%' },
  podiumScore: { fontSize: 10, fontWeight: '800' },
});
