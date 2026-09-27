import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, Pressable } from 'react-native';
import { Text } from './CustomText';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Clock, Gem, Play, Info, X, ShieldCheck } from 'lucide-react-native';
import { sounds } from '../utils/sound';

interface TournamentBannerProps {
  theme?: unknown;
  language?: 'tr' | 'en';
  onStartTournament: () => void;
}

const C = {
  card: '#17181D',
  surface: '#121317',
  border: '#26272B',
  amber: '#F59E0B',
  orange: '#F97316',
  accent: '#38BDF8',
  green: '#22C55E',
  violetLight: '#A78BFA',
  text: '#F4F4F5',
  text2: '#A1A1AA',
  muted: '#71717A',
};

const TIERS = [
  { medal: '🥇', title: '1. Sıra (Şampiyon)', sub: 'Sözcük Hükümdarı Avatarı + Unvan', reward: '1.000 💎', color: C.amber, border: 'rgba(245,158,11,0.3)' },
  { medal: '🥈', title: '2. - 3. Sıra', sub: 'Kozmik Galaksi Çerçevesi + 300 XP', reward: '500 💎', color: C.accent, border: C.border },
  { medal: '🥉', title: '4. - 10. Sıra', sub: 'Kraliyet Altını Çerçevesi', reward: '250 💎', color: C.violetLight, border: C.border },
  { medal: '🎖️', title: 'Katılım Bonusu', sub: 'En az 3 maç tamamlayan herkese', reward: '50 💎', color: C.green, border: C.border },
];

function getTimeToSunday(): number {
  const now = new Date();
  const day = now.getDay();
  const daysUntilSunday = (7 - day) % 7;
  const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 0);
  return Math.max(0, sunday.getTime() - now.getTime());
}

