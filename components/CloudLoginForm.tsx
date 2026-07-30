import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface CloudLoginFormProps {
  onLogin: (email: string) => void;
  theme: any;
  language: string;
  initialEmail?: string;
}

export function CloudLoginForm({ onLogin, theme, language, initialEmail = '' }: CloudLoginFormProps) {
  const [email, setEmail] = useState(initialEmail);

  return (
    <View style={styles.linkForm}>
      <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
        {language === 'en' ? 'Link E-mail Address:' : 'E-posta Adresi Bağla:'}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
        placeholder="name@email.com"
        placeholderTextColor={theme.colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity style={styles.actionBtn} onPress={() => onLogin(email)}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.btnGrad}>
          <Text style={styles.btnText}>
            {language === 'en' ? 'Link Account' : 'Hesabı Bağla'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  linkForm: {
    gap: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: '700',
  },
  input: {
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.size.md,
  },
  actionBtn: {
    height: 46,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  btnGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: FONTS.size.md,
  },
});
