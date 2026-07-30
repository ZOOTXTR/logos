import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { LetterStatus } from '../constants/words';
import { useTheme } from '../hooks/useTheme';

interface KeyboardProps {
  onKey: (key: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  revealedLetters: Record<string, LetterStatus>;
}

// Türkçe klavye düzeni
const KEYBOARD_ROWS = [
  ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['SİL', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'GÖNDER'],
];

const COLORBLIND_COLORS = {
  correct: '#0072B2',
  present: '#E69F00',
};

function KeyboardComponent({ onKey, onDelete, onSubmit, revealedLetters }: KeyboardProps) {
  const { theme, colorBlind, dyslexiaFont } = useTheme();

  const handlePress = (key: string) => {
    if (key === 'SİL') onDelete();
    else if (key === 'GÖNDER') onSubmit();
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
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => {
            const isSpecial = key === 'SİL' || key === 'GÖNDER';
            const status = revealedLetters[key];
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handlePress(key)}
                style={[
                  styles.key,
                  isSpecial && styles.specialKey,
                  { backgroundColor: getKeyBg(status) },
                ]}
                activeOpacity={0.7}
                accessibilityLabel={key === 'SİL' ? 'Delete' : key === 'GÖNDER' ? 'Submit' : key}
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
    minWidth: 30,
    height: 48,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: 36,
    position: 'relative',
  },
  specialKey: {
    maxWidth: 64,
    backgroundColor: COLORS.primary,
  },
  keyText: {
    fontSize: FONTS.size.sm,
    fontWeight: '700',
  },
  specialKeyText: {
    fontSize: 10,
    fontWeight: '800',
  },
  keyIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  keyIndicatorText: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
