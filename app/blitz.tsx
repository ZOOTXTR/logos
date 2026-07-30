import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, Alert, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { WORD_LENGTH } from '../constants/words';
import { useBlitz } from '../hooks/useBlitz';
import { useProgress } from '../hooks/useProgress';
import { useTheme } from '../hooks/useTheme';
import { Timer } from '../components/Timer';
import { Keyboard } from '../components/Keyboard';
import { LoadingView } from '../components/LoadingView';

export default function BlitzScreen() {
  const router = useRouter();
  const game = useBlitz('random');
  const progress = useProgress();
  const { theme, language } = useTheme();

  if (progress.loading) {
    return <LoadingView />;
  }

  const handleKey = (key: string) => {
    if (game.status !== 'playing') return;
    game.addLetter(key);
  };

  const handleSubmit = async () => {
    const result = game.submitGuess();
    if (result === 'correct') {
      await progress.earnXP(game.streak >= 3 ? 60 : 30);
    }
    if (game.status === 'ended') {
      await progress.earnXP(game.score / 10);
      await progress.addGems(Math.floor(game.wordsSolved * 5));
    }
  };

  // Physical keyboard support on Web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (game.status !== 'playing') return;

      const key = e.key.toLocaleUpperCase('tr-TR');

      if (key === 'ENTER') {
        handleSubmit();
      } else if (key === 'BACKSPACE') {
        game.deleteLetter();
      } else if (/^[A-ZĞÜŞİÖÇI]$/.test(key)) {
        handleKey(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [game.status, handleKey, handleSubmit]);

  if (progress.loading) {
    return <LoadingView />;
  }

  if (game.status === 'ended') {
    return (
      <SafeAreaView style={styles.safe}>
        <LinearGradient colors={['#0D0D1A', '#0F0F23']} style={styles.container}>
          <View style={styles.resultScreen}>
            <Text style={styles.resultTitle}>⚡ Blitz Bitti!</Text>
            <View style={styles.resultCards}>
              {[
                { label: 'Skor', value: game.score, emoji: '🏆' },
                { label: 'Çözülen', value: game.wordsSolved, emoji: '✅' },
                { label: 'Toplam', value: game.wordsAnswered, emoji: '📝' },
                { label: 'En Uzun Seri', value: game.streak, emoji: '🔥' },
              ].map((item, i) => (
                <View key={i} style={styles.resultCard}>
                  <Text style={styles.resultEmoji}>{item.emoji}</Text>
                  <Text style={styles.resultValue}>{item.value}</Text>
                  <Text style={styles.resultLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.resultXP}>+{Math.floor(game.wordsSolved * 5)} 💎  +{Math.floor(game.score / 10)} XP</Text>
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.resultBtn} onPress={game.reset}>
                <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.resultBtnGrad}>
                  <Text style={styles.resultBtnText}>🔄 Tekrar</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.resultBtn, { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }]} onPress={() => router.back()}>
                <Text style={[styles.resultBtnText, { color: COLORS.text }]}>🏠 Menü</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <LinearGradient colors={[COLORS.background, '#0F0F23']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>⚡ Blitz</Text>
          {game.streak >= 3 && (
            <Text style={styles.streakBadge}>🔥 {game.streak} Seri!</Text>
          )}
        </View>

        {/* Timer */}
        <Timer timeLeft={game.timeLeft} totalTime={60} />

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
