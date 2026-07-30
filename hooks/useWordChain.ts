import { useState, useCallback } from 'react';
import { ALL_WORDS } from '../constants/words';

export interface WordChainState {
  chain: string[];
  currentInput: string;
  score: number;
  lives: number;
  maxLives: number;
  status: 'playing' | 'won' | 'lost';
  errorMessage: string;
  lastWord: string;
}

const VALID_WORDS = new Set(ALL_WORDS.map(w => w.toUpperCase().replace(/\s/g, '')).filter(w => w.length >= 3));

export function useWordChain() {
  const getStartWord = (): string => {
    const words = Array.from(VALID_WORDS);
    return words[Math.floor(Math.random() * words.length)];
  };

  const [state, setState] = useState<WordChainState>(() => {
    const start = getStartWord();
    return {
      chain: [start],
      currentInput: '',
      score: 0,
      lives: 3,
      maxLives: 3,
      status: 'playing',
      errorMessage: '',
      lastWord: start,
    };
  });

  const setInput = useCallback((text: string) => {
    setState(prev => ({ ...prev, currentInput: text.toUpperCase() }));
  }, []);

  const submitWord = useCallback((): 'ok' | 'invalid' | 'used' | 'wrong_start' => {
    const word = state.currentInput.trim().toUpperCase();
    const lastWord = state.lastWord;
    const lastChar = lastWord[lastWord.length - 1];

    if (!word.startsWith(lastChar)) {
      setState(prev => ({
        ...prev,
        lives: prev.lives - 1,
        errorMessage: `'${lastChar}' harfiyle başlamalı!`,
        currentInput: '',
        status: prev.lives - 1 <= 0 ? 'lost' : 'playing',
      }));
      return 'wrong_start';
    }
    if (state.chain.includes(word)) {
      setState(prev => ({
        ...prev,
        lives: prev.lives - 1,
        errorMessage: 'Bu kelime zaten kullanıldı!',
        currentInput: '',
        status: prev.lives - 1 <= 0 ? 'lost' : 'playing',
      }));
      return 'used';
    }
    if (!VALID_WORDS.has(word)) {
      setState(prev => ({
        ...prev,
        lives: prev.lives - 1,
        errorMessage: 'Geçersiz kelime!',
        currentInput: '',
        status: prev.lives - 1 <= 0 ? 'lost' : 'playing',
      }));
      return 'invalid';
    }

    setState(prev => ({
      ...prev,
      chain: [...prev.chain, word],
      currentInput: '',
      score: prev.score + word.length * 10,
      lastWord: word,
      errorMessage: '',
    }));
    return 'ok';
  }, [state]);

  const reset = useCallback(() => {
    const start = getStartWord();
    setState({
      chain: [start],
      currentInput: '',
      score: 0,
      lives: 3,
      maxLives: 3,
      status: 'playing',
      errorMessage: '',
      lastWord: start,
    });
  }, []);

  return { ...state, setInput, submitWord, reset };
}
