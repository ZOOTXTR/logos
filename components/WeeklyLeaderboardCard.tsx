import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { Text } from './CustomText';
import { LinearGradient } from 'expo-linear-gradient';
import { Medal, ChevronRight, Trophy, Clock, X } from 'lucide-react-native';
import { sounds } from '../utils/sound';
import { getWeeklyLeaderboard } from '../services/leaderboard.service';

interface WeeklyLeaderboardCardProps {
  theme?: unknown;
  language?: 'tr' | 'en';
  onViewAll?: () => void;
  weeklyPoints?: number;
  rank?: number;
}

const C = {
  card: '#17181D',
  surface: '#121317',
  border: '#26272B',
  primary: '#7C5CFF',
  accent: '#38BDF8',
  amber: '#F59E0B',
  text: '#F4F4F5',
  text2: '#A1A1AA',
  muted: '#71717A',
};

interface LeaderUser {
  rank: number;
  name: string;
  title: string;
  score: number;
  streak: number;
  avatar: string;
  league: string;
}

const WEEKLY_LEADERS: LeaderUser[] = [
  { rank: 1, name: 'Zeynep Kaya', title: 'Kelime Şampiyonu', score: 3840, streak: 34, avatar: '👑', league: 'Efsane Lig' },
  { rank: 2, name: 'Burak Demir', title: 'Büyük Usta', score: 3410, streak: 28, avatar: '🥈', league: 'Efsane Lig' },
  { rank: 3, name: 'Ayşe Yıldız', title: 'Zihin Ustası', score: 2980, streak: 21, avatar: '🥉', league: 'Zümrüt Lig' },
  { rank: 4, name: 'Emre Çelik', title: 'Hızlı Çözücü', score: 2650, streak: 19, avatar: '⚡', league: 'Zümrüt Lig' },
  { rank: 5, name: 'Deniz Aydın', title: 'Sözlük Kurdu', score: 2420, streak: 15, avatar: '📚', league: 'Zümrüt Lig' },
  { rank: 6, name: 'Mert Aksoy', title: 'Harf Avcısı', score: 2190, streak: 12, avatar: '🎯', league: 'Altın Lig' },
  { rank: 7, name: 'Gülşah Öztürk', title: 'Kelimebaz', score: 1980, streak: 10, avatar: '🧩', league: 'Altın Lig' },
  { rank: 8, name: 'Canberk Polat', title: 'Taktik Dehası', score: 1820, streak: 8, avatar: '🏹', league: 'Altın Lig' },
  { rank: 9, name: 'Selin Doğan', title: 'Anagram Ustası', score: 1690, streak: 7, avatar: '✨', league: 'Gümüş Lig' },
  { rank: 10, name: 'Barış Koç', title: 'Hızlı Zihin', score: 1540, streak: 6, avatar: '🧠', league: 'Gümüş Lig' },
];

const rankBg = (rank: number) => {
  if (rank === 1) return { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.5)' };
  if (rank === 2) return { backgroundColor: 'rgba(161,161,170,0.1)', borderColor: 'rgba(161,161,170,0.4)' };
  if (rank === 3) return { backgroundColor: 'rgba(217,119,6,0.1)', borderColor: 'rgba(217,119,6,0.4)' };
  return { backgroundColor: C.surface, borderColor: C.border };
};

