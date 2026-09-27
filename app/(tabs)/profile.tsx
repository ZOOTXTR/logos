import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileScreen } from '../../components/ProfileScreen';
import { StoreModal as StoreModalGq } from '../../components/StoreModalGq';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import { useTheme } from '../../hooks/useTheme';

export default function ProfileTab() {
  const { theme } = useTheme();
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const { stats, updateStats, progress } = usePlayerStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ProfileScreen
        stats={stats}
        onOpenStore={() => setIsStoreOpen(true)}
        onUpdateStats={updateStats}
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
