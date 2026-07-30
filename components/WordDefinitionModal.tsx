import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { fetchDefinition, DefinitionItem } from '../services/definition.service';
import { DefinitionCard } from './DefinitionCard';

interface WordDefinitionModalProps {
  visible: boolean;
  word: string;
  lang: 'tr' | 'en';
  onClose: () => void;
}

export function WordDefinitionModal({ visible, word, lang, onClose }: WordDefinitionModalProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [definitions, setDefinitions] = useState<DefinitionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && word) {
      setLoading(true);
      setError(null);
      setDefinitions([]);

      fetchDefinition(word, lang)
        .then(setDefinitions)
        .catch((err) => {
          setError(
            lang === 'tr'
              ? err.message || 'Kelime anlamı yüklenirken bağlantı hatası oluştu.'
              : err.message || 'Failed to fetch definition. Check network connection.'
          );
        })
        .finally(() => setLoading(false));
    }
  }, [visible, word, lang]);

  const defList = useMemo(() => definitions, [definitions]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>
              📖 {lang === 'tr' ? 'Kelime Anlamı' : 'Word Definition'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={[styles.wordBanner, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.wordText, { color: theme.colors.primaryLight }]}>
                {word}
              </Text>
              <Text style={[styles.langTag, { color: theme.colors.textMuted }]}>
                {lang === 'tr' ? 'TÜRKÇE SÖZLÜK' : 'ENGLISH DICTIONARY'}
              </Text>
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primaryLight} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                  {lang === 'tr' ? 'Sözlük sorgulanıyor...' : 'Querying dictionary...'}
                </Text>
              </View>
            )}

            {error && !loading && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorEmoji}>⚠️</Text>
                <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
                  {error}
                </Text>
              </View>
            )}

            {!loading && defList.map((item, idx) => (
              <DefinitionCard key={idx} index={idx} item={item} theme={theme} language={lang} />
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeActionBtn} onPress={onClose}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.btnGrad}
              >
                <Text style={styles.btnText}>
                  {lang === 'tr' ? 'Kapat' : 'Close'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    borderTopWidth: 1.5,
    maxHeight: '75%',
    paddingBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopLeftRadius: BORDER_RADIUS.lg - 1,
    borderTopRightRadius: BORDER_RADIUS.lg - 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: FONTS.size.lg,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    fontWeight: 'bold',
  },
  body: {
    padding: SPACING.lg,
  },
  wordBanner: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  wordText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  langTag: {
    fontSize: FONTS.size.xs,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1.5,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.size.sm,
  },
  errorContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  errorEmoji: {
    fontSize: 32,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: FONTS.size.sm,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  closeActionBtn: {
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
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
