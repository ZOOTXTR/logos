import React, { useCallback, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, StatusBar, Dimensions, Share, Platform, Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { LetterStatus, WORD_LENGTH } from '../constants/words';
import { useDordle } from '../hooks/useDordle';
import { useProgress } from '../hooks/useProgress';
import { useTheme } from '../hooks/useTheme';
import { Keyboard } from '../components/Keyboard';
import { audioService } from '../services/audio.service';
import { Confetti } from '../components/Confetti';
import { GameResultOverlay, GameResultOverlayProps } from '../components/GameResultOverlay';
import { TRANSLATIONS } from '../constants/translations';
import { LoadingView } from '../components/LoadingView';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.floor((width - 48) / 11); // Side by side cell sizing

export default function DordleScreen() {
  const router = useRouter();
  const progress = useProgress();
  const { theme, colorBlind, language, dyslexiaFont } = useTheme();
  const game = useDordle(language);
  const [showConfetti, setShowConfetti] = useState(false);
  const [resultOverlay, setResultOverlay] = useState<GameResultOverlayProps>({ visible: false, title: '', emoji: '', message: '', buttons: [], theme: theme, language: language });
  const dismissOverlay = () => setResultOverlay({ visible: false, title: '', emoji: '', message: '', buttons: [], theme: theme, language: language });

  if (progress.loading) {
    return <LoadingView message={language === 'en' ? 'Loading...' : 'Yükleniyor...'} />;
  }

  const t = TRANSLATIONS[language];

  const handleKey = useCallback((key: string) => {
    if (game.gameStatus !== 'playing') return;
    audioService.triggerHaptic('light');
    game.addLetter(key);
  }, [game]);

  const handleDelete = useCallback(() => {
    audioService.triggerHaptic('light');
    game.deleteLetter();
  }, [game]);

  const handleShare = async () => {
    audioService.triggerHaptic('light');
    let board1Grid = '';
    let board2Grid = '';
    const limit = game.gameStatus === 'won' ? game.currentRow : game.maxAttempts;

    game.board1.slice(0, limit).forEach(row => {
      let r = '';
      row.forEach(cell => {
        if (cell.status === 'correct') r += colorBlind ? '🟦' : '🟩';
        else if (cell.status === 'present') r += colorBlind ? '🟧' : '🟨';
        else r += '⬛';
      });
      board1Grid += r + '\n';
    });

    game.board2.slice(0, limit).forEach(row => {
      let r = '';
      row.forEach(cell => {
        if (cell.status === 'correct') r += colorBlind ? '🟦' : '🟩';
        else if (cell.status === 'present') r += colorBlind ? '🟧' : '🟨';
        else r += '⬛';
      });
      board2Grid += r + '\n';
    });

    const shareText = language === 'en'
      ? `💎 Logos Dordle - ${game.gameStatus === 'won' ? `${game.currentRow}/${game.maxAttempts}` : 'X'}/7 🎭\n\nLeft Word:\n${board1Grid}\nRight Word:\n${board2Grid}\nPlay now! 🚀`
      : `💎 Logos Dordle - ${game.gameStatus === 'won' ? `${game.currentRow}/${game.maxAttempts}` : 'X'}/7 🎭\n\nSol Kelime:\n${board1Grid}\nSağ Kelime:\n${board2Grid}\nSen de oyna! 🚀`;

    if (Platform.OS === 'web') {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          setResultOverlay({
            visible: true, title: language === 'en' ? 'Copied!' : 'Kopyalandı!', emoji: '📋',
            message: language === 'en' ? 'Score grid copied to clipboard! Share it with friends.' : 'Skorunuz panoya kopyalandı! Arkadaşlarınızla paylaşabilirsiniz.',
            buttons: [{ label: language === 'en' ? 'OK' : 'Tamam', onPress: dismissOverlay }], onClose: dismissOverlay, theme, language,
          });
          return;
        }
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      await Share.share({ message: shareText });
    } catch (e) {
      Clipboard.setString(shareText);
      setResultOverlay({
        visible: true, title: language === 'en' ? 'Copied!' : 'Kopyalandı!', emoji: '📋',
        message: language === 'en' ? 'Score copied to clipboard!' : 'Skorunuz panoya kopyalandı!',
        buttons: [{ label: language === 'en' ? 'OK' : 'Tamam', onPress: dismissOverlay }], onClose: dismissOverlay, theme, language,
      });
    }
  };

  const handleSubmit = useCallback(async () => {
    audioService.triggerHaptic('medium');
    const result = game.submitGuess();
    if (result === 'short') {
      audioService.triggerHaptic('warning');
      setResultOverlay({ visible: true, title: '', emoji: '⚠️', message: language === 'en' ? 'Complete the words!' : 'Kelimeleri tamamlayın!', buttons: [{ label: language === 'en' ? 'OK' : 'Tamam', onPress: dismissOverlay }], onClose: dismissOverlay, theme, language });
      return;
    }
    if (game.gameStatus === 'won') {
      setShowConfetti(true);
      audioService.play('win');
      audioService.triggerHaptic('success');
      await progress.earnXP(150);
      await progress.addGems(50);
      setResultOverlay({
        visible: true,
        title: language === 'en' ? 'Dordle Victory!' : 'Dordle Zaferi!',
        emoji: '🎉',
        message: language === 'en' ? 'You earned +50 💎 +150 XP!' : '+50 💎 +150 XP kazandınız!',
        gemsAwarded: 50,
        xpAwarded: 150,
        buttons: [
          { label: language === 'en' ? 'Share 📤' : 'Paylaş 📤', onPress: handleShare },
          { label: language === 'en' ? 'Continue' : 'Devam', primary: true, onPress: () => { setShowConfetti(false); dismissOverlay(); game.reset(language); } }
        ],
        onClose: dismissOverlay,
        theme,
        language,
      });
    } else if (game.gameStatus === 'lost') {
      audioService.play('loss');
      audioService.triggerHaptic('warning');
      setResultOverlay({
        visible: true,
        title: language === 'en' ? 'You Lost' : 'Kaybettiniz',
        emoji: '😢',
        message: language === 'en' ? `Word 1: ${game.targetWord1}\nWord 2: ${game.targetWord2}` : `1. Kelime: ${game.targetWord1}\n2. Kelime: ${game.targetWord2}`,
        buttons: [
          { label: language === 'en' ? 'Share 📤' : 'Paylaş 📤', onPress: handleShare },
          { label: language === 'en' ? 'Try Again' : 'Tekrar Dene', primary: true, onPress: () => { setShowConfetti(false); dismissOverlay(); game.reset(language); } },
          { label: language === 'en' ? 'Menu' : 'Menü', onPress: () => { dismissOverlay(); router.back(); } }
        ],
        onClose: dismissOverlay,
        theme,
        language,
      });
    }
  }, [game, colorBlind, language]);

  // Physical keyboard support on Web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (game.gameStatus !== 'playing') return;

      const key = e.key.toLocaleUpperCase('tr-TR');

      if (key === 'ENTER') {
        handleSubmit();
      } else if (key === 'BACKSPACE') {
        handleDelete();
      } else if (/^[A-ZĞÜŞİÖÇI]$/.test(key)) {
        handleKey(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [game.gameStatus, handleSubmit, handleDelete, handleKey]);

  // Combine revealed letters for the keyboard color coding
  const getMergedRevealedLetters = () => {
    const merged: Record<string, LetterStatus> = {};
    const keys = new Set([...Object.keys(game.revealedLetters1), ...Object.keys(game.revealedLetters2)]);
    
    keys.forEach(k => {
      const s1 = game.revealedLetters1[k];
      const s2 = game.revealedLetters2[k];
      
      if (s1 === 'correct' || s2 === 'correct') {
        merged[k] = 'correct';
      } else if (s1 === 'present' || s2 === 'present') {
        merged[k] = 'present';
      } else {
        merged[k] = 'absent';
      }
    });
    return merged;
  };

  const getCellBg = (status: LetterStatus, isSolved: boolean, targetChar: string) => {
    if (isSolved) return colorBlind ? '#0072B2' : theme.colors.correct;
    switch (status) {
      case 'correct': return colorBlind ? '#0072B2' : theme.colors.correct;
      case 'present': return colorBlind ? '#E69F00' : theme.colors.present;
      case 'absent': return theme.colors.absent;
      case 'tbd': return theme.colors.surfaceLight;
      default: return theme.colors.empty;
    }
  };

  const MiniBoard = ({ board, targetWord, isSolved }: { board: any[][], targetWord: string, isSolved: boolean }) => (
    <View style={styles.board}>
      {board.map((row, rIdx) => (
        <View key={rIdx} style={styles.row}>
          {row.map((cell, cIdx) => {
            const bg = getCellBg(cell.status, isSolved && rIdx >= game.currentRow, targetWord[cIdx]);
            return (
              <View
                key={cIdx}
                style={[
                  styles.cell,
                  {
                    backgroundColor: bg,
                    borderColor: cell.status === 'empty' ? theme.colors.border : 'transparent',
                    borderWidth: cell.status === 'empty' ? 1.5 : 0
                  }
                ]}
              >
                <Text style={[styles.cellText, { color: theme.colors.text }, dyslexiaFont && { fontFamily: 'monospace' }]}>
                  {isSolved && rIdx >= game.currentRow ? targetWord[cIdx] : cell.char}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => router.back()}>
            <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>← Geri</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>🎭 Çift Kelime</Text>
          <View style={[styles.gemPill, { backgroundColor: theme.colors.card, borderColor: theme.colors.gem }]}>
            <Text style={[styles.gemText, { color: theme.colors.gem }]}>💎 {progress.gems}</Text>
          </View>
        </View>

        <Text style={[styles.info, { color: theme.colors.textSecondary }]}>Aynı anda iki gizli kelimeyi 7 tahminde bul!</Text>

        {/* Side-by-Side Boards */}
        <View style={styles.boardsContainer}>
          <MiniBoard board={game.board1} targetWord={game.targetWord1} isSolved={game.word1Solved} />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <MiniBoard board={game.board2} targetWord={game.targetWord2} isSolved={game.word2Solved} />
        </View>

        {/* Keyboard */}
        <View style={styles.keyboardContainer}>
          <Keyboard
            onKey={handleKey}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
            revealedLetters={getMergedRevealedLetters()}
          />
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
          onClose={resultOverlay.onClose}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: SPACING.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md },
  backBtn: { paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  backText: { fontSize: FONTS.size.sm, fontWeight: '600' },
  title: { fontSize: FONTS.size.xl, fontWeight: '900' },
  gemPill: { paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  gemText: { fontWeight: '700', fontSize: FONTS.size.sm },
  info: { fontSize: FONTS.size.sm, textAlign: 'center', marginBottom: SPACING.md },
  boardsContainer: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: SPACING.md, alignItems: 'center' },
  board: { gap: 4 },
  row: { flexDirection: 'row', gap: 4 },
  cell: { width: CELL_SIZE, height: CELL_SIZE + 6, borderRadius: BORDER_RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: FONTS.size.md, fontWeight: '800' },
  divider: { width: 1, height: '80%' },
  keyboardContainer: { paddingBottom: SPACING.md, marginTop: SPACING.md },
});
