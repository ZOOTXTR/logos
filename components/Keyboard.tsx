import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './CustomText';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { LetterStatus } from '../constants/words';
import { useTheme } from '../hooks/useTheme';

interface KeyboardProps {
  onKey: (key: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  revealedLetters: Record<string, LetterStatus>;
  language?: 'tr' | 'en';
}

// Türkçe klavye düzeni
const KEYBOARD_ROWS_TR = [
  ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['SİL', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'GÖNDER'],
];

// English QWERTY keyboard layout
const KEYBOARD_ROWS_EN = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

const COLORBLIND_COLORS = {
  correct: '#0072B2',
  present: '#E69F00',
};

const isDeleteKey = (key: string) => key === 'SİL' || key === 'DEL' || key === '⌫';
const isSubmitKey = (key: string) => key === 'GÖNDER' || key === 'ENTER' || key === 'SUBMIT';

function KeyboardComponent({ onKey, onDelete, onSubmit, revealedLetters, language }: KeyboardProps) {
  const themeContext = useTheme();
  const theme = themeContext?.theme ?? { colors: { correct: COLORS.correct, present: COLORS.present, card: COLORS.card, text: COLORS.text } };
  const colorBlind = themeContext?.colorBlind ?? false;
  const dyslexiaFont = themeContext?.dyslexiaFont ?? false;
  const activeLanguage = language ?? themeContext?.language ?? 'tr';

  const rows = activeLanguage === 'en' ? KEYBOARD_ROWS_EN : KEYBOARD_ROWS_TR;

  const handlePress = (key: string) => {
    if (isDeleteKey(key)) onDelete();
    else if (isSubmitKey(key)) onSubmit();
    else onKey(key);
  };

  const getKeyBg = (status?: LetterStatus): string => {
    switch (status) {
      case 'correct': return colorBlind ? COLORBLIND_COLORS.correct : theme.colors.correct;
      case 'present': return colorBlind ? COLORBLIND_COLORS.present : theme.colors.present;
      case 'absent': return '#1F2937';
      default: return theme.colors.card;
    }
  };

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => {
            const isSpecial = isDeleteKey(key) || isSubmitKey(key);
            const status = revealedLetters[key];
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handlePress(key)}
                hitSlop={{ top: 5, bottom: 5, left: 4, right: 4 }}
                style={[
                  styles.key,
                  isSpecial && styles.specialKey,
                  { backgroundColor: getKeyBg(status) },
                ]}
                activeOpacity={0.7}
                accessibilityLabel={isDeleteKey(key) ? (activeLanguage === 'en' ? 'Delete' : 'Sil') : isSubmitKey(key) ? (activeLanguage === 'en' ? 'Submit' : 'Gönder') : key}
                accessibilityRole="button"
              >
                <Text style={[
                  styles.keyText,
                  isSpecial && styles.specialKeyText,
                  { color: theme.colors.text },
                  dyslexiaFont && { fontFamily: 'monospace' }
                ]}>
                  {key}
                </Text>
                {colorBlind && status && (status === 'correct' || status === 'present') && (
                  <View style={styles.keyIndicator}>
                    <Text style={styles.keyIndicatorText}>
                      {status === 'correct' ? '✓' : '●'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export const Keyboard = React.memo(KeyboardComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: SPACING.xs,
    gap: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  key: {
    height: 52, // Slightly taller for the 3D effect
    paddingHorizontal: 2,
    borderRadius: BORDER_RADIUS.md, // More rounded for modern look
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
    borderBottomWidth: 4, // 3D depth
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)', // Darker bottom edge simulated by the main component logic, here we just set the structural border
  },
  specialKey: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
  },
  keyText: {
    fontSize: FONTS.size.sm,
    fontWeight: '700',
  },
  specialKeyText: {
    fontSize: 12,
    fontWeight: '800',
  },
  keyIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  keyIndicatorText: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
