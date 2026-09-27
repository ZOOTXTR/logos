import { useState, useCallback } from 'react';
import { ALL_WORDS, ALL_WORDS_EN } from '../constants/words';
import { toTurkishUpper } from '../utils/turkish';

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

const VALID_WORDS_TR_ARRAY = ALL_WORDS.map(w => toTurkishUpper(w).replace(/\s/g, '')).filter(w => w.length >= 3);
const VALID_WORDS_EN_ARRAY = ALL_WORDS_EN.map(w => w.toUpperCase().replace(/\s/g, '')).filter(w => w.length >= 3);

const VALID_WORDS_TR = new Set(VALID_WORDS_TR_ARRAY);
const VALID_WORDS_EN = new Set(VALID_WORDS_EN_ARRAY);

const getRandomStartWord = (lang: 'tr' | 'en'): string => {
  const words = lang === 'en' ? VALID_WORDS_EN_ARRAY : VALID_WORDS_TR_ARRAY;
  return words[Math.floor(Math.random() * words.length)];
};

export function useWordChain(lang: 'tr' | 'en' = 'tr') {
  const validWords = lang === 'en' ? VALID_WORDS_EN : VALID_WORDS_TR;

  const [state, setState] = useState<WordChainState>(() => {
    const start = getRandomStartWord(lang);
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

  const normalize = useCallback((text: string) => (
    lang === 'en' ? text.toUpperCase() : toTurkishUpper(text)
  ), [lang]);

  const setInput = useCallback((text: string) => {
    setState(prev => ({ ...prev, currentInput: normalize(text) }));
  }, [normalize]);

  const submitWord = useCallback((): 'ok' | 'invalid' | 'used' | 'wrong_start' => {
    if (state.status !== 'playing') return 'invalid';
    const word = normalize(state.currentInput.trim());
    const lastWord = state.lastWord;
    const lastChar = lastWord[lastWord.length - 1];

    // Boş girişte can GİTMEZ; yalnızca uyarı göster.
    if (!word) {
      setState(prev => ({
        ...prev,
        errorMessage: lang === 'en' ? 'Enter a word!' : 'Bir kelime girin!',
        currentInput: '',
      }));
      return 'invalid';
    }

    if (!word.startsWith(lastChar)) {
      setState(prev => ({ ...prev, lives: prev.lives - 1, errorMessage: lang === 'en' ? `Word must start with "${lastChar}"!` : `Kelime "${lastChar}" harfiyle başlamalı!`, currentInput: '', status: prev.lives - 1 <= 0 ? 'lost' : 'playing' }));
      return 'wrong_start';
    }

    if (state.chain.includes(word)) {
      setState(prev => ({
        ...prev,
        lives: prev.lives - 1,
        errorMessage: lang === 'en' ? 'This word was already used!' : 'Bu kelime zaten kullanıldı!',
        currentInput: '',
        status: prev.lives - 1 <= 0 ? 'lost' : 'playing',
      }));
      return 'used';
    }
    if (!validWords.has(word)) {
      setState(prev => ({
        ...prev,
        lives: prev.lives - 1,
        errorMessage: lang === 'en' ? 'Invalid word!' : 'Geçersiz kelime!',
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
  }, [state, validWords, normalize]);

  const reset = useCallback((newLang?: 'tr' | 'en') => {
    const activeLang = (newLang === 'en' || newLang === 'tr') ? newLang : lang;
    const start = getRandomStartWord(activeLang);
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
  }, [lang]);

  return { ...state, setInput, submitWord, reset };
}
