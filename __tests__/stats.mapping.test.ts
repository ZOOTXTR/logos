import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('../hooks/useProgress', () => ({
  useProgress: () => ({
    levelInfo: { level: 5, minXP: 1000, maxXP: 2000 },
    xp: 1300,
    streak: { current: 3, max: 9 },
    gems: 275,
    premium: true,
    loading: false,
    addGems: jest.fn(),
    spendGems: jest.fn(),
    unlockPremium: jest.fn(),
  }),
}));

jest.mock('../services/storage.service', () => ({
  getStats: jest.fn(),
  updateStats: jest.fn(),
  storageGet: jest.fn(async () => null),
  storageSet: jest.fn(async () => {}),
  storageGetJSON: jest.fn(async () => null),
  storageSetJSON: jest.fn(async () => {}),
}));

import { usePlayerStats } from '../hooks/usePlayerStats';
import * as storage from '../services/storage.service';

const getStats = storage.getStats as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('usePlayerStats - gerçek istatistik eşlemesi', () => {
  it('genişletilmiş istatistik alanlarını FullStats\'tan doğru eşler', async () => {
    getStats.mockResolvedValue({
      gamesPlayed: 20,
      gamesWon: 15,
      guessDistribution: { 3: 5, 4: 7, 5: 3 },
      perfectGames: 4,
      speedModeWins: 6,
      expertModeWins: 2,
      dailyChallengesCompleted: 8,
      gamesPlayedByDifficulty: { normal: 10, expert: 5 },
      gamesWonByDifficulty: { normal: 9, expert: 3 },
    });

    const { result } = renderHook(() => usePlayerStats());
    await waitFor(() => expect(result.current.stats.gamesPlayed).toBe(20));

    const s = result.current.stats;
    expect(s.perfectGames).toBe(4);
    expect(s.speedModeWins).toBe(6);
    expect(s.expertModeWins).toBe(2);
    expect(s.dailyChallengesCompleted).toBe(8);
    expect(s.gamesPlayedByDifficulty).toEqual({ normal: 10, expert: 5 });
    expect(s.gamesWonByDifficulty).toEqual({ normal: 9, expert: 3 });
    expect(s.distribution).toEqual({ 3: 5, 4: 7, 5: 3 });
    expect(s.winRate).toBe(75);
    expect(s.currentXP).toBe(300);
    expect(s.maxXP).toBe(1000);
    expect(s.gems).toBe(275);
    expect(s.isPremium).toBe(true);
  });

  it('eksik alanlarda güvenli varsayılanlara düşer', async () => {
    getStats.mockResolvedValue({ gamesPlayed: 0, gamesWon: 0 });

    const { result } = renderHook(() => usePlayerStats());
    await waitFor(() => expect(result.current.stats.gamesPlayed).toBe(0));

    const s = result.current.stats;
    expect(s.perfectGames).toBe(0);
    expect(s.speedModeWins).toBe(0);
    expect(s.expertModeWins).toBe(0);
    expect(s.dailyChallengesCompleted).toBe(0);
    expect(s.gamesPlayedByDifficulty).toEqual({});
    expect(s.gamesWonByDifficulty).toEqual({});
    expect(s.distribution).toEqual({});
    expect(s.winRate).toBe(0);
  });
});
