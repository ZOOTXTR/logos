import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { GameMode, Category, Difficulty, GAME_MODE_INFO, CATEGORY_INFO, DIFFICULTY_INFO } from '../constants/words';
import { HINT_GEM_COST } from '../constants/products';
import { GameBoard } from '../components/GameBoard';
import { Keyboard } from '../components/Keyboard';
import { HintModal } from '../components/HintModal';
import { HelpModal } from '../components/HelpModal';
import { StoreModal } from '../components/StoreModal';
import { Timer } from '../components/Timer';
import { AchievementToast } from '../components/AchievementToast';
import { Confetti } from '../components/Confetti';
import { GemShower } from '../components/GemShower';
import { WordDefinitionModal } from '../components/WordDefinitionModal';
import { CustomAlert } from '../components/CustomAlert';
import { GameEndCertificate } from '../components/GameEndCertificate';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { shareScoreGrid } from '../services/share.service';
import { audioService } from '../services/audio.service';

interface GamePlayScreenProps {
  theme: any;
  language: string;
  colorBlind: boolean;
  game: {
    board: any[][];
    currentRow: number;
    currentCol: number;
    targetWord: string;
    gameStatus: 'playing' | 'won' | 'lost';
    revealedLetters: Record<string, any>;
    hintsUsed: number;
    timeLeft: number;
    elapsedSeconds: number;
    maxGuesses: number;
    addLetter: (l: string) => void;
    deleteLetter: () => void;
    submitGuess: () => 'short' | 'not_valid' | 'not_ready' | 'submitted';
    resetGame: (d?: Difficulty, m?: GameMode, c?: Category, l?: 'tr' | 'en') => void;
    useHint: () => string | null;
    useSweeper: () => string[];
    addTime: (s: number) => void;
  };
  gameConfig: { mode: GameMode; category: Category; difficulty: Difficulty };
  gems: number;
  premium: boolean;
  unlockedCategories: string[];
  showConfetti: boolean;
  showGemShower: boolean;
  newAchievement: any;
  onBackToMenu: () => void;
  onRetry: () => void;
  onAddGems: (amount: number) => Promise<number>;
  onSpendGems: (amount: number) => Promise<boolean>;
  onUnlockPremium: () => Promise<void>;
  onUnlockCategory: (cat: string) => Promise<string[]>;
  onClearNewAchievement: () => void;
  onShowConfetti: (v: boolean) => void;
  onShowGemShower: (v: boolean) => void;
}

