import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemePalette {
  id: string;
  name: string;
  description: string;
  badge: string;
  canvas: string;
  surface: string;
  card: string;
  border: string;
  primary: string;
  primaryHover: string;
  accent: string;
  glow: string;
  previewColors: [string, string, string, string];
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'obsidian',
    name: 'Obsidian Mor',
    description: 'Klasik, sakin ve odaklanmış mor & camgöbeği',
    badge: 'Varsayılan',
    canvas: '#0B0C10',
    surface: '#121317',
    card: '#17181D',
    border: '#26272B',
    primary: '#7C5CFF',
    primaryHover: '#6e4ef5',
    accent: '#38BDF8',
    glow: 'rgba(124, 92, 255, 0.4)',
    previewColors: ['#0B0C10', '#17181D', '#7C5CFF', '#38BDF8']
  },
  {
    id: 'midnight',
    name: 'Gece Mavisi',
    description: 'Derin okyanus laciverti ve kobalt gökyüzü',
    badge: 'Popüler',
    canvas: '#080E1A',
    surface: '#0F172A',
    card: '#1E293B',
    border: '#334155',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    accent: '#38BDF8',
    glow: 'rgba(59, 130, 246, 0.4)',
    previewColors: ['#080E1A', '#1E293B', '#3B82F6', '#38BDF8']
  },
  {
    id: 'forest',
    name: 'Orman Yeşili',
    description: 'Taze zümrüt, çam ormanı ve ferah nane',
    badge: 'Doğal',
    canvas: '#07150E',
    surface: '#0B2016',
    card: '#132E20',
    border: '#1F4A34',
    primary: '#10B981',
    primaryHover: '#059669',
    accent: '#34D399',
    glow: 'rgba(16, 185, 129, 0.4)',
    previewColors: ['#07150E', '#132E20', '#10B981', '#34D399']
  },
  {
    id: 'sunset',
    name: 'Gün Batımı',
    description: 'Sıcak akşam kızıllığı, yakut ve kehribar',
    badge: 'Canlı',
    canvas: '#160B0E',
    surface: '#211015',
    card: '#2E161E',
    border: '#48232F',
    primary: '#F43F5E',
    primaryHover: '#E11D48',
    accent: '#FB923C',
    glow: 'rgba(244, 63, 94, 0.4)',
    previewColors: ['#160B0E', '#2E161E', '#F43F5E', '#FB923C']
  },
  {
    id: 'cyber',
    name: 'Siber Neon',
    description: 'Fütüristik neon pembe ve siberpunk mavisi',
    badge: 'Neon',
    canvas: '#0D0B14',
    surface: '#151221',
    card: '#1F1A30',
    border: '#352C52',
    primary: '#EC4899',
    primaryHover: '#DB2777',
    accent: '#06B6D4',
    glow: 'rgba(236, 72, 153, 0.4)',
    previewColors: ['#0D0B14', '#1F1A30', '#EC4899', '#06B6D4']
  },
  {
    id: 'gold',
    name: 'Kozmik Altın',
    description: 'Görkemli kraliyet altını ve sıcak bronz',
    badge: 'Elit',
    canvas: '#120E06',
    surface: '#1C160B',
    card: '#271F10',
    border: '#3D311A',
    primary: '#F59E0B',
    primaryHover: '#D97706',
    accent: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.4)',
    previewColors: ['#120E06', '#271F10', '#F59E0B', '#FBBF24']
  },
  {
    id: 'ocean',
    name: 'Derin Okyanus',
    description: 'Turkuaz deniz dalgası, camgöbeği ve ferah koyuluk',
    badge: 'Ferah',
    canvas: '#05131D',
    surface: '#091E2D',
    card: '#0F2C41',
    border: '#174363',
    primary: '#06B6D4',
    primaryHover: '#0891B2',
    accent: '#38BDF8',
    glow: 'rgba(6, 182, 212, 0.4)',
    previewColors: ['#05131D', '#0F2C41', '#06B6D4', '#38BDF8']
  },
  {
    id: 'amethyst',
    name: 'Ametist Lavanta',
    description: 'Büyüleyici leylak, asil ametist ve mistik gece',
    badge: 'Asil',
    canvas: '#0F0C1B',
    surface: '#171328',
    card: '#211C38',
    border: '#372F5C',
    primary: '#A855F7',
    primaryHover: '#9333EA',
    accent: '#C084FC',
    glow: 'rgba(168, 85, 247, 0.4)',
    previewColors: ['#0F0C1B', '#211C38', '#A855F7', '#C084FC']
  }
];

const THEME_STORAGE_KEY = '@logos_active_theme_v1';

interface ThemeContextType {
  activeTheme: ThemePalette;
  themeId: string;
  setTheme: (id: string) => void;
  palettes: ThemePalette[];
}

const ThemeContext = createContext<ThemeContextType>({
  activeTheme: THEME_PALETTES[0],
  themeId: 'obsidian',
  setTheme: () => {},
  palettes: THEME_PALETTES
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<string>('obsidian');

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && THEME_PALETTES.some((p) => p.id === saved)) {
          setThemeId(saved);
        }
      } catch (e) {
        console.error('Failed to load theme from AsyncStorage', e);
      }
    };
    loadSavedTheme();
  }, []);

  const activeTheme =
    THEME_PALETTES.find((p) => p.id === themeId) || THEME_PALETTES[0];

  const setTheme = async (id: string) => {
    if (THEME_PALETTES.some((p) => p.id === id)) {
      setThemeId(id);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, id);
      } catch (e) {
        console.error('Failed to save theme in AsyncStorage', e);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        activeTheme,
        themeId,
        setTheme,
        palettes: THEME_PALETTES
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
