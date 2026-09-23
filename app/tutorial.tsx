import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Text } from '../components/CustomText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { audioService } from '../services/audio.service';

const TUTORIAL_STEPS = [
  {
    id: 'classic',
    title: 'Klasik Mod',
    desc: 'Logos\'ta amaç 5 harfli kelimeyi bulmaktır.\nAşağıdaki klavyeyi kullanarak "LOGOS" yazın.',
    targetWord: 'LOGOS'
  },
  {
    id: 'chain',
    title: 'Kelime Zinciri',
    desc: 'Önceki kelimenin SON harfi, yeni kelimenin İLK harfi olmalıdır!\n"SERGİ" kelimesini yazın (S ile başlıyor).',
    targetWord: 'SERGİ'
  },
  {
    id: 'anagram',
    title: 'Anagram',
    desc: 'Karışık verilen harflerden anlamlı bir kelime oluşturun!\nHarflere dokunarak "KALEM" kelimesini bulun.',
    targetWord: 'KALEM',
    scrambled: ['M', 'K', 'L', 'A', 'E']
  }
];

export default function TutorialScreen() {
  const router = useRouter();
  const { theme, language } = useTheme();
  const [step, setStep] = useState(0);
  const [guess, setGuess] = useState('');
  
  const currentStep = TUTORIAL_STEPS[step];
  
  const handleKey = (key: string) => {
    if (guess.length < 5) {
      audioService.play('click');
      setGuess(prev => prev + key);
    }
  };
  
  const handleBackspace = () => {
    if (guess.length > 0) {
      audioService.play('click');
      setGuess(prev => prev.slice(0, -1));
    }
  };
  
  const handleSubmit = () => {
    if (guess === currentStep.targetWord) {
      audioService.play('win');
      if (step < TUTORIAL_STEPS.length - 1) {
        setStep(prev => prev + 1);
        setGuess('');
      } else {
        router.replace('/');
      }
    } else {
      audioService.play('loss');
      setGuess('');
    }
  };

  const renderBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 5; i++) {
      const char = guess[i] || '';
      boxes.push(
        <View key={i} style={[styles.box, { borderColor: theme.colors.border, backgroundColor: char ? theme.colors.primaryDark : theme.colors.surface }]}>
          <Text style={[styles.boxText, { color: theme.colors.text }]}>{char}</Text>
        </View>
      );
    }
    return <View style={styles.board}>{boxes}</View>;
  };
  
  const renderAnagramButtons = () => {
    return (
      <View style={styles.anagramBoard}>
        {(currentStep.scrambled || []).map((char, i) => (
          <TouchableOpacity key={i} style={[styles.anagramBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={() => handleKey(char)}>
            <Text style={[styles.boxText, { color: theme.colors.text }]}>{char}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Eğitim: {currentStep.title}</Text>
      </View>
      
      <View style={styles.content}>
        <View style={[styles.instructionBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.instructionText, { color: theme.colors.text }]}>{currentStep.desc}</Text>
        </View>
        
        {currentStep.id === 'chain' && (
          <View style={styles.chainPrev}>
            <Text style={{ color: theme.colors.textSecondary }}>Önceki: LOGO<Text style={{ color: theme.colors.primaryLight, fontWeight: 'bold' }}>S</Text></Text>
          </View>
        )}
        
        {currentStep.id === 'anagram' ? renderAnagramButtons() : null}
        
        <View style={styles.guessArea}>
          {renderBoxes()}
        </View>
        
        {currentStep.id !== 'anagram' && (
          <View style={styles.mockKeyboard}>
            <Text style={{ color: theme.colors.textMuted, marginBottom: 10 }}>Fiziksel veya ekran klavyesi benzetimi:</Text>
            <View style={styles.keyRow}>
              {['L','O','G','S','E','R','İ'].map(k => (
                <TouchableOpacity key={k} style={[styles.key, { backgroundColor: theme.colors.surface }]} onPress={() => handleKey(k)}>
                  <Text style={{ color: theme.colors.text, fontSize: 18 }}>{k}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keyRow}>
              <TouchableOpacity style={[styles.actionKey, { backgroundColor: theme.colors.surface }]} onPress={handleBackspace}>
                <Text style={{ color: theme.colors.text, fontSize: 16 }}>SİL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionKey, { backgroundColor: theme.colors.primary }]} onPress={handleSubmit}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>GİRİŞ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {currentStep.id === 'anagram' && (
          <View style={styles.keyRow}>
            <TouchableOpacity style={[styles.actionKey, { backgroundColor: theme.colors.surface, marginTop: 40 }]} onPress={handleBackspace}>
              <Text style={{ color: theme.colors.text, fontSize: 16 }}>SİL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionKey, { backgroundColor: theme.colors.primary, marginTop: 40 }]} onPress={handleSubmit}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>GİRİŞ</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: SPACING.md, borderBottomWidth: 1, alignItems: 'center' },
  title: { fontSize: FONTS.size.lg, fontWeight: 'bold' },
  content: { flex: 1, padding: SPACING.lg, alignItems: 'center' },
  instructionBox: { padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1, marginBottom: SPACING.xl, width: '100%' },
  instructionText: { fontSize: FONTS.size.md, textAlign: 'center', lineHeight: 22 },
  chainPrev: { marginBottom: SPACING.md },
  board: { flexDirection: 'row', gap: 8, marginBottom: SPACING.xl },
  box: { width: 50, height: 50, borderWidth: 2, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  boxText: { fontSize: 24, fontWeight: 'bold' },
  anagramBoard: { flexDirection: 'row', gap: 8, marginBottom: SPACING.xl, flexWrap: 'wrap', justifyContent: 'center' },
  anagramBtn: { width: 50, height: 50, borderWidth: 2, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  guessArea: { alignItems: 'center', marginBottom: SPACING.xxl },
  mockKeyboard: { width: '100%', alignItems: 'center', marginTop: 20 },
  keyRow: { flexDirection: 'row', gap: 8, marginBottom: 8, justifyContent: 'center' },
  key: { width: 40, height: 50, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  actionKey: { paddingHorizontal: 20, height: 50, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
});
