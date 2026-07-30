import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Svg, Path, G, Circle, Line, Text as SvgText } from 'react-native-svg';

export interface Prize {
  label: string;
  value: number;
  color: string;
  gradientFrom: string;
}

const WHEEL_SIZE = 260;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = WHEEL_SIZE / 2 - 4;

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function buildSlicePath(
  cx: number, cy: number, r: number,
  startAngle: number, endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x.toFixed(3)} ${start.y.toFixed(3)}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`,
    'Z',
  ].join(' ');
}

interface SpinWheelCanvasProps {
  theme: any;
  prizes: Prize[];
  spinAnim: Animated.Value;
}

export function SpinWheelCanvas({ theme, prizes, spinAnim }: SpinWheelCanvasProps) {
  const SLICE_ANGLE = (2 * Math.PI) / prizes.length;
  const spinRotation = spinAnim.interpolate({
    inputRange: [-10000, 10000],
    outputRange: ['-10000deg', '10000deg'],
  });

  return (
    <>
      <View style={styles.pointerContainer}>
        <View style={[styles.pointer, { borderBottomColor: theme.colors.accent }]} />
      </View>
      <View style={[styles.outerRing, { borderColor: theme.colors.primary + '55' }]}>
        <Animated.View
          style={{
            width: WHEEL_SIZE,
            height: WHEEL_SIZE,
            transform: [{ rotate: spinRotation }],
          }}
        >
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
            <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill={theme.colors.card} />
            {prizes.map((p, i) => {
              const startAngle = i * SLICE_ANGLE - Math.PI / 2;
              const endAngle = startAngle + SLICE_ANGLE;
              const midAngle = startAngle + SLICE_ANGLE / 2;
              const textR = RADIUS * 0.62;
              const tx = CENTER + textR * Math.cos(midAngle);
              const ty = CENTER + textR * Math.sin(midAngle);
              const d = buildSlicePath(CENTER, CENTER, RADIUS, startAngle, endAngle);
              return (
                <G key={i}>
                  <Path d={d} fill={p.color} stroke={theme.colors.background} strokeWidth={2} />
                  <SvgText
                    x={tx}
                    y={ty + 4}
                    fill="white"
                    fontSize={11}
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    {p.label}
                  </SvgText>
                </G>
              );
            })}
            {prizes.map((_, i) => {
              const angle = i * SLICE_ANGLE - Math.PI / 2;
              const ex = CENTER + RADIUS * Math.cos(angle);
              const ey = CENTER + RADIUS * Math.sin(angle);
              return (
                <Line
                  key={`line-${i}`}
                  x1={CENTER} y1={CENTER}
                  x2={ex} y2={ey}
                  stroke={theme.colors.background}
                  strokeWidth={2}
                />
              );
            })}
            <Circle cx={CENTER} cy={CENTER} r={22} fill={theme.colors.surface} stroke={theme.colors.primary} strokeWidth={3} />
            <SvgText x={CENTER} y={CENTER + 7} fill={theme.colors.text} fontSize={18} textAnchor="middle">💎</SvgText>
          </Svg>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pointerContainer: {
    position: 'absolute',
    top: 6,
    zIndex: 20,
    alignItems: 'center',
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  outerRing: {
    borderRadius: WHEEL_SIZE / 2 + 12,
    borderWidth: 4,
    padding: 6,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 14,
  },
});
