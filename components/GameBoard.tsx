import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { SPACING } from '../constants/theme';
import { Board } from '../constants/words';
import { useTheme } from '../hooks/useTheme';
import { AnimatedCell } from './AnimatedCell';

interface GameBoardProps {
  board: Board;
  currentRow: number;
}

export const GameBoard = React.memo(function GameBoard({ board, currentRow }: GameBoardProps) {
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
        <View key={rowIndex} style={styles.row}>
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
            />
          ))}
        </View>
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
