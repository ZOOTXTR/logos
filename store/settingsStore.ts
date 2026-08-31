import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { Theme, THEMES, getThemeById } from '../constants/themes';
import { storageGet, storageSet, storageSetJSON } from '../services/storage.service';

export interface SettingsStoreState {
  themeId: string;
  unlockedThemes: string[];
  colorBlind: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  notifEnabled: boolean;
  language: 'tr' | 'en';
  dyslexiaFont: boolean;
  systemKeyboard: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setTheme: (id: string) => void;
  unlockTheme: (id: string) => void;
  unlockAndSetTheme: (id: string) => void;
  setColorBlind: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  setHapticEnabled: (v: boolean) => void;
  setNotifEnabled: (v: boolean) => void;
  setLanguage: (lang: 'tr' | 'en') => void;
  setDyslexiaFont: (v: boolean) => void;
  setSystemKeyboard: (v: boolean) => void;
}

let hydrationStarted = false;

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  themeId: 'dark',
  unlockedThemes: ['dark'],
  colorBlind: false,
  soundEnabled: true,
  hapticEnabled: true,
  notifEnabled: true,
  language: 'tr',
  dyslexiaFont: false,
  systemKeyboard: false,
  hydrated: false,

  hydrate: async () => {
    if (hydrationStarted) return;
    hydrationStarted = true;
    try {
      const [saved, unlocked, cb, sound, haptic, notif, lang, df, sysKb] = await Promise.all([
        storageGet('gq_theme'),
        storageGet('gq_unlocked_themes'),
        storageGet('gq_color_blind'),
        storageGet('gq_sound_enabled'),
        storageGet('gq_haptic_enabled'),
        storageGet('gq_notif_enabled'),
        storageGet('gq_language'),
        storageGet('gq_dyslexia_font'),
        storageGet('gq_system_keyboard'),
      ]);
      set({
        themeId: saved || 'dark',
        unlockedThemes: unlocked ? JSON.parse(unlocked) as string[] : ['dark'],
        colorBlind: cb !== null ? cb === 'true' : false,
        soundEnabled: sound !== null ? sound === 'true' : true,
        hapticEnabled: haptic !== null ? haptic === 'true' : true,
        notifEnabled: notif !== null ? notif === 'true' : true,
        language: lang ? lang as 'tr' | 'en' : 'tr',
        dyslexiaFont: df !== null ? df === 'true' : false,
        systemKeyboard: sysKb !== null ? sysKb === 'true' : false,
      });
    } catch (e) {
      console.error('Failed to hydrate settings store:', e);
    } finally {
      set({ hydrated: true });
    }
  },

  setTheme: (id) => {
    set({ themeId: id });
    storageSet('gq_theme', id);
  },

  unlockTheme: (id) => {
    const { unlockedThemes } = useSettingsStore.getState();
    if (unlockedThemes.includes(id)) return;
    const next = [...unlockedThemes, id];
    storageSetJSON('gq_unlocked_themes', next);
    set({ unlockedThemes: next });
  },

  unlockAndSetTheme: (id) => {
    const { unlockedThemes } = useSettingsStore.getState();
    const next = unlockedThemes.includes(id) ? unlockedThemes : [...unlockedThemes, id];
    storageSetJSON('gq_unlocked_themes', next);
    set({ unlockedThemes: next, themeId: id });
    storageSet('gq_theme', id);
  },

  setColorBlind: (v) => {
    set({ colorBlind: v });
    storageSet('gq_color_blind', String(v));
  },

  setSoundEnabled: (v) => {
    set({ soundEnabled: v });
    storageSet('gq_sound_enabled', String(v));
  },

  setHapticEnabled: (v) => {
    set({ hapticEnabled: v });
    storageSet('gq_haptic_enabled', String(v));
  },

  setNotifEnabled: (v) => {
    set({ notifEnabled: v });
    storageSet('gq_notif_enabled', String(v));
  },

  setLanguage: (lang) => {
    set({ language: lang });
    storageSet('gq_language', lang);
  },

  setDyslexiaFont: (v) => {
    set({ dyslexiaFont: v });
    storageSet('gq_dyslexia_font', String(v));
  },

  setSystemKeyboard: (v) => {
    set({ systemKeyboard: v });
    storageSet('gq_system_keyboard', String(v));
  },
}));

export interface ThemeContextType {
  theme: Theme;
  setTheme: (id: string) => void;
  unlockedThemes: string[];
  unlockTheme: (id: string) => void;
  unlockAndSetTheme: (id: string) => void;
  colorBlind: boolean;
  setColorBlind: (v: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  hapticEnabled: boolean;
  setHapticEnabled: (v: boolean) => void;
  notifEnabled: boolean;
  setNotifEnabled: (v: boolean) => void;
  language: 'tr' | 'en';
  setLanguage: (lang: 'tr' | 'en') => void;
  dyslexiaFont: boolean;
  setDyslexiaFont: (v: boolean) => void;
  systemKeyboard: boolean;
  setSystemKeyboard: (v: boolean) => void;
}

export const THEME_DEFAULTS: ThemeContextType = {
  theme: THEMES[0],
  setTheme: () => {},
  unlockedThemes: ['dark'],
  unlockTheme: () => {},
  unlockAndSetTheme: () => {},
  colorBlind: false,
  setColorBlind: () => {},
  soundEnabled: true,
  setSoundEnabled: () => {},
  hapticEnabled: true,
  setHapticEnabled: () => {},
  notifEnabled: true,
  setNotifEnabled: () => {},
  language: 'tr',
  setLanguage: () => {},
  dyslexiaFont: false,
  setDyslexiaFont: () => {},
  systemKeyboard: false,
  setSystemKeyboard: () => {},
};
