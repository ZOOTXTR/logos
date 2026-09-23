import * as Linking from 'expo-linking';
import { claimReferral } from './referral.service';

let subscription: { remove: () => void } | null = null;

/**
 * Deep link dinleyicisini kurar ve bir temizleme (cleanup) fonksiyonu döndürür.
 * Etkiden dönen cleanup çağrılmazsa dinleyici sızar.
 */
export function setupDeepLinkHandler(): () => void {
  if (subscription) return () => subscription?.remove();
  subscription = Linking.addEventListener('url', handleDeepLink);
  Linking.getInitialURL()
    .then(url => { if (url) handleDeepLink({ url }); })
    .catch(() => {});
  return () => { subscription?.remove(); subscription = null; };
}

async function handleDeepLink(event: { url: string }) {
  try {
    const parsed = Linking.parse(event.url);
    const scheme = (parsed.scheme ?? '').toLowerCase();
    // Yalnızca kendi şemalarımızı kabul et; keyfi uygulama/web tetiklemesini engelle
    if (scheme && !['logos', 'exp', 'https', 'http'].includes(scheme)) return;

    const rawRef = (parsed.queryParams?.ref ?? parsed.queryParams?.code) as string | undefined;
    if (typeof rawRef !== 'string') return;

    const code = rawRef.trim().toUpperCase();
    // Katı format: 4-16 karakter, yalnızca A-Z0-9
    if (!/^[A-Z0-9]{4,16}$/.test(code)) return;

    await claimReferral(code);
  } catch {
    // Geçersiz/ayrıştırılamayan link sessizce yok sayılır
  }
}
