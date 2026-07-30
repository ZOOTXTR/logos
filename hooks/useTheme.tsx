import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Theme, THEMES, getThemeById } from '../constants/themes';
import { storageGet, storageSet, storageSetJSON, storageGetJSON } from '../services/storage.service';

interface ThemeContextType {
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
}

const ThemeContext = createContext<ThemeContextType>({
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
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState('dark');
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(['dark']);
  const [colorBlind, setColorBlindState] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [hapticEnabled, setHapticEnabledState] = useState(true);
  const [notifEnabled, setNotifEnabledState] = useState(true);
  const [language, setLanguageState] = useState<'tr' | 'en'>('tr');
  const [dyslexiaFont, setDyslexiaFontState] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [saved, unlocked, cb, sound, haptic, notif, lang, df] = await Promise.all([
        storageGet('gq_theme'),
        storageGet('gq_unlocked_themes'),
        storageGet('gq_color_blind'),
        storageGet('gq_sound_enabled'),
        storageGet('gq_haptic_enabled'),
        storageGet('gq_notif_enabled'),
        storageGet('gq_language'),
        storageGet('gq_dyslexia_font'),
      ]);
      
      
      if (saved) setThemeId(saved);
      if (unlocked) setUnlockedThemes(JSON.parse(unlocked) as string[]);
      if (cb !== null) setColorBlindState(cb === 'true');
      if (sound !== null) setSoundEnabledState(sound === 'true');
      if (haptic !== null) setHapticEnabledState(haptic === 'true');
      if (notif !== null) setNotifEnabledState(notif === 'true');
      if (lang !== null) setLanguageState(lang as 'tr' | 'en');
      if (df !== null) setDyslexiaFontState(df === 'true');
    };
    load();
  }, []);

  const setTheme = useCallback((id: string) => {
    setThemeId(id);
    storageSet('gq_theme', id);
  }, []);

  const unlockTheme = useCallback((id: string) => {
    setUnlockedThemes(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      storageSetJSON('gq_unlocked_themes', next);
      return next;
    });
  }, []);

  // Atomically unlocks AND sets a theme in one operation (prevents race condition)
  const unlockAndSetTheme = useCallback((id: string) => {
    setUnlockedThemes(prev => {
      const next = prev.includes(id) ? prev : [...prev, id];
      storageSetJSON('gq_unlocked_themes', next);
      return next;
    });
    setThemeId(id);
    storageSet('gq_theme', id);
  }, []);

  const setColorBlind = useCallback((v: boolean) => {
    setColorBlindState(v);
    storageSet('gq_color_blind', String(v));
  }, []);

  const setSoundEnabled = useCallback((v: boolean) => {
    setSoundEnabledState(v);
    storageSet('gq_sound_enabled', String(v));
  }, []);

  const setHapticEnabled = useCallback((v: boolean) => {
    setHapticEnabledState(v);
    storageSet('gq_haptic_enabled', String(v));
  }, []);

  const setNotifEnabled = useCallback((v: boolean) => {
    setNotifEnabledState(v);
    storageSet('gq_notif_enabled', String(v));
  }, []);

  const setLanguage = useCallback((lang: 'tr' | 'en') => {
    setLanguageState(lang);
    storageSet('gq_language', lang);
  }, []);

  const setDyslexiaFont = useCallback((v: boolean) => {
    setDyslexiaFontState(v);
    storageSet('gq_dyslexia_font', String(v));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: getThemeById(themeId),
        setTheme,
        unlockedThemes,
        unlockTheme,
        unlockAndSetTheme,
        colorBlind,
        setColorBlind,
        soundEnabled,
        setSoundEnabled,
        hapticEnabled,
        setHapticEnabled,
        notifEnabled,
        setNotifEnabled,
        language,
        setLanguage,
        dyslexiaFont,
        setDyslexiaFont,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
