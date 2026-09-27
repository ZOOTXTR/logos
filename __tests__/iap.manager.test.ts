import { renderHook, act, waitFor } from '@testing-library/react-native';

type PurchaseLike = {
  productId?: string;
  purchaseToken?: string;
  transactionId?: string;
  isAcknowledgedAndroid?: boolean;
};

jest.mock('react-native-iap', () => ({
  initConnection: jest.fn(async () => {}),
  endConnection: jest.fn(async () => {}),
  getProducts: jest.fn(async () => []),
  getSubscriptions: jest.fn(async () => []),
  requestPurchase: jest.fn(async () => {}),
  requestSubscription: jest.fn(async () => {}),
  finishTransaction: jest.fn(async () => {}),
  purchaseUpdatedListener: jest.fn((cb: (p: PurchaseLike) => Promise<void>) => {
    (globalThis as unknown as { __iapPurchaseCb: unknown }).__iapPurchaseCb = cb;
    return { remove: jest.fn() };
  }),
  purchaseErrorListener: jest.fn(() => ({ remove: jest.fn() })),
  getAvailablePurchases: jest.fn(async () => [] as PurchaseLike[]),
}));

jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({})),
  httpsCallable: jest.fn(() => jest.fn(async () => ({ data: { success: true, verified: true } }))),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
}));

import { useIAPManager } from '../hooks/useIAPManager';
import * as iap from 'react-native-iap';
import * as functions from 'firebase/functions';

const finishTransaction = iap.finishTransaction as unknown as jest.Mock;
const getAvailablePurchases = iap.getAvailablePurchases as unknown as jest.Mock;
const httpsCallable = functions.httpsCallable as unknown as jest.Mock;

const getPurchaseCb = (): ((p: PurchaseLike) => Promise<void>) =>
  (globalThis as unknown as { __iapPurchaseCb: (p: PurchaseLike) => Promise<void> }).__iapPurchaseCb;

beforeEach(() => {
  jest.clearAllMocks();
  httpsCallable.mockImplementation(() => jest.fn(async () => ({ data: { success: true, verified: true } })));
});

describe('useIAPManager - satın alma deduplikasyonu', () => {
  it('aynı purchaseToken iki kez gelince gem SADECE bir kez verilir', async () => {
    const onPurchase = jest.fn(async () => {});
    const showAlert = jest.fn();
    renderHook(() => useIAPManager({ visible: true, onPurchase, onPurchasePremium: jest.fn(), language: 'tr', showAlert }));
    await waitFor(() => expect(getPurchaseCb()).toBeTruthy());

    const purchase: PurchaseLike = { productId: 'gem_pack_1', purchaseToken: 'tok-1', transactionId: 't1', isAcknowledgedAndroid: false };

    await act(async () => { await getPurchaseCb()(purchase); });
    await act(async () => { await getPurchaseCb()(purchase); });

    expect(onPurchase).toHaveBeenCalledTimes(1);
    expect(finishTransaction).toHaveBeenCalledTimes(1);
  });

  it('doğrulama başarısızsa gem VERİLMEZ ve işlem onaylanmaz', async () => {
    const onPurchase = jest.fn(async () => {});
    const showAlert = jest.fn();
    renderHook(() => useIAPManager({ visible: true, onPurchase, onPurchasePremium: jest.fn(), language: 'tr', showAlert }));
    await waitFor(() => expect(getPurchaseCb()).toBeTruthy());

    httpsCallable.mockReturnValueOnce(jest.fn(async () => ({ data: { success: false, verified: false } })));

    const purchase: PurchaseLike = { productId: 'gem_pack_1', purchaseToken: 'tok-bad', transactionId: 'tb', isAcknowledgedAndroid: false };
    await act(async () => { await getPurchaseCb()(purchase); });

    expect(onPurchase).not.toHaveBeenCalled();
    expect(finishTransaction).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalled();
  });
});

describe('useIAPManager - geri yükleme (restore)', () => {
  it('premium abonelik geri yüklenince finishTransaction(false) ile onaylanır', async () => {
    const onPurchasePremium = jest.fn(async () => {});
    getAvailablePurchases.mockResolvedValueOnce([{ productId: 'premium_monthly', purchaseToken: 'sub-1', transactionId: 's1' }]);

    const { result } = renderHook(() => useIAPManager({ visible: true, onPurchase: jest.fn(), onPurchasePremium, language: 'tr', showAlert: jest.fn() }));
    await waitFor(() => expect(getPurchaseCb()).toBeTruthy());

    await act(async () => { await result.current.handleRestore(); });

    expect(onPurchasePremium).toHaveBeenCalledTimes(1);
    expect(finishTransaction).toHaveBeenCalledWith(expect.objectContaining({ isConsumable: false }));
  });

  it('tüketilebilir gem paketleri restore ile YENİDEN verilmez (elmas çoğaltma engeli)', async () => {
    const onPurchase = jest.fn(async () => {});
    getAvailablePurchases.mockResolvedValueOnce([{ productId: 'gem_pack_1', purchaseToken: 'g1' }]);

    const { result } = renderHook(() => useIAPManager({ visible: true, onPurchase, onPurchasePremium: jest.fn(), language: 'tr', showAlert: jest.fn() }));
    await waitFor(() => expect(getPurchaseCb()).toBeTruthy());

    await act(async () => { await result.current.handleRestore(); });

    expect(onPurchase).not.toHaveBeenCalled();
  });
});
