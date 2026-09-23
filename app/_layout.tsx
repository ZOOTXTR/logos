import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { notificationService } from '../services/notification.service';
import { audioService } from '../services/audio.service';
import { preloadDictionaries } from '../services/dictionary.service';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { setupDeepLinkHandler } from '../services/deeplink.service';
import { initErrorReporting } from '../services/error-reporting.service';
import { AgeGateModal } from '../components/AgeGateModal';
import { initAuth } from '../services/auth.service';

function RootLayoutContent() {
  const { language, notifEnabled } = useTheme();
  const [ageChecked, setAgeChecked] = useState(false);

  const handleAgeComplete = (isChild: boolean) => {
    setAgeChecked(true);
    if (!isChild) {
      initErrorReporting();
      initAuth();
    }
  };

  useEffect(() => {
    const initNotifications = async () => {
      try {
        if (notifEnabled) {
          const allowed = await notificationService.registerForPushNotificationsAsync();
          if (allowed) {
            await notificationService.scheduleDailyNotifications(language);
          }
        } else {
          await notificationService.cancelDailyNotifications();
        }
      } catch (e) {
        console.warn('Notification init failed:', e);
      }
    };
    initNotifications();
  }, [language, notifEnabled]);

  useEffect(() => setupDeepLinkHandler(), []);

  useEffect(() => {
    // Start background music immediately (lightweight)
    audioService.startBgMusic();

    // Defer heavy preloading to after first render
    const { InteractionManager } = require('react-native');
    const handle = InteractionManager.runAfterInteractions(() => {
      audioService.preloadSounds();
      preloadDictionaries();
    });

    return () => {
      handle.cancel();
      audioService.stopBgMusic();
    };
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <AgeGateModal onComplete={handleAgeComplete} />
      {ageChecked && (
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
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
