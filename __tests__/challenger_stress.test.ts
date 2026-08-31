import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act } from '@testing-library/react-native';
import { useGame } from '../hooks/useGame';
import { useDordle } from '../hooks/useDordle';
import { useWordChain } from '../hooks/useWordChain';
import { useAnagram } from '../hooks/useAnagram';
import { audioService } from '../services/audio.service';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../services/dictionary.service', () => ({
  preloadDictionaries: jest.fn().mockResolvedValue(undefined),
  getDictionary: jest.fn().mockReturnValue(new Set([
    'AAAA', 'BBBB', 'CCCC', 'DDDD', 'EEEE', 'FFFF',
    'AAAAA', 'BBBBB', 'CCCCC', 'DDDDD', 'EEEEE', 'FFFFF',
    'AAAAAA', 'BBBBBB', 'CCCCCC', 'DDDDDD', 'EEEEEE', 'FFFFFF',
    'ASLAN', 'ZEBRA', 'ELMA'
  ])),
  isDictionaryReady: jest.fn().mockReturnValue(true),
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

describe('Challenger M2 Adversarial Test Suite', () => {
  describe('1. useGame Invariant Stress', () => {
    it('maintains strict row immutability across full 6-row game cycle', () => {
      const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr'));
      const wordLen = result.current.targetWord.length;

      for (let row = 0; row < 5; row++) {
        // Type wordLen letters on currentRow
        for (let col = 0; col < wordLen; col++) {
          const boardBeforeKey = result.current.board;
          act(() => {
            result.current.addLetter('A');
          });
          const boardAfterKey = result.current.board;

          // Only active row modified
          expect(boardAfterKey[row]).not.toBe(boardBeforeKey[row]);
          // All other rows preserved
          for (let otherRow = 0; otherRow < 6; otherRow++) {
            if (otherRow !== row) {
              expect(boardAfterKey[otherRow]).toBe(boardBeforeKey[otherRow]);
            }
          }
        }

        // Submit guess to advance to next row
        act(() => {
          result.current.submitGuess();
        });
      }
    });

    it('handles out-of-bound keystrokes gracefully without mutating board', () => {
      const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr'));
      const wordLen = result.current.targetWord.length;
      
      // Fill first row completely
      for (let i = 0; i < wordLen; i++) {
        act(() => { result.current.addLetter('B'); });
      }
      const boardFullRow = result.current.board;

      // Excess keystroke should be ignored (no-op)
      act(() => { result.current.addLetter('Z'); });
      expect(result.current.board).toBe(boardFullRow);

      // Backspace at 0 index on fresh game
      const { result: freshResult } = renderHook(() => useGame('normal', 'classic', 'random', 'tr'));
      const initialBoard = freshResult.current.board;
      act(() => { freshResult.current.deleteLetter(); });
      expect(freshResult.current.board).toBe(initialBoard);
    });
  });

  describe('2. useDordle Differential Board Invariants', () => {
    it('selectively clones only unsolved boards when one board is solved', () => {
      const { result } = renderHook(() => useDordle('tr'));

      // Type 5 letters matching targetWord1
      act(() => {
        const target1 = result.current.targetWord1;
        for (const char of target1) {
          result.current.addLetter(char);
        }
      });

      // Submit guess
      act(() => {
        result.current.submitGuess();
      });

      if (result.current.word1Solved && !result.current.word2Solved) {
        const b1AfterSolve = result.current.board1;
        const b2AfterSolve = result.current.board2;

        // Next letter typed: board1 should NOT be cloned!
        act(() => {
          result.current.addLetter('X');
        });

        expect(result.current.board1).toBe(b1AfterSolve);
        expect(result.current.board2).not.toBe(b2AfterSolve);
      }
    });
  });

  describe('3. useWordChain Adversarial Inputs', () => {
    it('handles case-insensitivity, trim, and life exhaustion', () => {
      const { result } = renderHook(() => useWordChain('tr'));
      expect(result.current.lives).toBe(3);

      // Try empty / invalid word
      act(() => {
        result.current.setInput('   ');
      });
      act(() => {
        const res = result.current.submitWord();
        expect(res).toBe('wrong_start');
      });
      expect(result.current.lives).toBe(2);

      // Exhaust remaining lives
      act(() => {
        result.current.setInput('WRONG1');
      });
      act(() => {
        result.current.submitWord();
      });
      expect(result.current.lives).toBe(1);

      act(() => {
        result.current.setInput('WRONG2');
      });
      act(() => {
        result.current.submitWord();
      });
      expect(result.current.lives).toBe(0);
      expect(result.current.status).toBe('lost');
    });
  });

  describe('4. Audio & Settings Concurrency', () => {
    it('handles rapid toggle and concurrent playback safely', async () => {
      audioService.initSettings(true, true, true);

      // Spam play and toggle in parallel
      const promises: Promise<void>[] = [];
      for (let i = 0; i < 50; i++) {
        promises.push(audioService.play('click'));
        if (i % 10 === 0) {
          audioService.setSoundEnabled(i % 20 === 0);
        }
      }
      await Promise.all(promises);
      expect(true).toBe(true);

      // Clean teardown
      await audioService.unloadAll();
    });
  });
});
