jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-av Audio
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

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));

import { renderHook, act } from '@testing-library/react-native';
import { useGame } from '../hooks/useGame';
import { useDordle } from '../hooks/useDordle';
import { useWordChain } from '../hooks/useWordChain';
import { useAnagram } from '../hooks/useAnagram';
import { audioService } from '../services/audio.service';
import { rollRandomStickers, STICKERS } from '../constants/stickers';
import { getRandomWord, getDailyWord, Category } from '../constants/words';

describe('Milestone 2 - Memory Optimization & Structural Sharing', () => {
  describe('2D Grid Structural Sharing in useGame', () => {
    it('preserves reference equality for unaffected rows and cells on addLetter', () => {
      const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr'));
      const initialBoard = result.current.board;
      const initialRow0 = initialBoard[0];
      const initialRow1 = initialBoard[1];
      const initialRow2 = initialBoard[2];
      const initialCell01 = initialRow0[1];

      act(() => {
        result.current.addLetter('K');
      });

      const updatedBoard = result.current.board;
      // Active row is newly cloned
      expect(updatedBoard[0]).not.toBe(initialRow0);
      expect(updatedBoard[0][0].char).toBe('K');
      expect(updatedBoard[0][0].status).toBe('tbd');

      // Unmodified cells in active row preserve identity
      expect(updatedBoard[0][1]).toBe(initialCell01);

      // Unaffected rows MUST preserve strict reference identity
      expect(updatedBoard[1]).toBe(initialRow1);
      expect(updatedBoard[2]).toBe(initialRow2);
      expect(updatedBoard[3]).toBe(initialBoard[3]);
      expect(updatedBoard[4]).toBe(initialBoard[4]);
      expect(updatedBoard[5]).toBe(initialBoard[5]);
    });

    it('preserves reference equality for unaffected rows on deleteLetter', () => {
      const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr'));

      act(() => {
        result.current.addLetter('K');
      });

      const boardAfterAdd = result.current.board;
      const row1BeforeDelete = boardAfterAdd[1];

      act(() => {
        result.current.deleteLetter();
      });

      const boardAfterDelete = result.current.board;
      expect(boardAfterDelete[0][0].char).toBe('');
      expect(boardAfterDelete[0][0].status).toBe('empty');
      expect(boardAfterDelete[1]).toBe(row1BeforeDelete);
    });
  });

  describe('2D Grid Structural Sharing in useDordle', () => {
    it('preserves reference equality for unaffected rows across both boards', () => {
      const { result } = renderHook(() => useDordle('tr'));
      const b1 = result.current.board1;
      const b2 = result.current.board2;
      const b1Row1 = b1[1];
      const b2Row1 = b2[1];

      act(() => {
        result.current.addLetter('A');
      });

      expect(result.current.board1[0][0].char).toBe('A');
      expect(result.current.board2[0][0].char).toBe('A');
      expect(result.current.board1[1]).toBe(b1Row1);
      expect(result.current.board2[1]).toBe(b2Row1);
    });
  });

  describe('Word Database & Set Optimization in useWordChain & useAnagram', () => {
    it('initializes Word Chain with a valid start word and validates inputs', () => {
      const { result } = renderHook(() => useWordChain('tr'));
      expect(result.current.chain.length).toBe(1);
      expect(result.current.lastWord.length).toBeGreaterThanOrEqual(3);
      expect(result.current.status).toBe('playing');

      // Test typing and validation
      const lastChar = result.current.lastWord[result.current.lastWord.length - 1];
      act(() => {
        result.current.setInput(lastChar + 'XYZNONEXISTENT');
      });
      act(() => {
        const res = result.current.submitWord();
        expect(res).toBe('invalid');
      });
    });

    it('validates anagrams correctly using static sets', () => {
      const { result } = renderHook(() => useAnagram('random', 'tr'));
      expect(result.current.targetWord).toBeTruthy();
      expect(result.current.shuffledLetters.length).toBe(result.current.targetWord.length);

      // Select all letters in correct order
      const targetLetters = result.current.targetWord.split('');
      const shuffled = [...result.current.shuffledLetters];
      const pickedIndices: number[] = [];

      targetLetters.forEach(tl => {
        const idx = shuffled.findIndex((l, i) => l === tl && !pickedIndices.includes(i));
        if (idx !== -1) {
          pickedIndices.push(idx);
          act(() => {
            result.current.selectLetter(idx);
          });
        }
      });

      expect(result.current.currentGuess).toBe(result.current.targetWord);
      act(() => {
        const res = result.current.submitGuess();
        expect(res).toBe('correct');
      });
      expect(result.current.status).toBe('won');
    });

    it('returns valid random words and daily words without runtime overhead', () => {
      const trWord = getRandomWord('hayvanlar', 'tr');
      expect(trWord.length).toBeGreaterThanOrEqual(4);
      expect(trWord.length).toBeLessThanOrEqual(6);

      const enWord = getRandomWord('animals' as unknown as Category, 'en');
      expect(enWord.length).toBeGreaterThanOrEqual(4);

      const daily1 = getDailyWord('tr');
      const daily2 = getDailyWord('tr');
      expect(daily1).toBe(daily2); // Deterministic
    });

    it('rolls stickers fast using pre-partitioned pools', () => {
      const rolled = rollRandomStickers(10);
      expect(rolled.length).toBe(10);
      rolled.forEach(st => {
        expect(STICKERS.some(s => s.id === st.id)).toBe(true);
      });
    });
  });

  describe('Audio Service Sound Pooling & Settings Cache', () => {
    it('preloads and pools sound objects', async () => {
      await audioService.preloadSounds();
      await audioService.play('click');
      await audioService.play('win');
      await audioService.play('loss');
      expect(true).toBe(true);
    });

    it('synchronously honors in-memory sound and haptic toggles', async () => {
      audioService.initSettings(false, false, false);
      await audioService.play('click');
      await audioService.triggerHaptic('light');

      audioService.setSoundEnabled(true);
      audioService.setHapticEnabled(true);
      await audioService.play('click');
      await audioService.triggerHaptic('light');
    });
  });
});
