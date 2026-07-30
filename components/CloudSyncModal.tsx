import React from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useCloudSync } from '../hooks/useCloudSync';
import { CloudLoginForm } from './CloudLoginForm';
import { CloudSyncStatus } from './CloudSyncStatus';

interface CloudSyncModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CloudSyncModal({ visible, onClose }: CloudSyncModalProps) {
  const { theme, language } = useTheme();
  const { linkedEmail, loading, syncStatus, handleLinkAccount, handleBackup, handleRestore, handleUnlink } = useCloudSync(visible, onClose);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>

          <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.header}>
            <Text style={styles.headerTitle}>
              ☁️ {language === 'en' ? 'Cloud Save Sync' : 'Bulut Kayıt Portalı'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
              {language === 'en'
                ? 'Back up your level, gems, streaks, and unlocked themes so you never lose them.'
                : 'Seviye, gem, seri ve temalarınızı yedekleyerek asla kaybetmeyin.'}
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primaryLight} />
                <Text style={[styles.loadingLabel, { color: theme.colors.textSecondary }]}>
                  {language === 'en' ? 'Connecting to cloud...' : 'Bulut sunucusuna bağlanılıyor...'}
                </Text>
              </View>
            ) : !linkedEmail ? (
              <CloudLoginForm
                onLogin={handleLinkAccount}
                theme={theme}
                language={language}
              />
            ) : (
              <CloudSyncStatus
                email={linkedEmail}
                isSyncing={loading}
                onSync={handleBackup}
                onRestore={handleRestore}
                onUnlink={handleUnlink}
                theme={theme}
                language={language}
              />
            )}
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
    paddingBottom: SPACING.xl,
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
  descText: {
    fontSize: FONTS.size.sm,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  loadingLabel: {
    marginTop: SPACING.md,
    fontSize: FONTS.size.sm,
    fontWeight: '600',
  },
});
