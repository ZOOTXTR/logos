import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { ensureAnonymousAuth } from '../services/firebase';
import { initAuth } from '../services/auth.service';
import { initAppCheck } from '../services/appCheck.service';
import { storageGet } from '../services/storage.service';

function RootStack() {
  const { activeTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // App Check'i ÖNCE kur (native sağlayıcı + JS SDK köprüsü), sonra auth/Firestore
    // çağrıları yap — aksi halde enforcement istekleri token'sız kalabilir.
    initAppCheck().finally(() => {
      // Authenticate anonymously in the background via Firebase
      ensureAnonymousAuth();
      // app-level currentUser'ı da kur (multiplayer/liderlik/referral buna bağlı)
      initAuth().catch(() => {});
    });
    // First-launch onboarding gate
    storageGet('gq_onboarded').then((v) => {
      if (v !== 'true') router.replace('/onboarding');
    }).catch(() => {});
  }, [router]);

  return (
    <View style={[styles.root, { backgroundColor: activeTheme.canvas }]}>
      <StatusBar style="light" backgroundColor={activeTheme.canvas} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: activeTheme.canvas },
          animation: 'fade'
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="game"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom'
          }}
        />
      </Stack>
    </View>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
