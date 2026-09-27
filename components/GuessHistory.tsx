import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './CustomText';
import { History } from 'lucide-react-native';
import { Board } from '../constants/words';
import { Theme } from '../constants/themes';

interface GuessHistoryProps {
  board: Board;
  currentRow: number;
  maxGuesses: number;
  theme: Theme;
  language: 'tr' | 'en';
}

export function GuessHistory({ board, currentRow, maxGuesses, theme, language }: GuessHistoryProps) {
  const completed = board.slice(0, currentRow);
  const hasGuess = completed.some((row) => row.some((cell) => cell.char !== ''));

  const tileBg = (status: string): string => {
    switch (status) {
      case 'correct': return theme.colors.correct;
      case 'present': return theme.colors.present;
      case 'absent': return theme.colors.absent;
      default: return theme.colors.surface;
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <History size={14} color={theme.colors.accent} />
          <Text style={[styles.title, { color: theme.colors.text }]}>{language === 'en' ? 'Guess History' : 'Tahmin Geçmişi'}</Text>
          <Text style={[styles.count, { color: theme.colors.textMuted }]}>({completed.length}/{maxGuesses})</Text>
        </View>
      </View>

      {!hasGuess ? (
        <View style={[styles.empty, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {language === 'en' ? 'No guesses yet.' : 'Henüz tahmin yapılmadı.'}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {completed.map((row, i) => {
            if (row.every((cell) => cell.char === '')) return null;
            const isCorrect = row.every((cell) => cell.status === 'correct');
            return (
              <View key={i} style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: isCorrect ? theme.colors.correct + '66' : theme.colors.border }]}>
                <Text style={[styles.idx, { color: isCorrect ? theme.colors.correct : theme.colors.textMuted }]}>#{i + 1}</Text>
                <View style={styles.tiles}>
                  {row.map((cell, j) => (
                    <View key={j} style={[styles.tile, { backgroundColor: tileBg(cell.status) }]}>
                      <Text style={[styles.tileText, { color: cell.status === 'correct' || cell.status === 'present' ? '#fff' : theme.colors.textSecondary }]}>
                        {cell.char}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.status, { color: isCorrect ? theme.colors.correct : theme.colors.error }]}>
                  {isCorrect ? '✓' : '✗'}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 11, fontWeight: '800' },
  count: { fontSize: 10, fontWeight: '600' },
  empty: { paddingVertical: 8, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  emptyText: { fontSize: 10, fontStyle: 'italic' },
  list: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 12, borderWidth: 1 },
  idx: { fontSize: 10, fontWeight: '800', width: 22 },
  tiles: { flexDirection: 'row', gap: 3, flex: 1 },
  tile: { width: 20, height: 20, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  tileText: { fontSize: 10, fontWeight: '800' },
  status: { fontSize: 14, fontWeight: '800' },
});
