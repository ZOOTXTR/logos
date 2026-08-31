import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../hooks/useTheme';

export function AgeGateModal({ onComplete }: { onComplete: (isChild: boolean) => void }) {
  const [visible, setVisible] = useState(false);
  const [year, setYear] = useState('');
  const { theme, language } = useTheme();

  useEffect(() => {
    AsyncStorage.getItem('gq_age_gate_passed').then((res) => {
      if (res === null) {
        setVisible(true);
      } else {
        onComplete(res === 'child');
      }
    });
  }, []);

  const handleSubmit = async () => {
    const num = parseInt(year);
    if (!num || num < 1900 || num > new Date().getFullYear()) return;
    const isChild = new Date().getFullYear() - num < 13;
    await AsyncStorage.setItem('gq_age_gate_passed', isChild ? 'child' : 'adult');
    setVisible(false);
    onComplete(isChild);
  };

  if (!visible) return null;
  const c = theme.colors;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.title, { color: c.text }]}>
            {language === 'en' ? 'Welcome to Logos!' : 'Logos\'a Hoş Geldiniz!'}
          </Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            {language === 'en' ? 'Please enter your birth year to continue.' : 'Devam etmek için lütfen doğum yılınızı girin.'}
          </Text>
          <TextInput
            style={[styles.input, { color: c.text, borderColor: c.border }]}
            placeholder="YYYY"
            placeholderTextColor={c.textMuted}
            keyboardType="number-pad"
            maxLength={4}
            value={year}
            onChangeText={setYear}
          />
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: c.primary, opacity: year.length === 4 ? 1 : 0.5 }]}
            onPress={handleSubmit}
            disabled={year.length !== 4}
          >
            <Text style={styles.buttonText}>{language === 'en' ? 'Continue' : 'Devam Et'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
