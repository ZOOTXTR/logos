import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/themes';

interface AuraBackgroundProps {
  theme: Theme;
}

// Sade, statik bir arka plan: dönen renk blobl'ları yerine yukarıdan aşağı
// yumuşak bir degrade. Ekranların üzerine geldiği "çamurlu" görünümü kaldırır.
export function AuraBackground({ theme }: AuraBackgroundProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[theme.colors.surfaceLight, theme.colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </View>
  );
}
