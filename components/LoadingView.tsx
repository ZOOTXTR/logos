import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message }: LoadingViewProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.emoji]}>💎</Text>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.text, { color: theme.colors.textMuted }]}>
          {message ?? 'Loading...'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  emoji: { fontSize: 48, marginBottom: SPACING.sm },
  text: { fontSize: FONTS.size.sm, fontWeight: '600' },
});
