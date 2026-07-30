import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Public high-quality Sfx and Music assets
const SOUNDS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
  win: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav',
  loss: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-84.wav',
};

const BG_MUSIC_URL = 'https://assets.mixkit.co/active_storage/music/2422/2422-500.mp3'; // Chill Zen Lofi

class AudioService {
  private bgMusicSound: Audio.Sound | null = null;
  private isMusicPlaying = false;

  private async checkSetting(key: string): Promise<boolean> {
    try {
      const v = await AsyncStorage.getItem(key);
      return v === null ? true : v === 'true';
    } catch {
      return true;
    }
  }

  // ── BACKGROUND MUSIC ──────────────────────────────────────
  async startBgMusic() {
    const isMusicEnabled = await this.checkSetting('gq_music_enabled');
    if (!isMusicEnabled) {
      this.stopBgMusic();
      return;
    }

    if (this.isMusicPlaying) return;

    try {
      if (!this.bgMusicSound) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: BG_MUSIC_URL },
          { shouldPlay: true, isLooping: true, volume: 0.25 }
        );
        this.bgMusicSound = sound;
      } else {
        await this.bgMusicSound.playAsync();
      }
      this.isMusicPlaying = true;
    } catch (e) {
      console.warn('Background music failed to start:', e);
    }
  }

  async stopBgMusic() {
    if (!this.isMusicPlaying) return;
    try {
      if (this.bgMusicSound) {
        await this.bgMusicSound.pauseAsync();
      }
      this.isMusicPlaying = false;
    } catch (e) {
      console.warn('Background music pause failed:', e);
    }
  }

  async toggleBgMusic(enabled: boolean) {
    await AsyncStorage.setItem('gq_music_enabled', String(enabled));
    if (enabled) {
      this.startBgMusic();
    } else {
      this.stopBgMusic();
    }
  }

  // ── SOUNDS ───────────────────────────────────────────────
  async play(type: keyof typeof SOUNDS) {
    const isSoundEnabled = await this.checkSetting('gq_sound_enabled');
    if (!isSoundEnabled) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: SOUNDS[type] },
        { shouldPlay: true, volume: 0.7 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // ── HAPTICS ──────────────────────────────────────────────
  async triggerHaptic(style: 'light' | 'medium' | 'success' | 'warning' = 'light') {
    const isHapticEnabled = await this.checkSetting('gq_haptic_enabled');
    if (!isHapticEnabled) return;

    try {
      switch (style) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
      }
    } catch (e) {
      // Haptics not supported in simulator, fail silently
    }
  }
}

export const audioService = new AudioService();
export default audioService;
