import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LeaderboardScreen } from '../../components/LeaderboardScreen';
import { useTheme } from '../../context/ThemeContext';
import { usePlayerStats } from '../../hooks/usePlayerStats';

export default function LeaderboardTab() {
  const { activeTheme } = useTheme();
  const { stats } = usePlayerStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.canvas }]} edges={['top']}>
      <LeaderboardScreen stats={stats} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
