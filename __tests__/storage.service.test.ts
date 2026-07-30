import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGems, addGems, spendGems, isPremium, setPremium } from '../services/storage.service';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('storage.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGems', () => {
    it('returns default 150 when no value stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await getGems();
      expect(result).toBe(150);
    });

    it('returns parsed value when stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('200');
      const result = await getGems();
      expect(result).toBe(200);
    });

    it('calls AsyncStorage with correct key', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('150');
      await getGems();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('gq_gems');
    });
  });

  describe('addGems', () => {
    it('adds gems to existing balance', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('100');
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      const result = await addGems(50);
      expect(result).toBe(150);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('gq_gems', '150');
    });
  });

  describe('spendGems', () => {
    it('returns success when sufficient gems', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('100');
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      const result = await spendGems(30);
      expect(result).toEqual({ success: true, remaining: 70 });
    });

    it('returns failure when insufficient gems', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('10');
      const result = await spendGems(30);
      expect(result).toEqual({ success: false, remaining: 10 });
    });
  });

  describe('premium', () => {
    it('isPremium returns false when not set', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await isPremium();
      expect(result).toBe(false);
    });

    it('isPremium returns true when set', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      const result = await isPremium();
      expect(result).toBe(true);
    });

    it('setPremium stores the value', async () => {
      await setPremium(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('gq_premium', 'true');
    });
  });
});
