import { useState, useEffect, useCallback } from 'react';
import { duelService, DuelSession } from '../services/duel.service';
import { getCurrentUser } from '../services/auth.service';
import { toTurkishUpper } from '../utils/turkish';

type LetterStatus = 'empty' | 'absent' | 'present' | 'correct';
interface DuelCell { char: string; status: LetterStatus }
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

export function useMultiplayer() {
  const [duel, setDuel] = useState<DuelSession | null>(null);
  const [duelId, setDuelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Local board state
  const createEmptyBoard = (): DuelCell[][] =>
    Array(MAX_GUESSES).fill(null).map(() => Array(WORD_LENGTH).fill(null).map(() => ({ char: '', status: 'empty' })));

  const [playerBoard, setPlayerBoard] = useState<DuelCell[][]>(createEmptyBoard());
  const [playerRow, setPlayerRow] = useState(0);
  const [playerCol, setPlayerCol] = useState(0);

  const user = getCurrentUser();
  const isPlayer1 = duel?.player1 === user?.uid;

  // Find or create match
  const startMatchmaking = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to play online.');
      return;
    }
    setError(null);
    try {
      const id = await duelService.findOrCreateMatch(user.uid, user.displayName || 'Player');
      setDuelId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [user]);

  // Subscribe to match
  useEffect(() => {
    if (!duelId) return;
    const unsubscribe = duelService.subscribeToDuel(duelId, (updatedDuel) => {
      setDuel(updatedDuel);
    });
    return () => unsubscribe();
  }, [duelId]);

  const addLetter = useCallback((char: string) => {
    if (!duel || duel.status !== 'playing') return;
    if (playerCol >= WORD_LENGTH) return;
    
    setPlayerBoard(prev => {
      const next = [...prev];
      next[playerRow] = [...next[playerRow]];
      next[playerRow][playerCol] = { char: toTurkishUpper(char), status: 'empty' };
      return next;
    });
    setPlayerCol(prev => prev + 1);
  }, [duel, playerRow, playerCol]);

  const deleteLetter = useCallback(() => {
    if (!duel || duel.status !== 'playing') return;
    if (playerCol <= 0) return;

    setPlayerCol(prev => prev - 1);
    setPlayerBoard(prev => {
      const next = [...prev];
      next[playerRow] = [...next[playerRow]];
      next[playerRow][playerCol - 1] = { char: '', status: 'empty' };
      return next;
    });
  }, [duel, playerRow, playerCol]);

  const submitGuess = useCallback(async (): Promise<'short' | 'correct' | 'wrong' | 'gameover'> => {
    if (!duel || duel.status !== 'playing' || !user) return 'wrong';
    if (playerCol < WORD_LENGTH) return 'short';

    const guess = playerBoard[playerRow].map(c => c.char).join('');
    const target = duel.targetWord;
    const correct = guess === target;

    // Colorize the board
    setPlayerBoard(prev => {
      const nextBoard = [...prev];
      const newRow = prev[playerRow].map(cell => ({ ...cell, status: 'absent' as LetterStatus }));
      const targetChars: (string | null)[] = target.split('');
      
      newRow.forEach((cell, cIdx) => {
        if (cell.char === targetChars[cIdx]) {
          cell.status = 'correct';
          targetChars[cIdx] = null;
        }
      });
      
      newRow.forEach((cell) => {
        if (cell.status !== 'correct') {
          const matchIndex = targetChars.indexOf(cell.char);
          if (matchIndex !== -1) {
            cell.status = 'present';
            targetChars[matchIndex] = null;
          }
        }
      });
      nextBoard[playerRow] = newRow;
      return nextBoard;
    });

    const isGameOver = correct || playerRow + 1 >= MAX_GUESSES;
    setPlayerRow(prev => prev + 1);
    setPlayerCol(0);

    // Update Firebase progress (how many words guessed)
    const newProgress = Math.round(((playerRow + 1) / MAX_GUESSES) * 100);
    await duelService.updateProgress(duel.id, user.uid, isPlayer1, newProgress);

    if (isGameOver) {
      await duelService.finishMatch(duel.id, user.uid, isPlayer1, correct);
      return correct ? 'correct' : 'gameover';
    }

    return 'wrong';
  }, [duel, playerBoard, playerRow, playerCol, user, isPlayer1]);

  const reset = () => {
    setDuel(null);
    setDuelId(null);
    setPlayerBoard(createEmptyBoard());
    setPlayerRow(0);
    setPlayerCol(0);
  };

  return { 
    duel, 
    error, 
    playerBoard, 
    playerRow,
    playerCol,
    isPlayer1,
    startMatchmaking, 
    addLetter, 
    deleteLetter, 
    submitGuess, 
    reset 
  };
}
