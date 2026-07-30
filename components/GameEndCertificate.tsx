import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Board } from '../constants/words';

interface GameEndCertificateProps {
  gameStatus: 'won' | 'lost';
  targetWord: string;
  board: Board;
  currentRow: number;
  colorBlind: boolean;
  language: string;
  theme: any;
  onShowDefinition: () => void;
  onShare: () => void;
  onRetry: () => void;
  onMenu: () => void;
  gameMode: string;
}

export function GameEndCertificate({
  gameStatus, targetWord, board, currentRow,
  colorBlind, language, theme,
  onShowDefinition, onShare, onRetry, onMenu,
}: GameEndCertificateProps) {
  const gameStatusText =
    gameStatus === 'won'
      ? `🎉 ${language === 'en' ? 'Congratulations!' : 'Tebrikler!'}`
      : `😢 ${language === 'en' ? 'Word:' : 'Kelime:'} ${targetWord}`;

  const gameStatusColor =
    gameStatus === 'won'
      ? (colorBlind ? '#0072B2' : theme.colors.correct)
      : theme.colors.error;

  const won = gameStatus === 'won';

  return (
    <View style={[styles.statusBanner, { backgroundColor: theme.colors.card }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
        <Text style={[styles.statusText, { color: gameStatusColor, flex: 1, marginRight: SPACING.sm }]}>
          {gameStatusText}
        </Text>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.primary + '22', maxWidth: 110, paddingVertical: 6, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: theme.colors.primary + '44' }]}
          onPress={onShowDefinition}
        >
          <Text style={[styles.actionBtnText, { color: theme.colors.primaryLight, fontSize: 11, fontWeight: '800' }]}>
            📖 {language === 'en' ? 'Meaning' : 'Anlamı'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.shareCardContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.accent }]}>
        <Text style={[styles.shareCardHeader, { color: theme.colors.accent }]}>👾 LOGOS RETRO CERTIFICATE 👾</Text>
        <View style={[styles.shareCardDivider, { borderBottomColor: theme.colors.border }]} />

        <Text style={[styles.shareCardWord, { color: theme.colors.text }]}>
          {language === 'en' ? 'TARGET WORD:' : 'HEDEF KELİME:'} {targetWord}
        </Text>

        <View style={styles.shareCardRow}>
          <Text style={[styles.shareCardLabel, { color: theme.colors.textSecondary }]}>
            {language === 'en' ? 'RESULT:' : 'SONUÇ:'}
          </Text>
          <Text style={{ color: won ? theme.colors.correct : theme.colors.error, fontWeight: '900', fontSize: 11 }}>
            {won ? (language === 'en' ? 'SUCCESS' : 'BAŞARILI') : (language === 'en' ? 'FAILED' : 'BAŞARISIZ')}
          </Text>
        </View>

        <View style={styles.shareCardRow}>
          <Text style={[styles.shareCardLabel, { color: theme.colors.textSecondary }]}>
            {language === 'en' ? 'GUESSES:' : 'TAHMİNLER:'}
          </Text>
          <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 11 }}>
            {won ? `${currentRow + 1}/${board.length}` : `X/${board.length}`}
          </Text>
        </View>

        <View style={[styles.shareCardGrid, { backgroundColor: theme.colors.card }]}>
          {board.slice(0, won ? currentRow + 1 : board.length).map((row, rIdx) => (
            <View key={rIdx} style={{ flexDirection: 'row', gap: 4, marginVertical: 1 }}>
              {row.map((cell, cIdx) => (
                <View
                  key={cIdx}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    backgroundColor: cell.status === 'correct'
                      ? (colorBlind ? '#0072B2' : theme.colors.correct)
                      : cell.status === 'present'
                      ? (colorBlind ? '#E69F00' : theme.colors.present)
                      : cell.status === 'absent'
                      ? theme.colors.absent
                      : 'transparent',
                  }}
                />
              ))}
            </View>
          ))}
        </View>

        <Text style={[styles.shareCardFooter, { color: theme.colors.textMuted }]}>
          www.zovtex.com · 💎 + XP REWARDS
        </Text>
      </View>

      <View style={styles.statusActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
          onPress={onRetry}
        >
          <Text style={styles.actionBtnText}>🔄 {language === 'en' ? 'Retry' : 'Tekrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.accent }]}
          onPress={onShare}
        >
          <Text style={[styles.actionBtnText, { color: '#000' }]}>📤 {language === 'en' ? 'Share' : 'Paylaş'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.card }]}
          onPress={onMenu}
        >
          <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>🏠 {language === 'en' ? 'Menu' : 'Menü'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBanner: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  statusText: { fontSize: FONTS.size.lg, fontWeight: '800' },
  statusActions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    flex: 1, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  actionBtnText: { color: COLORS.text, fontWeight: '700', fontSize: FONTS.size.sm },
  shareCardContainer: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  shareCardHeader: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  shareCardDivider: {
    width: '100%',
    height: 1,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  shareCardWord: {
    fontSize: FONTS.size.md,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginVertical: 4,
  },
  shareCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 2,
  },
  shareCardLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  shareCardGrid: {
    padding: 8,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  shareCardFooter: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
