import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, StatusBar, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { getScores, getStreak, ScoreEntry } from '../../services/storage.service';
import { getGlobalLeaderboard, submitScore, LeaderboardEntry } from '../../services/leaderboard.service';
import { initAuth, getCurrentUser } from '../../services/auth.service';
import { useTheme } from '../../hooks/useTheme';
import { TRANSLATIONS } from '../../constants/translations';
import { FilterChips } from '../../components/FilterChips';
import { ScoreRow } from '../../components/ScoreRow';

type FilterMode = 'all' | 'classic' | 'speed' | 'daily' | 'anagram' | 'dordle' | 'chain' | 'wordconnect' | 'duel';

export default function LeaderboardScreen() {
  const { theme, language } = useTheme();
  const t = TRANSLATIONS[language];

  const [tab, setTab] = useState<'local' | 'global'>('local');
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [streak, setStreak] = useState({ current: 0, max: 0 });
  const [filter, setFilter] = useState<FilterMode>('all');
  const [globalScores, setGlobalScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const FILTERS: Array<{ id: FilterMode; label: string; emoji: string }> = [
    { id: 'all', label: t.filterAll, emoji: '📋' },
    { id: 'classic', label: t.tabClassic, emoji: '🎯' },
    { id: 'speed', label: language === 'en' ? 'Speed' : 'Hızlı', emoji: '⚡' },
    { id: 'daily', label: language === 'en' ? 'Daily' : 'Günlük', emoji: '🌟' },
    { id: 'anagram', label: 'Anagram', emoji: '🔀' },
    { id: 'dordle', label: 'Dordle', emoji: '🎭' },
    { id: 'chain', label: language === 'en' ? 'Chain' : 'Zincir', emoji: '⛓️' },
    { id: 'wordconnect', label: t.modeConnectTitle, emoji: '🌀' },
    { id: 'duel', label: t.modeDuelTitle, emoji: '⚔️' },
  ];

  useEffect(() => {
    Promise.all([getScores(), getStreak()]).then(([s, st]) => {
      setScores(s);
      setStreak(st);
    });
  }, []);

  useEffect(() => {
    if (tab !== 'global') return;
    setLoading(true);
    getGlobalLeaderboard(50).then(entries => {
      setGlobalScores(entries);
      setLoading(false);
    });
  }, [tab]);

  const filteredScores = useMemo(() => scores.filter(s => {
    if (filter === 'all') return true;
    return s.mode === filter;
  }), [scores, filter]);

  const bestScore = useMemo(() => filteredScores.length > 0
    ? [...filteredScores].sort((a, b) => a.guesses - b.guesses)[0]
    : null, [filteredScores]);

  const fastestSpeed = useMemo(() => filteredScores
    .filter(s => s.mode === 'speed' && s.timeSeconds)
    .sort((a, b) => (a.timeSeconds ?? 999) - (b.timeSeconds ?? 999))[0], [filteredScores]);

  const totalXP = useMemo(() => filteredScores.reduce((sum, s) => sum + s.xpEarned, 0), [filteredScores]);

  const handleSubmitScore = async () => {
    if (scores.length === 0) return;
    setLoading(true);
    const ok = await submitScore(scores[scores.length - 1]);
    if (ok) {
      const entries = await getGlobalLeaderboard(50);
      setGlobalScores(entries);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Başlık */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>📊 {t.leaderboardTitle}</Text>
          </View>

          {/* Tab Bar */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabButton, tab === 'local' && { backgroundColor: theme.colors.primary }]}
              onPress={() => setTab('local')}
            >
              <Text style={[styles.tabText, { color: tab === 'local' ? '#fff' : theme.colors.text }]}>
                📍 {language === 'en' ? 'Local' : 'Yerel'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, tab === 'global' && { backgroundColor: theme.colors.primary }]}
              onPress={() => setTab('global')}
            >
              <Text style={[styles.tabText, { color: tab === 'global' ? '#fff' : theme.colors.text }]}>
                🌍 {language === 'en' ? 'Global' : 'Küresel'}
              </Text>
            </TouchableOpacity>
          </View>

          {tab === 'local' && (
            <>
              <FilterChips filters={FILTERS} active={filter} onSelect={id => setFilter(id as FilterMode)} theme={theme} language={language} />

              {/* Özet Kartlar */}
              <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={styles.summaryEmoji}>🔥</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{streak.current}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>{t.currentStreak}</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={styles.summaryEmoji}>🏆</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{streak.max}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>{t.maxStreak}</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={styles.summaryEmoji}>⭐</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{totalXP}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>{t.totalXp}</Text>
                </View>
              </View>

              {/* En İyi Sonuçlar */}
              {bestScore && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🥇 {t.bestResults}</Text>
                  <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.bestCard}>
                    <View style={styles.bestRow}>
                      <Text style={styles.bestEmoji}>🎯</Text>
                      <View>
                        <Text style={styles.bestTitle}>
                          {t.bestGuesses} ({filter === 'all' ? (language === 'en' ? 'All Modes' : 'Tüm Modlar') : FILTERS.find(f => f.id === filter)?.label})
                        </Text>
                        <Text style={[styles.bestValue, { color: theme.colors.text }]}>
                          {bestScore.guesses} {language === 'en' ? 'guesses' : 'tahmin'}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                  {fastestSpeed && filter === 'speed' && (
                    <LinearGradient colors={['#EF4444', '#DC2626']} style={[styles.bestCard, { marginTop: SPACING.sm }]}>
                      <View style={styles.bestRow}>
                        <Text style={styles.bestEmoji}>⚡</Text>
                        <View>
                          <Text style={styles.bestTitle}>{t.fastestSpeed}</Text>
                          <Text style={[styles.bestValue, { color: theme.colors.text }]}>{fastestSpeed.timeSeconds}sn</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  )}
                </View>
              )}

              {/* Geçmiş Oyunlar */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📋 {t.scoreHistory}</Text>
                {filteredScores.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🎮</Text>
                    <Text style={[styles.emptyText, { color: theme.colors.text }]}>{t.noGamesFound}</Text>
                    <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
                      {filter === 'all' ? t.startPlayingClassic : `${t.noScoresForMode} (${FILTERS.find(f => f.id === filter)?.label})`}
                    </Text>
                  </View>
                ) : (
                  filteredScores.slice(0, 20).map((score, i) => (
                    <ScoreRow key={i} score={score} theme={theme} language={language} />
                  ))
                )}
              </View>
            </>
          )}

          {tab === 'global' && (
            <View style={styles.section}>
              <View style={styles.globalHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🌍 {language === 'en' ? 'Global Leaderboard' : 'Küresel Sıralama'}</Text>
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSubmitScore}
                  disabled={loading || scores.length === 0}
                >
                  <Text style={styles.submitButtonText}>📤 {language === 'en' ? 'Submit Score' : 'Puan Gönder'}</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
                    {language === 'en' ? 'Loading leaderboard...' : 'Sıralama yükleniyor...'}
                  </Text>
                </View>
              ) : globalScores.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🏁</Text>
                  <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                    {language === 'en' ? 'No scores yet' : 'Henüz puan yok'}
                  </Text>
                  <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
                    {language === 'en' ? 'Be the first to submit your score!' : 'İlk puanını gönderen sen ol!'}
                  </Text>
                </View>
              ) : (
                globalScores.map((entry, i) => (
                  <View key={entry.id} style={[styles.globalRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.rank, { color: i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : theme.colors.textMuted }]}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${entry.rank}`}
                    </Text>
                    <View style={styles.globalInfo}>
                      <Text style={[styles.globalName, { color: theme.colors.text }]}>{entry.displayName}</Text>
                      <Text style={[styles.globalMode, { color: theme.colors.textMuted }]}>{entry.mode}</Text>
                    </View>
                    <Text style={[styles.globalScore, { color: theme.colors.primary }]}>{entry.score}</Text>
                  </View>
                ))
              )}
            </View>
          )}

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: SPACING.md },
  header: { paddingVertical: SPACING.md },
  title: { fontSize: FONTS.size.xxl, fontWeight: '900' },

  tabRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  tabButton: { flex: 1, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  tabText: { fontSize: FONTS.size.md, fontWeight: '700' },

  summaryRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  summaryCard: {
    flex: 1, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1,
  },
  summaryEmoji: { fontSize: 24, marginBottom: 4 },
  summaryValue: { fontSize: FONTS.size.xxl, fontWeight: '900' },
  summaryLabel: { fontSize: FONTS.size.xs, fontWeight: '600', textAlign: 'center' },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.size.md, fontWeight: '700', marginBottom: SPACING.sm },
  bestCard: { borderRadius: BORDER_RADIUS.md, padding: SPACING.md },
  bestRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  bestEmoji: { fontSize: 32 },
  bestTitle: { color: 'rgba(255,255,255,0.8)', fontSize: FONTS.size.sm, fontWeight: '600' },
  bestValue: { fontSize: FONTS.size.xl, fontWeight: '900' },
  emptyState: { alignItems: 'center', padding: SPACING.xl },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { fontSize: FONTS.size.lg, fontWeight: '700' },
  emptySubtext: { fontSize: FONTS.size.sm, marginTop: 4, textAlign: 'center' },

  globalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  submitButton: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.md },
  submitButtonText: { color: '#fff', fontSize: FONTS.size.sm, fontWeight: '700' },
  loadingContainer: { alignItems: 'center', padding: SPACING.xl },
  loadingText: { fontSize: FONTS.size.md, marginTop: SPACING.sm },
  globalRow: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.xs, borderWidth: 1,
  },
  rank: { fontSize: FONTS.size.lg, fontWeight: '900', width: 40 },
  globalInfo: { flex: 1, marginLeft: SPACING.sm },
  globalName: { fontSize: FONTS.size.md, fontWeight: '700' },
  globalMode: { fontSize: FONTS.size.xs, marginTop: 2 },
  globalScore: { fontSize: FONTS.size.lg, fontWeight: '900' },
});
