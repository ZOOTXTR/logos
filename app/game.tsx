import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GameArena } from '../components/GameArena';
import { WheelModal } from '../components/WheelModal';
import { StoreModal as StoreModalGq } from '../components/StoreModalGq';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useTheme } from '../hooks/useTheme';
import { GameMode, CategoryId, DifficultyId } from '../types/game';

export default function GameRoute() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: GameMode;
    category?: CategoryId;
    difficulty?: DifficultyId;
  }>();

  const mode = params.mode || 'klasik';
  const category = params.category || 'karisik';
  const difficulty = params.difficulty || 'normal';

  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const { stats, updateStats, progress } = usePlayerStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <GameArena
        mode={mode}
        category={category}
        difficulty={difficulty}
        stats={stats}
        onUpdateStats={updateStats}
        onBack={() => router.back()}
        onOpenWheel={() => setIsWheelOpen(true)}
        onOpenStore={() => setIsStoreOpen(true)}
      />

      <WheelModal
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
        onReward={(rewardGems) => updateStats({ gems: stats.gems + rewardGems })}
      />

      <StoreModalGq
        visible={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        gems={stats.gems}
        isPremium={Boolean(stats.isPremium)}
        onPurchase={async (_: string, g: number) => { await updateStats({ gems: stats.gems + g }); }}
        onPurchasePremium={async () => { await updateStats({ isPremium: true }); }}
        unlockedCategories={progress.unlockedCategories}
        onUnlockCategory={async (cat: string) => { await progress.unlockCategory(cat); return true; }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
