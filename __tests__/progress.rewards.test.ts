import { renderHook, act } from '@testing-library/react-native';

jest.mock('../services/storage.service', () => ({
  getGems: jest.fn(async () => 100),
  addGems: jest.fn(async (n: number) => 100 + n),
  spendGems: jest.fn(async () => ({ success: true, remaining: 100 })),
  isPremium: jest.fn(async () => false),
  setPremium: jest.fn(async () => {}),
  getXP: jest.fn(async () => 600),
  addXP: jest.fn(async (n: number) => 600 + n),
  getStreak: jest.fn(async () => ({ current: 2, max: 5 })),
  updateStreak: jest.fn(async () => ({ current: 3, max: 5, bonusGems: 10 })),
  getStats: jest.fn(),
  updateStats: jest.fn(),
  getUnlockedAchievements: jest.fn(async () => []),
  getUnlockedCategories: jest.fn(async () => ['random']),
  unlockCategory: jest.fn(async () => ['random']),
  unlockAchievement: jest.fn(async () => {}),
  addScore: jest.fn(async () => {}),
}));

jest.mock('../services/leaderboard.service', () => ({
  submitScore: jest.fn(async () => {}),
}));

jest.mock('../services/dailyQuests.service', () => ({
  incrementQuestProgress: jest.fn(async () => {}),
}));

jest.mock('../constants/levels', () => ({
  getLevelFromXP: jest.fn(() => ({ level: 3, minXP: 500, maxXP: 1000 })),
}));

jest.mock('../constants/achievements', () => ({
  getNewAchievements: jest.fn(() => []),
}));

import { useProgress } from '../hooks/useProgress';
import * as storage from '../services/storage.service';

const BASE_STATS = {
  gamesPlayed: 10,
  gamesWon: 8,
  speedModeWins: 1,
  expertModeWins: 1,
  perfectGames: 2,
  dailyChallengesCompleted: 3,
  categoriesWon: ['random'],
  lateNightGames: 0,
  totalXP: 500,
  guessDistribution: { 3: 1 },
  gamesPlayedByDifficulty: { normal: 5 },
  gamesWonByDifficulty: { normal: 4 },
};

const getStats = storage.getStats as unknown as jest.Mock;
const updateStats = storage.updateStats as unknown as jest.Mock;
const updateStreak = storage.updateStreak as unknown as jest.Mock;
const addXP = storage.addXP as unknown as jest.Mock;
const addGems = storage.addGems as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  getStats.mockResolvedValue({ ...BASE_STATS });
  updateStats.mockImplementation(async (patch: Record<string, unknown>) => ({ ...BASE_STATS, ...patch }));
  updateStreak.mockResolvedValue({ current: 3, max: 5, bonusGems: 10 });
});

describe('useProgress - kazanma ödülleri (recordWin)', () => {
  it('gamesPlayed/gamesWon ve mod/difficulty bazlı alanları doğru artırır', async () => {
    const { result } = renderHook(() => useProgress());

    await act(async () => {
      await result.current.recordWin({
        guesses: 4,
        mode: 'speed',
        difficulty: 'normal',
        category: 'hayvanlar',
        isSpeed: true,
        isExpert: false,
        isPerfect: true,
        isDaily: false,
        elapsedSeconds: 30,
        xpEarned: 50,
        gemsEarned: 20,
      });
    });

    const patch = updateStats.mock.calls[0][0] as Record<string, unknown>;
    expect(patch.gamesPlayed).toBe(11);
    expect(patch.gamesWon).toBe(9);
    expect(patch.speedModeWins).toBe(2);
    expect(patch.expertModeWins).toBe(1);
    expect(patch.perfectGames).toBe(3);
    expect(patch.dailyChallengesCompleted).toBe(3);
    expect((patch.guessDistribution as Record<number, number>)[4]).toBe(1);
    expect((patch.gamesPlayedByDifficulty as Record<string, number>).normal).toBe(6);
    expect((patch.gamesWonByDifficulty as Record<string, number>).normal).toBe(5);
    expect(patch.categoriesWon).toContain('hayvanlar');
  });

  it('XP ve gem ödüllerini gerçek katmana yazar', async () => {
    const { result } = renderHook(() => useProgress());

    await act(async () => {
      await result.current.recordWin({
        guesses: 3,
        mode: 'classic',
        difficulty: 'easy',
        category: 'random',
        isSpeed: false,
        isExpert: false,
        isPerfect: false,
        isDaily: false,
        elapsedSeconds: 12,
        xpEarned: 50,
        gemsEarned: 20,
      });
    });

    expect(addXP).toHaveBeenCalledWith(50);
    expect(addGems).toHaveBeenCalledWith(20);
    expect(updateStreak).toHaveBeenCalledWith(true);
  });
});

describe('useProgress - kayıp (recordLoss)', () => {
  it('gamesPlayed artar, gamesWon artmaz ve difficulty sayacı işler', async () => {
    const { result } = renderHook(() => useProgress());

    await act(async () => {
      await result.current.recordLoss('expert');
    });

    const patch = updateStats.mock.calls[0][0] as Record<string, unknown>;
    expect(patch.gamesPlayed).toBe(11);
    expect(patch.gamesWon).toBeUndefined();
    expect((patch.gamesPlayedByDifficulty as Record<string, number>).expert).toBe(1);
    expect(updateStreak).toHaveBeenCalledWith(false);
  });
});
