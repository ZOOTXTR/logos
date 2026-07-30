import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface CloudSyncStatusProps {
  email: string;
  lastSyncDate?: string | null;
  isSyncing: boolean;
  onSync: () => void;
  onRestore: () => void;
  onUnlink: () => void;
  theme: any;
  language: string;
}

export function CloudSyncStatus({
  email,
  lastSyncDate,
  isSyncing,
  onSync,
  onRestore,
  onUnlink,
  theme,
  language,
}: CloudSyncStatusProps) {
  return (
    <View style={styles.portalControls}>
      <View style={[styles.linkedCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.primaryLight }]}>
        <Text style={[styles.linkedLabel, { color: theme.colors.textMuted }]}>
          {language === 'en' ? 'CONNECTED ACCOUNT:' : 'BAĞLI HESAP:'}
        </Text>
        <Text style={[styles.linkedValue, { color: theme.colors.primaryLight }]}>
          {email}
        </Text>
        {lastSyncDate ? (
          <Text style={[styles.lastSyncText, { color: theme.colors.textMuted }]}>
            {language === 'en' ? 'Last sync: ' : 'Son senkronizasyon: '}
            {lastSyncDate}
          </Text>
        ) : null}
        <TouchableOpacity style={styles.unlinkBtn} onPress={onUnlink}>
          <Text style={[styles.unlinkText, { color: theme.colors.error }]}>
            {language === 'en' ? 'Unlink Account' : 'Hesap Bağlantısını Kes'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.portalBtn} onPress={onSync} disabled={isSyncing}>
          <LinearGradient colors={[theme.colors.correct, theme.colors.correct + 'bb']} style={styles.btnGrad}>
            <Text style={styles.btnText}>
              {isSyncing ? '⏳' : '📤'} {language === 'en' ? 'Backup Data' : 'Veri Yedekle'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.portalBtn} onPress={onRestore} disabled={isSyncing}>
          <LinearGradient colors={[theme.colors.accent, theme.colors.accent + 'bb']} style={styles.btnGrad}>
            <Text style={[styles.btnText, { color: '#000' }]}>
              🔄 {language === 'en' ? 'Restore Data' : 'Geri Yükle'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  portalControls: {
    gap: SPACING.md,
  },
  linkedCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
  },
  linkedLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  linkedValue: {
    fontSize: FONTS.size.lg,
    fontWeight: '900',
    marginTop: 4,
  },
  lastSyncText: {
    fontSize: FONTS.size.sm,
    marginTop: SPACING.sm,
  },
  unlinkBtn: {
    marginTop: SPACING.md,
    alignSelf: 'center',
  },
  unlinkText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  portalBtn: {
    flex: 1,
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
