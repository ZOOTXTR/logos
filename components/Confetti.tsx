import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NUM_PARTICLES = 40;

const COLORS_POOL = [
  '#FF007F', '#FFD700', '#00FFFF', '#FF00FF', '#00FF00',
  '#FF4500', '#9400D3', '#1E90FF', '#FF8C00', '#ADFF2F'
];

interface ParticleProps {
  index: number;
}

function ConfettiParticle({ index }: ParticleProps) {
  // Random horizontal starting position
  const startX = Math.random() * SCREEN_WIDTH;
  
  // Animated values
  const y = useSharedValue(-20);
  const x = useSharedValue(startX);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(Math.random() * 0.6 + 0.4);

  // Random animation characteristics
  const delay = Math.random() * 1500;
  const duration = Math.random() * 2000 + 2000;
  const drift = Math.random() * 160 - 80; // random wind sway
  const color = COLORS_POOL[index % COLORS_POOL.length];
  const isCircle = Math.random() > 0.5;

  useEffect(() => {
    // Start falling down
    y.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 20, {
        duration,
        easing: Easing.linear,
      })
    );

    // Wind drift sway
    x.value = withDelay(
      delay,
      withTiming(startX + drift, {
        duration,
        easing: Easing.out(Easing.quad),
      })
    );

    // Random spinning
    rotation.value = withDelay(
      delay,
      withTiming(Math.random() * 720 + 360, {
        duration,
        easing: Easing.linear,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: y.value },
        { translateX: x.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          backgroundColor: color,
          borderRadius: isCircle ? 10 : 2,
        },
      ]}
    />
  );
}

interface ConfettiProps {
  active: boolean;
}

export function Confetti({ active }: ConfettiProps) {
  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array(NUM_PARTICLES).fill(null).map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    zIndex: 9999,
  },
});