function formatRemaining(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}g ${hours}s`;
  if (hours > 0) return `${hours}s ${minutes}dk`;
  return `${minutes}dk`;
}

export function TournamentBanner({ language = 'tr', onStartTournament }: TournamentBannerProps) {
  const [remaining, setRemaining] = useState(getTimeToSunday());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setRemaining(getTimeToSunday()), 30000);
    return () => clearInterval(t);
  }, []);

  const en = language === 'en';

  return (
    <LinearGradient colors={['rgba(245,158,11,0.15)', 'rgba(124,92,255,0.15)', 'rgba(56,189,248,0.15)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.banner}>
      <View style={styles.blob} pointerEvents="none" />

      <View style={styles.topRow}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{en ? 'LIVE TOURNAMENT' : 'CANLI TURNUVA AÇIK'}</Text>
        </View>
        <View style={styles.countdown}>
          <Clock size={12} color={C.accent} />
          <Text style={styles.countdownText}>{formatRemaining(remaining)} {en ? 'left' : 'Kaldı'}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.iconTile}>
          <View style={styles.iconInner}>
            <Trophy size={20} color={C.amber} fill={C.amber} />
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{en ? 'Weekly Word Tournament' : 'Haftalık Büyük Kelime Turnuvası'}</Text>
          <Text style={styles.desc} numberOfLines={1}>{en ? 'Earn 2.5x points on every correct guess and climb!' : 'Her doğru tahminde 2.5x Turnuva Puanı kazan, zirveye tırman!'}</Text>
          <View style={styles.prizeRow}>
            <View style={styles.prizeBadge}>
              <Gem size={12} color={C.accent} fill={C.accent} />
              <Text style={styles.prizeText}>1.000 💎 {en ? 'Prize Pool' : 'Ödül Havuzu'}</Text>
            </View>
            <View style={styles.frameBadge}>
              <Text style={styles.frameBadgeText}>+{en ? 'Legendary Frame' : 'Efsanevi Çerçeve'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={() => { sounds.playClick(); setIsDetailsOpen(true); }} style={styles.detailsBtn}>
          <Info size={14} color={C.text2} />
          <Text style={styles.detailsBtnText}>{en ? 'Rewards & Rules' : 'Ödüller & Kurallar'}</Text>
        </Pressable>
        <Pressable onPress={() => { sounds.playClick(); onStartTournament(); }} style={styles.startBtnWrap}>
          <LinearGradient colors={[C.amber, C.orange]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtn}>
            <Play size={14} color="#000" fill="#000" />
            <Text style={styles.startBtnText}>{en ? 'Start (2.5x)' : 'Turnuvaya Başla (2.5x)'}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <Modal visible={isDetailsOpen} transparent animationType="fade" onRequestClose={() => setIsDetailsOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Trophy size={16} color={C.amber} />
                <Text style={styles.modalTitle}>{en ? 'Weekly Grand Tournament' : 'Haftalık Büyük Turnuva'}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={en ? 'Close' : 'Kapat'} onPress={() => { sounds.playClick(); setIsDetailsOpen(false); }} style={styles.closeBtn}>
                <X size={14} color={C.muted} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <LinearGradient colors={['#1C1A24', C.surface]} style={styles.heroCard}>
                <View style={styles.heroTile}>
                  <View style={styles.heroTileInner}>
                    <Trophy size={28} color={C.amber} fill={C.amber} />
                  </View>
                </View>
                <Text style={styles.heroEyebrow}>{en ? 'Weekly Grand Prize Pool' : 'Haftalık Büyük Ödül Havuzu'}</Text>
                <Text style={styles.heroTitle}>1.000 💎 + {en ? 'Legendary Cosmic Frame' : 'Efsanevi Kozmik Çerçeve'}</Text>
                <Text style={styles.heroDesc}>{en ? 'When the week ends Sunday night, the champions with the highest scores are rewarded.' : "Pazar gecesi sona erdiğinde en yüksek skora sahip şampiyonlar ödüllendirilir."}</Text>
              </LinearGradient>

              <Text style={styles.tiersLabel}>{en ? 'Rank Rewards' : 'Derece Ödülleri'}</Text>
              {TIERS.map((t) => (
                <View key={t.title} style={[styles.tierRow, { borderColor: t.border }]}>
                  <View style={styles.tierLeft}>
                    <Text style={styles.tierMedal}>{t.medal}</Text>
                    <View>
                      <Text style={styles.tierTitle}>{t.title}</Text>
                      <Text style={styles.tierSub}>{t.sub}</Text>
                    </View>
                  </View>
                  <Text style={[styles.tierReward, { color: t.color }]}>{t.reward}</Text>
                </View>
              ))}

              <View style={styles.rulesCard}>
                <View style={styles.rulesHeader}>
                  <ShieldCheck size={14} color={C.green} />
                  <Text style={styles.rulesTitle}>{en ? 'Tournament Rules' : 'Turnuva Kuralları'}</Text>
                </View>
                <Text style={styles.ruleItem}>• {en ? 'Every correct guess is multiplied by ' : 'Her doğru tahmin edilen kelimede standart XP ve puanlar '}<Text style={styles.ruleBold}>2.5x</Text>{en ? '.' : ' ile çarpılır.'}</Text>
                <Text style={styles.ruleItem}>• {en ? 'Wrong guesses reset the streak bonus; fast solves grant extra +50 tournament points.' : 'Hatalı tahminlerde seri bonusu sıfırlanır, hızlı çözümler ekstra +50 turnuva puanı kazandırır.'}</Text>
                <Text style={styles.ruleItem}>• {en ? 'Weekly results finalize every Sunday 23:59 and rewards go straight to your vault.' : "Haftalık sonuçlar her Pazar gece 23:59'da kesinleşir ve ödüller doğrudan kasaya aktarılır."}</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable onPress={() => { sounds.playClick(); setIsDetailsOpen(false); onStartTournament(); }}>
                <LinearGradient colors={[C.amber, C.orange]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalCta}>
                  <Play size={16} color="#000" fill="#000" />
                  <Text style={styles.modalCtaText}>{en ? 'Start Tournament Match (2.5x)' : 'Turnuva Maçını Başlat (2.5x)'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)', padding: 14, overflow: 'hidden' },
  blob: { position: 'absolute', top: -20, right: -20, width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(245,158,11,0.1)' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,158,11,0.2)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber },
  liveText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6, color: C.amber },
  countdown: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(18,19,23,0.8)', borderWidth: 1, borderColor: C.border, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  countdownText: { fontSize: 11, fontWeight: '500', color: C.text2 },
  body: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconTile: { width: 44, height: 44, borderRadius: 16, borderWidth: 1.5, borderColor: C.amber, padding: 1, alignItems: 'center', justifyContent: 'center' },
  iconInner: { width: '100%', height: '100%', backgroundColor: C.card, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontSize: 14, fontWeight: '800', color: '#fff' },
  desc: { fontSize: 11, color: C.text2 },
  prizeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  prizeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(56,189,248,0.15)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  prizeText: { fontSize: 11, fontWeight: '800', color: C.accent },
  frameBadge: { backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  frameBadgeText: { fontSize: 10, fontWeight: '700', color: C.amber },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(38,39,43,0.6)' },
  detailsBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 32, borderRadius: 11, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  detailsBtnText: { fontSize: 12, fontWeight: '600', color: C.text },
  startBtnWrap: { flex: 1 },
  startBtn: { height: 32, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  startBtnText: { fontSize: 12, fontWeight: '800', color: '#000' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(11,12,16,0.85)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 370, maxHeight: '88%', borderRadius: 24, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: 'rgba(18,19,23,0.8)' },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  closeBtn: { width: 28, height: 28, borderRadius: 999, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  modalScroll: { maxHeight: 420 },
  modalScrollContent: { padding: 16, gap: 12 },
  heroCard: { padding: 16, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(245,158,11,0.5)', alignItems: 'center' },
  heroTile: { width: 56, height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: C.amber, padding: 1, marginBottom: 8 },
  heroTileInner: { width: '100%', height: '100%', backgroundColor: C.card, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: C.amber, textTransform: 'uppercase' },
  heroTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginTop: 2, textAlign: 'center' },
  heroDesc: { fontSize: 11, color: C.text2, marginTop: 4, textAlign: 'center' },
  tiersLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 2 },
  tierRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1 },
  tierLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  tierMedal: { fontSize: 16 },
  tierTitle: { fontSize: 12, fontWeight: '700', color: '#fff' },
  tierSub: { fontSize: 10, color: C.muted },
  tierReward: { fontSize: 12, fontWeight: '900' },
  rulesCard: { padding: 12, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, gap: 6 },
  rulesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rulesTitle: { fontSize: 12, fontWeight: '700', color: '#fff' },
  ruleItem: { fontSize: 11, color: C.text2, lineHeight: 16 },
  ruleBold: { color: '#fff', fontWeight: '700' },
  modalFooter: { padding: 12, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: 'rgba(18,19,23,0.8)' },
  modalCta: { height: 44, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modalCtaText: { fontSize: 14, fontWeight: '800', color: '#000' },
});
