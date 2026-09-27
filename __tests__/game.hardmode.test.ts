import { renderHook, act } from '@testing-library/react-native';
import { useGame } from '../hooks/useGame';

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
  getDictionary: jest.fn(() => new Set(['KALEM', 'KITAP', 'ASLAN', 'ZEBRA', 'KOLON', 'KABAK', 'BALIK', 'KOYUN'])),
}));

type GameHook = ReturnType<typeof useGame>;

function guess(res: { current: GameHook }, word: string): string {
  for (const ch of word) {
    act(() => { res.current.addLetter(ch); });
  }
  let out = '';
  act(() => { out = res.current.submitGuess(); });
  return out;
}

describe('useGame - hard mode kuralları', () => {
  it('açılan doğru harfi farklı konuma koyan tahmini reddeder', () => {
    const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr', true));

    expect(guess(result, 'KITAP')).toBe('submitted'); // K doğru(0), A sarı
    expect(result.current.revealedLetters['K']).toBe('correct');
    expect(result.current.revealedLetters['A']).toBe('present');

    expect(guess(result, 'ASLAN')).toBe('hard_mode'); // pos0 K değil
    expect(result.current.currentRow).toBe(1);
  });

  it('sarı (present) harfi atlayan tahmini reddeder', () => {
    const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr', true));

    expect(guess(result, 'KITAP')).toBe('submitted');
    expect(guess(result, 'KOLON')).toBe('hard_mode'); // K doğru ama A yok
  });

  it('kurallara uyan tahmini kabul eder', () => {
    const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr', true));

    expect(guess(result, 'KITAP')).toBe('submitted');
    expect(guess(result, 'KABAK')).toBe('submitted'); // K korunur + A içerir
    expect(result.current.currentRow).toBe(2);
  });

  it('hard mode kapalıyken doğru harfi taşımayan tahmin kabul edilir', () => {
    const { result } = renderHook(() => useGame('normal', 'classic', 'random', 'tr', false));

    expect(guess(result, 'KITAP')).toBe('submitted');
    expect(guess(result, 'ASLAN')).toBe('submitted');
  });
});
