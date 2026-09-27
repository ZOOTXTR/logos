import { useState, useEffect, useCallback } from 'react';
import { useProgress } from './useProgress';
import {
  getStats, updateStats as updateStatsStorage, FullStats, storageGet, storageSet, storageGetJSON, storageSetJSON,
} from '../services/storage.service';
import { PlayerStats } from '../types/game';

const DEFAULT_AVATARS = ['avatar-default', 'avatar-wizard', 'avatar-scholar'];
const DEFAULT_FRAMES = ['frame-default'];

// expo-logos'un PlayerStats şeklini bizim gerçek veri katmanına (useProgress + FullStats) bağlar.
export function usePlayerStats() {
  const progress = useProgress();
  const [full, setFull] = useState<FullStats | null>(null);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [frame, setFrame] = useState<string | undefined>(undefined);
  const [unlockedAvatars, setUnlockedAvatars] = useState<string[]>(DEFAULT_AVATARS);
  const [unlockedFrames, setUnlockedFrames] = useState<string[]>(DEFAULT_FRAMES);

  const refresh = useCallback(async () => {
    const [s, av, fr, uAv, uFr] = await Promise.all([
      getStats(),
      storageGet('gq_avatar'),
      storageGet('gq_frame'),
      storageGetJSON<string[]>('gq_unlocked_avatars'),
      storageGetJSON<string[]>('gq_unlocked_frames'),
    ]);
    setFull(s);
    setAvatar(av ?? undefined);
    setFrame(fr ?? undefined);
    if (uAv) setUnlockedAvatars(uAv);
    if (uFr) setUnlockedFrames(uFr);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const gp = full?.gamesPlayed ?? 0;
  const gw = full?.gamesWon ?? 0;
  const level = progress.levelInfo?.level ?? 1;

  const stats: PlayerStats = {
    level,
    currentXP: progress.levelInfo ? Math.max(0, progress.xp - progress.levelInfo.minXP) : 0,
    maxXP: progress.levelInfo ? Math.max(1, progress.levelInfo.maxXP - progress.levelInfo.minXP) : 1,
    streak: progress.streak.current,
    bestStreak: progress.streak.max,
    gems: progress.gems,
    gamesPlayed: gp,
    gamesWon: gw,
    winRate: gp > 0 ? Math.round((gw / gp) * 100) : 0,
    distribution: full?.guessDistribution ?? {},
    isPremium: progress.premium,
    selectedAvatar: avatar,
    selectedFrame: frame,
    unlockedAvatars,
    unlockedFrames,
  };

  const updateStats = useCallback(async (patch: Partial<PlayerStats>) => {
    // Gem değişimi → gerçek bakiye
    if (typeof patch.gems === 'number') {
      const diff = patch.gems - progress.gems;
      if (diff > 0) await progress.addGems(diff);
      else if (diff < 0) await progress.spendGems(-diff);
    }
    if (patch.isPremium) await progress.unlockPremium();
    if (patch.selectedAvatar) { setAvatar(patch.selectedAvatar); await storageSet('gq_avatar', patch.selectedAvatar); }
    if (patch.selectedFrame) { setFrame(patch.selectedFrame); await storageSet('gq_frame', patch.selectedFrame); }
    if (patch.unlockedAvatars) { setUnlockedAvatars(patch.unlockedAvatars); await storageSetJSON('gq_unlocked_avatars', patch.unlockedAvatars); }
    if (patch.unlockedFrames) { setUnlockedFrames(patch.unlockedFrames); await storageSetJSON('gq_unlocked_frames', patch.unlockedFrames); }

    // İstatistik değişimleri → FullStats
    if (patch.gamesPlayed !== undefined || patch.gamesWon !== undefined || patch.distribution !== undefined) {
      const next: Partial<FullStats> = {};
      if (patch.gamesPlayed !== undefined) next.gamesPlayed = patch.gamesPlayed;
      if (patch.gamesWon !== undefined) next.gamesWon = patch.gamesWon;
      if (patch.distribution !== undefined) next.guessDistribution = patch.distribution;
      const updated = await updateStatsStorage(next);
      setFull(updated);
    }
  }, [progress, refresh]);

  return { stats, updateStats, progress, loading: progress.loading, refresh };
}
