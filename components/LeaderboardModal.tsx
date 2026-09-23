import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Text } from './CustomText';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { cloudService, CloudScoreEntry } from '../services/cloud.service';

interface LeaderboardModalProps {
  visible: boolean;
  onClose: () => void;
  language?: string;
}

export function LeaderboardModal({ visible, onClose, language = 'tr' }: LeaderboardModalProps) {
  const [scores, setScores] = useState<CloudScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      cloudService.getTopScores().then((data: CloudScoreEntry[]) => {
        setScores(data);
        setLoading(false);
      });
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🏆 {language === 'en' ? 'Global Leaderboard' : 'Küresel Liderlik Tablosu'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Kapat">
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView style={styles.list}>
              {scores.map((s, idx) => (
                <View key={s.id} style={styles.row}>
                  <Text style={styles.rank}>#{idx + 1}</Text>
                  {s.photoURL ? (
                    <Image source={{ uri: s.photoURL }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>{s.playerName?.[0] || '?'}</Text></View>
                  )}
                  <View style={styles.info}>
                    <Text style={styles.name}>{s.playerName || 'Anonim'}</Text>
                    <Text style={styles.mode}>{s.mode} - {s.category}</Text>
                  </View>
                  <Text style={styles.score}>{s.score} XP</Text>
                </View>
              ))}
              {scores.length === 0 && (
                <Text style={styles.empty}>{language === 'en' ? 'No scores yet!' : 'Henüz skor yok!'}</Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', maxWidth: 500, height: '80%', backgroundColor: COLORS.background, borderRadius: 24, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: FONTS.size.lg, fontWeight: '800', color: COLORS.text, fontFamily: FONTS.bold },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { flex: 1, padding: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  rank: { fontSize: FONTS.size.md, fontWeight: 'bold', color: COLORS.primary, width: 35 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: SPACING.sm },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  avatarText: { color: COLORS.text, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: FONTS.size.md, fontWeight: '700', color: COLORS.text },
  mode: { fontSize: FONTS.size.xs, color: COLORS.textSecondary },
  score: { fontSize: FONTS.size.md, fontWeight: '900', color: COLORS.gem },
  empty: { textAlign: 'center', color: COLORS.textSecondary, marginTop: SPACING.xl },
});
