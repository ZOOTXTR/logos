import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

export function initErrorReporting() {
  if (!SENTRY_DSN) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.EXPO_PUBLIC_ENV ?? 'development',
    tracesSampleRate: 0.2,
  });
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) {
    console.warn('[ErrorReporting]', error.message, context);
    return;
  }
  Sentry.captureException(error, { extra: context });
}

export function setUserContext(uid: string, email?: string) {
  if (!SENTRY_DSN) return;
  Sentry.setUser({ id: uid, email });
}

export function clearUserContext() {
  if (!SENTRY_DSN) return;
  Sentry.setUser(null);
}
