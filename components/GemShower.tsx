import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GemShowerProps {
  active: boolean;
  onComplete?: () => void;
  particleCount?: number;
}

interface ParticleData {
  id: number;
  startX: number;
  startY: number;
  delay: number;
  duration: number;
}

export function GemShower({ active, onComplete, particleCount = 16 }: GemShowerProps) {
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      // Generate random particles starting near center-screen
      const list: ParticleData[] = [];
      for (let i = 0; i < particleCount; i++) {
        list.push({
          id: i,
          // Randomize center burst area
          startX: SCREEN_WIDTH / 2 + (Math.random() * 120 - 60),
          startY: SCREEN_HEIGHT / 2 + (Math.random() * 120 - 60),
          delay: Math.random() * 400, // staggered start
          duration: 800 + Math.random() * 300,
        });
      }
      setParticles(list);
      setVisible(true);

      // Trigger completion callback after all particles finish
      const totalTime = 400 + 1100 + 100;
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, totalTime);

      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <GemParticle key={p.id} particle={p} />
      ))}
    </View>
  );
}

function GemParticle({ particle }: { particle: ParticleData }) {
  const translateX = useSharedValue(particle.startX);
  const translateY = useSharedValue(particle.startY);
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Burst out slightly, then fly towards the gem pill at top-right (roughly x: SCREEN_WIDTH - 60, y: 55)
    const targetX = SCREEN_WIDTH - 60;
    const targetY = Platform.OS === 'ios' ? 65 : 45; // Target header gem pill position

    // 1. Scale Up & pop outward
    scale.value = withDelay(
      particle.delay,
      withSequence(
        withTiming(1.3, { duration: 150, easing: Easing.out(Easing.back()) }),
        withTiming(1.0, { duration: 100 })
      )
    );

    // 2. Fly to target coordinates
    translateX.value = withDelay(
      particle.delay + 200,
      withTiming(targetX, { duration: particle.duration - 200, easing: Easing.inOut(Easing.quad) })
    );

    translateY.value = withDelay(
      particle.delay + 200,
      withTiming(targetY, { duration: particle.duration - 200, easing: Easing.inOut(Easing.quad) })
    );

    // 3. Spin while flying
    rotate.value = withDelay(
      particle.delay,
      withTiming(360 + Math.random() * 720, {
        duration: particle.duration,
        easing: Easing.out(Easing.sin),
      })
    );

    // 4. Fade out right as it hits the target pill
    opacity.value = withDelay(
      particle.delay + particle.duration - 150,
      withTiming(0, { duration: 150 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.Text style={[styles.gemText, animatedStyle]}>
      💎
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  gemText: {
    position: 'absolute',
    left: 0,
    top: 0,
    fontSize: 22,
    textShadowColor: 'rgba(232, 192, 106, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