export function WeeklyLeaderboardCard({ language = 'tr', weeklyPoints = 2150, rank = 14 }: WeeklyLeaderboardCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [leaders, setLeaders] = useState<LeaderUser[]>(WEEKLY_LEADERS);
  const en = language === 'en';
  const top3 = leaders.slice(0, 3);

  useEffect(() => {
    let cancelled = false;
    getWeeklyLeaderboard(10)
      .then((entries) => {
        if (cancelled || !entries || entries.length === 0) return;
        const medals = ['👑', '🥈', '🥉', '⚡', '📚', '🎯', '🧩', '🏹', '✨', '🧠'];
        const mapped: LeaderUser[] = entries.map((e, i) => ({
          rank: i + 1,
          name: e.displayName || 'Oyuncu',
          title: 'Oyuncu',
          score: e.score,
          streak: 0,
          avatar: medals[i] || '🎮',
          league: e.score >= 3000 ? 'Efsane Lig' : e.score >= 2000 ? 'Zümrüt Lig' : e.score >= 1200 ? 'Altın Lig' : 'Gümüş Lig',
        }));
        setLeaders(mapped);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconTile}>
            <Medal size={16} color={C.amber} />
          </View>
          <View>
            <Text style={styles.title}>{en ? 'WEEKLY LEADERBOARD' : 'HAFTALIK LİDERLİK TABLOSU'}</Text>
            <Text style={styles.subtitle}>{en ? 'Resets Sunday 23:59' : "Her Pazar 23:59'da sıfırlanır"}</Text>
          </View>
        </View>
        <Pressable onPress={() => { sounds.playClick(); setIsOpen(true); }} style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>{en ? 'View All' : 'Tümünü Gör'}</Text>
          <ChevronRight size={14} color={C.primary} />
        </Pressable>
      </View>

      {/* User standing */}
      <View style={styles.standing}>
        <View style={styles.standingLeft}>
          <View style={styles.rankCircle}><Text style={styles.rankCircleText}>#{rank}</Text></View>
          <View>
            <Text style={styles.standingTitle}>{en ? 'Your Ranking' : 'Senin Sıralaman'}</Text>
            <Text style={styles.standingSub}>💎 {en ? 'Emerald League' : 'Zümrüt Lig'} • {en ? '530 pts to Top 10' : "İlk 10'a 530 Puan"}</Text>
          </View>
        </View>
        <Text style={styles.standingPts}>{weeklyPoints.toLocaleString()} XP</Text>
      </View>

      {/* Podium */}
      <View style={styles.podium}>
        {top3.map((leader, i) => (
          <Pressable key={leader.rank} onPress={() => { sounds.playClick(); setIsOpen(true); }} style={[styles.podiumItem, i === 0 ? { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.5)' } : { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={styles.podiumTop}>
              <Text style={styles.podiumEmoji}>{i === 0 ? '👑' : i === 1 ? '🥈' : '🥉'}</Text>
              <Text style={styles.podiumRank}>{leader.rank}. {en ? 'Rank' : 'Sıra'}</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{leader.name.split(' ')[0]}</Text>
            <Text style={styles.podiumScore}>{leader.score} XP</Text>
          </Pressable>
        ))}
      </View>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Trophy size={16} color={C.amber} />
                <Text style={styles.modalTitle}>{en ? 'Weekly Leaderboard' : 'Haftalık Liderlik Tablosu'}</Text>
              </View>
              <Pressable onPress={() => { sounds.playClick(); setIsOpen(false); }} style={styles.closeBtn}>
                <X size={14} color={C.muted} />
              </Pressable>
            </View>

            <LinearGradient colors={['rgba(245,158,11,0.1)', 'rgba(124,92,255,0.1)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.resetBanner}>
              <View style={styles.resetLeft}>
                <Clock size={14} color={C.accent} />
                <Text style={styles.resetText}>{en ? 'Reset: Sunday 23:59' : 'Sıfırlanma: Pazar 23:59'}</Text>
              </View>
              <View style={styles.resetPill}><Text style={styles.resetPillText}>3g 14s 22d</Text></View>
            </LinearGradient>

            <View style={styles.userCapsule}>
              <View style={styles.userCapsuleLeft}>
                <View style={styles.userCapsuleRank}><Text style={styles.userCapsuleRankText}>#{rank}</Text></View>
                <View>
                  <Text style={styles.userCapsuleName}>{en ? 'Kerem Yılmaz (You)' : 'Kerem Yılmaz (Sen)'}</Text>
                  <Text style={styles.userCapsuleSub}>💎 {en ? 'Emerald League' : 'Zümrüt Lig'} • {en ? '530 XP to Top 10' : "İlk 10'a 530 XP kaldı"}</Text>
                </View>
              </View>
              <Text style={styles.userCapsulePts}>{weeklyPoints.toLocaleString()} XP</Text>
            </View>

            <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              {leaders.map((user) => (
                <View key={user.rank} style={[styles.listRow, rankBg(user.rank)]}>
                  <View style={styles.listLeft}>
                    <Text style={styles.listRank}>{user.rank <= 3 ? (user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉') : `#${user.rank}`}</Text>
                    <Text style={styles.listAvatar}>{user.avatar}</Text>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.listName} numberOfLines={1}>{user.name}</Text>
                      <Text style={styles.listMeta} numberOfLines={1}>{user.league} • {user.streak} {en ? 'streak' : 'seri'}</Text>
                    </View>
                  </View>
                  <Text style={styles.listScore}>{user.score.toLocaleString()} XP</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable onPress={() => { sounds.playClick(); setIsOpen(false); }} style={styles.modalCtaWrap}>
                <LinearGradient colors={[C.amber, '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalCta}>
                  <Trophy size={14} color="#000" fill="#000" />
                  <Text style={styles.modalCtaText}>{en ? 'Compete & Earn Points (2.5x)' : 'Turnuvada Yarış & Puan Topla (2.5x)'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 14, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconTile: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(245,158,11,0.15)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, color: C.text },
  subtitle: { fontSize: 10, color: C.muted, marginTop: 1 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText: { fontSize: 11, fontWeight: '700', color: C.primary },
  standing: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  standingLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(124,92,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  rankCircleText: { fontSize: 11, fontWeight: '900', color: C.primary },
  standingTitle: { fontSize: 12, fontWeight: '700', color: '#fff' },
  standingSub: { fontSize: 10, color: C.text2 },
  standingPts: { fontSize: 12, fontWeight: '900', color: C.amber },
  podium: { flexDirection: 'row', gap: 6 },
  podiumItem: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 8, alignItems: 'center', gap: 2 },
  podiumTop: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  podiumEmoji: { fontSize: 11 },
  podiumRank: { fontSize: 10, fontWeight: '800', color: C.muted },
  podiumName: { fontSize: 11, fontWeight: '700', color: '#fff' },
  podiumScore: { fontSize: 10, fontWeight: '900', color: C.amber },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(11,12,16,0.85)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 370, maxHeight: '88%', borderRadius: 24, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: 'rgba(18,19,23,0.8)' },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  closeBtn: { width: 28, height: 28, borderRadius: 999, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  resetBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  resetLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resetText: { fontSize: 12, color: C.text2 },
  resetPill: { backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  resetPillText: { fontSize: 10, fontWeight: '800', color: C.amber },
  userCapsule: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 12, marginVertical: 10, padding: 12, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(124,92,255,0.4)' },
  userCapsuleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userCapsuleRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  userCapsuleRankText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  userCapsuleName: { fontSize: 12, fontWeight: '700', color: '#fff' },
  userCapsuleSub: { fontSize: 10, color: C.text2 },
  userCapsulePts: { fontSize: 12, fontWeight: '900', color: C.amber },
  list: { maxHeight: 300 },
  listContent: { padding: 12, gap: 8 },
  listRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 14, borderWidth: 1 },
  listLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  listRank: { width: 20, textAlign: 'center', fontSize: 12, fontWeight: '900', color: C.muted },
  listAvatar: { fontSize: 16 },
  listName: { fontSize: 12, fontWeight: '700', color: C.text },
  listMeta: { fontSize: 10, color: C.muted },
  listScore: { fontSize: 12, fontWeight: '900', color: C.amber },
  modalFooter: { padding: 12, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: 'rgba(18,19,23,0.8)' },
  modalCtaWrap: { borderRadius: 14, overflow: 'hidden' },
  modalCta: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modalCtaText: { fontSize: 12, fontWeight: '800', color: '#000' },
});
