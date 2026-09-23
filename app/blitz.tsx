import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Alert, Platform,  } from 'react-native';
import { Text } from '../components/CustomText';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { WORD_LENGTH } from '../constants/words';
import { useBlitz } from '../hooks/useBlitz';
import { useProgress } from '../hooks/useProgress';
import { useTheme } from '../hooks/useTheme';
import { TimerDisplay } from '../components/TimerDisplay';
import { Keyboard } from '../components/Keyboard';
import { LoadingView } from '../components/LoadingView';
import { GameResultOverlay } from '../components/GameResultOverlay';

import { audioService } from '../services/audio.service';

export default function BlitzScreen() {
  const router = useRouter();
  const { theme, language } = useTheme();
  const game = useBlitz('random', language as 'tr' | 'en');
  const progress = useProgress();



  const handleKey = (key: string) => {
    if (game.status !== 'playing') return;
    audioService.play('click');
    game.addLetter(key);
  };

  const handleSubmit = async () => {
    const result = game.submitGuess();
    if (result === 'correct') {
      audioService.play('win');
      audioService.triggerHaptic('success');
      await progress.earnXP(game.streak >= 3 ? 60 : 30);
    } else {
      audioService.triggerHaptic('warning');
    }
  };

  useEffect(() => {
    let mounted = true;
    return () => { mounted = false; };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <LinearGradient colors={[COLORS.background, '#0F0F23']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Geri">
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>⚡ Blitz</Text>
          {game.streak >= 3 && (
            <Text style={styles.streakBadge}>🔥 {game.streak} Seri!</Text>
          )}
        </View>

        {/* Timer */}
        <TimerDisplay endTime={game.endTime} totalTime={60} onTimeUp={game.onTimeUp} />

        {/* Skor */}
        <View style={styles.scoreRow}>
          <Text style={styles.score}>🏆 {game.score}</Text>
          <Text style={styles.wordsCount}>✅ {game.wordsSolved}/{game.wordsAnswered}</Text>
        </View>

        {/* Mevcut Kelime (5 hücre) */}
        <View style={styles.wordDisplay}>
          {Array(WORD_LENGTH).fill(null).map((_, i) => (
            <View key={i} style={[styles.letterCell, game.guess[i] && styles.letterCellFilled]}>
              <Text style={styles.letterText}>{game.guess[i] ?? ''}</Text>
            </View>
          ))}
        </View>

        {/* Klavye */}
        <View style={styles.keyboard}>
          <Keyboard
            onKey={handleKey}
            onDelete={game.deleteLetter}
            onSubmit={handleSubmit}
            revealedLetters={{}}
          />
          <TouchableOpacity style={[styles.skipBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.warning }]} onPress={game.skip}>
            <Text style={[styles.skipText, { color: theme.colors.warning }]}>⏭ {language === 'en' ? 'Skip -5s' : 'ATLA -5sn'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <GameResultOverlay
        visible={game.status === 'ended'}
        title={language === 'en' ? 'Time is Up!' : 'Süre Bitti!'}
        emoji="⚡"
        message={language === 'en' ? `Score: ${game.score}\nSolved: ${game.wordsSolved}\nStreak: ${game.streak}` : `Skor: ${game.score}\nÇözülen: ${game.wordsSolved}\nSeri: ${game.streak}`}
        theme={theme}
        language={language}
        buttons={[
          { label: language === 'en' ? 'Play Again' : 'Yeniden Oyna', onPress: game.reset, primary: true },
          { label: language === 'en' ? 'Menu' : 'Ana Menü', onPress: () => router.back() }
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SPACING.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md },
  backBtn: { backgroundColor: COLORS.card, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  backText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, fontWeight: '600' },
  title: { fontSize: FONTS.size.xl, fontWeight: '900', color: COLORS.text },
  streakBadge: { backgroundColor: COLORS.error + '33', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, color: COLORS.error, fontWeight: '800', fontSize: FONTS.size.sm },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.sm, marginVertical: SPACING.sm },
  score: { fontSize: FONTS.size.xl, fontWeight: '900', color: COLORS.text },
  wordsCount: { fontSize: FONTS.size.lg, fontWeight: '700', color: COLORS.textSecondary },
  wordDisplay: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginVertical: SPACING.lg },
  letterCell: { width: 54, height: 62, backgroundColor: COLORS.empty, borderRadius: BORDER_RADIUS.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border },
  letterCellFilled: { borderColor: COLORS.primaryLight, backgroundColor: COLORS.surfaceLight },
  letterText: { fontSize: FONTS.size.xxl, fontWeight: '800', color: COLORS.text },
  keyboard: { flex: 1, justifyContent: 'flex-end', gap: 8, paddingBottom: SPACING.md },
  skipBtn: { paddingVertical: 10, borderRadius: BORDER_RADIUS.md, borderWidth: 1.5, alignItems: 'center' },
  skipText: { fontSize: FONTS.size.sm, fontWeight: '800' },
  // Sonuç ekranı
  resultScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  resultTitle: { fontSize: FONTS.size.huge, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.xl },
  resultCards: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center', marginBottom: SPACING.xl },
  resultCard: { width: 140, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  resultEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  resultValue: { fontSize: FONTS.size.xxxl, fontWeight: '900', color: COLORS.text },
  resultLabel: { fontSize: FONTS.size.sm, color: COLORS.textMuted, fontWeight: '600' },
  resultXP: { fontSize: FONTS.size.xl, fontWeight: '800', color: COLORS.accent, marginBottom: SPACING.xl },
  resultActions: { flexDirection: 'row', gap: SPACING.md, width: '100%' },
  resultBtn: { flex: 1, borderRadius: BORDER_RADIUS.full, overflow: 'hidden' },
  resultBtnGrad: { paddingVertical: SPACING.md, alignItems: 'center' },
  resultBtnText: { color: COLORS.text, fontWeight: '800', fontSize: FONTS.size.md },
});


