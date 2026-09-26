import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput,  } from 'react-native';
import { Text } from './CustomText';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Theme } from '../constants/themes';

interface CloudLoginFormProps {
  onLogin: (email: string, password: string) => void;
  onGoogleLogin: () => void;
  theme: Theme;
  language: string;
  initialEmail?: string;
}

export function CloudLoginForm({ onLogin, onGoogleLogin, theme, language, initialEmail = '' }: CloudLoginFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');

  return (
    <View style={styles.linkForm}>
      <TouchableOpacity accessibilityRole="button" style={styles.googleBtn} onPress={onGoogleLogin}>
        <View style={styles.googleBtnInner}>
          <Text style={styles.googleIcon}>🎮</Text>
          <Text style={styles.googleBtnText}>
            {language === 'en' ? 'Continue with Play Games' : 'Play Oyunlar ile Devam Et'}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
        <Text style={[styles.orText, { color: theme.colors.textMuted }]}>
          {language === 'en' ? 'OR' : 'VEYA'}
        </Text>
        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
      </View>

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
      <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
        {language === 'en' ? 'Password (min 6 chars):' : 'Parola (en az 6 karakter):'}
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
        placeholder="••••••"
        placeholderTextColor={theme.colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity accessibilityRole="button"
        style={styles.actionBtn}
        onPress={() => onLogin(email.trim(), password)}
        disabled={!email.includes('@') || password.length < 6}
      >
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
  googleBtn: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.full,
    height: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: SPACING.xs,
  },
  googleBtnInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#34A853',
  },
  googleBtnText: {
    color: '#333',
    fontWeight: '700',
    fontSize: FONTS.size.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  line: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: SPACING.md,
    fontSize: FONTS.size.xs,
    fontWeight: '600',
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
