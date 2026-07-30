import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, Alert, TextInput, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Category, CATEGORY_INFO } from '../constants/words';
import { useAnagram } from '../hooks/useAnagram';
import { useProgress } from '../hooks/useProgress';
import { useTheme } from '../hooks/useTheme';
import { HINT_GEM_COST } from '../constants/products';
import { audioService } from '../services/audio.service';
import { Confetti } from '../components/Confetti';
import { GameResultOverlay } from '../components/GameResultOverlay';
import { TRANSLATIONS } from '../constants/translations';
import { LoadingView } from '../components/LoadingView';

export default function AnagramScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('random');
  const { theme, colorBlind, language } = useTheme();
  const game = useAnagram(category, language);
  const progress = useProgress();
  const [showConfetti, setShowConfetti] = useState(false);
  const [resultOverlay, setResultOverlay] = useState<{ visible: boolean; title: string; emoji: string; message: string; word?: string; gemsAwarded?: number; xpAwarded?: number; buttons: Array<{ label: string; onPress: () => void; primary?: boolean }> }>({ visible: false, title: '', emoji: '', message: '', buttons: [] });

  if (progress.loading) {
    return <LoadingView message={language === 'en' ? 'Loading...' : 'Yükleniyor...'} />;
  }

  const t = TRANSLATIONS[language];
  const categories: Category[] = ['random', 'hayvanlar', 'sehirler', 'yiyecek', 'meslekler', 'doga', 'spor'];

  const handleSubmit = async () => {
    if (game.currentGuess.length < game.targetWord.length) {
      audioService.triggerHaptic('warning');
      Alert.alert('', language === 'en' ? 'Select all letters!' : 'Tüm harfleri seçin!');
      return;
    }
    const result = game.submitGuess();
    if (result === 'correct') {
      setShowConfetti(true);
      audioService.play('win');
      audioService.triggerHaptic('success');
      await progress.earnXP(75);
      await progress.addGems(20);
      setResultOverlay({
        visible: true,
        title: language === 'en' ? 'Correct!' : 'Doğru!',
        emoji: '🎉',
        message: language === 'en' ? 'Great job!' : 'Harika!',
        gemsAwarded: 20,
        xpAwarded: 75,
        buttons: [{
          label: language === 'en' ? 'Continue' : 'Devam',
          onPress: () => {
            setShowConfetti(false);
            game.reset(category);
          },
          primary: true
        }]
      });
    } else if (result === 'gameover') {
      audioService.play('loss');
      audioService.triggerHaptic('warning');
      setResultOverlay({
        visible: true,
        title: language === 'en' ? 'Game Over' : 'Oyun Bitti',
        emoji: '😢',
        message: language === 'en' ? 'Better luck next time!' : 'Bir dahaki sefere daha iyi şanslar!',
        word: game.targetWord,
        buttons: [
          { label: language === 'en' ? 'Retry' : 'Tekrar', onPress: () => { setShowConfetti(false); game.reset(category); } },
          { label: language === 'en' ? 'Menu' : 'Menü', onPress: () => router.back(), primary: true }
        ]
      });
    } else {
      audioService.play('loss');
      audioService.triggerHaptic('warning');
      Alert.alert(language === 'en' ? '❌ Wrong' : '❌ Yanlış', language === 'en' ? `${game.maxAttempts - game.attempts} guesses remaining` : `${game.maxAttempts - game.attempts} hakkın kaldı`);
    }
  };

  const handleHint = async () => {
    if (progress.premium) {
      const hintMsg = game.useHint();
      if (Platform.OS === 'web') {
        alert(`💡 ${language === 'en' ? 'Hint' : 'İpucu'}: ${hintMsg}`);
      } else {
        Alert.alert(language === 'en' ? '💡 Hint' : '💡 İpucu', hintMsg);
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        language === 'en'
          ? `Spend ${HINT_GEM_COST} Gems for a hint?`
          : `Bir ipucu için ${HINT_GEM_COST} Gem harcamak ister misiniz?`
      );
      if (confirmed) {
        const ok = await progress.spendGems(HINT_GEM_COST);
        if (ok) {
          alert(`💡 ${language === 'en' ? 'Hint' : 'İpucu'}: ${game.useHint()}`);
        } else {
          alert(language === 'en' ? 'Insufficient Gems!' : 'Yetersiz Gem bakiyesi!');
        }
      }
      return;
    }

    Alert.alert(language === 'en' ? 'Get Hint' : 'İpucu Al', language === 'en' ? `Spend ${HINT_GEM_COST} 💎 for a hint?` : `${HINT_GEM_COST} 💎 harcamak ister misiniz?`, [
      { text: language === 'en' ? 'Cancel' : 'İptal' },
      {
        text: language === 'en' ? 'Buy' : 'Evet',
        onPress: async () => {
          const ok = await progress.spendGems(HINT_GEM_COST);
          if (ok) Alert.alert(language === 'en' ? '💡 Hint' : '💡 İpucu', game.useHint());
          else Alert.alert(language === 'en' ? '💎 Insufficient Gems' : '💎 Yetersiz Gem');
        }
      }
    ]);
  };

  // Physical keyboard support on Web for Anagram Screen
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (game.status !== 'playing') return;

      const key = e.key.toLocaleUpperCase('tr-TR');

      if (key === 'ENTER') {
        handleSubmit();
      } else if (key === 'BACKSPACE') {
        game.removeLast();
      } else if (/^[A-ZĞÜŞİÖÇI]$/.test(key)) {
        // Find first index of key in shuffledLetters that is not selected
        const idx = game.shuffledLetters.findIndex((char, index) => {
          return char.toLocaleUpperCase('tr-TR') === key && !game.selectedIndices.includes(index);
        });
        if (idx !== -1) {
          audioService.triggerHaptic('light');
          audioService.play('click');
          game.selectLetter(idx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [game.status, game.shuffledLetters, game.selectedIndices, handleSubmit]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => router.back()}>
            <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>← Geri</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>🔀 Anagram</Text>
          <TouchableOpacity style={[styles.gemPill, { backgroundColor: theme.colors.card, borderColor: theme.colors.gem }]}>
            <Text style={[styles.gemText, { color: theme.colors.gem }]}>💎 {progress.gems}</Text>
          </TouchableOpacity>
        </View>

        {/* Kategori */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map(c => {
            const info = CATEGORY_INFO[c];
            const isActive = category === c;
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.catChip,
                  { backgroundColor: theme.colors.card, borderColor: isActive ? theme.colors.primaryLight : theme.colors.border },
                  isActive && { backgroundColor: theme.colors.primary + '33' }
                ]}
                onPress={() => { setCategory(c); game.reset(c); }}
              >
                <Text style={[styles.catChipText, { color: isActive ? theme.colors.primaryLight : theme.colors.textSecondary }]}>{info.emoji} {info.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Açıklama */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Harfleri doğru sırayla seçerek kelimeyi bul!
          </Text>
          <Text style={[styles.attemptsText, { color: theme.colors.text }]}>
            {game.maxAttempts - game.attempts} hak kaldı · Deneme: {game.attempts}/{game.maxAttempts}
          </Text>
        </View>

        {/* Tahmin Göster */}
        <View style={styles.guessArea}>
          {Array(game.targetWord.length).fill(null).map((_, i) => {
            const isWon = game.status === 'won';
            const cellBg = isWon ? (progress.premium || colorBlind ? '#0072B2' : theme.colors.correct) : theme.colors.empty;
            const cellBorder = isWon ? (progress.premium || colorBlind ? '#0072B2' : theme.colors.correct) : (game.currentGuess[i] ? theme.colors.primaryLight : theme.colors.border);
            return (
              <View
                key={i}
                style={[
                  styles.guessCell,
                  {
                    backgroundColor: cellBg,
                    borderColor: cellBorder,
                    borderWidth: isWon ? 0 : 2,
                  }
                ]}
              >
                <Text style={[styles.guessLetter, { color: theme.colors.text }]}>{game.currentGuess[i] ?? ''}</Text>
                {colorBlind && isWon && (
                  <View style={{ position: 'absolute', bottom: 2, right: 4 }}>
                    <Text style={{ fontSize: 8, fontWeight: '900', color: 'white' }}>✓</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Karışık Harfler */}
        <View style={styles.lettersArea}>
          <View style={styles.lettersGrid}>
            {game.shuffledLetters.map((letter, idx) => {
              const isSelected = game.selectedIndices.includes(idx);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.letterBtn,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                    isSelected && { backgroundColor: theme.colors.absent, borderColor: 'transparent', opacity: 0.4 }
                  ]}
                  onPress={() => {
                    audioService.triggerHaptic('light');
                    audioService.play('click');
                    game.selectLetter(idx);
                  }}
                  disabled={isSelected || game.status !== 'playing'}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.letterBtnText,
                    { color: theme.colors.text },
                    isSelected && { color: theme.colors.textMuted }
                  ]}>
                    {letter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Aksiyonlar */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.clearBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => {
              audioService.triggerHaptic('light');
              game.clearSelection();
            }}
          >
            <Text style={[styles.clearBtnText, { color: theme.colors.textSecondary }]}>🗑️ Temizle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.hintBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.primaryLight }]}
            onPress={handleHint}
          >
            <Text style={[styles.hintBtnText, { color: theme.colors.primaryLight }]}>💡 İpucu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.submitGrad}>
              <Text style={[styles.submitText, { color: theme.colors.text }]}>✓ Onayla</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Confetti active={showConfetti} />
        <GameResultOverlay
          visible={resultOverlay.visible}
          title={resultOverlay.title}
          emoji={resultOverlay.emoji}
          message={resultOverlay.message}
          word={resultOverlay.word}
          gemsAwarded={resultOverlay.gemsAwarded}
          xpAwarded={resultOverlay.xpAwarded}
          buttons={resultOverlay.buttons}
          theme={theme}
          language={language}
          onClose={() => setResultOverlay(prev => ({ ...prev, visible: false }))}
        />
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
  gemPill: { backgroundColor: COLORS.card, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: COLORS.gem },
  gemText: { color: COLORS.gem, fontWeight: '700', fontSize: FONTS.size.sm },
  catScroll: { marginBottom: SPACING.md, flexGrow: 0 },
  catChip: { backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, marginRight: SPACING.xs, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { borderColor: COLORS.primaryLight, backgroundColor: COLORS.primary + '33' },
  catChipText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, fontWeight: '600' },
  infoCard: { backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  infoText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, textAlign: 'center' },
  attemptsText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  guessArea: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  guessCell: { width: 48, height: 56, backgroundColor: COLORS.empty, borderRadius: BORDER_RADIUS.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border },
  guessCellFilled: { borderColor: COLORS.primaryLight },
  guessCellCorrect: { backgroundColor: COLORS.correct, borderColor: COLORS.correct },
  guessLetter: { fontSize: FONTS.size.xxl, fontWeight: '800', color: COLORS.text },
  lettersArea: { flex: 1, justifyContent: 'center' },
  lettersGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm },
  letterBtn: { width: 56, height: 64, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border },
  letterBtnSelected: { backgroundColor: COLORS.absent, borderColor: COLORS.absent, opacity: 0.4 },
  letterBtnText: { fontSize: FONTS.size.xxl, fontWeight: '800', color: COLORS.text },
  letterBtnTextSelected: { color: COLORS.textMuted },
  actions: { flexDirection: 'row', gap: SPACING.sm, paddingVertical: SPACING.md },
  clearBtn: { flex: 1, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.full, paddingVertical: SPACING.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  clearBtnText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: FONTS.size.sm },
  hintBtn: { flex: 1, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.full, paddingVertical: SPACING.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primaryLight },
  hintBtnText: { color: COLORS.primaryLight, fontWeight: '600', fontSize: FONTS.size.sm },
  submitBtn: { flex: 1, borderRadius: BORDER_RADIUS.full, overflow: 'hidden' },
  submitGrad: { paddingVertical: SPACING.sm, alignItems: 'center' },
  submitText: { color: COLORS.text, fontWeight: '800', fontSize: FONTS.size.sm },
});
