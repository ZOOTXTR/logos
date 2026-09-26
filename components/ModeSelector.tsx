import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Text } from './CustomText';
import { SPACING, BORDER_RADIUS } from '../constants/theme';
import { GameMode, Category, Difficulty, CATEGORY_INFO, DIFFICULTY_INFO, DIFFICULTY_MAX_GUESSES } from '../constants/words';
import { LevelInfo } from '../constants/levels';
import { useTheme } from '../hooks/useTheme';
import { audioService } from '../services/audio.service';
import { Flame, Zap, ChevronRight, Play, Trophy } from 'lucide-react-native';

interface Props {
  onStart: (mode: GameMode, category: Category, difficulty: Difficulty) => void;
  gems: number;
  xp: number;
  levelInfo: LevelInfo | null;
  streak: number;
  dailyDone: boolean;
  unlockedCategories: string[];
  onOpenStore: () => void;
  onOpenWheel: () => void;
  onOpenDuel: () => void;
}

const CATS: Category[] = ['random', 'hayvanlar', 'sehirler', 'yiyecek', 'meslekler', 'doga', 'spor'];
const DIFFS: Difficulty[] = ['easy', 'normal', 'hard', 'expert'];

const MODE_HINT: Record<GameMode, string> = {
  classic: 'Standart 6 Hak',
  speed: '90 Saniye Blitz',
  daily: 'Günün Tek Kelimesi',
  turnuva: '2.5x Turnuva Puanı',
};

