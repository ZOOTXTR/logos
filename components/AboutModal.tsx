import React from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import type { Theme } from '../constants/themes';
import type { Language } from '../constants/translations';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
  theme: Theme;
  language: Language;
}

export function AboutModal({ visible, onClose, theme, language }: AboutModalProps) {
  const c = theme.colors;
  const t = TRANSLATIONS[language];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: '#16162A', borderColor: c.border }]}>
          <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>ℹ️ {t.aboutApp}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={{ color: c.textMuted, fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} contentContainerStyle={{ alignItems: 'center' }}>
            <Text style={[styles.aboutLogo, { color: c.text }]}>💎 Logos</Text>
            <Text style={styles.aboutVersion}>Version 3.0.0 (Premium Update)</Text>
            <Text style={styles.aboutDescription}>
              {language === 'en'
                ? 'Logos is a word puzzle game designed to expand your vocabulary. Alongside classic guessing, it includes Anagram, Blitz, and Word Chain modes for endless fun.'
                : 'Logos, kelime dağarcığınızı zorlayan, eğlenceli ve öğretici bir kelime bulmaca platformudur. Klasik kelime tahmininin yanı sıra Anagram, Hızlı Mod (Blitz) ve Kelime Zinciri gibi modlarla oyun keyfini en üst seviyeye taşır.'}
            </Text>

            <View style={styles.badgeRow}>
              <View style={[styles.infoBadge, { backgroundColor: c.card, borderColor: c.border }]}><Text style={[styles.infoBadgeText, { color: c.text }]}>Expo SDK 52</Text></View>
              <View style={[styles.infoBadge, { backgroundColor: c.card, borderColor: c.border }]}><Text style={[styles.infoBadgeText, { color: c.text }]}>React Native</Text></View>
              <View style={[styles.infoBadge, { backgroundColor: c.card, borderColor: c.border }]}><Text style={[styles.infoBadgeText, { color: c.text }]}>TypeScript</Text></View>
            </View>

            <Text style={[styles.creditsTitle, { color: c.text }]}>{language === 'en' ? 'Publisher' : 'Yayıncı'}</Text>
            <Text style={styles.creditsText}>ZOVTEX</Text>
            <Text style={[styles.creditsTitle, { color: c.text }]}>{language === 'en' ? 'Development Team' : 'Geliştirici Ekip'}</Text>
            <Text style={styles.creditsText}>Antigravity AI & Google Deepmind Pair Programing</Text>
            <Text style={[styles.creditsSub, { color: c.textMuted }]}>All rights reserved © 2026</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: SPACING.md },
  modalContent: { width: '100%', maxHeight: '80%', borderRadius: BORDER_RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1 },
  modalTitle: { fontSize: FONTS.size.lg, fontWeight: '800' },
  closeBtn: { padding: 4 },
  modalBody: { padding: SPACING.md },
  aboutLogo: { fontSize: FONTS.size.xxl, fontWeight: '900', marginTop: SPACING.md },
  aboutVersion: { color: COLORS.gem, fontSize: FONTS.size.sm, fontWeight: '600', marginTop: 2, marginBottom: SPACING.md },
  aboutDescription: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, textAlign: 'center', lineHeight: 20, marginHorizontal: SPACING.md, marginBottom: SPACING.lg },
  badgeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  infoBadge: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  infoBadgeText: { fontSize: 10, fontWeight: '700' },
  creditsTitle: { fontSize: FONTS.size.md, fontWeight: '700', marginTop: SPACING.md },
  creditsText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 4 },
  creditsSub: { fontSize: 10, marginTop: 12, marginBottom: SPACING.lg },
});
