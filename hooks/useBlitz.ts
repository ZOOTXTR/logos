import { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getRandomWord, Category, WORD_LENGTH, ALL_WORDS, ALL_WORDS_EN } from '../constants/words';
import { getDictionary } from '../services/dictionary.service';

export interface BlitzState {
  currentWord: string;
  guess: string;
  score: number;
  streak: number;
  endTime: number;
  status: 'playing' | 'ended';
  wordsAnswered: number;
  wordsSolved: number;
  history: Array<{ word: string; solved: boolean; guesses: number }>;
}

const BLITZ_TIME = 60;

export function useBlitz(category: Category = 'random', language: 'tr' | 'en' = 'tr') {
  const backgroundTimeRef = useRef<number>(0);

  const [state, setState] = useState<BlitzState>(() => ({
    currentWord: getRandomWord(category, language),
    guess: '',
    score: 0,
    streak: 0,
    endTime: Date.now() + BLITZ_TIME * 1000,
    status: 'playing',
    wordsAnswered: 0,
    wordsSolved: 0,
    history: [],
  }));
  const stateRef = useRef(state);
  stateRef.current = state;

  const onTimeUp = useCallback(() => {
    setState(prev => (prev.status === 'playing' ? { ...prev, status: 'ended' } : prev));
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        if (backgroundTimeRef.current > 0) {
          setState(prev => {
            if (prev.status !== 'playing') return prev;
            if (prev.endTime <= Date.now()) {
              return { ...prev, status: 'ended' };
            }
            return prev;
          });
        }
      } else if (nextState.match(/inactive|background/)) {
        backgroundTimeRef.current = Date.now();
      }
    });

    return () => {
      sub.remove();
    };
  }, []);

  const addLetter = useCallback((letter: string) => {
    setState(prev => {
      if (prev.status !== 'playing') return prev;
      if (prev.guess.length >= WORD_LENGTH) return prev;
      return { ...prev, guess: prev.guess + letter };
    });
  }, []);

  const deleteLetter = useCallback(() => {
    setState(prev => {
      if (prev.status !== 'playing') return prev;
      return { ...prev, guess: prev.guess.slice(0, -1) };
    });
  }, []);

  const submitGuess = useCallback((): 'short' | 'correct' | 'wrong' => {
    const s = stateRef.current;
    if (s.status !== 'playing') return 'wrong';
    if (s.guess.length < WORD_LENGTH) return 'short';

    const rawGuess = s.guess;
    const guess = language === 'tr'
      ? rawGuess.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase()
      : rawGuess.toUpperCase();

    const dictionary = getDictionary(language);
    const targetPool = language === 'en' ? ALL_WORDS_EN : ALL_WORDS;
    const isValidWord = (dictionary && dictionary.has(guess)) || targetPool.includes(guess);
    const alreadyUsed = s.history.some(h => h.word === guess && h.solved);
    // Doğruluk hedef kelimeyle karşılaştırılır; sadece sözlükte var olmak yetmez.
    const correct = isValidWord && !alreadyUsed && guess === s.currentWord;

    setState(prev => {
      const newStreak = correct ? prev.streak + 1 : 0;
      const bonus = correct ? (newStreak >= 5 ? 100 : newStreak >= 3 ? 50 : 0) : 0;
      const baseScore = correct ? prev.currentWord.length * 20 : 0;
      return {
        ...prev,
        score: prev.score + baseScore + bonus,
        streak: newStreak,
        wordsAnswered: prev.wordsAnswered + 1,
        wordsSolved: prev.wordsSolved + (correct ? 1 : 0),
        currentWord: getRandomWord(category, language),
        guess: '',
        endTime: correct ? Math.min(prev.endTime + 5000, Date.now() + BLITZ_TIME * 1000) : prev.endTime,
        history: [...prev.history, { word: guess, solved: correct, guesses: 1 }],
      };
    });
    return correct ? 'correct' : 'wrong';
  }, [category, language]);

  const skip = useCallback(() => {
    setState(prev => {
      if (prev.status !== 'playing') return prev;
      return {
        ...prev,
        currentWord: getRandomWord(category, language),
        guess: '',
        streak: 0,
        wordsAnswered: prev.wordsAnswered + 1,
        history: [...prev.history, { word: prev.currentWord, solved: false, guesses: 0 }],
        endTime: Math.max(prev.endTime - 5000, Date.now() + 1000),
      };
    });
  }, [category, language]);

  const reset = useCallback(() => {
    backgroundTimeRef.current = 0;
    setState({
      currentWord: getRandomWord(category, language),
      guess: '',
      score: 0,
      streak: 0,
      endTime: Date.now() + BLITZ_TIME * 1000,
      status: 'playing',
      wordsAnswered: 0,
      wordsSolved: 0,
      history: [],
    });
  }, [category, language]);

  return { ...state, addLetter, deleteLetter, submitGuess, skip, reset, onTimeUp };
}
