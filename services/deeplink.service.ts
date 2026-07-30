import * as Linking from 'expo-linking';
import { claimReferral } from './referral.service';

export function setupDeepLinkHandler() {
  Linking.addEventListener('url', handleDeepLink);
  Linking.getInitialURL().then(url => {
    if (url) handleDeepLink({ url });
  });
}

async function handleDeepLink(event: { url: string }) {
  const url = event.url;
  const refMatch = url.match(/ref=([A-Z0-9]+)/i);
  if (refMatch) {
    const code = refMatch[1].toUpperCase();
    await claimReferral(code);
  }
}
