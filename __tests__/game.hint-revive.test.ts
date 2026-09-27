import { renderHook, act } from '@testing-library/react-native';
import { useGame } from '../hooks/useGame';

const TARGET = 'KALEM';

jest.mock('../constants/words', () => {
  const actual = jest.requireActual('../constants/words');
  return {
    ...actual,
    getRandomWord: jest.fn(() => 'KALEM'),
    getDailyWord: jest.fn(() => 'KALEM'),
  };
});

jest.mock('../services/dictionary.service', () => ({
  preloadDictionaries: jest.fn(async () => {}),
  isDictionaryReady: jest.fn(() => true),
  getDictionary: jest.fn(() => new Set(['KALEM', 'ASLAN', 'ZEBRA', 'BALIK', 'KOYUN'])),
}));

describe('useGame - kalıcı ipucu (hint)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('ipucu harfini tahtaya kalıcı yerleştirir (sadece overlay değil)', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr', false));

    expect(result.current.targetWord).toBe(TARGET);

    let hint: string | null = null;
    act(() => { hint = result.current.useHint('tr'); });

    // Math.random 0 → ilk bilinmeyen konum (0) seçilir.
    expect(result.current.board[0][0].char).toBe(TARGET[0]);
    expect(result.current.board[0][0].status).toBe('tbd');
    expect(result.current.currentCol).toBe(1);
    expect(result.current.hintsUsed).toBe(1);
    expect(result.current.revealedCells[0]).toBe(TARGET[0]);
    expect(hint).toContain('1. harf');
  });

  it('İngilizce için doğru ipucu mesajı döner', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'en', false));

    let hint: string | null = null;
    act(() => { hint = result.current.useHint('en'); });

    expect(hint).toBe('Letter 1: K');
  });
});

describe('useGame - ikinci şans (revive)', () => {
  it('kayıptan sonra aynı kelimeye +1 satır ekler ve oyunu sürdürür', () => {
    const { result } = renderHook(() => useGame('expert', 'classic', 'random', 'tr', false));

    const startLen = result.current.board.length;
    expect(startLen).toBe(4);
    expect(result.current.maxGuesses).toBe(4);

    const guesses = ['ASLAN', 'ZEBRA', 'BALIK', 'KOYUN'];
    for (let r = 0; r < startLen; r++) {
      for (const ch of guesses[r]) {
        act(() => { result.current.addLetter(ch); });
      }
      act(() => { result.current.submitGuess(); });
    }

    expect(result.current.gameStatus).toBe('lost');
    const lenBefore = result.current.board.length;
    const wordBefore = result.current.targetWord;

    act(() => { result.current.revive(); });

    expect(result.current.gameStatus).toBe('playing');
    expect(result.current.board.length).toBe(lenBefore + 1);
    expect(result.current.currentRow).toBe(lenBefore);
    expect(result.current.currentCol).toBe(0);
    expect(result.current.targetWord).toBe(wordBefore);
  });

  it('oyun oynanırken revive hiçbir şey yapmaz', () => {
    const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr', false));
    const lenBefore = result.current.board.length;

    act(() => { result.current.revive(); });

    expect(result.current.board.length).toBe(lenBefore);
    expect(result.current.gameStatus).toBe('playing');
  });
});