// AI Studio HomeScreen'in birebir RN düzeni: stats kartı + mod segmenti + kategori + zorluk + Oyna + hızlı erişim.
export function ModeSelector({ onStart, gems, xp, levelInfo, streak, dailyDone, unlockedCategories, onOpenStore, onOpenWheel, onOpenDuel }: Props) {
  const { theme, language } = useTheme();
  const [mode, setMode] = React.useState<GameMode>('classic');
  const [cat, setCat] = React.useState<Category>('random');
  const [diff, setDiff] = React.useState<Difficulty>('normal');

  const lvl = levelInfo?.level ?? 1;
  const currentXP = levelInfo ? Math.max(0, xp - levelInfo.minXP) : 0;
  const neededXP = levelInfo ? Math.max(1, levelInfo.maxXP - levelInfo.minXP) : 1;
  const xpPct = Math.min(100, Math.round((currentXP / neededXP) * 100));

  const handleCat = (c: Category) => {
    audioService.play('click');
    if (c !== 'random' && !unlockedCategories.includes(c)) {
      Alert.alert(
        language === 'en' ? '🔒 Category Locked' : '🔒 Kategori Kilitli',
        language === 'en' ? 'Purchase this word pack from the Shop to play!' : 'Bu kelime paketinin kilidini Mağazadan açmalısınız!',
        [{ text: language === 'en' ? 'Cancel' : 'İptal', style: 'cancel' as const },
         { text: language === 'en' ? 'Go to Shop 🛒' : 'Mağazaya Git 🛒', onPress: onOpenStore }]
      );
      return;
    }
    setCat(c);
  };

  const handleMode = (m: GameMode) => {
    audioService.play('click');
    if (m === 'daily' && dailyDone) return;
    setMode(m);
  };

  const isLocked = (c: Category) => c !== 'random' && !unlockedCategories.includes(c);

  return (
    <View style={styles.c}>
      {/* 1. Kompakt İstatistik Kartı */}
      <View style={[styles.statsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={[styles.statCol, { borderRightColor: theme.colors.border, borderRightWidth: StyleSheet.hairlineWidth }]}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{language === 'en' ? 'Level' : 'Seviye'} {lvl}</Text>
          <View style={[styles.xpBar, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.xpFill, { width: `${xpPct}%`, backgroundColor: theme.colors.primary }]} />
          </View>
          <Text style={[styles.statSub, { color: theme.colors.textMuted }]}>{currentXP}/{neededXP} XP</Text>
        </View>
        <View style={[styles.statCol, { borderRightColor: theme.colors.border, borderRightWidth: StyleSheet.hairlineWidth }]}>
          <View style={styles.statInline}>
            <Flame size={14} color={theme.colors.present} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{language === 'en' ? 'Streak' : 'Seri'} {streak}</Text>
          </View>
          <Text style={[styles.statSub, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Daily Streak' : 'Günlük Seri'}</Text>
        </View>
        <View style={styles.statCol}>
          <View style={styles.statInline}>
            <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
            <Text style={[styles.statValue, { color: theme.colors.accent }]}>Gem {gems}</Text>
          </View>
          <Text style={[styles.statSub, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Balance' : 'Mevcut Bakiye'}</Text>
        </View>
      </View>

      {/* 2. Oyun Modu Segmenti */}
      <View style={styles.sectionHead}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Game Mode' : 'Oyun Modu'}</Text>
        <Text style={[styles.sectionHint, { color: theme.colors.present }]}>{MODE_HINT[mode]}</Text>
      </View>
      <View style={[styles.segment, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        {(['classic', 'speed', 'daily', 'turnuva'] as GameMode[]).map((m) => {
          const active = mode === m;
          const isTour = m === 'turnuva';
          return (
            <TouchableOpacity
              key={m}
              accessibilityRole="button"
              onPress={() => handleMode(m)}
              style={[
                styles.segBtn,
                active && { backgroundColor: isTour ? '#F59E0B' : theme.colors.primary },
                !active && isTour && { backgroundColor: '#F59E0B1A', borderWidth: 1, borderColor: '#F59E0B40' },
              ]}
            >
              {m === 'speed' && <Zap size={12} color={active ? '#F4F4F5' : theme.colors.textSecondary} />}
              {isTour && <Trophy size={12} color={active ? '#0B0C10' : '#F59E0B'} />}
              <Text style={[styles.segText, { color: active ? (isTour ? '#0B0C10' : '#F4F4F5') : (isTour ? '#F59E0B' : theme.colors.textSecondary), opacity: m === 'daily' && dailyDone ? 0.5 : 1 }]}>
                {m === 'classic' ? (language === 'en' ? 'Classic' : 'Klasik') : m === 'speed' ? (language === 'en' ? 'Blitz' : 'Hızlı') : m === 'daily' ? (language === 'en' ? 'Daily' : 'Günlük') : (language === 'en' ? 'Tournament' : 'Turnuva')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Kategori */}
      <View style={styles.sectionHead}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Category' : 'Kategori'}</Text>
        <Text style={[styles.sectionHint, { color: theme.colors.textSecondary }]}>{language === 'en' ? 'Word Pool' : 'Sözcük Havuzu'}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow} style={styles.chipScroll}>
        {CATS.map((c) => {
          const info = CATEGORY_INFO[c];
          const selected = cat === c;
          const locked = isLocked(c);
          return (
            <TouchableOpacity
              key={c}
              accessibilityRole="button"
              onPress={() => handleCat(c)}
              style={[
                styles.chip,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                selected && { backgroundColor: theme.colors.primary + '26', borderColor: theme.colors.primary },
                locked && { opacity: 0.65 },
              ]}
            >
              <Text style={styles.chipEmoji}>{locked ? '🔒' : info.emoji}</Text>
              <Text style={[styles.chipLabel, { color: selected ? theme.colors.primaryLight : theme.colors.textSecondary }]}>
                {language === 'en' && c === 'random' ? 'Random' : info.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 4. Zorluk */}
      <View style={styles.sectionHead}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Difficulty' : 'Zorluk'}</Text>
        <Text style={[styles.sectionHint, { color: theme.colors.present }]}>+{DIFFICULTY_INFO[diff].xpBonus} XP</Text>
      </View>
      <View style={[styles.segment, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        {DIFFS.map((d) => {
          const active = diff === d;
          return (
            <TouchableOpacity
              key={d}
              accessibilityRole="button"
              onPress={() => { audioService.play('click'); setDiff(d); }}
              style={[styles.diffBtn, active && { backgroundColor: theme.colors.primary }]}
            >
              <Text style={[styles.diffLabel, { color: active ? '#F4F4F5' : theme.colors.textSecondary }]}>
                {language === 'en' && d === 'easy' ? 'Easy' : language === 'en' && d === 'normal' ? 'Normal' : language === 'en' && d === 'hard' ? 'Hard' : language === 'en' && d === 'expert' ? 'Expert' : DIFFICULTY_INFO[d].label}
              </Text>
              <Text style={[styles.diffSub, { color: active ? 'rgba(244,244,245,0.8)' : theme.colors.textMuted }]}>
                {DIFFICULTY_MAX_GUESSES[d]} {language === 'en' ? 'Tries' : 'Hak'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 5. Büyük Oyna Butonu */}
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.85}
        onPress={() => { audioService.play('click'); onStart(mode, cat, diff); }}
        style={[styles.playBtn, { backgroundColor: mode === 'turnuva' ? '#F59E0B' : theme.colors.primary }]}
      >
        <View style={styles.playLeft}>
          <View style={[styles.playIcon, { backgroundColor: mode === 'turnuva' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }]}>
            {mode === 'turnuva' ? <Trophy size={16} color="#0B0C10" fill="#0B0C10" /> : <Play size={16} color="#fff" fill="#fff" style={{ marginLeft: 1 }} />}
          </View>
          <Text style={[styles.playText, { color: mode === 'turnuva' ? '#0B0C10' : '#F4F4F5' }]}>
            {mode === 'turnuva' ? (language === 'en' ? 'PLAY TOURNAMENT' : 'TURNUVA OYNA') : (language === 'en' ? 'PLAY' : 'OYNA')}
          </Text>
        </View>
        <View style={[styles.playRight, { backgroundColor: mode === 'turnuva' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.15)' }]}>
          <Text style={[styles.playRightText, { color: mode === 'turnuva' ? '#0B0C10' : 'rgba(244,244,245,0.9)' }]}>
            {DIFFICULTY_MAX_GUESSES[diff]} {language === 'en' ? 'Tries' : 'Hak'} • {mode === 'classic' ? (language === 'en' ? 'Classic' : 'Klasik') : mode === 'speed' ? (language === 'en' ? 'Blitz' : 'Hızlı') : mode === 'daily' ? (language === 'en' ? 'Daily' : 'Günlük') : '2.5x Puan'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 6. Hızlı Erişim Kartları */}
      <View style={styles.quickRow}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={() => { audioService.play('click'); onOpenWheel(); }}
          style={[styles.quickCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        >
          <View style={styles.quickTop}>
            <View style={[styles.quickIcon, { backgroundColor: '#F59E0B26' }]}>
              <Text style={styles.quickEmoji}>🎡</Text>
            </View>
            <Text style={[styles.quickTag, { color: theme.colors.present, backgroundColor: '#F59E0B1A' }]}>{language === 'en' ? 'Free' : 'Ücretsiz'}</Text>
          </View>
          <View style={styles.quickBottom}>
            <Text style={[styles.quickTitle, { color: theme.colors.text }]}>{language === 'en' ? 'Daily Wheel' : 'Günlük Şans Çarkı'}</Text>
            <ChevronRight size={14} color={theme.colors.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={() => { audioService.play('click'); onOpenDuel(); }}
          style={[styles.quickCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        >
          <View style={styles.quickTop}>
            <View style={[styles.quickIcon, { backgroundColor: '#38BDF826' }]}>
              <Text style={styles.quickEmoji}>⚔️</Text>
            </View>
            <Text style={[styles.quickTag, { color: theme.colors.accent, backgroundColor: '#38BDF81A' }]}>{language === 'en' ? 'Live 1v1' : 'Canlı 1v1'}</Text>
          </View>
          <View style={styles.quickBottom}>
            <Text style={[styles.quickTitle, { color: theme.colors.text }]}>{language === 'en' ? 'Online Duel' : 'Çevrimiçi Düello'}</Text>
            <ChevronRight size={14} color={theme.colors.textMuted} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, paddingBottom: 24 },
  statsCard: { borderRadius: BORDER_RADIUS.lg, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 6, flexDirection: 'row', marginBottom: SPACING.md },
  statCol: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  statInline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontWeight: '700' },
  statSub: { fontSize: 10, marginTop: 4 },
  xpBar: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  xpFill: { height: '100%', borderRadius: 3 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2, marginBottom: 6, marginTop: SPACING.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600' },
  sectionHint: { fontSize: 11, fontWeight: '600' },
  segment: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 4, gap: 4, marginBottom: SPACING.sm },
  segBtn: { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  segText: { fontSize: 12, fontWeight: '700' },
  chipScroll: { marginBottom: SPACING.sm },
  chipRow: { gap: 8, paddingHorizontal: 2, paddingVertical: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1 },
  chipEmoji: { fontSize: 14 },
  chipLabel: { fontSize: 13, fontWeight: '600' },
  diffBtn: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  diffLabel: { fontSize: 12, fontWeight: '600' },
  diffSub: { fontSize: 10, marginTop: 2 },
  playBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: 20, marginTop: SPACING.xs },
  playLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  playText: { color: '#F4F4F5', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  playRight: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  playRightText: { color: 'rgba(244,244,245,0.9)', fontSize: 12, fontWeight: '600' },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: SPACING.sm },
  quickCard: { flex: 1, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, padding: 12, justifyContent: 'space-between', minHeight: 92 },
  quickTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quickIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  quickEmoji: { fontSize: 15 },
  quickTag: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  quickBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  quickTitle: { fontSize: 12, fontWeight: '600' },
});
