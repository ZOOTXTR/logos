import React from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import type { Theme } from '../constants/themes';
import type { Language } from '../constants/translations';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
  theme: Theme;
  language: Language;
}

export function PrivacyPolicyModal({ visible, onClose, theme, language }: PrivacyPolicyModalProps) {
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
            <Text style={[styles.modalTitle, { color: c.text }]}>🔒 {t.privacyPolicy}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={{ color: c.textMuted, fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={[styles.policyHeading, { color: c.primaryLight }]}>
              {language === 'en' ? '1. Data Retention' : '1. Verilerin Saklanması'}
            </Text>
            <Text style={styles.policyText}>
              {language === 'en'
                ? 'All stats (level, XP, completed achievements, and Gem balance) are saved securely on your device (Local Storage / AsyncStorage). We (ZOVTEX) do not collect or store personal data on our servers.'
                : 'Logos oyunundaki tüm istatistikleriniz (seviyeniz, XP miktarınız, tamamladığınız başarımlar ve biriktirdiğiniz Gem bakiyesi) tamamen cihazınızda (Local Storage / AsyncStorage) şifrelenmiş olarak saklanır. Sunucularımızda (ZOVTEX) hiçbir kişisel bilginiz tutulmamaktadır.'}
            </Text>

            <Text style={[styles.policyHeading, { color: c.primaryLight }]}>
              {language === 'en' ? '2. Personal Data' : '2. Kişisel Bilgiler'}
            </Text>
            <Text style={styles.policyText}>
              {language === 'en'
                ? 'Playing Logos does not require registering an email address, phone number, or name. You can play anonymously and securely.'
                : 'Oyunumuzu oynamak için herhangi bir e-posta adresi, telefon numarası veya isim kaydetmeniz gerekmez. Anonim olarak tamamen güvenli şekilde oynayabilirsiniz.'}
            </Text>

            <Text style={[styles.policyHeading, { color: c.primaryLight }]}>
              {language === 'en' ? '3. Ads and Third Party Services' : '3. Reklamlar ve Üçüncü Taraf Servisler'}
            </Text>
            <Text style={styles.policyText}>
              {language === 'en'
                ? 'The app does not display third-party ads. Crash reports are processed anonymously via Sentry for stability improvements. Optional cloud save, leaderboard, and referral features use Firebase services. These services may process anonymous device identifiers for security and functionality purposes.'
                : 'Uygulama üçüncü taraf reklam göstermez. Çökme raporları, kararlılık iyileştirmeleri için Sentry üzerinden anonim olarak işlenir. Opsiyonel bulut kayıt, liderlik tablosu ve davet özellikleri Firebase servislerini kullanır. Bu servisler, güvenlik ve işlevsellik amacıyla anonim cihaz tanımlayıcılarını işleyebilir.'}
            </Text>

            <Text style={[styles.policyHeading, { color: c.primaryLight }]}>
              {language === 'en' ? '4. Contact' : '4. İletişim'}
            </Text>
            <Text style={styles.policyText}>
              {language === 'en'
                ? 'For support, questions, or requests, please contact us at support@zovtex.com.'
                : 'Herhangi bir soru, öneri veya destek talebiniz için support@zovtex.com adresi üzerinden bizimle iletişime geçebilirsiniz.'}
            </Text>
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
  policyHeading: { fontSize: FONTS.size.md, fontWeight: '700', marginTop: SPACING.md, marginBottom: SPACING.xs },
  policyText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, lineHeight: 20, marginBottom: SPACING.md },
});
