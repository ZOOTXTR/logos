import { useEffect, useState } from 'react';
import { useTheme as usePalette } from '../context/ThemeContext';
import { storageGet } from '../services/storage.service';
import { Theme, ThemeColors } from '../constants/themes';

// gq bileşenleri (useGame/GamePlayScreen/GameBoard...) gq `useTheme` API'sini bekler.
// Bu shim, expo-logos'un ThemeContext'i + AsyncStorage'dan gq uyumlu bir tema üretir.

function toThemeColors(a: {
  canvas: string; surface: string; card: string; border: string;
  primary: string; primaryHover: string; accent: string;
}): ThemeColors {
  return {
    background: a.canvas,
    surface: a.surface,
    surfaceLight: a.card,
    card: a.card,
    primary: a.primary,
    primaryLight: a.accent,
    primaryDark: a.primaryHover,
    accent: a.accent,
    accentLight: a.accent,
    correct: '#22C55E',
    present: '#F59E0B',
    absent: a.border,
    empty: a.surface,
    gem: a.accent,
    gemDark: a.accent,
    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    border: a.border,
    borderLight: a.border,
    error: '#EF4444',
    warning: '#F59E0B',
  };
}

export function useTheme() {
  const { activeTheme } = usePalette();
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [colorBlind, setColorBlind] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);

  useEffect(() => {
    Promise.all([
      storageGet('gq_language'),
      storageGet('gq_color_blind'),
      storageGet('gq_dyslexia_font'),
    ]).then(([l, cb, df]) => {
      if (l === 'en' || l === 'tr') setLanguage(l);
      setColorBlind(cb === 'true');
      setDyslexiaFont(df === 'true');
    });
  }, []);

  const theme: Theme = {
    id: activeTheme.id,
    name: activeTheme.name,
    emoji: '',
    description: activeTheme.description,
    badge: activeTheme.badge,
    gemCost: 0,
    preview: [activeTheme.canvas, activeTheme.primary],
    colors: toThemeColors(activeTheme),
  };

  return {
    theme,
    language,
    colorBlind,
    dyslexiaFont,
    setLanguage,
    setColorBlind,
    setDyslexiaFont,
  };
}
