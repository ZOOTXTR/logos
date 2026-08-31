import { useState, useCallback } from 'react';
import { getRandomWord, Category, ALL_WORDS, ALL_WORDS_EN } from '../constants/words';
import { toTurkishUpper } from '../utils/turkish';

export type AnagramStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface AnagramState {
  targetWord: string;
  shuffledLetters: string[];
  selectedIndices: number[];
  currentGuess: string;
  attempts: number;
  maxAttempts: number;
  status: AnagramStatus;
  hintsUsed: number;
}

const VALID_WORDS_TR_SET = new Set(ALL_WORDS.map(w => toTurkishUpper(w).replace(/\s/g, '')));
const VALID_WORDS_EN_SET = new Set(ALL_WORDS_EN.map(w => w.toUpperCase().replace(/\s/g, '')));

const shuffle = (arr: string[]): string[] => {
  if (arr.length <= 1) return [...arr];
  const a = [...arr];
  for (let attempt = 0; attempt < 5; attempt++) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.join('') !== arr.join('')) return a;
  }
  return a; // Return best effort if all chars identical
};

export function useAnagram(category: Category = 'random', lang: 'tr' | 'en' = 'tr') {
  const [state, setState] = useState<AnagramState>(() => {
    const word = getRandomWord(category, lang);
    return {
      targetWord: word,
      shuffledLetters: shuffle(word.split('')),
      selectedIndices: [],
      currentGuess: '',
      attempts: 0,
      maxAttempts: 5,
      status: 'playing',
      hintsUsed: 0,
    };
  });

  const selectLetter = useCallback((index: number) => {
    setState(prev => {
      if (prev.selectedIndices.includes(index)) return prev;
      if (prev.currentGuess.length >= prev.targetWord.length) return prev;
      return {
        ...prev,
        selectedIndices: [...prev.selectedIndices, index],
        currentGuess: prev.currentGuess + prev.shuffledLetters[index],
      };
    });
  }, []);

  const removeLast = useCallback(() => {
    setState(prev => {
      if (prev.selectedIndices.length === 0) return prev;
      return {
        ...prev,
        selectedIndices: prev.selectedIndices.slice(0, -1),
        currentGuess: prev.currentGuess.slice(0, -1),
      };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedIndices: [], currentGuess: '' }));
  }, []);

  const submitGuess = useCallback((): 'correct' | 'wrong' | 'gameover' => {
    const guess = state.currentGuess;
    const target = state.targetWord;

    let isCorrect = guess === target;
    if (!isCorrect && guess.length === target.length) {
      const sortedGuess = guess.split('').sort().join('');
      const sortedTarget = target.split('').sort().join('');
      if (sortedGuess === sortedTarget) {
        const poolSet = lang === 'en' ? VALID_WORDS_EN_SET : VALID_WORDS_TR_SET;
        isCorrect = poolSet.has(guess);
      }
    }

    const result = isCorrect ? 'correct' : 'wrong';
    const newAttempts = state.attempts + 1;
    const won = result === 'correct';
    const lost = !won && newAttempts >= state.maxAttempts;

    setState(prev => ({
      ...prev,
      attempts: newAttempts,
      status: won ? 'won' : lost ? 'lost' : 'playing',
      selectedIndices: won ? prev.selectedIndices : [],
      currentGuess: won ? prev.currentGuess : '',
    }));

    return won ? 'correct' : lost ? 'gameover' : 'wrong';
  }, [state, lang]);

  const useHint = useCallback((): string => {
    setState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    return lang === 'en' 
      ? `First letter: ${state.targetWord[0]}, Last letter: ${state.targetWord[state.targetWord.length - 1]}`
      : `İlk harf: ${state.targetWord[0]}, Son harf: ${state.targetWord[state.targetWord.length - 1]}`;
  }, [state.targetWord, lang]);

  const reset = useCallback((newCategory?: Category, newLang?: 'tr' | 'en') => {
    const activeLang = newLang ?? lang;
    const word = getRandomWord(newCategory ?? category, activeLang);
    setState({
      targetWord: word,
      shuffledLetters: shuffle(word.split('')),
      selectedIndices: [],
      currentGuess: '',
      attempts: 0,
      maxAttempts: 5,
      status: 'playing',
      hintsUsed: 0,
    });
  }, [category, lang]);

  return { ...state, selectLetter, removeLast, clearSelection, submitGuess, useHint, reset };
}
