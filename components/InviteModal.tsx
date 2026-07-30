import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { getMyReferralCode, shareReferralLink, claimReferral } from '../services/referral.service';
import { audioService } from '../services/audio.service';

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
}

export function InviteModal({ visible, onClose }: InviteModalProps) {
  const { theme, language } = useTheme();
  const [referralCode, setReferralCode] = useState('');
  const [myCode, setMyCode] = useState<string | null>(null);
  const [claimCode, setClaimCode] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (visible) {
      getMyReferralCode().then(setMyCode);
      setClaimCode('');
      setClaimResult(null);
    }
  }, [visible]);

  const handleShare = async () => {
    audioService.triggerHaptic('medium');
    await shareReferralLink();
  };

  const handleClaim = async () => {
    if (!claimCode.trim()) return;
    audioService.triggerHaptic('light');
    setClaiming(true);
    setClaimResult(null);
    const result = await claimReferral(claimCode.trim());
    setClaimResult(result);
    setClaiming(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.header}>
            <Text style={styles.headerTitle}>🎉 {language === 'en' ? 'Invite Friends' : 'Arkadaş Davet Et'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.body}>
            {myCode && (
              <View style={[styles.codeBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.gem }]}>
                <Text style={[styles.codeLabel, { color: theme.colors.textSecondary }]}>
                  {language === 'en' ? 'Your Invite Code' : 'Davet Kodunuz'}
                </Text>
                <Text style={[styles.codeValue, { color: theme.colors.gem }]}>{myCode}</Text>
                <TouchableOpacity style={[styles.shareBtn, { backgroundColor: theme.colors.primary }]} onPress={handleShare}>
                  <Text style={styles.shareBtnText}>
                    📤 {language === 'en' ? 'Share Invite' : 'Daveti Paylaş'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {language === 'en' ? 'Have a code? Enter it!' : 'Kodun var mı? Gir!'}
            </Text>

            <View style={styles.claimRow}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
                placeholder={language === 'en' ? 'Enter invite code' : 'Davet kodunu gir'}
                placeholderTextColor={theme.colors.textMuted}
                value={claimCode}
                onChangeText={setClaimCode}
                autoCapitalize="characters"
                maxLength={10}
              />
              <TouchableOpacity
                style={[styles.claimBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleClaim}
                disabled={claiming}
              >
                {claiming ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.claimBtnText}>🎁</Text>
                )}
              </TouchableOpacity>
            </View>

            {claimResult && (
              <View style={[styles.resultBox, { backgroundColor: claimResult.success ? theme.colors.correct + '22' : theme.colors.error + '22', borderColor: claimResult.success ? theme.colors.correct : theme.colors.error }]}>
                <Text style={{ color: claimResult.success ? theme.colors.correct : theme.colors.error, fontWeight: '700', fontSize: FONTS.size.sm, textAlign: 'center' }}>
                  {claimResult.message}
                </Text>
              </View>
            )}

            <Text style={[styles.info, { color: theme.colors.textMuted }]}>
              {language === 'en' ? '💎 You get 50 gems • Your friend gets 75 gems' : '💎 Sana 50 gem • Arkadaşına 75 gem'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  content: { borderTopLeftRadius: BORDER_RADIUS.lg, borderTopRightRadius: BORDER_RADIUS.lg, borderTopWidth: 1.5, paddingBottom: SPACING.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderTopLeftRadius: BORDER_RADIUS.lg - 1, borderTopRightRadius: BORDER_RADIUS.lg - 1 },
  headerTitle: { color: '#fff', fontSize: FONTS.size.lg, fontWeight: '800' },
  closeBtn: { padding: 6 },
  closeBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 'bold' },
  body: { padding: SPACING.lg, gap: SPACING.md },
  codeBox: { borderRadius: BORDER_RADIUS.md, borderWidth: 1.5, padding: SPACING.md, alignItems: 'center', gap: SPACING.sm },
  codeLabel: { fontSize: FONTS.size.xs, fontWeight: '600' },
  codeValue: { fontSize: FONTS.size.xxl, fontWeight: '900', letterSpacing: 4 },
  shareBtn: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full },
  shareBtnText: { color: '#fff', fontWeight: '800', fontSize: FONTS.size.sm },
  sectionTitle: { fontSize: FONTS.size.md, fontWeight: '700' },
  claimRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  input: { flex: 1, borderRadius: BORDER_RADIUS.md, borderWidth: 1, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONTS.size.lg, fontWeight: '700', letterSpacing: 2 },
  claimBtn: { width: 48, height: 48, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  claimBtnText: { fontSize: 24 },
  resultBox: { padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, borderWidth: 1 },
  info: { fontSize: FONTS.size.xs, textAlign: 'center', fontWeight: '600' },
});
