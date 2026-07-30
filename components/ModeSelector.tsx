import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { GameMode, Category, Difficulty, GAME_MODE_INFO, CATEGORY_INFO, DIFFICULTY_INFO } from '../constants/words';
import { useTheme } from '../hooks/useTheme';
import { TRANSLATIONS } from '../constants/translations';
import { ModeCard } from './ModeCard';

interface Props {
  onStart: (mode: GameMode, category: Category, difficulty: Difficulty) => void;
  gems: number; streak: number; levelTitle: string; level: number;
  dailyDone: boolean; unlockedCategories: string[]; onOpenStore: () => void;
}

const MODES = [
  { id: 'classic' as GameMode, icon: '🎯', titleKey: 'modeClassicTitle', descKey: 'modeClassicDesc', gemCost: 0, premium: false },
  { id: 'speed' as GameMode, icon: '⚡', titleKey: 'modeBlitzTitle', descKey: 'modeBlitzDesc', gemCost: 0, premium: false },
  { id: 'daily' as GameMode, icon: '🌟', titleKey: 'dailyChallenge', descKey: 'dailyChallengeDesc', gemCost: 0, premium: false },
];
const CATS: Category[] = ['random', 'hayvanlar', 'sehirler', 'yiyecek', 'meslekler', 'doga', 'spor'];
const DIFFS: Difficulty[] = ['easy', 'normal', 'hard', 'expert'];

export function ModeSelector({ onStart, gems, streak, levelTitle, level, dailyDone, unlockedCategories, onOpenStore }: Props) {
  const { theme, language } = useTheme();
  const t = TRANSLATIONS[language];
  const [mode, setMode] = React.useState<GameMode>('classic');
  const [cat, setCat] = React.useState<Category>('random');
  const [diff, setDiff] = React.useState<Difficulty>('normal');

  const handleCat = (c: Category) => {
    if (!unlockedCategories.includes(c)) {
      Alert.alert(
        language === 'en' ? '🔒 Category Locked' : '🔒 Kategori Kilitli',
        language === 'en' ? 'Purchase this word pack from the Shop to play!' : 'Mağazadan kelime paketinin kilidini açmalısınız!',
        [{ text: language === 'en' ? 'Cancel' : 'İptal', style: 'cancel' as const },
         { text: language === 'en' ? 'Go to Shop 🏪' : 'Mağazaya Git 🏪', onPress: onOpenStore }]
      );
      return;
    }
    setCat(c);
  };

  return (
    <View style={styles.c}>
      <View style={[styles.strip, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.si}><Text style={[styles.sl, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Level' : 'Seviye'}</Text><Text style={[styles.sv, { color: theme.colors.text }]}>{level} · {levelTitle}</Text></View>
        <View style={[styles.sd, { backgroundColor: theme.colors.border }]} />
        <View style={styles.si}><Text style={[styles.sl, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Streak' : 'Seri'}</Text><Text style={[styles.sv, { color: theme.colors.text }]}>🔥 {streak}</Text></View>
        <View style={[styles.sd, { backgroundColor: theme.colors.border }]} />
        <View style={styles.si}><Text style={[styles.sl, { color: theme.colors.textMuted }]}>Gem</Text><Text style={[styles.sv, { color: theme.colors.text }]}>💎 {gems}</Text></View>
      </View>

      <Text style={[styles.section, { color: theme.colors.textSecondary }]}>🎮 {language === 'en' ? 'Game Mode' : 'Oyun Modu'}</Text>
      <View style={styles.grid}>{MODES.map(m => {
        const info = GAME_MODE_INFO[m.id];
        return <ModeCard key={m.id} mode={m.id} icon={m.icon} title={(t[m.titleKey as keyof typeof t] || info.label) as string} description={(t[m.descKey as keyof typeof t] || info.description) as string} gemCost={m.gemCost} isUnlocked premium={m.premium} onSelect={id => { if (id !== 'daily' || !dailyDone) setMode(id as GameMode); }} theme={theme} language={language} />;
      })}</View>

      {mode === 'classic' && <>
        <Text style={[styles.section, { color: theme.colors.textSecondary }]}>📂 {language === 'en' ? 'Category' : 'Kategori'}</Text>
        <View style={styles.cgrid}>{CATS.map(c => {
          const info = CATEGORY_INFO[c];
          return <TouchableOpacity key={c} style={[styles.cc, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, cat === c && { borderColor: info.color, borderWidth: 2, backgroundColor: info.color + '22' }]} onPress={() => handleCat(c)} activeOpacity={0.8}><Text style={styles.ce}>{unlockedCategories.includes(c) ? info.emoji : '🔒'}</Text><Text style={[styles.cl, { color: theme.colors.textSecondary }, cat === c && { color: info.color }]}>{language === 'en' && c === 'random' ? 'Random' : info.label}</Text></TouchableOpacity>;
        })}</View>
      </>}

      <Text style={[styles.section, { color: theme.colors.textSecondary }]}>⚡ {language === 'en' ? 'Difficulty' : 'Zorluk'}</Text>
      <View style={styles.row}>{DIFFS.map(d => {
        const info = DIFFICULTY_INFO[d];
        return <TouchableOpacity key={d} style={[styles.dc, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, diff === d && { borderColor: info.color, backgroundColor: info.color + '33' }]} onPress={() => setDiff(d)} activeOpacity={0.8}><Text style={styles.de}>{info.emoji}</Text><Text style={[styles.dl, { color: theme.colors.textSecondary }, diff === d && { color: info.color }]}>{language === 'en' && d === 'easy' ? 'Easy' : language === 'en' && d === 'normal' ? 'Normal' : language === 'en' && d === 'hard' ? 'Hard' : language === 'en' && d === 'expert' ? 'Expert' : info.label}</Text></TouchableOpacity>;
      })}</View>

      <TouchableOpacity style={styles.btn} onPress={() => onStart(mode, cat, diff)} activeOpacity={0.85}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.bt}>{mode === 'daily' ? `🌟 ${language === 'en' ? 'Daily Word' : 'Günlük Kelime'}` : mode === 'speed' ? `⚡ ${language === 'en' ? 'Start Blitz!' : 'Hızlı Başla!'}` : `🎯 ${language === 'en' ? 'Start Game' : 'Oyunu Başlat'}`}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1 },
  strip: { flexDirection: 'row', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1 },
  si: { flex: 1, alignItems: 'center' },
  sl: { fontSize: FONTS.size.xs, fontWeight: '600' },
  sv: { fontSize: FONTS.size.sm, fontWeight: '700', marginTop: 2 },
  sd: { width: 1 },
  section: { fontSize: FONTS.size.sm, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.sm },
  row: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm, justifyContent: 'space-between' },
  cgrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  cc: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: BORDER_RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderWidth: 1 },
  ce: { fontSize: 14 },
  cl: { fontSize: FONTS.size.xs, fontWeight: '600' },
  dc: { flex: 1, borderRadius: BORDER_RADIUS.sm, padding: SPACING.xs, alignItems: 'center', borderWidth: 1 },
  de: { fontSize: 16 },
  dl: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  btn: { marginTop: SPACING.md, borderRadius: BORDER_RADIUS.full, overflow: 'hidden' },
  bg: { paddingVertical: SPACING.md, alignItems: 'center' },
  bt: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: '800', letterSpacing: 0.5 },
});