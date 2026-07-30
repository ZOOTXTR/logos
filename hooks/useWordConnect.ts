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
  status: 'playing' | 'won';
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
    targetWords: ['KALEM', 'KALE', 'ELMA', 'LEKE'],
    layout: [
      ['KALEM', 2, 1, 'H'],
      ['KALE', 2, 1, 'V'],
      ['ELMA', 4, 3, 'H'],
      ['LEKE', 1, 3, 'V'],
    ]
  },
  {
    letters: ['T', 'A', 'S', 'M', 'A'],
    targetWords: ['TASMA', 'MASAT', 'SAAT', 'MALA'],
    layout: [
      ['TASMA', 0, 1, 'H'],
      ['MASAT', 0, 4, 'V'],
      ['SAAT', 2, 2, 'H'],
      ['MALA', 0, 1, 'V'],
    ]
  }
];

const LEVELS_EN: LevelConfig[] = [
  {
    letters: ['S', 'T', 'A', 'R', 'E'],
    targetWords: ['STARE', 'TEAR', 'RATE', 'EAST'],
    layout: [
      ['STARE', 2, 0, 'H'],
      ['TEAR', 0, 1, 'V'],
      ['RATE', 2, 3, 'V'],
      ['EAST', 3, 0, 'H'],
    ]
  },
  {
    letters: ['P', 'E', 'A', 'C', 'H'],
    targetWords: ['PEACH', 'EACH', 'CAPE', 'HEAP'],
    layout: [
      ['PEACH', 2, 0, 'H'],
      ['EACH', 2, 1, 'V'],
      ['CAPE', 0, 3, 'V'],
      ['HEAP', 4, 0, 'H'],
    ]
  }
];

export function useWordConnect(levelIndex = 0, lang: 'tr' | 'en' = 'tr') {
  const levels = lang === 'en' ? LEVELS_EN : LEVELS_TR;
  const config = levels[levelIndex % levels.length];

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
    const word = state.currentGuess.toUpperCase();
    
    if (state.wordsFound.includes(word)) {
      return 'already_found';
    }

    if (state.targetWords.includes(word)) {
      // Find where this word lies in the layout
      const level = levels[(state.level - 1) % levels.length];
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
    const nextIdx = nextLevel ?? (state.level - 1);
    const conf = levels[nextIdx % levels.length];
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

  return { ...state, selectLetter, clearSelection, submitWord, reset };
}
