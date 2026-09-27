jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    getItemAsync: jest.fn(async (k: string) => (store.has(k) ? (store.get(k) as string) : null)),
    setItemAsync: jest.fn(async (k: string, v: string) => { store.set(k, v); }),
    deleteItemAsync: jest.fn(async (k: string) => { store.delete(k); }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    getItem: jest.fn(async (k: string) => (store.has(k) ? (store.get(k) as string) : null)),
    setItem: jest.fn(async (k: string, v: string) => { store.set(k, v); }),
    removeItem: jest.fn(async (k: string) => { store.delete(k); }),
  };
});

import { addGems, getGems, spendGems } from '../services/storage.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const resetStore = () => {
  (AsyncStorage as unknown as { __store: Map<string, string> }).__store.clear();
  (SecureStore as unknown as { __store: Map<string, string> }).__store.clear();
};

beforeEach(() => {
  resetStore();
});

describe('storage.service - mutex / eşzamanlılık', () => {
  it('eşzamanlı addGems çağrıları kaybolmaz (serileştirme)', async () => {
    // Varsayılan bakiye 150; iki eşzamanlı +50 kayıpsız uygulanmalı.
    const [a, b] = await Promise.all([addGems(50), addGems(50)]);

    expect(await getGems()).toBe(250);
    expect([a, b].sort((x, y) => x - y)).toEqual([200, 250]);
  });

  it('eşzamanlı spendGems bakiyeyi aşamaz', async () => {
    const [r1, r2] = await Promise.all([spendGems(100), spendGems(100)]);

    const successes = [r1, r2].filter(r => r.success).length;
    expect(successes).toBe(1);
    expect(await getGems()).toBe(50);
  });
});
