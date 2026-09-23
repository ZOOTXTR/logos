import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Text } from '../components/CustomText';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { useTheme } from '../hooks/useTheme';
import { Keyboard } from '../components/Keyboard';
import { GameResultOverlay } from '../components/GameResultOverlay';
import { TRANSLATIONS } from '../constants/translations';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuraBackground } from '../components/design/AuraBackground';
import { WidgetCard } from '../components/design/WidgetCard';

const PLAYER_CELL_SIZE = 40;

export default function MultiplayerScreen() {
  const router = useRouter();
  const { theme, language } = useTheme();
  const t = TRANSLATIONS[language];
  
  const { 
    duel, error, playerBoard, playerRow, isPlayer1, 
    startMatchmaking, addLetter, deleteLetter, submitGuess, reset 
  } = useMultiplayer();

  const [showResult, setShowResult] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  // Start matchmaking on mount
  useEffect(() => {
    startMatchmaking();
    return () => reset();
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK", onPress: () => router.back() }]);
    }
  }, [error]);

  // Check game over
  useEffect(() => {
    if (duel && duel.status === 'finished') {
      setShowResult(true);
      const amIWinner = duel.winner === (isPlayer1 ? duel.player1 : duel.player2);
      if (amIWinner) {
        setResultTitle('You Won! 🏆');
        setResultMessage(`You defeated ${isPlayer1 ? duel.player2Name : duel.player1Name}!`);
      } else if (duel.winner) {
        setResultTitle('You Lost 💀');
        setResultMessage(`${isPlayer1 ? duel.player2Name : duel.player1Name} won the duel!`);
      } else {
        setResultTitle('Draw 🤝');
        setResultMessage('Nobody guessed the word!');
      }
    }
  }, [duel?.status]);

  const handleKey = (char: string) => addLetter(char);
  const handleDelete = () => deleteLetter();
  const handleSubmit = async () => {
    const res = await submitGuess();
    if (res === 'short') {
      // shake row
    }
  };

  const getRevealedLetters = () => {
    const revealed: Record<string, any> = {};
    playerBoard.forEach(row => {
      row.forEach(cell => {
        if (!cell.char) return;
        if (cell.status === 'correct') revealed[cell.char] = 'correct';
        else if (cell.status === 'present' && revealed[cell.char] !== 'correct') revealed[cell.char] = 'present';
        else if (cell.status === 'absent' && !revealed[cell.char]) revealed[cell.char] = 'absent';
      });
    });
    return revealed;
  };

  const getCellBgColor = (status: string) => {
    if (status === 'correct') return theme.colors.correct;
    if (status === 'present') return theme.colors.present;
    if (status === 'absent') return theme.colors.border;
    return theme.colors.card;
  };

  if (!duel || duel.status === 'waiting') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <AuraBackground theme={theme} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.searchingText, { color: theme.colors.text }]}>Searching for opponent...</Text>
          <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.colors.border }]} onPress={() => router.back()}>
            <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const myName = isPlayer1 ? duel.player1Name : duel.player2Name;
  const oppName = isPlayer1 ? duel.player2Name : duel.player1Name;
  const oppProgress = isPlayer1 ? duel.player2Progress : duel.player1Progress;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <AuraBackground theme={theme} />
      <StatusBar barStyle="light-content" />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => router.back()}>
            <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>← {t.back}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Online Duel</Text>
        </View>

        <WidgetCard theme={theme} variant="glass" style={styles.duelInfo}>
          <View style={styles.vsContainer}>
            <Text style={[styles.playerName, { color: theme.colors.primary }]}>{myName}</Text>
            <Text style={[styles.vsText, { color: theme.colors.textSecondary }]}>VS</Text>
            <Text style={[styles.playerName, { color: theme.colors.error }]}>{oppName}</Text>
          </View>
          {/* Opponent Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${oppProgress}%`, backgroundColor: theme.colors.error }]} />
          </View>
          <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
            Opponent Progress: {oppProgress}%
          </Text>
        </WidgetCard>

        {/* Player Board */}
        <View style={styles.gameplay}>
          <View style={styles.playerGrid}>
            {playerBoard.map((row, rIdx) => (
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

        {/* Keyboard Input wrapper */}
        <View style={styles.keyboardSection}>
          <Keyboard
            onKey={handleKey}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
            revealedLetters={getRevealedLetters()}
          />
        </View>

      </View>

      <GameResultOverlay
        visible={showResult}
        title={resultTitle}
        message={resultMessage}
        word={duel.targetWord}
        emoji={resultTitle.includes('Won') ? '🏆' : '💀'}
        theme={theme}
        language={language}
        buttons={[
          { label: 'Back to Menu', onPress: () => router.back(), primary: true }
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: SPACING.md },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchingText: { marginTop: SPACING.md, fontSize: FONTS.size.lg, fontWeight: '700' },
  cancelBtn: { marginTop: SPACING.xl, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderWidth: 1, borderRadius: BORDER_RADIUS.full },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md },
  backBtn: { position: 'absolute', left: 0, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  backText: { fontSize: FONTS.size.sm, fontWeight: '600' },
  title: { fontSize: FONTS.size.lg, fontWeight: '900' },
  duelInfo: { marginBottom: SPACING.lg, padding: SPACING.md },
  vsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  playerName: { fontSize: FONTS.size.md, fontWeight: '800' },
  vsText: { fontSize: FONTS.size.sm, fontWeight: '900' },
  progressTrack: { height: 8, backgroundColor: '#00000044', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  progressBar: { height: '100%', borderRadius: 4 },
  progressLabel: { fontSize: 10, textAlign: 'right' },
  gameplay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  playerGrid: { gap: 6, alignItems: 'center' },
  playerRow: { flexDirection: 'row', gap: 6 },
  playerCell: { width: PLAYER_CELL_SIZE, height: PLAYER_CELL_SIZE, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: FONTS.size.md, fontWeight: '900' },
  keyboardSection: { paddingBottom: SPACING.md },
});
