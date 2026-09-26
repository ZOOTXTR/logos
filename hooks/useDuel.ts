import { useState, useEffect, useCallback, useRef } from 'react';
import { getRandomWord, WORD_LENGTH, Category } from '../constants/words';
import { toTurkishUpper } from '../utils/turkish';

export type LetterStatus = 'empty' | 'correct' | 'present' | 'absent';

export interface DuelCell {
  char: string;
  status: LetterStatus;
}

export interface DuelState {
  targetWord: string;
  playerBoard: DuelCell[][];
  playerRow: number;
  playerCol: number;
  playerStatus: 'playing' | 'won' | 'lost';

  opponentBoard: DuelCell[][];
  opponentRow: number;
  opponentStatus: 'playing' | 'won' | 'lost';

  winner: 'player' | 'opponent' | null;
}

const MAX_GUESSES = 6;

export function useDuel(category: Category = 'random', lang: 'tr' | 'en' = 'tr') {
  const [targetWord, setTargetWord] = useState(() => {
    const raw = getRandomWord(category, lang);
    return lang === 'tr' ? toTurkishUpper(raw) : raw.toUpperCase();
  });

  const createEmptyBoard = (): DuelCell[][] =>
    Array(MAX_GUESSES)
      .fill(null)
      .map(() =>
        Array(WORD_LENGTH)
          .fill(null)
          .map(() => ({ char: '', status: 'empty' }))
      );

  const [state, setState] = useState<DuelState>(() => ({
    targetWord,
    playerBoard: createEmptyBoard(),
    playerRow: 0,
    playerCol: 0,
    playerStatus: 'playing',
    opponentBoard: createEmptyBoard(),
    opponentRow: 0,
    opponentStatus: 'playing',
    winner: null,
  }));

  const botTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Bot logic simulating real-time player guesses
  useEffect(() => {
    if (state.playerStatus !== 'playing' || state.opponentStatus !== 'playing') return;

    // Start bot timer: makes a guess every 12-16 seconds
    const delay = 10000 + Math.random() * 5000;
    botTimerRef.current = setTimeout(() => {
      makeBotGuess();
    }, delay);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [state.opponentRow, state.playerStatus, state.opponentStatus]);

  const makeBotGuess = () => {
    setState(prev => {
      if (prev.opponentStatus !== 'playing' || prev.winner) return prev;

      const currentRow = prev.opponentRow;
      const target = prev.targetWord;

      // Bot olasılığı 1.0'a ulaşmaz; son satırda da zorla çözmez (yenilebilir).
      // Yanlış tahminler hedef harfleri sızdırmasın diye rastgele üretilir.
      let guessedWord = '';
      const probabilities = [0.0, 0.05, 0.2, 0.4, 0.6, 0.85];
      const willSolve = Math.random() < (probabilities[currentRow] ?? 0.85);

      if (willSolve) {
        guessedWord = target;
      } else {
        const alphabet = (lang === 'en' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ').split('');
        const chars: string[] = [];
        for (let i = 0; i < WORD_LENGTH; i++) {
          chars.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
        }
        guessedWord = chars.join('');
      }

      // Check guess and color cells
      const nextOpponentBoard = prev.opponentBoard.map((row, rIndex) => {
        if (rIndex !== currentRow) return row;
        
        const newRow = row.map((_, cIndex) => ({ char: guessedWord[cIndex], status: 'absent' as LetterStatus }));
        const targetChars: (string | null)[] = target.split('');
        
        // Pass 1: Mark corrects
        newRow.forEach((cell, cIndex) => {
          if (cell.char === targetChars[cIndex]) {
            cell.status = 'correct';
            targetChars[cIndex] = null;
          }
        });
        
        // Pass 2: Mark presents
        newRow.forEach((cell) => {
          if (cell.status !== 'correct') {
            const matchIndex = targetChars.indexOf(cell.char);
            if (matchIndex !== -1) {
              cell.status = 'present';
              targetChars[matchIndex] = null;
            }
          }
        });
        
        return newRow;
      });

      const won = guessedWord === target;
      const lost = !won && currentRow >= MAX_GUESSES - 1;
      const nextStatus = won ? 'won' : lost ? 'lost' : 'playing';

      let nextWinner: 'player' | 'opponent' | null = prev.winner;
      if (won && !prev.winner) {
        nextWinner = 'opponent';
      }

      return {
        ...prev,
        opponentBoard: nextOpponentBoard,
        opponentRow: currentRow + 1,
        opponentStatus: nextStatus,
        winner: nextWinner,
      };
    });
  };

  const addLetter = useCallback((char: string) => {
    setState(prev => {
      if (prev.playerStatus !== 'playing' || prev.winner) return prev;
      if (prev.playerCol >= WORD_LENGTH) return prev;

      const nextBoard = prev.playerBoard.map((row, rIndex) => {
        if (rIndex !== prev.playerRow) return row;
        return row.map((cell, cIndex) => {
          if (cIndex === prev.playerCol) return { char: (lang === 'tr' ? toTurkishUpper(char) : char.toUpperCase()), status: 'empty' as LetterStatus };
          return cell;
        });
      });

      return {
        ...prev,
        playerBoard: nextBoard,
        playerCol: prev.playerCol + 1,
      };
    });
  }, []);

  const deleteLetter = useCallback(() => {
    setState(prev => {
      if (prev.playerStatus !== 'playing' || prev.winner) return prev;
      if (prev.playerCol <= 0) return prev;

      const nextCol = prev.playerCol - 1;
      const nextBoard = prev.playerBoard.map((row, rIndex) => {
        if (rIndex !== prev.playerRow) return row;
        return row.map((cell, cIndex) => {
          if (cIndex === nextCol) return { char: '', status: 'empty' as LetterStatus };
          return cell;
        });
      });

      return {
        ...prev,
        playerBoard: nextBoard,
        playerCol: nextCol,
      };
    });
  }, []);

  const submitGuess = useCallback((): 'short' | 'correct' | 'wrong' | 'gameover' => {
    const s = stateRef.current;
    if (s.playerStatus !== 'playing' || s.winner) return 'wrong';
    if (s.playerCol < WORD_LENGTH) return 'short';

    const currentRow = s.playerRow;
    const guess = s.playerBoard[currentRow].map(c => c.char).join('');
    const correct = guess === s.targetWord;

    const nextBoard = s.playerBoard.map((row, rIdx) => {
      if (rIdx !== currentRow) return row;

      const newRow = row.map(cell => ({ ...cell, status: 'absent' as LetterStatus }));
      const targetChars: (string | null)[] = s.targetWord.split('');

      // Pass 1: doğru konumlar
      newRow.forEach((cell, cIdx) => {
        if (cell.char === targetChars[cIdx]) {
          cell.status = 'correct';
          targetChars[cIdx] = null;
        }
      });

      // Pass 2: mevcut harfler
      newRow.forEach((cell) => {
        if (cell.status !== 'correct') {
          const matchIndex = targetChars.indexOf(cell.char);
          if (matchIndex !== -1) {
            cell.status = 'present';
            targetChars[matchIndex] = null;
          }
        }
      });

      return newRow;
    });

    const nextStatus = correct ? 'won' : (currentRow + 1 >= MAX_GUESSES ? 'lost' : 'playing');
    let nextWinner: 'player' | 'opponent' | null = s.winner;
    if (correct && !s.winner) nextWinner = 'player';

    setState({
      ...s,
      playerBoard: nextBoard,
      playerRow: currentRow + 1,
      playerCol: 0,
      playerStatus: nextStatus,
      winner: nextWinner,
    });

    return correct ? 'correct' : nextStatus === 'lost' ? 'gameover' : 'wrong';
  }, []);

  const reset = useCallback((nextCategory?: Category) => {
    const word = (lang === 'tr' ? toTurkishUpper(getRandomWord(nextCategory ?? category, lang)) : getRandomWord(nextCategory ?? category, lang).toUpperCase());
    setTargetWord(word);
    setState({
      targetWord: word,
      playerBoard: createEmptyBoard(),
      playerRow: 0,
      playerCol: 0,
      playerStatus: 'playing',
      opponentBoard: createEmptyBoard(),
      opponentRow: 0,
      opponentStatus: 'playing',
      winner: null,
    });
  }, [category, lang]);

  return { ...state, addLetter, deleteLetter, submitGuess, reset };
}
