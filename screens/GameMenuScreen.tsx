import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { SPACING } from '../constants/theme';
import { GameMode, Category, Difficulty } from '../constants/words';
import { LevelInfo } from '../constants/levels';
import { ModeSelector } from '../components/ModeSelector';
import { StoreModal } from '../components/StoreModal';
import { DailySpinModal } from '../components/DailySpinModal';
import { GemShower } from '../components/GemShower';
import { TopBar } from '../components/TopBar';
import { DailyQuestsCard } from '../components/DailyQuestsCard';
import { TournamentBanner } from '../components/TournamentBanner';
import { WeeklyLeaderboardCard } from '../components/WeeklyLeaderboardCard';
import { audioService } from '../services/audio.service';

import { Theme } from '../constants/themes';

interface GameMenuScreenProps {
  theme: Theme;
  language: string;
  colorBlind: boolean;
  gems: number;
  xp: number;
  levelInfo: LevelInfo | null;
  streak: number;
  streakBonus: number;
  premium: boolean;
  unlockedCategories: string[];
  dailyDone: boolean;
  showGemShower: boolean;
  onStartGame: (mode: GameMode, category: Category, difficulty: Difficulty) => void;
  onAddGems: (amount: number) => Promise<number>;
  onUnlockCategory: (cat: string) => Promise<string[]>;
  onUnlockPremium: () => Promise<void>;
  onShowGemShower: (v: boolean) => void;
}

export function GameMenuScreen({
  theme, language,
  gems, xp, levelInfo, streak,
  premium, unlockedCategories, dailyDone,
  showGemShower,
  onStartGame, onAddGems, onUnlockCategory,
  onUnlockPremium, onShowGemShower,
}: GameMenuScreenProps) {
  const router = useRouter();
  const [showStore, setShowStore] = useState(false);
  const [showSpin, setShowSpin] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TopBar gems={gems} onOpenStore={() => { audioService.triggerHaptic('light'); setShowStore(true); }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.lg, maxWidth: 600, alignSelf: 'center', width: '100%' }}
      >
        <ModeSelector
          onStart={onStartGame}
          gems={gems}
          xp={xp}
          levelInfo={levelInfo}
          streak={streak}
          dailyDone={dailyDone}
          unlockedCategories={unlockedCategories}
          onOpenStore={() => { audioService.triggerHaptic('light'); setShowStore(true); }}
          onOpenWheel={() => { audioService.triggerHaptic('light'); setShowSpin(true); }}
          onOpenDuel={() => { audioService.triggerHaptic('light'); router.push('/multiplayer' as Href); }}
        />

        <TournamentBanner
          theme={theme}
          language={language as 'tr' | 'en'}
          onStartTournament={() => { audioService.triggerHaptic('light'); onStartGame('turnuva', 'random', 'normal'); }}
        />

        <WeeklyLeaderboardCard
          theme={theme}
          language={language as 'tr' | 'en'}
          onViewAll={() => router.push('/(tabs)/leaderboard' as Href)}
        />

        <DailyQuestsCard theme={theme} language={language as 'tr' | 'en'} onClaimGems={onAddGems} />
      </ScrollView>

      <StoreModal
        visible={showStore}
        onClose={() => setShowStore(false)}
        gems={gems}
        isPremium={premium}
        onPurchase={async (_, gemAmount) => { await onAddGems(gemAmount); }}
        onPurchasePremium={onUnlockPremium}
        unlockedCategories={unlockedCategories}
        onUnlockCategory={async (cat) => {
          const ok = await onUnlockCategory(cat);
          return ok;
        }}
      />
      <DailySpinModal
        visible={showSpin}
        onClose={() => setShowSpin(false)}
        gems={gems}
        premium={premium}
        onAddGems={(g) => { onAddGems(g); onShowGemShower(true); }}
      />
      <GemShower active={showGemShower} onComplete={() => onShowGemShower(false)} />
    </View>
  );
}
