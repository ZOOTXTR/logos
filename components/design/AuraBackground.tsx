import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/themes';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

interface AuraBackgroundProps {
  theme: Theme;
}

export function AuraBackground({ theme }: AuraBackgroundProps) {
  const { width, height } = useWindowDimensions();

  // Slow rotation for ambient feel
  const rotation = useSharedValue(0);
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: 1.5 }],
    };
  });

  return (
    <View style={styles.container} pointerEvents='none'>
      {/* Base background color */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]} />
      
      {/* Rotating Aura Blobs */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.blobContainer, animatedStyle]}>
        <View style={[styles.blob, { backgroundColor: theme.colors.primary, top: -height * 0.1, left: -width * 0.2 }]} />
        <View style={[styles.blob, { backgroundColor: theme.colors.accent, bottom: -height * 0.1, right: -width * 0.2 }]} />
        <View style={[styles.blob, { backgroundColor: theme.colors.primaryLight, top: height * 0.3, right: -width * 0.1, opacity: 0.3 }]} />
      </Animated.View>
      
      {/* Glass overlay to soften the blobs */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background + 'D9' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blobContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.35,
    // Note: React Native doesn't have true CSS blur for Views without heavy packages,
    // so we simulate it with an overlay and opacity
  }
});

