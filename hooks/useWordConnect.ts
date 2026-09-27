import { useState, useCallback } from 'react';

export interface ConnectCell {
  row: number;
  col: number;
  targetChar: string;
  char: string;
  isFilled: boolean;
}

export interface WordConnectState {
  letters: string[];
  selectedIndices: number[];
  currentGuess: string;
  wordsFound: string[];
  targetWords: string[];
  cells: ConnectCell[];
  status: 'playing' | 'won' | 'completed';
  level: number;
}

// Pre-defined crossword layouts for English and Turkish
interface LevelConfig {
  letters: string[];
  targetWords: string[];
  // Defines where words lie in the crossword grid:
  // [word, row, col, direction ('H' or 'V')]
  layout: Array<[string, number, number, 'H' | 'V']>;
}

const LEVELS_TR: LevelConfig[] = [
  {
    letters: ['K', 'A', 'L', 'E', 'M'],
    targetWords: ['KALEM', 'KALE', 'ELMA', 'ALEM'],
    layout: [
      ['KALEM', 0, 0, 'H'],
      ['KALE', 0, 0, 'V'],
      ['ELMA', 0, 3, 'V'],
      ['ALEM', 3, 3, 'H'],
    ]
  },
  {
    letters: ['T', 'A', 'S', 'M', 'A'],
    targetWords: ['TASMA', 'ASMA', 'SAAT', 'ATA'],
    layout: [
      ['TASMA', 0, 0, 'H'],
      ['ASMA', 0, 1, 'V'],
      ['SAAT', 0, 2, 'V'],
      ['ATA', 0, 4, 'V'],
    ]
  },
  {
    letters: ['M', 'A', 'S', 'A', 'L'],
    targetWords: ['MASAL', 'MASA', 'ALMA', 'SAL'],
    layout: [
      ['MASAL', 0, 0, 'H'],
      ['MASA', 0, 0, 'V'],
      ['ALMA', 0, 1, 'V'],
      ['SAL', 0, 2, 'V'],
    ]
  },
  {
    letters: ['S', 'E', 'L', 'A', 'M'],
    targetWords: ['SELAM', 'SAL', 'ELMA', 'ALEM'],
    layout: [
      ['SELAM', 0, 0, 'H'],
      ['SAL', 0, 0, 'V'],
      ['ELMA', 0, 1, 'V'],
      ['ALEM', 0, 3, 'V'],
    ]
  }
];

const LEVELS_EN: LevelConfig[] = [
  {
    letters: ['S', 'T', 'A', 'R', 'E'],
    targetWords: ['STARE', 'TEAR', 'RATE', 'STAR'],
    layout: [
      ['STARE', 0, 0, 'H'],
      ['TEAR', 0, 1, 'V'],
      ['RATE', 0, 3, 'V'],
      ['STAR', 0, 0, 'V'],
    ]
  },
  {
    letters: ['P', 'E', 'A', 'C', 'H'],
    targetWords: ['PEACH', 'EACH', 'CAPE', 'PEA'],
    layout: [
      ['PEACH', 0, 0, 'H'],
      ['EACH', 0, 1, 'V'],
      ['CAPE', 0, 3, 'V'],
      ['PEA', 0, 0, 'V'],
    ]
  },
  {
    letters: ['S', 'T', 'O', 'N', 'E'],
    targetWords: ['STONE', 'SON', 'TONE', 'NEST'],
    layout: [
      ['STONE', 0, 0, 'H'],
      ['SON', 0, 0, 'V'],
      ['TONE', 0, 1, 'V'],
      ['NEST', 0, 3, 'V'],
    ]
  },
  {
    letters: ['B', 'R', 'E', 'A', 'D'],
    targetWords: ['BREAD', 'BEAR', 'READ', 'ARE'],
    layout: [
      ['BREAD', 0, 0, 'H'],
      ['BEAR', 0, 0, 'V'],
      ['READ', 0, 1, 'V'],
      ['ARE', 0, 3, 'V'],
    ]
  }
];

