import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local bundled high-quality Sfx and Music assets
const SOUNDS = {
  click: require('../assets/audio/click.wav'),
  win: require('../assets/audio/win.wav'),
  loss: require('../assets/audio/loss.wav'),
};

const BG_MUSIC = require('../assets/audio/bg_music.wav');

export type SoundType = keyof typeof SOUNDS;

class AudioService {
  private soundPool: Partial<Record<SoundType, Audio.Sound>> = {};
  private bgMusicSound: Audio.Sound | null = null;
  private isMusicPlaying = false;

  // In-memory cached settings to eliminate SQLite/bridge latency on rapid user interactions
  private soundEnabled = true;
  private hapticEnabled = true;
  private musicEnabled = true;
  private settingsInitialized = false;

  constructor() {
    this.loadSettings();
  }

  private async loadSettings() {
    if (this.settingsInitialized) return;
    try {
      const [sound, haptic, music] = await Promise.all([
        AsyncStorage.getItem('gq_sound_enabled'),
        AsyncStorage.getItem('gq_haptic_enabled'),
        AsyncStorage.getItem('gq_music_enabled'),
      ]);
      if (sound !== null) this.soundEnabled = sound === 'true';
      if (haptic !== null) this.hapticEnabled = haptic === 'true';
      if (music !== null) this.musicEnabled = music === 'true';
      this.settingsInitialized = true;
    } catch {
      this.settingsInitialized = true;
    }
  }

  initSettings(sound: boolean, haptic: boolean, music: boolean) {
    this.soundEnabled = sound;
    this.hapticEnabled = haptic;
    this.musicEnabled = music;
    this.settingsInitialized = true;
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    AsyncStorage.setItem('gq_sound_enabled', String(enabled)).catch(() => {});
  }

  setHapticEnabled(enabled: boolean) {
    this.hapticEnabled = enabled;
    AsyncStorage.setItem('gq_haptic_enabled', String(enabled)).catch(() => {});
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    AsyncStorage.setItem('gq_music_enabled', String(enabled)).catch(() => {});
  }

  // Preload sound instances into the pool for instant low-latency playback
  async preloadSounds() {
    try {
      const types: SoundType[] = ['click', 'win', 'loss'];
      await Promise.all(
        types.map(async (type) => {
          if (!this.soundPool[type]) {
            const { sound } = await Audio.Sound.createAsync(SOUNDS[type], { volume: 0.7 });
            this.soundPool[type] = sound;
          }
        })
      );
    } catch (e) {
      console.warn('Audio preloading failed:', e);
    }
  }

  // ── BACKGROUND MUSIC ──────────────────────────────────────
  async startBgMusic() {
    await this.loadSettings();
    if (!this.musicEnabled) {
      this.stopBgMusic();
      return;
    }

    if (this.isMusicPlaying) return;

    try {
      if (!this.bgMusicSound) {
        const { sound } = await Audio.Sound.createAsync(
          BG_MUSIC,
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
    if (!this.isMusicPlaying && !this.bgMusicSound) return;
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
    this.setMusicEnabled(enabled);
    if (enabled) {
      this.startBgMusic();
    } else {
      this.stopBgMusic();
    }
  }

  // ── SOUNDS (POOLED & REUSED) ──────────────────────────────
  async play(type: SoundType) {
    await this.loadSettings();
    if (!this.soundEnabled) return;

    try {
      let sound = this.soundPool[type];
      if (!sound) {
        const result = await Audio.Sound.createAsync(
          SOUNDS[type],
          { shouldPlay: true, volume: 0.7 }
        );
        sound = result.sound;
        this.soundPool[type] = sound;
      } else {
        await sound.replayAsync();
      }
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // ── HAPTICS ──────────────────────────────────────────────
  async triggerHaptic(style: 'light' | 'medium' | 'success' | 'warning' = 'light') {
    if (!this.hapticEnabled) return;

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
      // Haptics not supported in simulator / web, fail silently
    }
  }

  // Cleanup all pooled sound instances on termination
  async unloadAll() {
    try {
      const sounds = Object.values(this.soundPool);
      await Promise.all(sounds.map(s => s?.unloadAsync()));
      this.soundPool = {};

      if (this.bgMusicSound) {
        await this.bgMusicSound.unloadAsync();
        this.bgMusicSound = null;
        this.isMusicPlaying = false;
      }
    } catch (e) {
      console.warn('Audio unload error:', e);
    }
  }
}

export const audioService = new AudioService();
export default audioService;
