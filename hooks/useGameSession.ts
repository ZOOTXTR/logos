import { useCallback, useState } from 'react';
import { useProgressStore, RecordWinOptions } from '../store/progressStore';
import { useTheme } from './useTheme';
import { markDailyDone, ScoreEntry } from '../services/storage.service';
import { audioService } from '../services/audio.service';
import { GameResultOverlayProps, ResultButton } from '../components/GameResultOverlay';

export interface GameSessionResult {
  won: boolean;
  title?: string;
  emoji?: string;
  message?: string;
  word?: string;
  xpEarned: number;
  gemsEarned: number;
  score: Pick<ScoreEntry, 'mode' | 'category' | 'guesses' | 'timeSeconds'>;
  stats?: RecordWinOptions;
  buttons?: ResultButton[];
}

export interface GameSession {
  resultOverlay: GameResultOverlayProps | null;
  showConfetti: boolean;
  showResult: (r: GameSessionResult) => Promise<void>;
  award: (r: GameSessionResult) => Promise<void>;
  showOverlay: (o: { title: string; emoji?: string; message?: string; word?: string; buttons?: ResultButton[] }) => void;
  hideResult: () => void;
  stopConfetti: () => void;
}

export function useGameSession(): GameSession {
  const { theme, language } = useTheme();
  const progress = useProgressStore();
  const [resultOverlay, setResultOverlay] = useState<GameResultOverlayProps | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const award = useCallback(async (r: GameSessionResult) => {
    if (r.won) {
      setShowConfetti(true);
      audioService.play('win');
      audioService.triggerHaptic('success');
      if (r.stats) {
        // Tek yazıcı: XP, gem ve skor recordWin içinde işlenir
        await progress.recordWin({ ...r.stats, xpEarned: r.xpEarned, gemsEarned: r.gemsEarned });
        if (r.stats.isDaily) {
          await markDailyDone();
          await progress.refreshDaily();
        }
      } else {
        await progress.earnXP(r.xpEarned);
        await progress.addGems(r.gemsEarned);
      }
    } else {
      audioService.play('loss');
      audioService.triggerHaptic('warning');
      await progress.recordLoss();
    }
  }, [progress]);

  const hideResult = useCallback(() => setResultOverlay(null), []);
  const stopConfetti = useCallback(() => setShowConfetti(false), []);

  const showOverlay = useCallback((o: { title: string; emoji?: string; message?: string; word?: string; buttons?: ResultButton[] }) => {
    setResultOverlay({
      visible: true,
      title: o.title,
      emoji: o.emoji ?? '📋',
      message: o.message ?? '',
      word: o.word,
      buttons: o.buttons ?? [],
      theme,
      language,
      onClose: hideResult,
    });
  }, [theme, language, hideResult]);

  const showResult = useCallback(async (r: GameSessionResult) => {
    await award(r);
    setResultOverlay({
      visible: true,
      title: r.title ?? '',
      emoji: r.emoji ?? (r.won ? '🎉' : '😢'),
      message: r.message ?? '',
      word: r.word,
      gemsAwarded: r.won ? r.gemsEarned : undefined,
      xpAwarded: r.won ? r.xpEarned : undefined,
      buttons: r.buttons ?? [],
      theme,
      language,
      onClose: hideResult,
    });
  }, [award, theme, language, hideResult]);

  return { resultOverlay, showConfetti, showResult, award, showOverlay, hideResult, stopConfetti };
}
