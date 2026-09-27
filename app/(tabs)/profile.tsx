import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileScreen } from '../../components/ProfileScreen';
import { StoreModal as StoreModalGq } from '../../components/StoreModalGq';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import { useTheme } from '../../hooks/useTheme';
import { storageGet } from '../../services/storage.service';

export default function ProfileTab() {
  const { theme } = useTheme();
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [playerName, setPlayerName] = useState<string | undefined>(undefined);
  const { stats, updateStats, progress } = usePlayerStats();

  useEffect(() => {
    storageGet('gq_user_name').then((v) => { if (v) setPlayerName(v); }).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ProfileScreen
        stats={stats}
        displayName={playerName}
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
});
