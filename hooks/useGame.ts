import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Board, LetterStatus,
  DIFFICULTY_MAX_GUESSES,
  Difficulty, GameMode, Category,
  createEmptyBoard, getRandomWord, getDailyWord,
  ALL_WORDS, ALL_WORDS_EN,
} from '../constants/words';
import { getDictionary, isDictionaryReady } from '../services/dictionary.service';

export interface GameState {
  board: Board;
  currentRow: number;
  currentCol: number;
  targetWord: string;
  gameStatus: 'playing' | 'won' | 'lost';
  revealedLetters: Record<string, LetterStatus>;
  hintsUsed: number;
  difficulty: Difficulty;
  mode: GameMode;
  category: Category;
  timeLeft: number;
  isTimerRunning: boolean;
  startTime: number;
  elapsedSeconds: number;
}

const MAX_SPEED_TIME = 90;

export function useGame(
  difficulty: Difficulty = 'normal',
  mode: GameMode = 'classic',
  category: Category = 'random',
  lang: 'tr' | 'en' = 'tr'
) {
  const maxGuesses = DIFFICULTY_MAX_GUESSES[difficulty];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef<GameState>(null!);
  const paramsRef = useRef({ difficulty, mode, category, lang });
  paramsRef.current = { difficulty, mode, category, lang };

  const [dictionaryReady, setDictionaryReady] = useState(false);

  useEffect(() => {
    if (isDictionaryReady()) { setDictionaryReady(true); return; }
    const check = setInterval(() => {
      if (isDictionaryReady()) { setDictionaryReady(true); clearInterval(check); }
    }, 200);
    return () => clearInterval(check);
  }, []);

  const getWord = (l = lang) => mode === 'daily' ? getDailyWord(l) : getRandomWord(category, l);

  const [state, setState] = useState<GameState>(() => {
    const target = getWord(lang);
    return {
      board: createEmptyBoard(maxGuesses, target.length),
      currentRow: 0, currentCol: 0,
      targetWord: target, gameStatus: 'playing',
      revealedLetters: {}, hintsUsed: 0,
      difficulty, mode, category,
      timeLeft: MAX_SPEED_TIME,
      isTimerRunning: mode === 'speed',
      startTime: Date.now(), elapsedSeconds: 0,
    };
  });

  stateRef.current = state;

  useEffect(() => {
    if (mode !== 'speed') return;
    if (state.gameStatus !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(timerRef.current!);
          return { ...prev, timeLeft: 0, gameStatus: 'lost' };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode, state.gameStatus]);

  const addTime = useCallback((seconds: number) => {
    setState(prev => ({ ...prev, timeLeft: Math.min(prev.timeLeft + seconds, MAX_SPEED_TIME + 30) }));
  }, []);

  const resetGame = useCallback((newDifficulty?: Difficulty, newMode?: GameMode, newCategory?: Category, newLang?: 'tr' | 'en') => {
    if (timerRef.current) clearInterval(timerRef.current);
    const p = paramsRef.current;
    const d = newDifficulty ?? p.difficulty;
    const m = newMode ?? p.mode;
    const c = newCategory ?? p.category;
    const l = newLang ?? p.lang;
    const mg = DIFFICULTY_MAX_GUESSES[d];
    const word = m === 'daily' ? getDailyWord(l) : getRandomWord(c, l);

    setState({
      board: createEmptyBoard(mg, word.length),
      currentRow: 0, currentCol: 0,
      targetWord: word, gameStatus: 'playing',
      revealedLetters: {}, hintsUsed: 0,
      difficulty: d, mode: m, category: c,
      timeLeft: MAX_SPEED_TIME,
      isTimerRunning: m === 'speed',
      startTime: Date.now(), elapsedSeconds: 0,
    });
  }, []);

  const addLetter = useCallback((letter: string) => {
    setState(prev => {
      if (prev.gameStatus !== 'playing' || prev.currentCol >= prev.targetWord.length) return prev;
      const newBoard = prev.board.map(r => r.map(l => ({ ...l })));
      newBoard[prev.currentRow][prev.currentCol] = { char: letter, status: 'tbd' };
      return { ...prev, board: newBoard, currentCol: prev.currentCol + 1 };
    });
  }, []);

  const deleteLetter = useCallback(() => {
    setState(prev => {
      if (prev.currentCol === 0) return prev;
      const newBoard = prev.board.map(r => r.map(l => ({ ...l })));
      newBoard[prev.currentRow][prev.currentCol - 1] = { char: '', status: 'empty' };
      return { ...prev, board: newBoard, currentCol: prev.currentCol - 1 };
    });
  }, []);

  const submitGuess = useCallback((): 'short' | 'not_valid' | 'not_ready' | 'submitted' => {
    const s = stateRef.current;
    const wordLen = s.targetWord.length;
    if (s.currentCol < wordLen) return 'short';
    if (!dictionaryReady) return 'not_ready';

    const p = paramsRef.current;
    const rawGuess = s.board[s.currentRow].map(l => l.char).join('');
    const guess = p.lang === 'tr'
      ? rawGuess.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR')
      : rawGuess.toUpperCase();
    const dictionary = getDictionary(p.lang);
    const targetPool = p.lang === 'en' ? ALL_WORDS_EN : ALL_WORDS;
    const isValid = (dictionary && dictionary.has(guess)) || targetPool.includes(guess);

    if (!isValid) return 'not_valid';

    const target = s.targetWord;
    const newStatuses: LetterStatus[] = Array(wordLen).fill('absent');
    const targetChars = target.split('');
    const guessChars = guess.split('');

    guessChars.forEach((c, i) => {
      if (c === targetChars[i]) { newStatuses[i] = 'correct'; targetChars[i] = '#'; }
    });
    guessChars.forEach((c, i) => {
      if (newStatuses[i] === 'correct') return;
      const idx = targetChars.indexOf(c);
      if (idx !== -1) { newStatuses[i] = 'present'; targetChars[idx] = '#'; }
    });

    setState(prev => {
      const newBoard = prev.board.map(r => r.map(l => ({ ...l })));
      newBoard[prev.currentRow] = guessChars.map((c, i) => ({ char: c, status: newStatuses[i] }));
      const newRevealed = { ...prev.revealedLetters };
      guessChars.forEach((c, i) => {
        const cur = newRevealed[c];
        const ns = newStatuses[i];
        if (!cur || cur === 'absent' || (cur === 'present' && ns === 'correct')) newRevealed[c] = ns;
      });
      const won = newStatuses.every(s => s === 'correct');
      const nextRow = prev.currentRow + 1;
      const lost = !won && nextRow >= DIFFICULTY_MAX_GUESSES[prev.difficulty];
      return {
        ...prev,
        board: newBoard,
        currentRow: won || lost ? prev.currentRow : nextRow,
        currentCol: 0,
        gameStatus: won ? 'won' : lost ? 'lost' : 'playing',
        revealedLetters: newRevealed,
        elapsedSeconds: Math.floor((Date.now() - prev.startTime) / 1000),
      };
    });

    return 'submitted';
  }, [dictionaryReady]);

  const useHint = useCallback((): string | null => {
    const s = stateRef.current;
    const target = s.targetWord;
    const unknownPositions: number[] = [];
    for (let i = 0; i < target.length; i++) {
      const isKnown = s.board.some(row => row[i].status === 'correct' && row[i].char === target[i]);
      if (!isKnown) unknownPositions.push(i);
    }
    if (unknownPositions.length === 0) return null;
    const pos = unknownPositions[Math.floor(Math.random() * unknownPositions.length)];
    setState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    return `${pos + 1}. harf: ${target[pos]}`;
  }, []);

  const useSweeper = useCallback((): string[] => {
    const s = stateRef.current;
    const p = paramsRef.current;
    const target = p.lang === 'tr'
      ? s.targetWord.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR')
      : s.targetWord.toUpperCase();
    const alphabet = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');
    const wrongLetters = alphabet.filter(l => !target.includes(l) && s.revealedLetters[l] !== 'absent');

    const toSweep: string[] = [];
    const count = Math.min(3, wrongLetters.length);
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * wrongLetters.length);
      toSweep.push(wrongLetters[idx]);
      wrongLetters.splice(idx, 1);
    }

    setState(prev => {
      const nextRevealed = { ...prev.revealedLetters };
      toSweep.forEach(l => { nextRevealed[l] = 'absent'; });
      return { ...prev, revealedLetters: nextRevealed };
    });

    return toSweep;
  }, []);

  return useMemo(() => ({
    ...state,
    maxGuesses,
    addLetter,
    deleteLetter,
    submitGuess,
    resetGame,
    useHint,
    useSweeper,
    addTime,
  }), [state, maxGuesses, addLetter, deleteLetter, submitGuess, resetGame, useHint, useSweeper, addTime]);
}
