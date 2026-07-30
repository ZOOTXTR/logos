import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { notificationService } from '../services/notification.service';
import { audioService } from '../services/audio.service';
import { preloadDictionaries } from '../services/dictionary.service';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { setupDeepLinkHandler } from '../services/deeplink.service';
import { initErrorReporting } from '../services/error-reporting.service';

function RootLayoutContent() {
  const { language, notifEnabled } = useTheme();

  useEffect(() => { initErrorReporting(); }, []);

  useEffect(() => {
    const initNotifications = async () => {
      try {
        if (notifEnabled) {
          const allowed = await notificationService.registerForPushNotificationsAsync();
          if (allowed) {
            await notificationService.scheduleDailyNotifications(language);
          }
        }
      } catch (e) {
        console.warn('Notification init failed:', e);
      }
    };
    initNotifications();
  }, [language, notifEnabled]);

  useEffect(() => { setupDeepLinkHandler(); }, []);

  useEffect(() => {
    // Start background music loop on app startup
    audioService.startBgMusic();
    preloadDictionaries();
    return () => {
      audioService.stopBgMusic();
    };
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="anagram" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="blitz" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="chain" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="dordle" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="wordconnect" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="duel" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      </Stack>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
