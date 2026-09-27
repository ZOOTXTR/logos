import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text } from './CustomText';
import { Trophy, Flame, ChevronUp, BarChart3, TrendingUp } from 'lucide-react-native';
import { PlayerStats } from '../types/game';
import { sounds } from '../utils/sound';
import { getWeeklyLeaderboard } from '../services/leaderboard.service';

interface LeaderboardScreenProps {
  stats: PlayerStats;
}

const C = {
  card: '#17181D',
  surface: '#121317',
  border: '#26272B',
  primary: '#7C5CFF',
  accent: '#38BDF8',
  amber: '#F59E0B',
  green: '#22C55E',
  text: '#F4F4F5',
  text2: '#A1A1AA',
  muted: '#71717A',
};

const LEADERS = [
  { rank: 1, name: 'Zeynep Kaya', title: 'Kelime Şampiyonu', score: 3840, streak: 34, avatar: '👑' },
  { rank: 2, name: 'Burak Demir', title: 'Büyük Usta', score: 3410, streak: 28, avatar: '🥈' },
  { rank: 3, name: 'Ayşe Yıldız', title: 'Zihin Ustası', score: 2980, streak: 21, avatar: '🥉' },
  { rank: 4, name: 'Emre Çelik', title: 'Hızlı Çözücü', score: 2650, streak: 19, avatar: '⚡' },
  { rank: 5, name: 'Deniz Aydın', title: 'Sözlük Kurdu', score: 2420, streak: 15, avatar: '📚' },
  { rank: 6, name: 'Mert Aksoy', title: 'Harf Avcısı', score: 2190, streak: 12, avatar: '🎯' },
  { rank: 7, name: 'Gülşah Öztürk', title: 'Kelimebaz', score: 1980, streak: 10, avatar: '🧩' },
];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ stats }) => {
  const [period, setPeriod] = useState<'gunluk' | 'haftalik' | 'tum'>('gunluk');
  const [leaders, setLeaders] = useState(LEADERS);

  useEffect(() => {
    let cancelled = false;
    getWeeklyLeaderboard(50)
      .then((entries) => {
        if (cancelled || !entries || entries.length === 0) return;
        const medals = ['👑', '🥈', '🥉', '⚡', '📚', '🎯', '🧩', '🏹', '✨', '🧠'];
        setLeaders(entries.map((e, i) => ({
          rank: i + 1,
          name: e.displayName || 'Oyuncu',
          title: 'Oyuncu',
          score: e.score,
          streak: 0,
          avatar: medals[i] || '🎮',
        })));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const first = leaders[0] ?? LEADERS[0];
  const second = leaders[1] ?? LEADERS[1];
  const third = leaders[2] ?? LEADERS[2];

  const difficultyData = [
    { id: 'kolay', label: 'Kolay', letters: '4 Harf', winRate: 92, played: 50, won: 46, color: C.green, bgLight: 'rgba(34,197,94,0.15)' },
    { id: 'normal', label: 'Normal', letters: '5 Harf', winRate: stats.winRate || 78, played: stats.gamesPlayed || 150, won: stats.gamesWon || 117, color: C.primary, bgLight: 'rgba(124,92,255,0.15)' },
    { id: 'zor', label: 'Zor', letters: '6 Harf', winRate: 68, played: 90, won: 61, color: C.amber, bgLight: 'rgba(245,158,11,0.15)' },
    { id: 'uzman', label: 'Uzman', letters: '7 Harf', winRate: 54, played: 52, won: 28, color: C.accent, bgLight: 'rgba(56,189,248,0.15)' },
  ];

  const totalPlayed = difficultyData.reduce((a, d) => a + d.played, 0);
  const totalWon = difficultyData.reduce((a, d) => a + d.won, 0);
  const overallWinPct = Math.round((totalWon / totalPlayed) * 100);

  const periods: { id: 'gunluk' | 'haftalik' | 'tum'; label: string }[] = [
    { id: 'gunluk', label: 'Günlük' },
    { id: 'haftalik', label: 'Haftalık' },
    { id: 'tum', label: 'Tüm Zamanlar' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.eyebrow}>
          <Trophy size={14} color={C.amber} />
          <Text style={styles.eyebrowText}>SIRALAMA &amp; PERFORMANS</Text>
        </View>
        <Text style={styles.title}>Liderlik Tablosu</Text>
        <Text style={styles.subtitle}>Sıralamanı yükselt ve başarı oranlarını incele.</Text>
      </View>

      {/* Period segmented */}
      <View style={styles.segment}>
        {periods.map((p) => (
          <Pressable key={p.id} onPress={() => { sounds.playClick(); setPeriod(p.id); }} style={[styles.segBtn, period === p.id && { backgroundColor: C.primary }]}>
            <Text style={[styles.segText, period === p.id && { color: C.text }]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Player rank capsule */}
      <View style={styles.rankCapsule}>
        <View style={styles.rankCapsuleLeft}>
          <View style={styles.rankCircle}><Text style={styles.rankCircleText}>#42</Text></View>
          <View>
            <Text style={styles.rankName}>Sen (Kerem Yılmaz)</Text>
            <Text style={styles.rankSub}>Seviye {stats.level} • {stats.gems} Gem</Text>
          </View>
        </View>
        <View style={styles.rankDelta}>
          <ChevronUp size={14} color={C.green} />
          <Text style={styles.rankDeltaText}>+4 Sıra</Text>
        </View>
      </View>

      {/* Başarı & Zorluk Dağılımı */}
      <View style={styles.analyticsCard}>
        <View style={styles.analyticsHeader}>
          <View style={styles.headerLeft}>
            <BarChart3 size={16} color={C.primary} />
            <Text style={styles.analyticsTitle}>Başarı &amp; Zorluk Dağılımı</Text>
          </View>
          <View style={styles.headerLeft}>
            <TrendingUp size={12} color={C.green} />
            <Text style={styles.analyticsOverall}>%{overallWinPct} Ort.</Text>
          </View>
        </View>

        {/* Micro-deck */}
        <View style={styles.microDeck}>
          <View style={styles.microCol}>
            <Text style={styles.microLabel}>Toplam Galibiyet</Text>
            <Text style={styles.microValue}>{totalWon} / {totalPlayed}</Text>
          </View>
          <View style={[styles.microCol, styles.microColBorder]}>
            <Text style={styles.microLabel}>Genel Oran</Text>
            <Text style={[styles.microValue, { color: C.green }]}>%{overallWinPct}</Text>
          </View>
          <View style={styles.microCol}>
            <Text style={styles.microLabel}>En İyi Oran</Text>
            <Text style={[styles.microValue, { color: C.primary }]}>%92 (4 Harf)</Text>
          </View>
        </View>

        {/* Difficulty rows */}
        <View style={{ gap: 10, paddingTop: 4 }}>
          {difficultyData.map((item) => (
            <View key={item.id} style={{ gap: 4 }}>
              <View style={styles.diffRowTop}>
                <View style={styles.headerLeft}>
                  <View style={[styles.letterChip, { backgroundColor: item.bgLight }]}>
                    <Text style={[styles.letterChipText, { color: item.color }]}>{item.letters[0]}</Text>
                  </View>
                  <Text style={styles.diffLabel}>{item.label}</Text>
                  <Text style={styles.diffLetters}>({item.letters})</Text>
                </View>
                <View style={styles.headerLeft}>
                  <Text style={styles.diffMatches}>{item.won}/{item.played} maç</Text>
                  <Text style={[styles.diffRate, { color: item.color }]}>%{item.winRate}</Text>
                </View>
              </View>
              <View style={styles.diffTrack}>
                <View style={[styles.diffFill, { width: `${item.winRate}%`, backgroundColor: item.color }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Share gauge */}
        <View style={styles.gaugeWrap}>
          <View style={styles.gaugeHeader}>
            <Text style={styles.gaugeLabel}>Zorluk Oynanma Ağırlığı</Text>
            <Text style={styles.gaugeTotal}>{totalPlayed} Toplam Maç</Text>
          </View>
          <View style={styles.gaugeTrack}>
            {difficultyData.map((d) => (
              <View key={d.id} style={{ width: `${Math.round((d.played / totalPlayed) * 100)}%`, height: '100%', backgroundColor: d.color, borderRadius: 999 }} />
            ))}
          </View>
        </View>
      </View>

      {/* Podium */}
      <View style={styles.podiumRow}>
        <View style={[styles.podiumCard, styles.podium2]}>
          <Text style={styles.podiumEmoji}>🥈</Text>
          <Text style={styles.podiumName} numberOfLines={1}>{second.name.split(' ')[0]}</Text>
          <Text style={styles.podiumScore}>{second.score.toLocaleString()}</Text>
          <Text style={styles.podiumRankLabel}>2. Sıra</Text>
        </View>
        <View style={[styles.podiumCard, styles.podium1]}>
          <View style={styles.podiumCrown}><Text style={{ fontSize: 14 }}>👑</Text></View>
          <Text style={styles.podiumName} numberOfLines={1}>{first.name.split(' ')[0]}</Text>
          <Text style={[styles.podiumScore, { color: C.amber }]}>{first.score.toLocaleString()} XP</Text>
          <Text style={[styles.podiumRankLabel, { color: C.amber }]}>1. Şampiyon</Text>
        </View>
        <View style={[styles.podiumCard, styles.podium3]}>
          <Text style={styles.podiumEmoji}>🥉</Text>
          <Text style={styles.podiumName} numberOfLines={1}>{third.name.split(' ')[0]}</Text>
          <Text style={styles.podiumScore}>{third.score.toLocaleString()}</Text>
          <Text style={styles.podiumRankLabel}>3. Sıra</Text>
        </View>
      </View>

      {/* Ranked list */}
      <View style={{ gap: 8 }}>
        {leaders.slice(3).map((item) => (
          <View key={item.rank} style={styles.listRow}>
            <View style={styles.listLeft}>
              <Text style={styles.listRank}>{item.rank}</Text>
              <Text style={styles.listAvatar}>{item.avatar}</Text>
              <View>
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listTitle}>{item.title}</Text>
              </View>
            </View>
            <View style={styles.listRight}>
              <View style={styles.listStreak}>
                <Flame size={12} color={C.amber} />
                <Text style={styles.listStreakText}>{item.streak}</Text>
              </View>
              <Text style={styles.listScore}>{item.score}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, gap: 14 },
  header: { gap: 4 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrowText: { fontSize: 11, fontWeight: '600', color: C.amber, letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: '700', color: C.text },
  subtitle: { fontSize: 12, color: C.text2 },
  segment: { flexDirection: 'row', gap: 4, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, padding: 4, borderRadius: 14 },
  segBtn: { flex: 1, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segText: { fontSize: 12, fontWeight: '600', color: C.muted },
  rankCapsule: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, borderWidth: 1, borderColor: 'rgba(124,92,255,0.4)', borderRadius: 18, padding: 14 },
  rankCapsuleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(124,92,255,0.2)', borderWidth: 1, borderColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  rankCircleText: { fontSize: 14, fontWeight: '700', color: C.primary },
  rankName: { fontSize: 14, fontWeight: '700', color: C.text },
  rankSub: { fontSize: 12, color: C.muted },
  rankDelta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rankDeltaText: { fontSize: 12, fontWeight: '600', color: C.green },
  analyticsCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 14, gap: 12 },
  analyticsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  analyticsTitle: { fontSize: 12, fontWeight: '700', color: C.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  analyticsOverall: { fontSize: 11, fontWeight: '600', color: C.green },
  microDeck: { flexDirection: 'row', padding: 10, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  microCol: { flex: 1, alignItems: 'center' },
  microColBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: C.border },
  microLabel: { fontSize: 10, color: C.muted, textAlign: 'center' },
  microValue: { fontSize: 14, fontWeight: '700', color: C.text, marginTop: 2 },
  diffRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  letterChip: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  letterChipText: { fontSize: 10, fontWeight: '700' },
  diffLabel: { fontSize: 12, fontWeight: '600', color: C.text },
  diffLetters: { fontSize: 10, color: C.muted },
  diffMatches: { fontSize: 10, color: C.muted },
  diffRate: { fontSize: 12, fontWeight: '700', minWidth: 34, textAlign: 'right' },
  diffTrack: { height: 8, borderRadius: 999, backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(38,39,43,0.7)', overflow: 'hidden', padding: 2 },
  diffFill: { height: '100%', borderRadius: 999 },
  gaugeWrap: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, gap: 6 },
  gaugeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gaugeLabel: { fontSize: 11, color: C.muted },
  gaugeTotal: { fontSize: 11, color: C.text2 },
  gaugeTrack: { flexDirection: 'row', gap: 2, height: 10, borderRadius: 999, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, overflow: 'hidden', padding: 2 },
  podiumRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  podiumCard: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  podium1: { height: 140, borderColor: 'rgba(245,158,11,0.5)', borderRadius: 18, padding: 12 },
  podium2: { height: 120 },
  podium3: { height: 110 },
  podiumCrown: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(245,158,11,0.2)', alignItems: 'center', justifyContent: 'center' },
  podiumEmoji: { fontSize: 18 },
  podiumName: { fontSize: 12, fontWeight: '700', color: C.text },
  podiumScore: { fontSize: 12, fontWeight: '700', color: C.text2 },
  podiumRankLabel: { fontSize: 10, color: C.muted },
  listRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12 },
  listLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listRank: { width: 16, textAlign: 'center', fontSize: 12, fontWeight: '700', color: C.muted },
  listAvatar: { fontSize: 16 },
  listName: { fontSize: 12, fontWeight: '700', color: C.text },
  listTitle: { fontSize: 10, color: C.muted },
  listRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listStreak: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  listStreakText: { fontSize: 11, color: C.amber },
  listScore: { fontSize: 12, fontWeight: '700', color: C.text },
});
