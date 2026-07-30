import { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getRandomWord, Category, WORD_LENGTH, DIFFICULTY_MAX_GUESSES } from '../constants/words';

export interface BlitzState {
  currentWord: string;
  guess: string;
  score: number;
  streak: number;
  timeLeft: number;
  status: 'playing' | 'ended';
  wordsAnswered: number;
  wordsSolved: number;
  history: Array<{ word: string; solved: boolean; guesses: number }>;
}

const BLITZ_TIME = 60;

export function useBlitz(category: Category = 'random') {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backgroundTimeRef = useRef<number>(0);

  const cleanupTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    cleanupTimer();
    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeLeft <= 1) {
          cleanupTimer();
          return { ...prev, timeLeft: 0, status: 'ended' };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  const [state, setState] = useState<BlitzState>({
    currentWord: getRandomWord(category),
    guess: '',
    score: 0,
    streak: 0,
    timeLeft: BLITZ_TIME,
    status: 'playing',
    wordsAnswered: 0,
    wordsSolved: 0,
    history: [],
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    startTimer();

    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const elapsed = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
        if (elapsed > 0 && backgroundTimeRef.current > 0) {
          setState(prev => {
            if (prev.status !== 'playing') return prev;
            const remaining = prev.timeLeft - elapsed;
            if (remaining <= 0) {
              cleanupTimer();
              return { ...prev, timeLeft: 0, status: 'ended' };
            }
            return { ...prev, timeLeft: remaining };
          });
        }
        startTimer();
      } else if (nextState.match(/inactive|background/)) {
        backgroundTimeRef.current = Date.now();
        cleanupTimer();
      }
    });

    return () => {
      cleanupTimer();
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
    setState(prev => ({ ...prev, guess: prev.guess.slice(0, -1) }));
  }, []);

  const submitGuess = useCallback((): 'short' | 'correct' | 'wrong' => {
    const s = stateRef.current;
    if (s.guess.length < WORD_LENGTH) return 'short';
    const correct = s.guess === s.currentWord;
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
        currentWord: getRandomWord(category),
        guess: '',
        timeLeft: correct ? Math.min(prev.timeLeft + 5, BLITZ_TIME) : prev.timeLeft,
        history: [...prev.history, { word: prev.currentWord, solved: correct, guesses: 1 }],
      };
    });
    return correct ? 'correct' : 'wrong';
  }, [category]);

  const skip = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentWord: getRandomWord(category),
      guess: '',
      streak: 0,
      wordsAnswered: prev.wordsAnswered + 1,
      history: [...prev.history, { word: prev.currentWord, solved: false, guesses: 0 }],
      timeLeft: Math.max(prev.timeLeft - 5, 1),
    }));
  }, [category]);

  const reset = useCallback(() => {
    cleanupTimer();
    backgroundTimeRef.current = 0;
    setState({
      currentWord: getRandomWord(category),
      guess: '',
      score: 0,
      streak: 0,
      timeLeft: BLITZ_TIME,
      status: 'playing',
      wordsAnswered: 0,
      wordsSolved: 0,
      history: [],
    });
    startTimer();
  }, [category]);

  return { ...state, addLetter, deleteLetter, submitGuess, skip, reset };
}
