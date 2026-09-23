import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,  } from 'react-native';
import { Text } from './CustomText';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { cloudService } from '../services/cloud.service';
import { audioService } from '../services/audio.service';
import { FeedbackTypeSelector } from './FeedbackTypeSelector';
import { FeedbackForm } from './FeedbackForm';
import { TRANSLATIONS } from '../constants/translations';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

type FeedbackType = 'bug' | 'suggestion' | 'complaint' | 'other';

export function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const { theme, language } = useTheme();
  const t = TRANSLATIONS[language];

  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (message.trim().length < 10) {
      Alert.alert(
        t.feedbackShortTitle,
        t.feedbackShortMsg
      );
      return;
    }

    setLoading(true);
    audioService.triggerHaptic('medium');

    const feedbackEmail = email.trim() || 'anonymous_user';
    const ok = await cloudService.submitFeedback(feedbackEmail, message.trim(), type === 'bug' ? 1 : 5);

    setLoading(false);

    if (ok) {
      audioService.triggerHaptic('success');
      Alert.alert(
        t.feedbackSuccessTitle,
        t.feedbackSuccessMsg,
        [
          {
            text: t.ok,
            onPress: () => {
              setMessage('');
              setEmail('');
              setType('suggestion');
              onClose();
            },
          },
        ]
      );
    } else {
      audioService.triggerHaptic('warning');
      Alert.alert(
        t.feedbackErrorTitle,
        t.feedbackErrorMsg
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.container, { backgroundColor: '#13132B', borderColor: theme.colors.border }]} accessibilityViewIsModal={true}>
          {/* Header */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.header}
          >
            <TouchableOpacity style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Kapat" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} onPress={onClose}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.titleEmoji}>📣</Text>
            <Text style={styles.titleText}>
              {t.feedbackTitle}
            </Text>
          </LinearGradient>

          <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: SPACING.xl }} showsVerticalScrollIndicator={false}>
            {/* Intro text */}
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
              {t.feedbackIntro}
            </Text>

            <FeedbackTypeSelector selectedType={type} onSelect={setType} theme={theme} language={language} />

            <FeedbackForm
              email={email}
              message={message}
              onEmailChange={setEmail}
              onMessageChange={setMessage}
              characterCount={message.length}
              theme={theme}
              language={language}
            />

            {/* Action buttons */}
            <TouchableOpacity accessibilityRole="button"
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.submitGrad}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitText}>
                    {t.feedbackSubmit}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    padding: SPACING.lg,
    alignItems: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.sm,
    zIndex: 10,
  },
  closeX: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONTS.size.lg,
    fontWeight: '600',
  },
  titleEmoji: { fontSize: 36 },
  titleText: {
    fontSize: FONTS.size.xl,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 4,
  },
  scroll: { padding: SPACING.md },
  introText: {
    fontSize: FONTS.size.sm,
    lineHeight: 20,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    height: 50,
  },
  submitGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: 'white',
    fontWeight: '900',
    fontSize: FONTS.size.md,
    letterSpacing: 1,
  },
});
