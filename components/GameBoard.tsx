import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { Board } from '../constants/words';
import { useTheme } from '../hooks/useTheme';
import { AnimatedCell } from './AnimatedCell';

interface GameBoardProps {
  board: Board;
  currentRow: number;
}

export const GameBoard = React.memo(function GameBoard({ board, currentRow }: GameBoardProps) {
  const { theme, colorBlind, dyslexiaFont } = useTheme();
  const wordLen = board[0]?.length ?? 5;
  const cellSize = useMemo(() => wordLen > 5 ? 46 : 56, [wordLen]);
  const cellFontSize = useMemo(() => wordLen > 5 ? 20 : 24, [wordLen]);

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
