import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { SPACING } from '../constants/theme';
import { Board } from '../constants/words';
import { useTheme } from '../hooks/useTheme';
import { AnimatedCell } from './AnimatedCell';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface GameBoardProps {
  board: Board;
  currentRow: number;
  shakeToken?: number;
  revealedCells?: Record<number, string>;
}

function BoardRow({ children, active, shakeToken }: { children: React.ReactNode; active: boolean; shakeToken?: number }) {
  const x = useSharedValue(0);

  useEffect(() => {
    if (active && shakeToken && shakeToken > 0) {
      x.value = withSequence(
        withTiming(9, { duration: 55 }),
        withTiming(-9, { duration: 55 }),
        withTiming(7, { duration: 55 }),
        withTiming(-7, { duration: 55 }),
        withTiming(0, { duration: 55 }),
      );
    }
  }, [shakeToken]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return <Animated.View style={[styles.row, style]}>{children}</Animated.View>;
}

export const GameBoard = React.memo(function GameBoard({ board, currentRow, shakeToken, revealedCells }: GameBoardProps) {
  const { theme, colorBlind, dyslexiaFont } = useTheme();
  const { width } = useWindowDimensions();
  const wordLen = board[0]?.length ?? 5;

  const cellSize = useMemo(() => {
    const maxCell = wordLen > 5 ? 46 : 56;
    // Total gap is (wordLen - 1) * 6, side padding approx 40
    const availableSpace = width - 40 - ((wordLen - 1) * 6);
    const calculated = availableSpace / wordLen;
    return Math.floor(Math.min(maxCell, calculated));
  }, [wordLen, width]);

  const cellFontSize = useMemo(() => Math.floor(cellSize * 0.45), [cellSize]);

  return (
    <View style={styles.container}>
      {board.map((row, rowIndex) => (
        <BoardRow key={rowIndex} active={rowIndex === currentRow} shakeToken={shakeToken}>
          {row.map((letter, colIndex) => (
            <AnimatedCell
              key={colIndex}
              letter={letter}
              colIndex={colIndex}
              rowIndex={rowIndex}
              currentRow={currentRow}
              cellSize={cellSize}
              cellFontSize={cellFontSize}
              colorBlind={colorBlind}
              dyslexiaFont={dyslexiaFont}
              theme={theme}
              revealedChar={rowIndex === currentRow ? revealedCells?.[colIndex] : undefined}
            />
          ))}
        </BoardRow>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
});
