import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAPTIC_STORAGE_KEY = '@logos_haptic_enabled_v1';

class HapticManager {
  public enabled: boolean = true;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const saved = await AsyncStorage.getItem(HAPTIC_STORAGE_KEY);
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch {
      // fallback
    }
  }

  async setEnabled(val: boolean) {
    this.enabled = val;
    try {
      await AsyncStorage.setItem(HAPTIC_STORAGE_KEY, val.toString());
    } catch {
      // fallback
    }
  }

  /** Light tactile tap when typing a letter on keyboard */
  async keyPress() {
    if (!this.enabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }

  /** Medium notch tap when pressing backspace */
  async keyDelete() {
    if (!this.enabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  }

  /** Double rhythmic pulse when submitting a valid guess row */
  async submitGuess() {
    if (!this.enabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 70);
    } catch {}
  }

  /** Sharp warning notification when an incomplete word is submitted */
  async invalidGuess() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
  }

  /** Error vibration when evaluated word is incorrect */
  async wrongGuess() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  }

  /** Festive multi-stage celebration notification when winning the game */
  async winGame() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 180);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 340);
    } catch {}
  }

  /** Descending defeat vibration when attempts are exhausted */
  async loseGame() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 150);
    } catch {}
  }

  /** Gentle magical sparkle pulse when unlocking a hint or booster */
  async hintUsed() {
    if (!this.enabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => {
        Haptics.selectionAsync();
      }, 60);
    } catch {}
  }

  /** Cascade vibration when collecting gems or leveling up */
  async gemReward() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  }

  /** Subtle micro-tap for general button clicks and tabs */
  async buttonTap() {
    if (!this.enabled) return;
    try {
      await Haptics.selectionAsync();
    } catch {}
  }
}

export const haptics = new HapticManager();
