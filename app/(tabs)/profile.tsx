import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { ProfileScreen } from '../../components/ProfileScreen';
import { StoreModal as StoreModalGq } from '../../components/StoreModalGq';
import { AccountModal } from '../../components/AccountModal';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import { useTheme } from '../../hooks/useTheme';
import { storageGet } from '../../services/storage.service';
import { isSignedIn, onAuthStateChanged } from '../../services/auth.service';

export default function ProfileTab() {
  const { theme } = useTheme();
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [playerName, setPlayerName] = useState<string | undefined>(undefined);
  const [signedIn, setSignedIn] = useState<boolean>(isSignedIn());
  const { stats, updateStats, progress } = usePlayerStats();

  const refresh = useCallback(() => {
    storageGet('gq_user_name').then((v) => setPlayerName(v ?? undefined)).catch(() => {});
    setSignedIn(isSignedIn());
  }, []);

  // Giriş/çıkış olduğunda anında güncelle
  useEffect(() => {
    const unsub = onAuthStateChanged(() => refresh());
    return () => { unsub(); };
  }, [refresh]);

  // Sekmeye her dönüşte tazele
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ProfileScreen
        stats={stats}
        displayName={playerName}
        isSignedIn={signedIn}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenStore={() => setIsStoreOpen(true)}
        onUpdateStats={updateStats}
      />

      <AccountModal visible={isAccountOpen} onClose={() => { setIsAccountOpen(false); refresh(); }} />

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
