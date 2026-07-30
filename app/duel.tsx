import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, StatusBar, Alert, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useDuel } from '../hooks/useDuel';
import { useProgress } from '../hooks/useProgress';
import { useTheme } from '../hooks/useTheme';
import { audioService } from '../services/audio.service';
import { Keyboard } from '../components/Keyboard';
import { Confetti } from '../components/Confetti';
import { GameResultOverlay } from '../components/GameResultOverlay';
import { TRANSLATIONS } from '../constants/translations';
import { LoadingView } from '../components/LoadingView';

const { width, height } = Dimensions.get('window');
const PLAYER_CELL_SIZE = 40;
const BOT_CELL_SIZE = 22;

export default function DuelScreen() {
  const router = useRouter();
  const progress = useProgress();
  const { theme, language, colorBlind } = useTheme();
  
  const [levelIdx, setLevelIdx] = useState(0);
  const game = useDuel('random', language);
  const [showConfetti, setShowConfetti] = useState(false);
  const [resultOverlay, setResultOverlay] = useState<{
    visible: boolean; title: string; emoji: string; message: string; word?: string;
    gemsAwarded?: number; xpAwarded?: number;
    buttons: { label: string; onPress: () => void; primary?: boolean }[];
    theme: any; language: string;
  }>({
    visible: false, title: '', emoji: '', message: '', word: '',
    buttons: [], gemsAwarded: 0, xpAwarded: 0, theme, language,
  });

  if (progress.loading) {
    return <LoadingView message={language === 'en' ? 'Loading...' : 'Yükleniyor...'} />;
  }

  const t = TRANSLATIONS[language];

  const [aiBubbleText, setAiBubbleText] = useState('');

  // Initial welcome message
  useEffect(() => {
    setAiBubbleText(language === 'en' 
      ? "Let's see who is faster! Good luck." 
      : "Kim daha hızlı bakalım! Başarılar."
    );
  }, []);

  // Update bubble text when AI completes a row or game ends
  useEffect(() => {
    if (game.winner) {
      if (game.winner === 'player') {
        setAiBubbleText(language === 'en'
          ? "Amazing! You beat me this time."
          : "Tebrikler! Beni bu sefer yendin."
        );
      } else {
        setAiBubbleText(language === 'en'
          ? "Victory is mine! Better luck next time."
          : "Zafer benim! Bir dahaki sefere artık."
        );
      }
      return;
    }

    if (game.opponentRow > 0) {
      const messages = language === 'en'
        ? ["Aha! I found a clue.", "Step by step, I am solving this.", "Is that your best guess?", "Interesting strategy..."]
        : ["Aha! Bir ipucu buldum.", "Adım adım çözüyorum.", "En iyi tahminin bu mu?", "İlginç bir strateji..."];
      setAiBubbleText(messages[Math.floor(Math.random() * messages.length)]);
    }
  }, [game.opponentRow, game.winner]);

  // Update bubble text when player completes a row
  useEffect(() => {
    if (game.playerRow > 0 && !game.winner) {
      const messages = language === 'en'
        ? ["Not bad, but I am faster!", "Hmm, a solid attempt.", "Let me think about my next word...", "You are doing great!"]
        : ["Fena değil, ama ben daha hızlıyım!", "Hmm, sağlam bir tahmin.", "Sonraki hamlemi düşüneyim...", "Harika gidiyorsun!"];
      setAiBubbleText(messages[Math.floor(Math.random() * messages.length)]);
    }
  }, [game.playerRow]);

  // Game End Logic
  useEffect(() => {
    if (!game.winner) return;

    const endGame = async () => {
      try {
        if (game.winner === 'player') {
          setShowConfetti(true);
          audioService.play('win');
          audioService.triggerHaptic('success');
          await progress.earnXP(200);
          await progress.addGems(50);
          setResultOverlay({
            visible: true,
            emoji: '🏆',
            title: language === 'en' ? 'Victory!' : 'Zafer Senin!',
            message: language === 'en' ? 'You defeated the AI!' : 'Yapay zekayı yendiniz!',
            word: game.targetWord,
            gemsAwarded: 50,
            xpAwarded: 200,
            buttons: [{ label: language === 'en' ? 'Continue' : 'Devam Et', onPress: () => { handleNext(); setResultOverlay(r => ({ ...r, visible: false })); }, primary: true }],
            theme,
            language,
          });
        } else {
          audioService.play('loss');
          audioService.triggerHaptic('warning');
          setResultOverlay({
            visible: true,
            emoji: '💀',
            title: language === 'en' ? 'Defeat' : 'Mağlubiyet',
            message: language === 'en' ? 'The AI solved the word first!' : 'Yapay zeka kelimeyi sizden önce çözdü!',
            word: game.targetWord,
            buttons: [{ label: language === 'en' ? 'Try Again' : 'Tekrar Dene', onPress: () => { handleNext(); setResultOverlay(r => ({ ...r, visible: false })); }, primary: true }],
            theme,
            language,
          });
        }
      } catch (e) {
        console.error('Game end handling failed:', e);
      }
    };
    endGame();
  }, [game.winner]);

  const handleNext = () => {
    setShowConfetti(false);
    game.reset();
  };

  const handleKey = (char: string) => {
    audioService.triggerHaptic('light');
    game.addLetter(char);
  };

  const handleDelete = () => {
    audioService.triggerHaptic('light');
    game.deleteLetter();
  };

  const handleSubmit = () => {
    audioService.triggerHaptic('medium');
    const result = game.submitGuess();
    if (result === 'short') {
      Alert.alert(language === 'en' ? 'Short Word' : 'Eksik Harf', language === 'en' ? 'Fill all 5 letters!' : '5 harfi de doldurun!');
      audioService.triggerHaptic('warning');
    } else if (result === 'correct') {
      // handled by useEffect
    } else if (result === 'wrong') {
      audioService.play('loss');
    } else if (result === 'gameover') {
      // player lost all rows
      if (!game.winner) {
        audioService.play('loss');
        audioService.triggerHaptic('warning');
        setResultOverlay({
          visible: true,
          emoji: '😢',
          title: language === 'en' ? 'Game Over' : 'Oyun Bitti',
          message: language === 'en' ? 'You ran out of rows!' : 'Tüm haklarınız bitti!',
          word: game.targetWord,
          buttons: [{ label: language === 'en' ? 'Try Again' : 'Tekrar Dene', onPress: () => { handleNext(); setResultOverlay(r => ({ ...r, visible: false })); }, primary: true }],
          theme,
          language,
        });
      }
    }
  };

  // Physical keyboard support on Web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (game.winner) return;

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
  }, [game.winner, handleSubmit, handleDelete, handleKey]);

  // Keyboard letter colors merged from player board
  const getRevealedLetters = () => {
    const revealed: Record<string, 'correct' | 'present' | 'absent'> = {};
    game.playerBoard.forEach(row => {
      row.forEach(cell => {
        if (!cell.char) return;
        if (cell.status === 'correct') {
          revealed[cell.char] = 'correct';
        } else if (cell.status === 'present' && revealed[cell.char] !== 'correct') {
          revealed[cell.char] = 'present';
        } else if (cell.status === 'absent' && !revealed[cell.char]) {
          revealed[cell.char] = 'absent';
        }
      });
    });
    return revealed;
  };

  const getCellBgColor = (status: string) => {
    if (status === 'correct') return colorBlind ? '#0072B2' : theme.colors.correct;
    if (status === 'present') return colorBlind ? '#E69F00' : theme.colors.present;
    if (status === 'absent') return theme.colors.border;
    return theme.colors.card;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => router.back()}>
            <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>← {t.back}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            ⚔️ {language === 'en' ? '1v1 AI Duel' : '1v1 Yapay Zeka Düello'}
          </Text>
          <View style={[styles.gemPill, { backgroundColor: theme.colors.card, borderColor: theme.colors.gem }]}>
            <Text style={[styles.gemText, { color: theme.colors.gem }]}>💎 {progress.gems}</Text>
          </View>
        </View>

        {/* Duel Area wrapper */}
        <View style={styles.gameplay}>
          
          {/* Opponent Bot Side */}
          <View style={[styles.sideCard, { backgroundColor: theme.colors.card + '22', borderColor: theme.colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm, width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 28 }}>🤖</Text>
                <View>
                  <Text style={[styles.sideTitle, { color: theme.colors.textSecondary }]}>RAKİP (AI Opponent)</Text>
                  {game.opponentStatus === 'playing' && (
                    <Text style={[styles.typingText, { color: theme.colors.primaryLight, fontSize: 9 }]}>
                      {language === 'en' ? 'Thinking...' : 'Düşünüyor...'} ⚡
                    </Text>
                  )}
                </View>
              </View>

              {/* Speech bubble */}
              {aiBubbleText !== '' && (
                <View style={[styles.speechBubble, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '33' }]}>
                  <Text style={[styles.speechBubbleText, { color: theme.colors.text }]}>
                    {aiBubbleText}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.botGrid}>
              {game.opponentBoard.map((row, rIdx) => (
                <View key={rIdx} style={styles.botRow}>
                  {row.map((cell, cIdx) => (
                    <View
                      key={cIdx}
                      style={[
                        styles.botCell,
                        {
                          backgroundColor: getCellBgColor(cell.status),
                          borderColor: cell.status === 'empty' ? theme.colors.border : 'transparent',
                        }
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Versus Divider line */}
          <View style={[styles.vsBar, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.vsText, { color: theme.colors.textSecondary }]}>
              {language === 'en' ? 'VS ARENA' : 'DÜELLO ARENASI'}
            </Text>
          </View>

          {/* Player Side */}
          <View style={[styles.sideCard, { flex: 1.4, paddingBottom: SPACING.sm }]}>
            <Text style={[styles.sideTitle, { color: theme.colors.text, marginBottom: SPACING.xs }]}>
              🎯 SİZ (You) — {game.playerRow}/6
            </Text>
            <View style={styles.playerGrid}>
              {game.playerBoard.map((row, rIdx) => (
                <View key={rIdx} style={styles.playerRow}>
                  {row.map((cell, cIdx) => (
                    <View
                      key={cIdx}
                      style={[
                        styles.playerCell,
                        {
                          backgroundColor: getCellBgColor(cell.status),
                          borderColor: cell.status === 'empty' ? theme.colors.border : 'transparent',
                          borderWidth: cell.status === 'empty' ? 1.5 : 0,
                        }
                      ]}
                    >
                      <Text style={[styles.cellText, { color: theme.colors.text }]}>
                        {cell.char}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>

        </View>

        {/* Keyboard Input wrapper */}
        <View style={styles.keyboardSection}>
          <Keyboard
            onKey={handleKey}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
            revealedLetters={getRevealedLetters()}
          />
        </View>

        <Confetti active={showConfetti} />
        <GameResultOverlay {...resultOverlay} />
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
  title: { fontSize: FONTS.size.lg, fontWeight: '900' },
  gemPill: { paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  gemText: { fontWeight: '700', fontSize: FONTS.size.sm },
  gameplay: { flex: 1, justifyContent: 'space-around' },
  sideCard: { borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: 'transparent', padding: SPACING.sm },
  sideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  sideTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  typingText: { fontSize: 9, fontWeight: '700' },
  botGrid: { gap: 3, alignItems: 'center' },
  botRow: { flexDirection: 'row', gap: 3 },
  botCell: { width: BOT_CELL_SIZE, height: BOT_CELL_SIZE, borderRadius: BORDER_RADIUS.sm, borderWidth: 1 },
  vsBar: { borderBottomWidth: 1, marginVertical: SPACING.xs, alignItems: 'center', paddingBottom: 4 },
  vsText: { fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  playerGrid: { gap: 4, alignItems: 'center' },
  playerRow: { flexDirection: 'row', gap: 4 },
  playerCell: { width: PLAYER_CELL_SIZE, height: PLAYER_CELL_SIZE, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: FONTS.size.md, fontWeight: '900' },
  keyboardSection: { paddingBottom: SPACING.md },
  speechBubble: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    maxWidth: '55%',
  },
  speechBubbleText: {
    fontSize: 9,
    fontWeight: '800',
    fontStyle: 'italic',
    lineHeight: 12,
  },
});
