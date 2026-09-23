import crashlytics from '@react-native-firebase/crashlytics';
const c = crashlytics as any;

function safe(fn: () => void) {
  try {
    fn();
  } catch {
    // Crashlytics native modülü yoksa (web/Expo Go) sessizce yoksay
  }
}

function toStringMap(context?: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  if (context) {
    for (const [k, v] of Object.entries(context)) {
      if (v === undefined || v === null) continue;
      out[k] = typeof v === 'string' ? v : JSON.stringify(v);
    }
  }
  return out;
}

export function initErrorReporting() {
  safe(() => { c().log('[ErrorReporting] Crashlytics initialized'); });
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  console.warn('[ErrorReporting]', error.message, context);
  safe(() => {
    const attrs = toStringMap(context);
    if (Object.keys(attrs).length > 0) c().setAttributes(attrs);
    c().recordError(error);
  });
}

// PII (e-posta) GÖNDERİLMEZ; yalnızca anonim uid gönderilir (KVKK/GDPR).
export function setUserContext(uid: string) {
  safe(() => { c().setUserId(uid); });
}

export function clearUserContext() {
  safe(() => { c().setUserId(''); });
}
