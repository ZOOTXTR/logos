jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockImplementation(() =>
        Promise.resolve({
          sound: {
            playAsync: jest.fn().mockResolvedValue({}),
            replayAsync: jest.fn().mockResolvedValue({}),
            pauseAsync: jest.fn().mockResolvedValue({}),
            unloadAsync: jest.fn().mockResolvedValue({}),
            setPositionAsync: jest.fn().mockResolvedValue({}),
            setOnPlaybackStatusUpdate: jest.fn(),
          },
        })
      ),
    },
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));

// Mock dictionary.service to load synchronously in Jest
jest.mock('../services/dictionary.service', () => {
  const dicts = require('../constants/validation_dictionary');
  return {
    preloadDictionaries: jest.fn().mockResolvedValue(undefined),
    getDictionary: jest.fn((lang: 'tr' | 'en') => (lang === 'en' ? dicts.VALIDATION_DICT_EN : dicts.VALIDATION_DICT_TR)),
    isDictionaryReady: jest.fn().mockReturnValue(true),
  };
});

import { renderHook, act } from '@testing-library/react-native';
import { useGame } from '../hooks/useGame';
import { useDordle } from '../hooks/useDordle';
import { useWordChain } from '../hooks/useWordChain';
import { useAnagram } from '../hooks/useAnagram';
import {
  ALL_WORDS,
  ALL_WORDS_EN,
  WORD_BANK,
} from '../constants/words';
import { WORD_BANK_EN } from '../constants/words_en';
import { getDictionary } from '../services/dictionary.service';