export function GamePlayScreen({
  theme, language, colorBlind,
  game, gameConfig,
  gems, premium, unlockedCategories,
  showConfetti, showGemShower, newAchievement,
  onBackToMenu, onRetry,
  onAddGems, onSpendGems, onUnlockPremium,
  onUnlockCategory, onClearNewAchievement,
  onShowConfetti, onShowGemShower,
}: GamePlayScreenProps) {
  const [showHint, setShowHint] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const { alert, showAlert: showCustomAlert, hideAlert } = useCustomAlert();

  const modeInfo = GAME_MODE_INFO[gameConfig.mode];
  const categoryInfo = CATEGORY_INFO[gameConfig.category];
  const diffInfo = DIFFICULTY_INFO[gameConfig.difficulty];

  const handleKey = useCallback((key: string) => {
    if (game.gameStatus !== 'playing') return;
    audioService.triggerHaptic('light');
    game.addLetter(key);
  }, [game]);

  const handleDelete = useCallback(() => {
    audioService.triggerHaptic('light');
    game.deleteLetter();
  }, [game]);

  const handleSubmit = useCallback(() => {
    audioService.triggerHaptic('medium');
    const result = game.submitGuess();
    const wordLen = game.targetWord.length;

    if (result === 'short') {
      audioService.triggerHaptic('warning');
      showCustomAlert(
        language === 'en' ? 'Warning' : 'Uyarı',
        language === 'en' ? `You must enter ${wordLen} letters!` : `${wordLen} harf girmelisiniz!`
      );
    } else if (result === 'not_valid') {
      audioService.triggerHaptic('warning');
      showCustomAlert(
        language === 'en' ? 'Invalid Word' : 'Geçersiz Kelime',
        language === 'en' ? 'This word is not in the dictionary!' : 'Girdiğiniz kelime sözlükte bulunamadı!'
      );
    } else if (result === 'not_ready') {
      audioService.triggerHaptic('warning');
      showCustomAlert(
        language === 'en' ? 'Loading' : 'Yükleniyor',
        language === 'en' ? 'Dictionary is loading, please wait...' : 'Sözlük yükleniyor, lütfen bekleyin...'
      );
    } else if (gameConfig.mode === 'speed' && game.gameStatus === 'playing') {
      game.addTime(15);
    }
  }, [game, gameConfig.mode, language, showCustomAlert]);

  const handleShare = async () => {
    audioService.triggerHaptic('light');
    const msg = await shareScoreGrid(
      game.board,
      game.currentRow,
      gameConfig.mode,
      game.gameStatus === 'won',
      colorBlind,
      language
    );
    if (msg) {
      showCustomAlert(language === 'en' ? 'Copied!' : 'Kopyalandı!', msg);
    }
  };

  const handleWatchAd = async () => {
    await new Promise(r => setTimeout(r, 1500));
    const hint = game.useHint();
    showCustomAlert('💡 İpucu', hint ?? (language === 'en' ? 'All letters found!' : 'Tüm harfler zaten bulundu!'));
  };

  const handleSpendGems = async (): Promise<boolean> => {
    const ok = await onSpendGems(HINT_GEM_COST);
    if (ok) {
      const hint = game.useHint();
      showCustomAlert('💡 İpucu', hint ?? (language === 'en' ? 'All letters found!' : 'Tüm harfler zaten bulundu!'));
    }
    return ok;
  };

  const executeSweeperPurchase = async () => {
    const ok = await onSpendGems(30);
    if (ok) {
      const swept = game.useSweeper();
      if (swept.length === 0) {
        showCustomAlert('', language === 'en' ? 'Keyboard already clean!' : 'Klavye zaten temiz!');
      } else {
        showCustomAlert('🧹', language === 'en' ? `Eliminated: ${swept.join(', ')}` : `Elenen harfler: ${swept.join(', ')}`);
      }
    } else {
      showCustomAlert('💎', language === 'en' ? 'Insufficient Gems' : 'Yetersiz Gem');
    }
  };

  const handleSweeperPress = () => {
    audioService.triggerHaptic('light');
    if (premium) {
      const swept = game.useSweeper();
      if (swept.length === 0) {
        showCustomAlert('', language === 'en' ? 'Keyboard already clean!' : 'Klavye zaten temiz!');
      } else {
        showCustomAlert('🧹', language === 'en' ? `Eliminated: ${swept.join(', ')}` : `Elenen harfler: ${swept.join(', ')}`);
      }
      return;
    }

    showCustomAlert(
      language === 'en' ? 'Sweep Keyboard 🧹' : 'Klavyeyi Süpür 🧹',
      language === 'en' ? 'Spend 30 💎 to eliminate 3 wrong letters?' : 'Klavyeden 3 yanlış harfi silmek için 30 💎 harcamak ister misiniz?',
      [
        { text: language === 'en' ? 'Cancel' : 'İptal' },
        {
          text: language === 'en' ? 'Sweep' : 'Süpür',
          onPress: executeSweeperPurchase,
        },
      ]
    );
  };

  const handleShareCard = async () => {
    await handleShare();
  };

  const handleShowDefinition = () => {
    audioService.triggerHaptic('light');
    setShowDefinition(true);
  };

  const handleRetry = () => {
    onShowConfetti(false);
    onRetry();
  };

  const handleMenu = () => {
    onShowConfetti(false);
    onBackToMenu();
  };

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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.gameStatus, handleSubmit, handleDelete, handleKey]);

  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={handleMenu}>
          <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>← {language === 'en' ? 'Menu' : 'Menü'}</Text>
        </TouchableOpacity>
        <View style={styles.modePills}>
          <Text style={[styles.pill, { backgroundColor: theme.colors.card, color: theme.colors.textSecondary, borderColor: theme.colors.border }]}>{modeInfo.emoji} {modeInfo.label}</Text>
          <Text style={[styles.pill, { backgroundColor: theme.colors.card, color: theme.colors.textSecondary, borderColor: theme.colors.border }]}>{categoryInfo.emoji} {categoryInfo.label}</Text>
          <Text style={[styles.pill, { backgroundColor: theme.colors.card, color: diffInfo.color, borderColor: theme.colors.border }]}>{diffInfo.emoji} {diffInfo.label}</Text>
        </View>
        <TouchableOpacity style={[styles.gemPill, { backgroundColor: theme.colors.card, borderColor: theme.colors.gem }]} onPress={() => setShowStore(true)}>
          <Text style={[styles.gemPillText, { color: theme.colors.gem }]}>💎 {gems}</Text>
        </TouchableOpacity>
      </View>

      {gameConfig.mode === 'speed' && game.gameStatus === 'playing' && (
        <Timer timeLeft={game.timeLeft} totalTime={90} />
      )}

      {game.gameStatus !== 'playing' && (
        <GameEndCertificate
          gameStatus={game.gameStatus}
          targetWord={game.targetWord}
          board={game.board}
          currentRow={game.currentRow}
          colorBlind={colorBlind}
          language={language}
          theme={theme}
          onShowDefinition={handleShowDefinition}
          onShare={handleShareCard}
          onRetry={handleRetry}
          onMenu={handleMenu}
          gameMode={gameConfig.mode}
        />
      )}

      <View style={styles.boardContainer}>
        <GameBoard board={game.board as any} currentRow={game.currentRow} />
      </View>

      {game.gameStatus === 'playing' && (
        <View style={styles.boosterRow}>
          <TouchableOpacity
            style={[styles.boosterBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => setShowHint(true)}
          >
            <Text style={styles.boosterEmoji}>🔍</Text>
            <Text style={[styles.boosterLabel, { color: theme.colors.text }]}>
              {language === 'en' ? 'Reveal (50💎)' : 'Harf Aç (50💎)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boosterBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={handleSweeperPress}
          >
            <Text style={styles.boosterEmoji}>🧹</Text>
            <Text style={[styles.boosterLabel, { color: theme.colors.text }]}>
              {language === 'en' ? 'Sweep (30💎)' : 'Süpürge (30💎)'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {game.gameStatus === 'playing' && (
        <View style={styles.keyboardWrap}>
          <Keyboard
            onKey={handleKey}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
            revealedLetters={game.revealedLetters}
          />
        </View>
      )}

      <HintModal
        visible={showHint}
        onClose={() => setShowHint(false)}
        gems={gems}
        isPremium={premium}
        onWatchAd={handleWatchAd}
        onSpendGems={handleSpendGems}
        onGoToStore={() => { setShowHint(false); setShowStore(true); }}
      />
      <StoreModal
        visible={showStore}
        onClose={() => setShowStore(false)}
        gems={gems}
        isPremium={premium}
        onPurchase={async (_, g) => { await onAddGems(g); }}
        onPurchasePremium={onUnlockPremium}
        unlockedCategories={unlockedCategories}
        onUnlockCategory={async (cat) => {
          const ok = await onUnlockCategory(cat);
          return ok;
        }}
      />
      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />
      <AchievementToast
        achievement={newAchievement}
        onDismiss={onClearNewAchievement}
      />
      <Confetti active={showConfetti} />
      <GemShower active={showGemShower} onComplete={() => onShowGemShower(false)} />
      <WordDefinitionModal
        visible={showDefinition}
        word={game.targetWord}
        lang={language as 'tr' | 'en'}
        onClose={() => setShowDefinition(false)}
      />
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.md },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: SPACING.sm,
  },
  backBtn: {
    backgroundColor: COLORS.card, paddingHorizontal: SPACING.sm,
    paddingVertical: 6, borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: COLORS.border,
  },
  backText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, fontWeight: '600' },
  modePills: { flexDirection: 'row', gap: 4 },
  pill: {
    color: COLORS.textSecondary, fontSize: 10, fontWeight: '700',
    backgroundColor: COLORS.card, paddingHorizontal: 6, paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
  },
  gemPill: {
    backgroundColor: COLORS.card, paddingHorizontal: SPACING.sm,
    paddingVertical: 6, borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: COLORS.gem,
  },
  gemPillText: { color: COLORS.gem, fontWeight: '700', fontSize: FONTS.size.sm },
  boardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  boosterRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  boosterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BORDER_RADIUS.md, borderWidth: 1.5 },
  boosterEmoji: { fontSize: 16 },
  boosterLabel: { fontSize: 11, fontWeight: '800' },
  keyboardWrap: { paddingBottom: SPACING.sm },
});
