import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from './CustomText';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { GameMode, Category, Difficulty, GAME_MODE_INFO, CATEGORY_INFO, DIFFICULTY_INFO } from '../constants/words';
import { useTheme } from '../hooks/useTheme';
import { TRANSLATIONS } from '../constants/translations';
import { WidgetCard } from './design/WidgetCard';
import { audioService } from '../services/audio.service';

interface Props {
  onStart: (mode: GameMode, category: Category, difficulty: Difficulty) => void;
  gems: number; streak: number; levelTitle: string; level: number;
  dailyDone: boolean; unlockedCategories: string[]; onOpenStore: () => void;
}

const MODES = [
  { id: 'classic' as GameMode, icon: '??', titleKey: 'modeClassicTitle', descKey: 'modeClassicDesc' },
  { id: 'speed' as GameMode, icon: '?', titleKey: 'modeBlitzTitle', descKey: 'modeBlitzDesc' },
  { id: 'daily' as GameMode, icon: '??', titleKey: 'dailyChallenge', descKey: 'dailyChallengeDesc' },
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
    audioService.play('click');
    if (!unlockedCategories.includes(c)) {
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

  return (
    <View style={styles.c}>
      {/* Bento Stats Row */}
      <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
        <WidgetCard theme={theme} variant='glass' style={styles.statWidget}>
          <Text style={[styles.sl, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Level' : 'Seviye'}</Text>
          <Text style={[styles.sv, { color: theme.colors.text }]}>{level}</Text>
          <Text style={[styles.sl, { color: theme.colors.textMuted, fontSize: 9, marginTop: 4 }]} numberOfLines={1}>{levelTitle}</Text>
        </WidgetCard>
        
        <WidgetCard theme={theme} variant='glass' style={styles.statWidget}>
          <Text style={[styles.sl, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Streak' : 'Seri'}</Text>
          <Text style={[styles.sv, { color: theme.colors.text }]}>?? {streak}</Text>
        </WidgetCard>
        
        <WidgetCard theme={theme} variant='glass' style={styles.statWidget}>
          <Text style={[styles.sl, { color: theme.colors.textMuted }]}>Gem</Text>
          <Text style={[styles.sv, { color: theme.colors.gem }]}>?? {gems}</Text>
        </WidgetCard>
      </View>

      <Text style={[styles.section, { color: theme.colors.textSecondary }]}>?? {language === 'en' ? 'Game Mode' : 'Oyun Modu'}</Text>
      
      {/* Bento Mode Grid */}
      <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
        <WidgetCard 
          theme={theme} 
          variant={mode === 'classic' ? 'primary' : 'glass'} 
          span={2} 
          onPress={() => handleMode('classic')}
        >
          <Text style={{ fontSize: 32, marginBottom: 8 }}>??</Text>
          <Text style={{ color: mode === 'classic' ? theme.colors.card : theme.colors.text, fontSize: 18, fontWeight: '900' }}>
            {language === 'en' ? 'Classic' : 'Klasik'}
          </Text>
        </WidgetCard>
        <View style={{ flex: 1, gap: SPACING.sm }}>
          <WidgetCard theme={theme} variant={mode === 'speed' ? 'primary' : 'glass'} onPress={() => handleMode('speed')}>
            <Text style={{ fontSize: 24, marginBottom: 4 }}>?</Text>
            <Text style={{ color: mode === 'speed' ? theme.colors.card : theme.colors.text, fontSize: 12, fontWeight: '800' }}>Blitz</Text>
          </WidgetCard>
          <WidgetCard theme={theme} variant={mode === 'daily' ? 'primary' : 'glass'} disabled={dailyDone} onPress={() => handleMode('daily')}>
            <Text style={{ fontSize: 24, marginBottom: 4 }}>??</Text>
            <Text style={{ color: mode === 'daily' ? theme.colors.card : theme.colors.text, fontSize: 12, fontWeight: '800', opacity: dailyDone ? 0.5 : 1 }}>Daily</Text>
          </WidgetCard>
        </View>
      </View>

      {mode === 'classic' && <>
        <Text style={[styles.section, { color: theme.colors.textSecondary }]}>?? {language === 'en' ? 'Category' : 'Kategori'}</Text>
        <View style={styles.cgrid}>{CATS.map(c => {
          const info = CATEGORY_INFO[c];
          return <TouchableOpacity key={c} style={[styles.cc, { backgroundColor: theme.colors.card + '88', borderColor: theme.colors.border + '55' }, cat === c && { borderColor: info.color, borderWidth: 2, backgroundColor: info.color + '44' }]} onPress={() => handleCat(c)} activeOpacity={0.8}><Text style={styles.ce}>{unlockedCategories.includes(c) ? info.emoji : '??'}</Text><Text style={[styles.cl, { color: theme.colors.textSecondary }, cat === c && { color: info.color }]}>{language === 'en' && c === 'random' ? 'Random' : info.label}</Text></TouchableOpacity>;
        })}</View>
      </>}

      <Text style={[styles.section, { color: theme.colors.textSecondary }]}>?? {language === 'en' ? 'Difficulty' : 'Zorluk'}</Text>
      <View style={styles.row}>{DIFFS.map(d => {
        const info = DIFFICULTY_INFO[d];
        return <TouchableOpacity key={d} style={[styles.dc, { backgroundColor: theme.colors.card + '88', borderColor: theme.colors.border + '55' }, diff === d && { borderColor: info.color, backgroundColor: info.color + '44' }]} onPress={() => { audioService.play('click'); setDiff(d); }} activeOpacity={0.8}><Text style={styles.de}>{info.emoji}</Text><Text style={[styles.dl, { color: theme.colors.textSecondary }, diff === d && { color: info.color }]}>{language === 'en' && d === 'easy' ? 'Easy' : language === 'en' && d === 'normal' ? 'Normal' : language === 'en' && d === 'hard' ? 'Hard' : language === 'en' && d === 'expert' ? 'Expert' : info.label}</Text></TouchableOpacity>;
      })}</View>

      <TouchableOpacity style={styles.btn} onPress={() => { audioService.play('click'); onStart(mode, cat, diff); }} activeOpacity={0.85}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.bt}>{mode === 'daily' ? '📅 OYNA' : mode === 'speed' ? '⚡ OYNA' : '📅 OYNA'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, paddingBottom: 24 },
  statWidget: { padding: 12, alignItems: 'center' },
  si: { flex: 1, alignItems: 'center' },
  sl: { fontSize: FONTS.size.xs, fontWeight: '600' },
  sv: { fontSize: FONTS.size.lg, fontWeight: '800', marginTop: 4 },
  section: { fontSize: FONTS.size.sm, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.sm },
  row: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  cgrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  cc: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 16, paddingHorizontal: SPACING.sm, paddingVertical: 8, borderWidth: 1 },
  ce: { fontSize: 16 },
  cl: { fontSize: FONTS.size.xs, fontWeight: '700' },
  dc: { flex: 1, borderRadius: 16, padding: SPACING.xs, alignItems: 'center', borderWidth: 1, paddingVertical: 12 },
  de: { fontSize: 20 },
  dl: { fontSize: 11, fontWeight: '800', marginTop: 4 },
  btn: { marginTop: SPACING.md, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  bg: { paddingVertical: 18, alignItems: 'center' },
  bt: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: '900', letterSpacing: 1 },
});