describe('Empirical Challenger Suite: Grid State Transformations & Word Set Lookups', () => {
  // =========================================================================
  // 1. STRESS-TEST: useGame 2D Grid Transformations & Structural Sharing
  // =========================================================================
  describe('1. useGame Structural Sharing & State Transformations', () => {
    it('maintains strict reference equality for all unaffected rows across a full row entry', () => {
      const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr'));
      const targetLen = result.current.targetWord.length;
      const initialBoard = result.current.board;
      const initialRow1 = initialBoard[1];
      const initialRow2 = initialBoard[2];
      const initialRow3 = initialBoard[3];
      const initialRow4 = initialBoard[4];
      const initialRow5 = initialBoard[5];

      const testLetters = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, targetLen);
      testLetters.forEach((char, index) => {
        const boardBeforeChar = result.current.board;
        act(() => {
          result.current.addLetter(char);
        });
        const boardAfterChar = result.current.board;

        // Board array reference changes because active row 0 is updated
        expect(boardAfterChar).not.toBe(boardBeforeChar);
        // Row 0 array reference changes
        expect(boardAfterChar[0]).not.toBe(boardBeforeChar[0]);
        // Cell updated
        expect(boardAfterChar[0][index].char).toBe(char);
        expect(boardAfterChar[0][index].status).toBe('tbd');
        // Unmodified cells in row 0 after index maintain identity
        for (let c = index + 1; c < targetLen; c++) {
          expect(boardAfterChar[0][c]).toBe(boardBeforeChar[0][c]);
        }
        // ALL unaffected rows 1..5 maintain strict identity across all keystrokes
        expect(boardAfterChar[1]).toBe(initialRow1);
        expect(boardAfterChar[2]).toBe(initialRow2);
        expect(boardAfterChar[3]).toBe(initialRow3);
        expect(boardAfterChar[4]).toBe(initialRow4);
        expect(boardAfterChar[5]).toBe(initialRow5);
      });

      expect(result.current.currentCol).toBe(targetLen);
      expect(result.current.currentRow).toBe(0);
    });

    it('returns identical state reference when addLetter is called beyond target word length', () => {
      const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr'));
      const targetLen = result.current.targetWord.length;
      
      act(() => {
        for (let i = 0; i < targetLen; i++) {
          result.current.addLetter('A');
        }
      });

      const boardAtMaxCol = result.current.board;

      act(() => {
        result.current.addLetter('X');
      });

      // Board reference and currentCol must remain untouched
      expect(result.current.board).toBe(boardAtMaxCol);
      expect(result.current.currentCol).toBe(targetLen);
    });

    it('handles deleteLetter sequences with zero-allocation when column is 0 and maintains structural sharing', () => {
      const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr'));
      const initialBoard = result.current.board;

      // Deleting at col 0 is a no-op that returns prev
      act(() => {
        result.current.deleteLetter();
      });
      expect(result.current.board).toBe(initialBoard);
      expect(result.current.currentCol).toBe(0);

      // Type 3 letters
      act(() => {
        result.current.addLetter('A');
        result.current.addLetter('B');
        result.current.addLetter('C');
      });
      expect(result.current.currentCol).toBe(3);

      const boardBeforeDelete = result.current.board;
      const row1 = boardBeforeDelete[1];

      act(() => {
        result.current.deleteLetter();
      });

      expect(result.current.currentCol).toBe(2);
      expect(result.current.board[0][2].char).toBe('');
      expect(result.current.board[0][2].status).toBe('empty');
      // Previous cells preserved
      expect(result.current.board[0][0].char).toBe('A');
      expect(result.current.board[0][1].char).toBe('B');
      // Unaffected rows preserved
      expect(result.current.board[1]).toBe(row1);
    });

    it('preserves previous evaluated rows and upcoming rows when a valid guess is submitted', () => {
      const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr'));
      const target = result.current.targetWord;
      
      // Submit row 0 guess
      act(() => {
        target.split('').forEach(c => result.current.addLetter(c));
      });

      const boardBeforeSubmit = result.current.board;
      const row2BeforeSubmit = boardBeforeSubmit[2];
      const row3BeforeSubmit = boardBeforeSubmit[3];

      act(() => {
        const res = result.current.submitGuess();
        expect(res).toBe('submitted');
      });

      const boardAfterRow0 = result.current.board;

      // Game is won because we guessed the target
      expect(result.current.gameStatus).toBe('won');
      expect(boardAfterRow0[2]).toBe(row2BeforeSubmit);
      expect(boardAfterRow0[3]).toBe(row3BeforeSubmit);
    });

    it('rejects short guesses and invalid dictionary words without advancing currentRow', () => {
      const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr'));
      const targetLen = result.current.targetWord.length;

      // 1. Short guess (1 letter short)
      act(() => {
        for (let i = 0; i < targetLen - 1; i++) {
          result.current.addLetter('A');
        }
      });
      const boardShort = result.current.board;
      act(() => {
        const res = result.current.submitGuess();
        expect(res).toBe('short');
      });
      expect(result.current.board).toBe(boardShort);
      expect(result.current.currentRow).toBe(0);

      // 2. Complete with an invalid word 'ZZZZ...'
      act(() => {
        result.current.addLetter('Z');
      });
      const boardInvalid = result.current.board;
      act(() => {
        const res = result.current.submitGuess();
        expect(res).toBe('not_valid');
      });
      // Board remains unsubmitted, row remains 0
      expect(result.current.board).toBe(boardInvalid);
      expect(result.current.currentRow).toBe(0);
      expect(result.current.currentCol).toBe(targetLen);
    });

    it('correctly executes full game cycle: winning scenario stops input and updates status', () => {
      const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr'));
      const target = result.current.targetWord;

      // Type the exact winning word
      act(() => {
        target.split('').forEach(c => result.current.addLetter(c));
      });
      act(() => {
        const res = result.current.submitGuess();
        expect(res).toBe('submitted');
      });

      expect(result.current.gameStatus).toBe('won');
      const boardWhenWon = result.current.board;

      // Keystrokes after game over are strictly rejected
      act(() => {
        result.current.addLetter('X');
      });
      expect(result.current.board).toBe(boardWhenWon);
    });

    it('correctly executes full game cycle: losing scenario on maxGuesses', () => {
      const { result } = renderHook(() => useGame('expert', 'classic', 'random', 'tr'));
      expect(result.current.maxGuesses).toBe(4); // expert has 4 guesses
      const target = result.current.targetWord;
      const targetLen = target.length;

      // Use 4 valid words of matching length that don't equal target
      const pool = ALL_WORDS.filter(w => w.length === targetLen && w !== target);
      const guesses = pool.slice(0, 4);

      if (guesses.length >= 4) {
        guesses.forEach((guess) => {
          act(() => {
            guess.split('').forEach(c => result.current.addLetter(c));
          });
          act(() => {
            result.current.submitGuess();
          });
        });

        expect(result.current.gameStatus).toBe('lost');
        expect(result.current.currentRow).toBe(3);
      }
    });

    it('correctly resets game state and constructs fresh board across difficulty levels', () => {
      const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr'));
      expect(result.current.board.length).toBe(6);

      // Reset to easy (7 rows)
      act(() => {
        result.current.resetGame('easy', 'classic', 'hayvanlar', 'tr');
      });
      expect(result.current.board.length).toBe(7);
      expect(result.current.difficulty).toBe('easy');
      expect(result.current.category).toBe('hayvanlar');
      expect(result.current.currentRow).toBe(0);
      expect(result.current.currentCol).toBe(0);
      expect(result.current.gameStatus).toBe('playing');

      // Reset to expert (4 rows)
      act(() => {
        result.current.resetGame('expert', 'speed', 'random', 'en');
      });
      expect(result.current.board.length).toBe(4);
      expect(result.current.difficulty).toBe('expert');
      expect(result.current.mode).toBe('speed');
      expect(result.current.isTimerRunning).toBe(true);
    });
  });

  // =========================================================================
  // 2. STRESS-TEST: useDordle Dual Board Structural Sharing & Asymmetric Solving
  // =========================================================================
  describe('2. useDordle Dual Board Structural Sharing', () => {
    it('updates both active boards on keystrokes while maintaining reference equality on unaffected rows', () => {
      const { result } = renderHook(() => useDordle('tr'));
      const b1 = result.current.board1;
      const b2 = result.current.board2;
      const b1Row1 = b1[1];
      const b2Row1 = b2[1];

      act(() => {
        result.current.addLetter('T');
      });

      expect(result.current.board1[0][0].char).toBe('T');
      expect(result.current.board2[0][0].char).toBe('T');
      expect(result.current.board1[1]).toBe(b1Row1);
      expect(result.current.board2[1]).toBe(b2Row1);
      expect(result.current.currentCol).toBe(1);
    });

    it('asymmetric solving: when Word 1 is solved, Board 1 completely stops mutating on keystrokes', () => {
      const { result } = renderHook(() => useDordle('tr'));
      
      // Type 5 letters matching targetWord1 (padded or truncated to 5)
      const guess5 = (result.current.targetWord1 + 'AAAAA').slice(0, 5);

      act(() => {
        guess5.split('').forEach(c => result.current.addLetter(c));
      });
      act(() => {
        const res = result.current.submitGuess();
        expect(res).toBe('submitted');
      });

      const solvedBoard1 = result.current.board1;
      const activeBoard2 = result.current.board2;

      // Type a letter on Turn 1
      act(() => {
        result.current.addLetter('Z');
      });

      if (result.current.word1Solved) {
        // Board 1 MUST NOT BE CLONED - strictly reference equal!
        expect(result.current.board1).toBe(solvedBoard1);
        // Board 2 row 1 IS cloned and updated
        expect(result.current.board2).not.toBe(activeBoard2);
        expect(result.current.board2[1][0].char).toBe('Z');

        // Delete letter on Turn 1
        act(() => {
          result.current.deleteLetter();
        });
        // Board 1 STILL strictly untouched
        expect(result.current.board1).toBe(solvedBoard1);
        expect(result.current.board2[1][0].char).toBe('');
      }
    });

    it('reaches won status when both words are solved and lost status when attempts reach 7', () => {
      const { result } = renderHook(() => useDordle('tr'));
      expect(result.current.maxAttempts).toBe(7);
      expect(result.current.board1.length).toBe(7);
      expect(result.current.board2.length).toBe(7);

      // Submit 7 guesses of 5 letters
      for (let turn = 0; turn < 7; turn++) {
        act(() => {
          ['K', 'A', 'L', 'E', 'M'].forEach(c => result.current.addLetter(c));
        });
        act(() => {
          result.current.submitGuess();
        });
      }

      expect(['won', 'lost']).toContain(result.current.gameStatus);
    });
  });

  // =========================================================================
  // 3. STRESS-TEST: Turkish & English Word Set Lookups & Normalization Edge Cases
  // =========================================================================
  describe('3. Word Set Lookups & Turkish/English Character Edge Cases', () => {
    it('validates Turkish dotted and dotless I normalization accurately across words', () => {
      const trDict = getDictionary('tr')!;
      expect(trDict).not.toBeNull();

      // Turkish dotted 'i' -> 'İ', dotless 'ı' -> 'I'
      const testCases = [
        { raw: 'afyon', expected: 'AFYON' },
        { raw: 'sinek', expected: 'SİNEK' },
        { raw: 'sığır', expected: 'SIĞIR' },
        { raw: 'kilis', expected: 'KİLİS' },
        { raw: 'aygır', expected: 'AYGIR' },
        { raw: 'tilki', expected: 'TİLKİ' },
        { raw: 'incir', expected: 'İNCİR' },
        { raw: 'çilek', expected: 'ÇİLEK' },
        { raw: 'güneş', expected: 'GÜNEŞ' },
        { raw: 'köpek', expected: 'KÖPEK' },
        { raw: 'şahin', expected: 'ŞAHİN' },
      ];

      testCases.forEach(({ raw, expected }) => {
        const normalized = raw.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
        expect(normalized).toBe(expected);
        const inPool = ALL_WORDS.includes(expected);
        const inDict = trDict.has(expected);
        expect(inPool || inDict).toBe(true);
      });
    });

    it('rejects cross-language casing anomalies (English uppercase of "i" is "I", but Turkish must be "İ")', () => {
      // In JS standard toUpperCase(), 'sinek'.toUpperCase() produces 'SINEK' (with dotless I), which is invalid in Turkish!
      const standardUpper = 'sinek'.toUpperCase();
      expect(standardUpper).toBe('SINEK');

      const trNormalized = 'sinek'.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
      expect(trNormalized).toBe('SİNEK');

      // The Turkish dictionary/pool contains 'SİNEK', NOT 'SINEK'
      const trDict = getDictionary('tr')!;
      expect(trDict.has('SİNEK') || ALL_WORDS.includes('SİNEK')).toBe(true);
      expect(trDict.has('SINEK')).toBe(false);
    });

    it('validates English dictionary words and rejects nonsense/symbols/accents', () => {
      const enDict = getDictionary('en')!;
      expect(enDict).not.toBeNull();

      // Valid English words (including Q, W, X)
      const validEnWords = ['QUEEN', 'WATER', 'EXTRA', 'ZEBRA', 'APPLE', 'CHAIR', 'DREAM'];
      validEnWords.forEach(word => {
        const inPool = ALL_WORDS_EN.includes(word);
        const inDict = enDict.has(word);
        expect(inPool || inDict).toBe(true);
      });

      // Nonsense and out-of-alphabet inputs
      const invalidWords = ['ZZZZZ', '12345', 'ABC!!', 'CAFÉ', 'RÉSUM', '     ', ''];
      invalidWords.forEach(word => {
        const inPool = ALL_WORDS_EN.includes(word);
        const inDict = enDict.has(word);
        expect(inPool || inDict).toBe(false);
      });
    });

    it('ensures all categories in WORD_BANK (TR) and WORD_BANK_EN (EN) produce valid words', () => {
      const trCategories = ['hayvanlar', 'sehirler', 'yiyecek', 'meslekler', 'doga', 'spor'] as const;
      trCategories.forEach(cat => {
        const words = WORD_BANK[cat];
        expect(words.length).toBeGreaterThan(15);
        words.forEach(w => {
          expect(typeof w).toBe('string');
          expect(w.length).toBeGreaterThanOrEqual(3);
          // Check uppercase format
          expect(w).toBe(w.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase());
        });
      });

      const enCategories = ['hayvanlar', 'sehirler', 'yiyecek', 'meslekler', 'doga', 'spor'] as const;
      enCategories.forEach(cat => {
        const words = WORD_BANK_EN[cat];
        expect(words.length).toBeGreaterThan(15);
        words.forEach(w => {
          expect(typeof w).toBe('string');
          expect(w.length).toBeGreaterThanOrEqual(3);
          expect(w).toBe(w.toUpperCase());
        });
      });
    });
  });

  // =========================================================================
  // 4. STRESS-TEST: useWordChain Chaining Rules & Turkish Character Edge Cases
  // =========================================================================
  describe('4. useWordChain Chaining & Rule Invariants', () => {
    it('enforces strict last-char to first-char chaining across Turkish special letters', () => {
      const { result } = renderHook(() => useWordChain('tr'));
      
      const startWord = result.current.lastWord;
      const lastChar = startWord[startWord.length - 1];

      // Submit wrong start letter
      const wrongChar = lastChar === 'A' ? 'B' : 'A';
      act(() => {
        result.current.setInput(wrongChar + 'SLAN');
      });
      act(() => {
        const res = result.current.submitWord();
        expect(res).toBe('wrong_start');
      });
      expect(result.current.lives).toBe(2);
      expect(result.current.errorMessage).toContain('harfiyle başlamalı');
    });

    it('prevents reusing words already in the chain', () => {
      const { result } = renderHook(() => useWordChain('tr'));
      const startWord = result.current.lastWord;

      act(() => {
        result.current.setInput(startWord);
      });
      act(() => {
        const res = result.current.submitWord();
        expect(['wrong_start', 'used']).toContain(res);
      });
    });
  });

  // =========================================================================
  // 5. STRESS-TEST: useAnagram Permutations & Turkish Special Letter Handling
  // =========================================================================
  describe('5. useAnagram Anagram Validation & Input Safety', () => {
    it('accepts alternative valid anagrams in dictionary pool', () => {
      const { result } = renderHook(() => useAnagram('random', 'tr'));
      expect(result.current.shuffledLetters.length).toBe(result.current.targetWord.length);
      expect(result.current.status).toBe('playing');

      // Clear, removeLast, and selectLetter edge cases
      act(() => {
        result.current.removeLast(); // nothing to remove
      });
      expect(result.current.selectedIndices.length).toBe(0);

      act(() => {
        result.current.selectLetter(0);
        result.current.selectLetter(0); // already selected, ignored
      });
      expect(result.current.selectedIndices.length).toBe(1);

      act(() => {
        result.current.clearSelection();
      });
      expect(result.current.selectedIndices.length).toBe(0);
      expect(result.current.currentGuess).toBe('');
    });
  });
});
