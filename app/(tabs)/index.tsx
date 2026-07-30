import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '../../hooks/useGame';
import { storageGet } from '../../services/storage.service';
import { useProgress } from '../../hooks/useProgress';
import { useTheme } from '../../hooks/useTheme';
import { hasDoneDaily, markDailyDone, addScore } from '../../services/storage.service';
import { XP_REWARDS } from '../../constants/levels';
import { GameMode, Category, Difficulty } from '../../constants/words';
import { audioService } from '../../services/audio.service';
import { submitScore } from '../../services/leaderboard.service';
import { GameMenuScreen } from '../../screens/GameMenuScreen';
import { GamePlayScreen } from '../../screens/GamePlayScreen';
import { LoadingView } from '../../components/LoadingView';

type Screen = 'menu' | 'game';

export default function GameScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('menu');
  const [dailyDone, setDailyDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showGemShower, setShowGemShower] = useState(false);

  const [gameConfig, setGameConfig] = useState<{
    mode: GameMode; category: Category; difficulty: Difficulty;
  }>({ mode: 'classic', category: 'random', difficulty: 'normal' });

  const progress = useProgress();
  const { theme, colorBlind, language } = useTheme();
  const game = useGame(gameConfig.difficulty, gameConfig.mode, gameConfig.category, language);

  useEffect(() => {
    const init = async () => {
      const onboarded = await storageGet('gq_onboarded');
      if (onboarded !== 'true') { router.replace('/onboarding'); return; }
      setDailyDone(await hasDoneDaily());
    };
    init();
  }, []);

  const isFirstLangRender = useRef(true);
  useEffect(() => {
    if (isFirstLangRender.current) { isFirstLangRender.current = false; return; }
    game.resetGame(gameConfig.difficulty, gameConfig.mode, gameConfig.category, language);
  }, [language]);

  const handleGameEnd = useCallback(async (won: boolean) => {
    if (!won) {
      audioService.play('loss'); audioService.triggerHaptic('warning');
      await progress.recordLoss(); return;
    }
    setShowConfetti(true); setShowGemShower(true);
    audioService.play('win'); audioService.triggerHaptic('success');

    const gc = game.currentRow + 1;
    const isPerfect = gc === 1;
    const isSpeed = gameConfig.mode === 'speed';
    const isExpert = gameConfig.difficulty === 'expert';
    const isDaily = gameConfig.mode === 'daily';

    let xp = XP_REWARDS.WIN_BASE;
    xp += XP_REWARDS.DIFFICULTY_BONUS[gameConfig.difficulty];
    if (isPerfect) xp += XP_REWARDS.PERFECT_GAME;
    if (isSpeed) xp *= XP_REWARDS.SPEED_MODE_MULTIPLIER;
    if (isDaily) xp += XP_REWARDS.DAILY_CHALLENGE;

    await progress.earnXP(xp);
    await progress.addGems(isSpeed ? 30 : isDaily ? 100 : 10);

    if (isDaily) { await markDailyDone(); setDailyDone(true); }

    await addScore({
      date: new Date().toISOString(), mode: gameConfig.mode,
      category: gameConfig.category, guesses: gc,
      timeSeconds: isSpeed ? (90 - game.timeLeft) : game.elapsedSeconds, xpEarned: xp,
    });

    await submitScore({
      date: new Date().toISOString(), mode: gameConfig.mode,
      category: gameConfig.category, guesses: gc,
      timeSeconds: isSpeed ? (90 - game.timeLeft) : game.elapsedSeconds, xpEarned: xp,
    });

    await progress.recordWin({
      guesses: gc, mode: gameConfig.mode, difficulty: gameConfig.difficulty,
      category: gameConfig.category, isSpeed, isExpert, isPerfect, isDaily,
      elapsedSeconds: game.elapsedSeconds, xpEarned: xp,
    });
  }, [game, gameConfig, progress]);

  useEffect(() => {
    if (game.gameStatus === 'won' || game.gameStatus === 'lost') {
      handleGameEnd(game.gameStatus === 'won');
    }
  }, [game.gameStatus]);

  const handleStartGame = useCallback((mode: GameMode, category: Category, difficulty: Difficulty) => {
    setShowConfetti(false);
    audioService.triggerHaptic('medium');
    setGameConfig({ mode, category, difficulty });
    setScreen('game');
    setTimeout(() => game.resetGame(difficulty, mode, category), 50);
  }, [game]);

  if (progress.loading) {
    return <LoadingView message={language === 'en' ? 'Loading...' : 'Yükleniyor...'} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      {screen === 'menu' ? (
        <GameMenuScreen
          theme={theme} language={language} colorBlind={colorBlind}
          gems={progress.gems} xp={progress.xp} levelInfo={progress.levelInfo}
          streak={progress.streak.current} streakBonus={0}
          premium={progress.premium} unlockedCategories={progress.unlockedCategories}
          dailyDone={dailyDone} showGemShower={showGemShower}
          onStartGame={handleStartGame}
          onAddGems={progress.addGems} onUnlockCategory={progress.unlockCategory}
          onUnlockPremium={progress.unlockPremium} onShowGemShower={setShowGemShower}
        />
      ) : (
        <GamePlayScreen
          theme={theme} language={language} colorBlind={colorBlind}
          game={game as any} gameConfig={gameConfig}
          gems={progress.gems} premium={progress.premium}
          unlockedCategories={progress.unlockedCategories}
          showConfetti={showConfetti} showGemShower={showGemShower}
          newAchievement={progress.newAchievement}
          onBackToMenu={() => setScreen('menu')}
          onRetry={() => game.resetGame()}
          onAddGems={progress.addGems} onSpendGems={progress.spendGems}
          onUnlockPremium={progress.unlockPremium}
          onUnlockCategory={progress.unlockCategory}
          onClearNewAchievement={progress.clearNewAchievement}
          onShowConfetti={setShowConfetti} onShowGemShower={setShowGemShower}
        />
      )}
    </SafeAreaView>
  );
}
