import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { Letter, LetterStatus } from '../constants/words';
import { BORDER_RADIUS } from '../constants/theme';

const COLORBLIND_COLORS = {
  correct: { bg: '#0072B2', border: '#0072B2' },
  present: { bg: '#E69F00', border: '#E69F00' },
};

interface AnimatedCellProps {
  letter: Letter;
  colIndex: number;
  rowIndex: number;
  currentRow: number;
  cellSize: number;
  cellFontSize: number;
  colorBlind: boolean;
  dyslexiaFont: boolean;
  theme: any;
}

function getLetterBg(status: LetterStatus | undefined, colorBlind: boolean, theme: any): string {
  switch (status) {
    case 'correct': return colorBlind ? COLORBLIND_COLORS.correct.bg : theme.colors.correct;
    case 'present': return colorBlind ? COLORBLIND_COLORS.present.bg : theme.colors.present;
    case 'absent': return theme.colors.absent;
    case 'tbd': return theme.colors.surfaceLight;
    case 'empty': return theme.colors.empty;
    default: return theme.colors.empty;
  }
}

function getLetterBorder(status: LetterStatus | undefined, theme: any): string {
  switch (status) {
    case 'correct': return theme.colors.correct;
    case 'present': return theme.colors.present;
    case 'absent': return theme.colors.absent;
    case 'tbd': return theme.colors.primaryLight;
    default: return theme.colors.border;
  }
}

function AnimatedCellComponent({ letter, colIndex, rowIndex, currentRow, cellSize, cellFontSize, colorBlind, dyslexiaFont, theme }: AnimatedCellProps) {
  const flipVal = useSharedValue(0);
  const scaleVal = useSharedValue(1);

  const isEvaluated = rowIndex < currentRow || (rowIndex === currentRow && (letter.status === 'correct' || letter.status === 'present' || letter.status === 'absent'));
  const isTyping = rowIndex === currentRow && letter.status === 'tbd';

  useEffect(() => {
    if (isEvaluated) {
      flipVal.value = withDelay(colIndex * 150, withTiming(1, { duration: 400 }));
    }
  }, [isEvaluated]);

  useEffect(() => {
    if (isTyping) {
      scaleVal.value = withTiming(1.08, { duration: 80 });
      setTimeout(() => { scaleVal.value = withTiming(1, { duration: 100 }); }, 80);
    }
  }, [isTyping, letter.char]);

  const containerStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipVal.value, [0, 1], [0, 180]);
    const bg = flipVal.value >= 0.5 ? getLetterBg(letter.status, colorBlind, theme) : theme.colors.empty;
    const border = flipVal.value >= 0.5 ? getLetterBorder(letter.status, theme) : theme.colors.border;
    return {
      transform: [{ rotateY: `${rotateY}deg` }, { scale: scaleVal.value }],
      backgroundColor: bg,
      borderColor: border,
    };
  });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: flipVal.value >= 0.5 ? '180deg' : '0deg' }],
    opacity: flipVal.value < 0.5 ? 1 : flipVal.value > 0.5 ? 1 : 0,
  }));

  return (
    <Animated.View
      style={[
        styles.cell,
        { width: cellSize, height: cellSize * 1.15 },
        containerStyle,
      ]}
    >
      <Animated.View style={[styles.contentContainer, contentStyle]}>
        <Text style={[
          styles.letter,
          { fontSize: cellFontSize, color: theme.colors.text },
          dyslexiaFont && { fontFamily: 'monospace' },
        ]}>
          {letter.char}
        </Text>
        {colorBlind && isEvaluated && (
          <View style={styles.indicatorContainer}>
            <Text style={styles.indicatorText}>
              {letter.status === 'correct' ? '✓' : letter.status === 'present' ? '●' : '✗'}
            </Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

export const AnimatedCell = React.memo(AnimatedCellComponent);

const styles = StyleSheet.create({
  cell: {
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '800',
    textAlign: 'center',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  indicatorText: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
