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

const getSpeedTime = (diff: Difficulty) => {
  switch (diff) {
    case 'easy': return 60;
    case 'normal': return 90;
    case 'hard': return 120;
    case 'expert': return 150;
    default: return 90;
  }
};

export function useGame(
  difficulty: Difficulty = 'normal',
  mode: GameMode = 'classic',
  category: Category = 'random',
  lang: 'tr' | 'en' = 'tr',
  hardMode: boolean = false
) {
  const initialMaxGuesses = DIFFICULTY_MAX_GUESSES[difficulty];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);
  const stateRef = useRef<GameState>(null!);
  const paramsRef = useRef({ difficulty, mode, category, lang, hardMode });

  const [dictionaryReady, setDictionaryReady] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  useEffect(() => {
    paramsRef.current = { difficulty, mode, category, lang, hardMode };
  }, [difficulty, mode, category, lang, hardMode]);

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
      board: createEmptyBoard(initialMaxGuesses, target.length),
      currentRow: 0, currentCol: 0,
      targetWord: target, gameStatus: 'playing',
      revealedLetters: {}, hintsUsed: 0,
      difficulty, mode, category,
      timeLeft: getSpeedTime(difficulty),
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
        if (!endTimeRef.current) endTimeRef.current = Date.now() + prev.timeLeft * 1000;
        const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        if (left <= 0) {
          clearInterval(timerRef.current!);
          return { ...prev, timeLeft: 0, gameStatus: 'lost', isTimerRunning: false };
        }
        return { ...prev, timeLeft: left };
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode, state.gameStatus, resetToken]);

  const addTime = useCallback((seconds: number) => {
    setState(prev => {
      const newTime = Math.min(prev.timeLeft + seconds, getSpeedTime(prev.difficulty) + 30);
      endTimeRef.current = Date.now() + newTime * 1000;
      return { ...prev, timeLeft: newTime };
    });
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

    endTimeRef.current = 0;
    setState({
      board: createEmptyBoard(mg, word.length),
      currentRow: 0, currentCol: 0,
      targetWord: word, gameStatus: 'playing',
      revealedLetters: {}, hintsUsed: 0,
      difficulty: d, mode: m, category: c,
      timeLeft: getSpeedTime(d),
      isTimerRunning: m === 'speed',
      startTime: Date.now(), elapsedSeconds: 0,
    });
    // Timer effect'ini yeniden tetikle (reset sırasında oyun zaten 'playing' olsa bile)
    setResetToken(t => t + 1);
  }, []);

  const addLetter = useCallback((letter: string) => {
    setState(prev => {
      if (prev.gameStatus !== 'playing' || prev.currentCol >= prev.targetWord.length) return prev;
      const newBoard = [...prev.board];
      const newRow = [...newBoard[prev.currentRow]];
      newRow[prev.currentCol] = { char: letter, status: 'tbd' };
      newBoard[prev.currentRow] = newRow;
      return { ...prev, board: newBoard, currentCol: prev.currentCol + 1 };
    });
  }, []);

  const deleteLetter = useCallback(() => {
    setState(prev => {
      if (prev.gameStatus !== 'playing') return prev;
      if (prev.currentCol === 0) return prev;
      const newBoard = [...prev.board];
      const newRow = [...newBoard[prev.currentRow]];
      newRow[prev.currentCol - 1] = { char: '', status: 'empty' };
      newBoard[prev.currentRow] = newRow;
      return { ...prev, board: newBoard, currentCol: prev.currentCol - 1 };
    });
  }, []);

  const submitGuess = useCallback((): 'short' | 'not_valid' | 'not_ready' | 'hard_mode' | 'submitted' => {
    const s = stateRef.current;
    if (s.gameStatus !== 'playing') return 'not_valid';
    const wordLen = s.targetWord.length;
    if (s.currentCol < wordLen) return 'short';
    if (!dictionaryReady) return 'not_ready';

    const p = paramsRef.current;
    const rawGuess = s.board[s.currentRow].map(l => l.char).join('');
    const norm = (c: string) => p.lang === 'tr'
      ? c.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase()
      : c.toUpperCase();
    const guess = rawGuess
      ? (p.lang === 'tr' ? rawGuess.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase() : rawGuess.toUpperCase())
      : '';

    // Zor Mod: daha önce açılan doğru harfler yerinde, sarı harfler kelimede bulunmalı
    if (p.hardMode) {
      for (let i = 0; i < wordLen; i++) {
        for (let r = 0; r < s.currentRow; r++) {
          if (s.board[r][i].status === 'correct' && norm(s.board[r][i].char) !== guess[i]) {
            return 'hard_mode';
          }
        }
      }
      const presentLetters = new Set<string>();
      for (let r = 0; r < s.currentRow; r++) {
        s.board[r].forEach((cell) => { if (cell.status === 'present') presentLetters.add(norm(cell.char)); });
      }
      const guessChars = guess.split('');
      for (const letter of presentLetters) {
        if (!guessChars.includes(letter)) return 'hard_mode';
      }
    }

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
      const newBoard = [...prev.board];
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
        isTimerRunning: won || lost ? false : prev.isTimerRunning,
        revealedLetters: newRevealed,
        elapsedSeconds: Math.floor((Date.now() - prev.startTime) / 1000),
      };
    });

    return 'submitted';
  }, [dictionaryReady]);

  const useHint = useCallback((lang: string = 'tr'): string | null => {
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
    return lang === 'en' ? `Letter ${pos + 1}: ${target[pos]}` : `${pos + 1}. harf: ${target[pos]}`;
  }, []);

  const useSweeper = useCallback((): string[] => {
    const s = stateRef.current;
    const p = paramsRef.current;
    const target = p.lang === 'tr'
      ? s.targetWord.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase()
      : s.targetWord.toUpperCase();
    const alphabet = (p.lang === 'en' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ').split('');
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

  // Mevcut satırdaki harfleri karıştır
  const shuffleRow = useCallback(() => {
    setState(prev => {
      if (prev.gameStatus !== 'playing') return prev;
      const row = prev.board[prev.currentRow];
      const letters = row.map(l => l.char).filter(c => c !== '');
      if (letters.length === 0) return prev;
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      const newRow = row.map(l => (l.char === '' ? l : { ...l, char: '' }));
      let li = 0;
      for (let i = 0; i < newRow.length; i++) {
        if (row[i].char !== '') { newRow[i] = { char: letters[li], status: 'tbd' }; li++; }
      }
      const newBoard = [...prev.board];
      newBoard[prev.currentRow] = newRow;
      return { ...prev, board: newBoard };
    });
  }, []);

  // Hedef kelimenin ilk harfini mevcut satırın ilk basamağına yerleştir
  const revealFirstLetter = useCallback((): string | null => {
    const s = stateRef.current;
    if (s.gameStatus !== 'playing') return null;
    const first = s.targetWord[0];
    setState(prev => {
      const newBoard = [...prev.board];
      const newRow = [...newBoard[prev.currentRow]];
      newRow[0] = { char: first, status: 'tbd' };
      newBoard[prev.currentRow] = newRow;
      return { ...prev, board: newBoard, currentCol: Math.max(prev.currentCol, 1) };
    });
    return first;
  }, []);

  return useMemo(() => ({
    ...state,
    maxGuesses: DIFFICULTY_MAX_GUESSES[state.difficulty],
    addLetter,
    deleteLetter,
    submitGuess,
    resetGame,
    useHint,
    useSweeper,
    shuffleRow,
    revealFirstLetter,
    addTime,
  }), [state, addLetter, deleteLetter, submitGuess, resetGame, useHint, useSweeper, shuffleRow, revealFirstLetter, addTime]);
}
