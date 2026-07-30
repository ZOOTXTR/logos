import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseApp } from '../config/firebase';

// Set default notification handler behaviors
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '' });
    if (token) {
      await AsyncStorage.setItem('gq_push_token', token);
    }
    return token ?? null;
  } catch (e) {
    console.warn('Failed to register push notification token:', e);
    return null;
  }
}

class NotificationService {
  async registerForPushNotificationsAsync(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
      });
    }

    try {
      await registerForPushNotifications();
    } catch (_) {}

    return true;
  }

  async scheduleDailyNotifications(language: 'tr' | 'en' = 'tr') {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const dailyTitle = language === 'en' ? '🌟 Daily Challenge Ready!' : '🌟 Günün Kelimesi Hazır!';
      const dailyBody = language === 'en' 
        ? 'A new hidden word is waiting. Solve it to earn +100 Gems bonus! 💎' 
        : 'Yeni günlük kelime hazır. Hemen çözüp +100 Gem bonusunu kap! 💎';

      await Notifications.scheduleNotificationAsync({
        content: { title: dailyTitle, body: dailyBody, sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, hour: 10, minute: 0, repeats: true },
      });

      const eveningTitle = language === 'en' ? '🔥 Protect Your Streak!' : '🔥 Serini Koruma Zamanı!';
      const eveningBody = language === 'en'
        ? 'Do not lose your daily streak multiplier. Open Logos and play now! ⏱️'
        : 'Günlük kazanma serini kaybetmek istemezsin. Logos\'e gir ve serini devam ettir! ⏱️';

      await Notifications.scheduleNotificationAsync({
        content: { title: eveningTitle, body: eveningBody, sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, hour: 20, minute: 0, repeats: true },
      });

    } catch (e) {
      console.warn('Failed to schedule notifications:', e);
    }
  }
}

export const notificationService = new NotificationService();
