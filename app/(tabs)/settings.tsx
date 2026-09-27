import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsScreen } from '../../components/SettingsScreen';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsTab() {
  const { activeTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.canvas }]} edges={['top']}>
      <SettingsScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