export function useWordConnect(levelIndex = 0, lang: 'tr' | 'en' = 'tr') {
  const levels = lang === 'en' ? LEVELS_EN : LEVELS_TR;
  const safeIndex = Math.max(0, Math.min(levelIndex, levels.length - 1));
  const config = levels[safeIndex];

  const buildCells = (layout: LevelConfig['layout']): ConnectCell[] => {
    const list: ConnectCell[] = [];
    const seen = new Set<string>();

    layout.forEach(([word, startRow, startCol, dir]) => {
      for (let i = 0; i < word.length; i++) {
        const r = dir === 'H' ? startRow : startRow + i;
        const c = dir === 'H' ? startCol + i : startCol;
        const key = `${r}-${c}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            row: r,
            col: c,
            targetChar: word[i],
            char: '',
            isFilled: false
          });
        }
      }
    });
    return list;
  };

  const [state, setState] = useState<WordConnectState>(() => {
    return {
      letters: config.letters,
      selectedIndices: [],
      currentGuess: '',
      wordsFound: [],
      targetWords: config.targetWords,
      cells: buildCells(config.layout),
      status: 'playing',
      level: levelIndex + 1,
    };
  });

  const selectLetter = useCallback((index: number) => {
    setState(prev => {
      if (prev.selectedIndices.includes(index)) return prev;
      const letter = prev.letters[index];
      return {
        ...prev,
        selectedIndices: [...prev.selectedIndices, index],
        currentGuess: prev.currentGuess + letter,
      };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedIndices: [], currentGuess: '' }));
  }, []);

  const submitWord = useCallback((): 'correct' | 'wrong' | 'already_found' => {
    const word = lang === 'tr'
      ? state.currentGuess.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR')
      : state.currentGuess.toUpperCase();
    
    if (state.wordsFound.includes(word)) {
      return 'already_found';
    }

    if (state.targetWords.includes(word)) {
      // Find where this word lies in the layout
      const level = levels[Math.min(state.level - 1, levels.length - 1)];
      const match = level.layout.find(([w]) => w === word);
      
      let newCells = [...state.cells];
      if (match) {
        const [_, startRow, startCol, dir] = match;
        newCells = state.cells.map(cell => {
          // Check if cell lies along the matched word's coordinate path
          for (let i = 0; i < word.length; i++) {
            const r = dir === 'H' ? startRow : startRow + i;
            const c = dir === 'H' ? startCol + i : startCol;
            if (cell.row === r && cell.col === c) {
              return { ...cell, char: cell.targetChar, isFilled: true };
            }
          }
          return cell;
        });
      }

      const nextFound = [...state.wordsFound, word];
      const won = nextFound.length === state.targetWords.length;

      setState(prev => ({
        ...prev,
        wordsFound: nextFound,
        cells: newCells,
        selectedIndices: [],
        currentGuess: '',
        status: won ? 'won' : 'playing',
      }));

      return 'correct';
    }

    setState(prev => ({ ...prev, selectedIndices: [], currentGuess: '' }));
    return 'wrong';
  }, [state, levels]);

  const reset = useCallback((nextLevel?: number) => {
    const requested = nextLevel ?? (state.level - 1);
    if (requested >= levels.length) {
      setState(prev => ({ ...prev, status: 'completed' }));
      return;
    }
    const nextIdx = Math.max(0, requested);
    const conf = levels[nextIdx];
    setState({
      letters: conf.letters,
      selectedIndices: [],
      currentGuess: '',
      wordsFound: [],
      targetWords: conf.targetWords,
      cells: buildCells(conf.layout),
      status: 'playing',
      level: nextIdx + 1,
    });
  }, [state.level, levels]);

  return { ...state, totalLevels: levels.length, selectLetter, clearSelection, submitWord, reset };
}
