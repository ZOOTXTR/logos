import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, StatusBar, Alert, Dimensions, PanResponder,
} from 'react-native';
import { Svg, Line, Circle as SvgCircle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useWordConnect } from '../hooks/useWordConnect';
import { useProgress } from '../hooks/useProgress';
import { useTheme } from '../hooks/useTheme';
import { audioService } from '../services/audio.service';
import { Confetti } from '../components/Confetti';
import { TRANSLATIONS } from '../constants/translations';
import { StoreModal } from '../components/StoreModal';
import { LoadingView } from '../components/LoadingView';
import { GameResultOverlay } from '../components/GameResultOverlay';

const { width } = Dimensions.get('window');
const CELL_SIZE = 40;
const WHEEL_SIZE = 180;
const LETTER_BTN_SIZE = 44;

export default function WordConnectScreen() {
  const router = useRouter();
  const progress = useProgress();
  const { theme, language } = useTheme();
  
  const [levelIdx, setLevelIdx] = useState(0);
  const game = useWordConnect(levelIdx, language);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [resultOverlay, setResultOverlay] = useState<{
    visible: boolean; title: string; emoji: string; message: string; word?: string;
    gemsAwarded?: number; xpAwarded?: number;
    buttons: { label: string; onPress: () => void; primary?: boolean }[];
    theme: any; language: string; onClose?: () => void;
  }>({ visible: false, title: '', emoji: '', message: '', buttons: [], theme, language });

  if (progress.loading) {
    return <LoadingView message={language === 'en' ? 'Loading...' : 'Yükleniyor...'} />;
  }

  const t = TRANSLATIONS[language];

  // Sync state if levelIndex changes
  useEffect(() => {
    game.reset(levelIdx);
  }, [levelIdx]);

  const [touchCoords, setTouchCoords] = useState<{ x: number; y: number } | null>(null);

  const handleSubmitRef = useRef<() => void>(() => {});
  handleSubmitRef.current = () => handleSubmit();

  const handleClearRef = useRef<() => void>(() => {});
  handleClearRef.current = () => handleClear();

  const checkTouchCollisionRef = useRef<(x: number, y: number) => void>(() => {});
  checkTouchCollisionRef.current = (touchX: number, touchY: number) => {
    game.letters.forEach((_, idx) => {
      const coords = getLetterCoords(idx, game.letters.length);
      const centerX = coords.x + LETTER_BTN_SIZE / 2;
      const centerY = coords.y + LETTER_BTN_SIZE / 2;
      const dist = Math.sqrt((touchX - centerX) ** 2 + (touchY - centerY) ** 2);
      if (dist < 26) {
        if (!game.selectedIndices.includes(idx)) {
          audioService.triggerHaptic('light');
          audioService.play('click');
          game.selectLetter(idx);
        }
      }
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setTouchCoords({ x: locationX, y: locationY });
        checkTouchCollisionRef.current(locationX, locationY);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setTouchCoords({ x: locationX, y: locationY });
        checkTouchCollisionRef.current(locationX, locationY);
      },
      onPanResponderRelease: () => {
        setTouchCoords(null);
        handleSubmitRef.current();
      },
      onPanResponderTerminate: () => {
        setTouchCoords(null);
        handleClearRef.current();
      },
    })
  ).current;

  const handleLetterSelect = (idx: number) => {
    audioService.triggerHaptic('light');
    audioService.play('click');
    game.selectLetter(idx);
  };

  const handleClear = () => {
    audioService.triggerHaptic('light');
    game.clearSelection();
  };

  const handleSubmit = async () => {
    audioService.triggerHaptic('medium');
    const result = game.submitWord();
    if (result === 'correct') {
      audioService.play('win');
      audioService.triggerHaptic('success');
      
      // If completed level
      const allFound = game.wordsFound.length + 1 === game.targetWords.length;
      if (allFound) {
        setShowConfetti(true);
        await progress.earnXP(100);
        await progress.addGems(30);
        setResultOverlay({
          visible: true,
          title: language === 'en' ? 'Level Complete!' : 'Bölüm Tamamlandı!',
          emoji: '🎉',
          message: '',
          gemsAwarded: 30,
          xpAwarded: 100,
          buttons: [
            {
              label: language === 'en' ? 'Next Level' : 'Sonraki Bölüm',
              onPress: () => {
                setShowConfetti(false);
                setResultOverlay(prev => ({ ...prev, visible: false }));
                setLevelIdx(prev => prev + 1);
              },
              primary: true,
            }
          ],
          theme,
          language,
          onClose: () => setResultOverlay(prev => ({ ...prev, visible: false })),
        });
      }
    } else if (result === 'already_found') {
      audioService.triggerHaptic('warning');
      Alert.alert('', language === 'en' ? 'Word already found!' : 'Bu kelimeyi zaten buldunuz!');
    } else {
      audioService.triggerHaptic('warning');
      audioService.play('loss');
    }
  };

  // Calculate circular coordinates for letter buttons
  const getLetterCoords = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const radius = WHEEL_SIZE / 2 - 25;
    const x = WHEEL_SIZE / 2 + radius * Math.cos(angle) - LETTER_BTN_SIZE / 2;
    const y = WHEEL_SIZE / 2 + radius * Math.sin(angle) - LETTER_BTN_SIZE / 2;
    return { x, y };
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
            🌀 {t.modeConnectTitle} (Lvl {game.level})
          </Text>
          <TouchableOpacity style={[styles.gemPill, { backgroundColor: theme.colors.card, borderColor: theme.colors.gem }]} onPress={() => setShowStore(true)}>
            <Text style={[styles.gemText, { color: theme.colors.gem }]}>💎 {progress.gems}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.info, { color: theme.colors.textSecondary }]}>{t.modeConnectDesc}</Text>

        {/* Crossword Grid Board */}
        <View style={styles.boardContainer}>
          <View style={styles.crosswordGrid}>
            {game.cells.map((cell, idx) => {
              // Position cells absolutely based on row/column indexes
              const cellTop = cell.row * (CELL_SIZE + 4);
              const cellLeft = cell.col * (CELL_SIZE + 4);
              return (
                <View
                  key={idx}
                  style={[
                    styles.gridCell,
                    {
                      top: cellTop,
                      left: cellLeft,
                      backgroundColor: cell.isFilled ? theme.colors.correct : theme.colors.card,
                      borderColor: cell.isFilled ? 'transparent' : theme.colors.border,
                      borderWidth: cell.isFilled ? 0 : 2,
                    }
                  ]}
                >
                  <Text style={[styles.cellLetter, { color: theme.colors.text }]}>
                    {cell.char}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Selected Guess Text */}
        <View style={styles.guessBar}>
          <Text style={[styles.guessText, { color: theme.colors.text }]}>
            {game.currentGuess.split('').join(' · ') || ' '}
          </Text>
        </View>

        {/* Letter Wheel Area */}
        <View style={styles.wheelSection}>
          <View 
            style={[styles.wheelContainer, { borderColor: theme.colors.border }]}
            {...panResponder.panHandlers}
          >
            {/* SVG Connecting Lines */}
            {game.selectedIndices.length > 0 && (
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
                  {/* Connecting lines between selected letters */}
                  {game.selectedIndices.map((letterIdx, i) => {
                    if (i === 0) return null;
                    const prevIdx = game.selectedIndices[i - 1];
                    const start = getLetterCoords(prevIdx, game.letters.length);
                    const end = getLetterCoords(letterIdx, game.letters.length);
                    return (
                      <Line
                        key={`line-${i}`}
                        x1={start.x + LETTER_BTN_SIZE / 2}
                        y1={start.y + LETTER_BTN_SIZE / 2}
                        x2={end.x + LETTER_BTN_SIZE / 2}
                        y2={end.y + LETTER_BTN_SIZE / 2}
                        stroke={theme.colors.accent}
                        strokeWidth={5}
                        strokeLinecap="round"
                      />
                    );
                  })}

                  {/* Connecting line to user finger */}
                  {touchCoords && game.selectedIndices.length > 0 && (() => {
                    const lastIdx = game.selectedIndices[game.selectedIndices.length - 1];
                    const start = getLetterCoords(lastIdx, game.letters.length);
                    return (
                      <Line
                        x1={start.x + LETTER_BTN_SIZE / 2}
                        y1={start.y + LETTER_BTN_SIZE / 2}
                        x2={touchCoords.x}
                        y2={touchCoords.y}
                        stroke={theme.colors.accent}
                        strokeWidth={4}
                        strokeLinecap="round"
                        opacity={0.7}
                      />
                    );
                  })()}
                </Svg>
              </View>
            )}

            {game.letters.map((letter, idx) => {
              const coords = getLetterCoords(idx, game.letters.length);
              const isSelected = game.selectedIndices.includes(idx);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.letterBtn,
                    {
                      position: 'absolute',
                      left: coords.x,
                      top: coords.y,
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                      borderColor: isSelected ? 'transparent' : theme.colors.border,
                    }
                  ]}
                  onPress={() => handleLetterSelect(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.letterText, { color: theme.colors.text }]}>
                    {letter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={handleClear}
          >
            <Text style={[styles.actionBtnText, { color: theme.colors.textSecondary }]}>🗑️ {t.clear}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={game.currentGuess.length < 2}
          >
            <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.submitGrad}>
              <Text style={styles.submitBtnText}>✓ {t.confirm}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <GameResultOverlay
          visible={resultOverlay.visible}
          title={resultOverlay.title}
          emoji={resultOverlay.emoji}
          message={resultOverlay.message}
          word={resultOverlay.word}
          gemsAwarded={resultOverlay.gemsAwarded}
          xpAwarded={resultOverlay.xpAwarded}
          buttons={resultOverlay.buttons}
          theme={resultOverlay.theme}
          language={resultOverlay.language}
          onClose={resultOverlay.onClose}
        />
        <Confetti active={showConfetti} />
        <StoreModal
          visible={showStore}
          onClose={() => setShowStore(false)}
          gems={progress.gems}
          isPremium={progress.premium}
          onPurchase={async (_, g) => { await progress.addGems(g); }}
          onPurchasePremium={progress.unlockPremium}
          unlockedCategories={progress.unlockedCategories}
          onUnlockCategory={async (cat) => {
            const spent = await progress.spendGems(100);
            if (spent) {
              await progress.unlockCategory(cat);
              return true;
            }
            return false;
          }}
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
  title: { fontSize: FONTS.size.lg, fontWeight: '900' },
  gemPill: { paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  gemText: { fontWeight: '700', fontSize: FONTS.size.sm },
  info: { fontSize: FONTS.size.sm, textAlign: 'center', marginBottom: SPACING.md },
  boardContainer: { flex: 1.2, alignItems: 'center', justifyContent: 'center' },
  crosswordGrid: { width: CELL_SIZE * 6 + 24, height: CELL_SIZE * 6 + 24, position: 'relative' },
  gridCell: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLetter: { fontSize: FONTS.size.lg, fontWeight: '800' },
  guessBar: { height: 40, alignItems: 'center', justifyContent: 'center', marginVertical: SPACING.sm },
  guessText: { fontSize: FONTS.size.xl, fontWeight: '900', letterSpacing: 2 },
  wheelSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: SPACING.md },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    borderWidth: 2,
    position: 'relative',
  },
  letterBtn: {
    width: LETTER_BTN_SIZE,
    height: LETTER_BTN_SIZE,
    borderRadius: LETTER_BTN_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: { fontSize: FONTS.size.md, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: SPACING.md, paddingBottom: SPACING.md, marginTop: SPACING.sm },
  actionBtn: { flex: 1, height: 48, borderRadius: BORDER_RADIUS.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { fontWeight: '700', fontSize: FONTS.size.md },
  submitBtn: { flex: 2, height: 48, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
  submitGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: FONTS.size.md },
});
