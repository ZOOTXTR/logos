import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './CustomText';
import { Trophy, Clock, Gem, Play } from 'lucide-react-native';
import { Theme } from '../constants/themes';

interface TournamentBannerProps {
  theme: Theme;
  language: 'tr' | 'en';
  onStartTournament: () => void;
}

function getTimeToSunday(): number {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
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

export function TournamentBanner({ theme, language, onStartTournament }: TournamentBannerProps) {
  const [remaining, setRemaining] = useState(getTimeToSunday());

  useEffect(() => {
    const t = setInterval(() => setRemaining(getTimeToSunday()), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={[styles.banner, { backgroundColor: '#F59E0B14', borderColor: '#F59E0B66' }]}>
      <View style={styles.topRow}>
        <View style={[styles.liveBadge, { backgroundColor: '#F59E0B33', borderColor: '#F59E0B66' }]}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{language === 'en' ? 'LIVE TOURNAMENT' : 'CANLI TURNUVA AÇIK'}</Text>
        </View>
        <View style={[styles.countdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Clock size={12} color={theme.colors.accent} />
          <Text style={[styles.countdownText, { color: theme.colors.textSecondary }]}>{formatRemaining(remaining)} {language === 'en' ? 'left' : 'Kaldı'}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={[styles.iconTile, { backgroundColor: '#F59E0B33' }]}>
          <Trophy size={20} color="#F59E0B" fill="#F59E0B" />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{language === 'en' ? 'Weekly Word Tournament' : 'Haftalık Büyük Kelime Turnuvası'}</Text>
          <Text style={[styles.desc, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {language === 'en' ? 'Earn 2.5x points on every correct guess and climb!' : 'Her doğru tahminde 2.5x puan kazan, zirveye tırman!'}
          </Text>
          <View style={[styles.prizeBadge, { backgroundColor: '#38BDF826', borderColor: '#38BDF866' }]}>
            <Gem size={12} color={theme.colors.accent} />
            <Text style={[styles.prizeText, { color: theme.colors.accent }]}>1.000 💎 {language === 'en' ? 'Prize Pool' : 'Ödül Havuzu'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.9}
        onPress={onStartTournament}
        style={styles.startBtn}
      >
        <Play size={14} color="#0B0C10" fill="#0B0C10" />
        <Text style={styles.startText}>{language === 'en' ? 'Start Tournament (2.5x)' : 'Turnuvaya Başla (2.5x)'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 18, borderWidth: 1.5, padding: 14, gap: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F59E0B' },
  liveText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: '#F59E0B' },
  countdown: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  countdownText: { fontSize: 11, fontWeight: '600' },
  body: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconTile: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontSize: 14, fontWeight: '800' },
  desc: { fontSize: 11 },
  prizeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  prizeText: { fontSize: 11, fontWeight: '800' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 36, borderRadius: 11, backgroundColor: '#F59E0B' },
  startText: { fontSize: 12, fontWeight: '800', color: '#0B0C10' },
});
