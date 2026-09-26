import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '../../components/CustomText';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { getScores, getStreak, getStats, ScoreEntry, FullStats } from '../../services/storage.service';
import { getGlobalLeaderboard, getWeeklyLeaderboard, submitScore, claimWeeklyReward, LeaderboardEntry } from '../../services/leaderboard.service';
import { getCurrentUser } from '../../services/auth.service';
import { useTheme } from '../../hooks/useTheme';
import { useProgress } from '../../hooks/useProgress';
import { TRANSLATIONS } from '../../constants/translations';
import { DIFFICULTY_INFO, Difficulty } from '../../constants/words';
import { FilterChips } from '../../components/FilterChips';
import { ScoreRow } from '../../components/ScoreRow';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WidgetCard } from '../../components/design/WidgetCard';
import { TopBar } from '../../components/TopBar';
import { Trophy } from 'lucide-react-native';

type FilterMode = 'all' | 'classic' | 'speed' | 'daily' | 'anagram' | 'dordle' | 'chain' | 'wordconnect' | 'duel';

export default function LeaderboardScreen() {
  const { theme, language } = useTheme();
  const progress = useProgress();
  const t = TRANSLATIONS[language];

  const [tab, setTab] = useState<'local' | 'global'>('local');
  const [period, setPeriod] = useState<'tum' | 'haftalik'>('tum');
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [streak, setStreak] = useState({ current: 0, max: 0 });
  const [stats, setStats] = useState<FullStats | null>(null);
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
    Promise.all([getScores(), getStreak(), getStats()]).then(([s, st, statsData]) => {
      setScores(s);
      setStreak(st);
      setStats(statsData);
    });
  }, []);

  useEffect(() => {
    if (tab !== 'global') return;
    setLoading(true);
    const fetcher = period === 'haftalik' ? getWeeklyLeaderboard(50) : getGlobalLeaderboard(50);
    fetcher.then(entries => {
      setGlobalScores(entries);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [tab, period]);

  const handleSubmitScore = async () => {
    if (scores.length === 0) return;
    const user = getCurrentUser();
    if (!user) {
      alert(language === 'en' ? 'You must sign in from Profile to submit scores.' : 'Skor göndermek için Profil ekranından giriş yapmalısınız.');
      return;
    }
    setLoading(true);
    const best = scores.reduce((prev, curr) => (prev.xpEarned > curr.xpEarned) ? prev : curr, scores[0]);
    await submitScore(best);
    const entries = period === 'haftalik' ? await getWeeklyLeaderboard(50) : await getGlobalLeaderboard(50);
    setGlobalScores(entries);
    setLoading(false);
  };

  const handleClaimWeekly = async () => {
    const res = await claimWeeklyReward();
    if (res && res.success) {
      await progress.addGems(res.prize);
      alert(`🏆 ${language === 'en' ? `You ranked #${res.rank}!` : `#${res.rank}. sıradasınız!`} +${res.prize} 💎`);
    } else {
      alert(language === 'en' ? 'No weekly reward available, already claimed, or sign in required.' : 'Haftalık ödül yok, zaten alındı veya giriş gerekli.');
    }
  };

  const filteredScores = useMemo(() => {
    return filter === 'all' ? scores : scores.filter(s => s.mode === filter);
  }, [scores, filter]);

  const bestScore = filteredScores.length > 0 ? filteredScores.reduce((prev, curr) => (prev.guesses < curr.guesses) ? prev : curr, filteredScores[0]) : null;
  const speedScores = filteredScores.filter(s => s.mode === 'speed');
  const fastestSpeed = speedScores.length > 0 ? speedScores.reduce((prev, curr) => ((prev.timeSeconds || Infinity) < (curr.timeSeconds || Infinity)) ? prev : curr, speedScores[0]) : null;
  const totalXP = scores.reduce((sum, s) => sum + (s.xpEarned || 0), 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.id === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.colors.background} />
      <TopBar gems={progress.gems} />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Başlık */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Trophy size={14} color={theme.colors.present} />
              <Text style={[styles.eyebrow, { color: theme.colors.present }]}>{t.leaderboardTitle}</Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>{t.leaderboardTitle}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {language === 'en' ? 'Climb the ranks and track your performance.' : 'Sıralamanı yükselt ve başarılarını incele.'}
            </Text>
          </View>

          {/* Tab Bar */}
          <WidgetCard theme={theme} variant="glass" style={{ padding: 4, marginBottom: SPACING.lg }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <TouchableOpacity accessibilityRole="button"
                style={[styles.tabButton, { backgroundColor: tab === 'local' ? theme.colors.primary : 'transparent' }]}
                onPress={() => setTab('local')}
              >
                <Text style={[styles.tabText, { color: tab === 'local' ? '#fff' : theme.colors.text }]}>
                  📱 {language === 'en' ? 'Local' : 'Yerel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button"
                style={[styles.tabButton, { backgroundColor: tab === 'global' ? theme.colors.primary : 'transparent' }]}
                onPress={() => setTab('global')}
              >
                <Text style={[styles.tabText, { color: tab === 'global' ? '#fff' : theme.colors.text }]}>
                  🌍 {language === 'en' ? 'Global' : 'Küresel'}
                </Text>
              </TouchableOpacity>
            </View>
          </WidgetCard>

          {tab === 'local' && (
            <>
              <FilterChips filters={FILTERS} active={filter} onSelect={id => setFilter(id as FilterMode)} theme={theme} language={language} />

              {/* Özet Kartlar */}
              <View style={styles.summaryRow}>
                <WidgetCard theme={theme} variant="glass" style={{ flex: 1, padding: SPACING.sm, alignItems: 'center' }}>
                  <Text style={styles.summaryEmoji}>🔥</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{streak.current}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>{t.currentStreak}</Text>
                </WidgetCard>
                <WidgetCard theme={theme} variant="glass" style={{ flex: 1, padding: SPACING.sm, alignItems: 'center' }}>
                  <Text style={styles.summaryEmoji}>🏆</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{streak.max}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>{t.maxStreak}</Text>
                </WidgetCard>
                <WidgetCard theme={theme} variant="glass" style={{ flex: 1, padding: SPACING.sm, alignItems: 'center' }}>
                  <Text style={styles.summaryEmoji}>⭐</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{totalXP}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>{t.totalXp}</Text>
                </WidgetCard>
              </View>

              {/* Başarı & Zorluk Dağılımı */}
              {stats && (
                <WidgetCard theme={theme} variant="glass" style={{ marginBottom: SPACING.lg, padding: SPACING.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>📊 {language === 'en' ? 'Difficulty Win Rate' : 'Zorluk Başarı Dağılımı'}</Text>
                    <Text style={{ color: theme.colors.correct, fontSize: FONTS.size.sm, fontWeight: '800' }}>
                      %{stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0} {language === 'en' ? 'Avg' : 'Ort.'}
                    </Text>
                  </View>
                  {(['easy', 'normal', 'hard', 'expert'] as Difficulty[]).map((d) => {
                    const info = DIFFICULTY_INFO[d];
                    const played = stats.gamesPlayedByDifficulty[d] || 0;
                    const won = stats.gamesWonByDifficulty[d] || 0;
                    const rate = played > 0 ? Math.round((won / played) * 100) : 0;
                    return (
                      <View key={d} style={{ marginBottom: SPACING.sm }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{ color: theme.colors.text, fontSize: FONTS.size.sm, fontWeight: '600' }}>
                            {info.emoji} {language === 'en' && d === 'easy' ? 'Easy' : language === 'en' && d === 'normal' ? 'Normal' : language === 'en' && d === 'hard' ? 'Hard' : language === 'en' && d === 'expert' ? 'Expert' : info.label}
                          </Text>
                          <Text style={{ color: info.color, fontSize: FONTS.size.sm, fontWeight: '800' }}>
                            {won}/{played} • %{rate}
                          </Text>
                        </View>
                        <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.colors.surface, overflow: 'hidden' }}>
                          <View style={{ width: `${rate}%`, height: '100%', borderRadius: 3, backgroundColor: info.color }} />
                        </View>
                      </View>
                    );
                  })}
                </WidgetCard>
              )}

              {/* En İyi Sonuçlar */}
              {bestScore && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🥇 {t.bestResults}</Text>
                  <WidgetCard theme={theme} variant="primary" style={{ padding: 0, overflow: 'hidden' }}>
                    <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.bestCard}>
                      <View style={styles.bestRow}>
                        <Text style={styles.bestEmoji}>🎯</Text>
                        <View>
                          <Text style={styles.bestTitle}>
                            {t.bestGuesses} ({filter === 'all' ? (language === 'en' ? 'All Modes' : 'Tüm Modlar') : FILTERS.find(f => f.id === filter)?.label})
                          </Text>
                          <Text style={[styles.bestValue, { color: '#FFF' }]}>
                            {bestScore.guesses} {language === 'en' ? 'guesses' : 'tahmin'}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </WidgetCard>
                  {fastestSpeed && filter === 'speed' && (
                    <WidgetCard theme={theme} variant="primary" style={{ padding: 0, overflow: 'hidden', marginTop: SPACING.sm }}>
                      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.bestCard}>
                        <View style={styles.bestRow}>
                          <Text style={styles.bestEmoji}>⚡</Text>
                          <View>
                            <Text style={styles.bestTitle}>{t.fastestSpeed}</Text>
                            <Text style={[styles.bestValue, { color: '#FFF' }]}>{fastestSpeed.timeSeconds}sn</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </WidgetCard>
                  )}
                </View>
              )}

              {/* Geçmiş Oyunlar */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📋 {t.scoreHistory}</Text>
                {filteredScores.length === 0 ? (
                  <WidgetCard theme={theme} variant="glass" style={{ alignItems: 'center', padding: SPACING.xl }}>
                    <Text style={styles.emptyEmoji}>🎮</Text>
                    <Text style={[styles.emptyText, { color: theme.colors.text }]}>{t.noGamesFound}</Text>
                    <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
                      {filter === 'all' ? t.startPlayingClassic : `${t.noScoresForMode} (${FILTERS.find(f => f.id === filter)?.label})`}
                    </Text>
                  </WidgetCard>
                ) : (
                  <WidgetCard theme={theme} variant="glass" style={{ padding: 0, overflow: 'hidden' }}>
                    {filteredScores.slice(0, 20).map((score, i) => (
                      <ScoreRow key={`${score.date}-${score.mode}-${i}`} score={score} theme={theme} language={language} />
                    ))}
                  </WidgetCard>
                )}
              </View>
            </>
          )}

          {tab === 'global' && (
            <View style={styles.section}>
              <View style={styles.globalHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🌍 {language === 'en' ? 'Global Leaderboard' : 'Küresel Sıralama'}</Text>
                <TouchableOpacity accessibilityRole="button"
                  style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSubmitScore}
                  disabled={loading || scores.length === 0}
                >
                  <Text style={styles.submitButtonText}>📤 {language === 'en' ? 'Submit Score' : 'Puan Gönder'}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.periodSeg, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                {([['tum', language === 'en' ? 'All Time' : 'Tüm Zamanlar'], ['haftalik', language === 'en' ? 'Weekly' : 'Haftalık']] as const).map(([id, label]) => {
                  const active = period === id;
                  return (
                    <TouchableOpacity
                      key={id}
                      accessibilityRole="button"
                      onPress={() => setPeriod(id)}
                      style={[styles.periodBtn, active && { backgroundColor: theme.colors.primary }]}
                    >
                      <Text style={[styles.periodText, { color: active ? '#F4F4F5' : theme.colors.textMuted }]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {period === 'haftalik' && (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={handleClaimWeekly}
                  style={[styles.claimBtn, { backgroundColor: '#F59E0B' }]}
                >
                  <Text style={styles.claimBtnText}>🏆 {language === 'en' ? 'Claim Weekly Reward' : 'Haftalık Ödül Al'}</Text>
                </TouchableOpacity>
              )}

              {loading ? (
                <WidgetCard theme={theme} variant="glass" style={{ alignItems: 'center', padding: SPACING.xl }}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.textMuted, marginTop: SPACING.sm }]}>
                    {language === 'en' ? 'Loading leaderboard...' : 'Sıralama yükleniyor...'}
                  </Text>
                </WidgetCard>
              ) : globalScores.length === 0 ? (
                <WidgetCard theme={theme} variant="glass" style={{ alignItems: 'center', padding: SPACING.xl }}>
                  <Text style={styles.emptyEmoji}>🏆</Text>
                  <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                    {language === 'en' ? 'No scores yet' : 'Henüz puan yok'}
                  </Text>
                  <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
                    {language === 'en' ? 'Be the first to submit your score!' : 'İlk puanını gönderen sen ol!'}
                  </Text>
                </WidgetCard>
              ) : (
                <WidgetCard theme={theme} variant="glass" style={{ padding: 0, overflow: 'hidden' }}>
                  {globalScores.map((entry, i) => (
                    <View key={entry.id} style={[styles.globalRow, { borderBottomColor: theme.colors.border, borderBottomWidth: i < globalScores.length - 1 ? 1 : 0 }]}>
                      <Text style={[styles.rank, { color: i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : theme.colors.textMuted }]}>
                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${entry.rank}`}
                      </Text>
                      <View style={styles.globalInfo}>
                        <Text style={[styles.globalName, { color: theme.colors.text }]}>{entry.displayName}</Text>
                        <Text style={[styles.globalMode, { color: theme.colors.textMuted }]}>{entry.mode}</Text>
                      </View>
                      <Text style={[styles.globalScore, { color: theme.colors.primary }]}>{entry.score}</Text>
                    </View>
                  ))}
                </WidgetCard>
              )}
            </View>
          )}

          <View style={{ height: SPACING.xl }} />

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: SPACING.md },
  header: { paddingVertical: SPACING.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  subtitle: { fontSize: 12, marginTop: 2 },
  title: { fontSize: FONTS.size.xl, fontWeight: '800' },

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
  periodSeg: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 4, gap: 4, marginBottom: SPACING.sm },
  periodBtn: { flex: 1, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  periodText: { fontSize: 12, fontWeight: '700' },
  claimBtn: { height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  claimBtnText: { color: '#0B0C10', fontSize: 14, fontWeight: '800' },
});
