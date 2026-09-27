import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_ENABLED_KEY = '@logos_sound_enabled_v1';
const SOUND_VOLUME_KEY = '@logos_sound_volume_v1';

class SoundManager {
  public enabled: boolean = true;
  public volume: number = 0.8;
  private isConfigured: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const [savedEnabled, savedVolume] = await Promise.all([
        AsyncStorage.getItem(SOUND_ENABLED_KEY),
        AsyncStorage.getItem(SOUND_VOLUME_KEY)
      ]);
      if (savedEnabled !== null) this.enabled = savedEnabled === 'true';
      if (savedVolume !== null) this.volume = parseFloat(savedVolume);

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true
      });
      this.isConfigured = true;
    } catch {
      // Audio setup fallback
    }
  }

  async setEnabled(val: boolean) {
    this.enabled = val;
    try {
      await AsyncStorage.setItem(SOUND_ENABLED_KEY, val.toString());
    } catch {}
  }

  async setVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.volume = clamped;
    try {
      await AsyncStorage.setItem(SOUND_VOLUME_KEY, clamped.toString());
    } catch {}
  }

  /**
   * Synthesize or play tone safely using Audio.Sound or silent cue
   */
  private async playTone(frequency: number, duration: number, _type: 'sine' | 'triangle' | 'square' = 'sine') {
    if (!this.enabled || this.volume <= 0) return;
    // In React Native / Expo without bundled asset files, Audio tones can be played
    // via base64 wav data URI or bundled sound files.
    // We implement a fast base64 WAV generator for zero-latency procedural game audio!
    try {
      const wavUri = this.generateWavDataUri(frequency, duration, this.volume);
      const { sound } = await Audio.Sound.createAsync(
        { uri: wavUri },
        { shouldPlay: true, volume: this.volume }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {
      // graceful audio fallback
    }
  }

  /**
   * Generates PCM 16-bit Mono WAV Data URI dynamically for ultra-responsive sound synthesis
   */
  private generateWavDataUri(freq: number, durationSec: number, vol: number): string {
    const sampleRate = 22050;
    const numSamples = Math.floor(sampleRate * durationSec);
    const headerByteLength = 44;
    const dataByteLength = numSamples * 2;
    const buffer = new ArrayBuffer(headerByteLength + dataByteLength);
    const view = new DataView(buffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataByteLength, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataByteLength, true);

    // Write samples with smooth exponential decay envelope
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 6);
      const sample = Math.sin(2 * Math.PI * freq * t) * 32767 * vol * envelope;
      view.setInt16(offset, Math.max(-32768, Math.min(32767, Math.floor(sample))), true);
      offset += 2;
    }

    // Convert arraybuffer to base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = typeof btoa === 'function' ? btoa(binary) : '';
    return `data:audio/wav;base64,${b64}`;
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /** Crisp keyboard typing click */
  playKey() {
    this.playTone(540, 0.04);
  }

  /** Backspace deletion click */
  playDelete() {
    this.playTone(320, 0.06);
  }

  /** UI Button click */
  playClick() {
    this.playTone(480, 0.05);
  }

  /** Dissonant buzz when wrong word is entered */
  playIncorrect() {
    this.playTone(180, 0.22);
    setTimeout(() => this.playTone(140, 0.25), 60);
  }

  /** Ascending arpeggio when hint is used */
  playHint() {
    this.playTone(587, 0.08);
    setTimeout(() => this.playTone(740, 0.1), 70);
    setTimeout(() => this.playTone(880, 0.16), 140);
  }

  /** Single gem chime */
  playGem() {
    this.playTone(987, 0.12);
  }

  /** Crystal cascade when gems are collected */
  playGemEarned() {
    this.playTone(659, 0.07);
    setTimeout(() => this.playTone(880, 0.08), 60);
    setTimeout(() => this.playTone(1174, 0.09), 120);
    setTimeout(() => this.playTone(1318, 0.18), 180);
  }

  /** Royal level up fanfare */
  playLevelUp() {
    this.playTone(523, 0.1);
    setTimeout(() => this.playTone(659, 0.1), 90);
    setTimeout(() => this.playTone(784, 0.1), 180);
    setTimeout(() => this.playTone(1046, 0.3), 270);
  }

  /** Victory chime upon solving puzzle */
  playVictory() {
    this.playTone(523, 0.08);
    setTimeout(() => this.playTone(659, 0.08), 80);
    setTimeout(() => this.playTone(784, 0.12), 160);
    setTimeout(() => this.playTone(1046, 0.28), 260);
  }
}

export const sounds = new SoundManager();
