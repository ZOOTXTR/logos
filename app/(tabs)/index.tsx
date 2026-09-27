import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TopBar } from '../../components/TopBar';
import { ModeSelector } from '../../components/ModeSelector';
import { TournamentBanner } from '../../components/TournamentBanner';
import { WeeklyLeaderboardCard } from '../../components/WeeklyLeaderboardCard';
import { DailyQuestsCard } from '../../components/DailyQuestsCard';
import { WheelModal } from '../../components/WheelModal';
import { DuelModal } from '../../components/DuelModal';
import { StoreModal as StoreModalGq } from '../../components/StoreModalGq';
import { useTheme } from '../../hooks/useTheme';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import { GameMode as GQMode, Category as GQCategory, Difficulty as GQDifficulty } from '../../constants/words';
import { GameMode, CategoryId, DifficultyId } from '../../types/game';

const MODE_OUT: Record<GQMode, GameMode> = { classic: 'klasik', speed: 'hizli', daily: 'gunluk', turnuva: 'turnuva' };
const CAT_OUT: Record<GQCategory, CategoryId> = {
  random: 'karisik', hayvanlar: 'hayvanlar', sehirler: 'sehirler', yiyecek: 'yiyecek',
  meslekler: 'meslekler', doga: 'doga', spor: 'spor',
};
const DIFF_OUT: Record<GQDifficulty, DifficultyId> = { easy: 'kolay', normal: 'normal', hard: 'zor', expert: 'uzman' };

export default function IndexTab() {
  const { theme, language } = useTheme();
  const router = useRouter();
  const { stats, updateStats, progress } = usePlayerStats();
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isDuelOpen, setIsDuelOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  const onStart = (mode: GQMode, cat: GQCategory, diff: GQDifficulty) => {
    router.push({
      pathname: '/game',
      params: { mode: MODE_OUT[mode], category: CAT_OUT[cat], difficulty: DIFF_OUT[diff] },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <TopBar gems={stats.gems} onOpenStore={() => setIsStoreOpen(true)} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ModeSelector
          onStart={onStart}
          gems={progress.gems}
          xp={progress.xp}
          levelInfo={progress.levelInfo}
          streak={progress.streak.current}
          dailyDone={false}
          unlockedCategories={progress.unlockedCategories}
          onOpenStore={() => setIsStoreOpen(true)}
          onOpenWheel={() => setIsWheelOpen(true)}
          onOpenDuel={() => setIsDuelOpen(true)}
          middle={
            <View style={{ gap: 8, marginBottom: 12 }}>
              <TournamentBanner theme={theme} language={language} onStartTournament={() => onStart('turnuva', 'random', 'normal')} />
              <WeeklyLeaderboardCard
                theme={theme}
                language={language}
                weeklyPoints={Math.max(2150, stats.gamesWon * 90 + stats.streak * 45)}
                rank={14}
                onViewAll={() => router.push('/(tabs)/leaderboard')}
              />
            </View>
          }
        />

        <DailyQuestsCard
          theme={theme}
          language={language}
          onClaimGems={(g: number) => { updateStats({ gems: stats.gems + g }); }}
        />
      </ScrollView>

      <WheelModal isOpen={isWheelOpen} onClose={() => setIsWheelOpen(false)} onReward={(g) => updateStats({ gems: stats.gems + g })} />
      <DuelModal isOpen={isDuelOpen} onClose={() => setIsDuelOpen(false)} onStartDuel={() => { setIsDuelOpen(false); router.push('/duel'); }} />
      <StoreModalGq
        visible={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        gems={stats.gems}
        isPremium={Boolean(stats.isPremium)}
        onPurchase={async (_: string, g: number) => { await updateStats({ gems: stats.gems + g }); }}
        onPurchasePremium={async () => { await updateStats({ isPremium: true }); }}
        unlockedCategories={progress.unlockedCategories}
        onUnlockCategory={async (cat: string) => {
          const paid = await progress.spendGems(100);
          if (!paid) return false;
          await progress.unlockCategory(cat);
          return true;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
});
