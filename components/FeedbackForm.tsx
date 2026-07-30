import React from 'react';
import { Text, StyleSheet, TextInput } from 'react-native';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface FeedbackFormProps {
  email: string;
  message: string;
  onEmailChange: (text: string) => void;
  onMessageChange: (text: string) => void;
  characterCount: number;
  theme: any;
  language: string;
}

export function FeedbackForm({ email, message, onEmailChange, onMessageChange, theme, language }: FeedbackFormProps) {
  return (
    <>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {language === 'en' ? 'Your Message' : 'Mesajınız'}
      </Text>
      <TextInput
        style={[
          styles.textarea,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          }
        ]}
        placeholder={
          language === 'en'
            ? 'Describe your suggestion or issue in detail...'
            : 'Önerinizi veya yaşadığınız sorunu detaylıca açıklayın...'
        }
        placeholderTextColor={theme.colors.textMuted}
        multiline
        numberOfLines={5}
        value={message}
        onChangeText={onMessageChange}
        textAlignVertical="top"
      />

      <Text style={[styles.label, { color: theme.colors.text }]}>
        {language === 'en' ? 'Email Address (Optional)' : 'E-posta Adresi (İsteğe Bağlı)'}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          }
        ]}
        placeholder="example@email.com"
        placeholderTextColor={theme.colors.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={onEmailChange}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: FONTS.size.md,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  textarea: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    fontSize: FONTS.size.md,
    height: 120,
  },
  input: {
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    fontSize: FONTS.size.md,
  },
});
