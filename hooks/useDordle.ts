import { useState, useCallback } from 'react';
import { Board, LetterStatus, WORD_LENGTH, createEmptyBoard, getRandomWord } from '../constants/words';

export interface DordleState {
  board1: Board;
  board2: Board;
  currentRow: number;
  currentCol: number;
  targetWord1: string;
  targetWord2: string;
  word1Solved: boolean;
  word2Solved: boolean;
  gameStatus: 'playing' | 'won' | 'lost';
  revealedLetters1: Record<string, LetterStatus>;
  revealedLetters2: Record<string, LetterStatus>;
  attempts: number;
  maxAttempts: number;
}

export function useDordle(lang: 'tr' | 'en' = 'tr') {
  const maxAttempts = 7;

  const [state, setState] = useState<DordleState>(() => {
    const w1 = getRandomWord('random', lang);
    const w2 = getRandomWord('random', lang);
    return {
      board1: createEmptyBoard(maxAttempts),
      board2: createEmptyBoard(maxAttempts),
      currentRow: 0,
      currentCol: 0,
      targetWord1: w1,
      targetWord2: w2,
      word1Solved: false,
      word2Solved: false,
      gameStatus: 'playing',
      revealedLetters1: {},
      revealedLetters2: {},
      attempts: 0,
      maxAttempts,
    };
  });

  const addLetter = useCallback((letter: string) => {
    setState(prev => {
      if (prev.gameStatus !== 'playing') return prev;
      if (prev.currentCol >= WORD_LENGTH) return prev;

      const newBoard1 = prev.board1.map(r => r.map(l => ({ ...l })));
      const newBoard2 = prev.board2.map(r => r.map(l => ({ ...l })));

      if (!prev.word1Solved) {
        newBoard1[prev.currentRow][prev.currentCol] = { char: letter, status: 'tbd' };
      }
      if (!prev.word2Solved) {
        newBoard2[prev.currentRow][prev.currentCol] = { char: letter, status: 'tbd' };
      }

      return {
        ...prev,
        board1: newBoard1,
        board2: newBoard2,
        currentCol: prev.currentCol + 1,
      };
    });
  }, []);

  const deleteLetter = useCallback(() => {
    setState(prev => {
      if (prev.currentCol === 0) return prev;

      const newBoard1 = prev.board1.map(r => r.map(l => ({ ...l })));
      const newBoard2 = prev.board2.map(r => r.map(l => ({ ...l })));

      if (!prev.word1Solved) {
        newBoard1[prev.currentRow][prev.currentCol - 1] = { char: '', status: 'empty' };
      }
      if (!prev.word2Solved) {
        newBoard2[prev.currentRow][prev.currentCol - 1] = { char: '', status: 'empty' };
      }

      return {
        ...prev,
        board1: newBoard1,
        board2: newBoard2,
        currentCol: prev.currentCol - 1,
      };
    });
  }, []);

  const submitGuess = useCallback((): 'short' | 'submitted' => {
    if (state.currentCol < WORD_LENGTH) return 'short';

    const guess = (state.word1Solved ? state.board2 : state.board1)[state.currentRow]
      .map(l => l.char)
      .join('');

    // Evaluate Word 1
    let w1Status: LetterStatus[] = Array(WORD_LENGTH).fill('absent');
    let w1Solved = state.word1Solved;
    let newRevealed1 = { ...state.revealedLetters1 };

    if (!state.word1Solved) {
      const target1Chars = state.targetWord1.split('');
      const guessChars = guess.split('');

      // Correct positions
      guessChars.forEach((c, i) => {
        if (c === target1Chars[i]) {
          w1Status[i] = 'correct';
          target1Chars[i] = '#';
        }
      });
      // Present positions
      guessChars.forEach((c, i) => {
        if (w1Status[i] === 'correct') return;
        const idx = target1Chars.indexOf(c);
        if (idx !== -1) {
          w1Status[i] = 'present';
          target1Chars[idx] = '#';
        }
      });

      w1Solved = w1Status.every(s => s === 'correct');

      guessChars.forEach((c, i) => {
        const cur = newRevealed1[c];
        const ns = w1Status[i];
        if (!cur || cur === 'absent' || (cur === 'present' && ns === 'correct')) {
          newRevealed1[c] = ns;
        }
      });
    }

    // Evaluate Word 2
    let w2Status: LetterStatus[] = Array(WORD_LENGTH).fill('absent');
    let w2Solved = state.word2Solved;
    let newRevealed2 = { ...state.revealedLetters2 };

    if (!state.word2Solved) {
      const target2Chars = state.targetWord2.split('');
      const guessChars = guess.split('');

      // Correct positions
      guessChars.forEach((c, i) => {
        if (c === target2Chars[i]) {
          w2Status[i] = 'correct';
          target2Chars[i] = '#';
        }
      });
      // Present positions
      guessChars.forEach((c, i) => {
        if (w2Status[i] === 'correct') return;
        const idx = target2Chars.indexOf(c);
        if (idx !== -1) {
          w2Status[i] = 'present';
          target2Chars[idx] = '#';
        }
      });

      w2Solved = w2Status.every(s => s === 'correct');

      guessChars.forEach((c, i) => {
        const cur = newRevealed2[c];
        const ns = w2Status[i];
        if (!cur || cur === 'absent' || (cur === 'present' && ns === 'correct')) {
          newRevealed2[c] = ns;
        }
      });
    }

    setState(prev => {
      const newBoard1 = prev.board1.map(r => r.map(l => ({ ...l })));
      const newBoard2 = prev.board2.map(r => r.map(l => ({ ...l })));

      if (!prev.word1Solved) {
        newBoard1[prev.currentRow] = guess.split('').map((c, i) => ({ char: c, status: w1Status[i] }));
      } else {
        newBoard1[prev.currentRow] = prev.targetWord1.split('').map(c => ({ char: c, status: 'correct' }));
      }

      if (!prev.word2Solved) {
        newBoard2[prev.currentRow] = guess.split('').map((c, i) => ({ char: c, status: w2Status[i] }));
      } else {
        newBoard2[prev.currentRow] = prev.targetWord2.split('').map(c => ({ char: c, status: 'correct' }));
      }

      const nextRow = prev.currentRow + 1;
      const bothSolved = w1Solved && w2Solved;
      const ranOutOfGuesses = nextRow >= maxAttempts;

      return {
        ...prev,
        board1: newBoard1,
        board2: newBoard2,
        currentRow: bothSolved || ranOutOfGuesses ? prev.currentRow : nextRow,
        currentCol: 0,
        word1Solved: w1Solved,
        word2Solved: w2Solved,
        gameStatus: bothSolved ? 'won' : ranOutOfGuesses ? 'lost' : 'playing',
        revealedLetters1: newRevealed1,
        revealedLetters2: newRevealed2,
        attempts: nextRow,
      };
    });

    return 'submitted';
  }, [state]);

  const reset = useCallback((newLang?: 'tr' | 'en') => {
    const activeLang = newLang ?? lang;
    const w1 = getRandomWord('random', activeLang);
    const w2 = getRandomWord('random', activeLang);
    setState({
      board1: createEmptyBoard(maxAttempts),
      board2: createEmptyBoard(maxAttempts),
      currentRow: 0,
      currentCol: 0,
      targetWord1: w1,
      targetWord2: w2,
      word1Solved: false,
      word2Solved: false,
      gameStatus: 'playing',
      revealedLetters1: {},
      revealedLetters2: {},
      attempts: 0,
      maxAttempts,
    });
  }, [lang]);

  return { ...state, addLetter, deleteLetter, submitGuess, reset };
}
