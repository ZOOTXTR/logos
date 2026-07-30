import React from 'react';
import {
  Modal, View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export function HelpModal({ visible, onClose }: HelpModalProps) {
  const { theme, colorBlind } = useTheme();

  const correctColor = colorBlind ? '#0072B2' : theme.colors.correct;
  const presentColor = colorBlind ? '#E69F00' : theme.colors.present;

  const MockCell = ({ char, status }: { char: string, status: 'correct' | 'present' | 'absent' }) => (
    <View
      style={[
        styles.mockCell,
        {
          backgroundColor:
            status === 'correct' ? correctColor :
            status === 'present' ? presentColor : theme.colors.absent
        }
      ]}
    >
      <Text style={styles.mockCellText}>{char}</Text>
      {colorBlind && (status === 'correct' || status === 'present') && (
        <View style={styles.indicator}>
          <Text style={styles.indicatorText}>{status === 'correct' ? '✓' : '●'}</Text>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: '#121225', borderColor: theme.colors.border }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>📖 Nasıl Oynanır?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* WORDLE */}
            <View style={styles.section}>
              <Text style={[styles.secTitle, { color: theme.colors.primaryLight }]}>🎯 Klasik / Günlük Mod</Text>
              <Text style={[styles.secText, { color: theme.colors.textSecondary }]}>
                Gizli 5 harfli kelimeyi 6 tahminde bulmaya çalışın. Her tahminden sonra kutucukların rengi harflerin konumuna göre değişir:
              </Text>
              <View style={styles.row}>
                <MockCell char="E" status="correct" />
                <Text style={[styles.descText, { color: theme.colors.text }]}>
                  Harf kelimede var ve <Text style={{ color: correctColor, fontWeight: 'bold' }}>doğru yerde</Text>.
                </Text>
              </View>
              <View style={styles.row}>
                <MockCell char="L" status="present" />
                <Text style={[styles.descText, { color: theme.colors.text }]}>
                  Harf kelimede var ama <Text style={{ color: presentColor, fontWeight: 'bold' }}>yanlış yerde</Text>.
                </Text>
              </View>
              <View style={styles.row}>
                <MockCell char="M" status="absent" />
                <Text style={[styles.descText, { color: theme.colors.text }]}>
                  Harf kelimede <Text style={{ color: theme.colors.textMuted, fontWeight: 'bold' }}>yok</Text>.
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            {/* DORDLE */}
            <View style={styles.section}>
              <Text style={[styles.secTitle, { color: theme.colors.primaryLight }]}>🎭 Çift Kelime (Dordle)</Text>
              <Text style={[styles.secText, { color: theme.colors.textSecondary }]}>
                Aynı anda iki farklı gizli kelimeyi 7 tahminde bulmaya çalışın. Yaptığınız tahminler her iki tahtaya da işlenir. Bir taraf çözüldüğünde o taraf kilitlenir ve diğer kelimeye odaklanabilirsiniz.
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            {/* ANAGRAM */}
            <View style={styles.section}>
              <Text style={[styles.secTitle, { color: theme.colors.primaryLight }]}>🔀 Anagram</Text>
              <Text style={[styles.secText, { color: theme.colors.textSecondary }]}>
                Karışık olarak verilen harfleri doğru sırayla seçerek anlamlı kelimeyi bulun. Toplam 5 deneme hakkınız vardır.
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            {/* BLITZ */}
            <View style={styles.section}>
              <Text style={[styles.secTitle, { color: theme.colors.primaryLight }]}>⚡ Blitz Modu</Text>
              <Text style={[styles.secText, { color: theme.colors.textSecondary }]}>
                60 saniye zamanınız var! Bu süre zarfında olabildiğince çok kelimeyi sırayla tahmin edin. Doğru bildiğiniz her kelime sürenize <Text style={{ color: theme.colors.correct, fontWeight: 'bold' }}>+5 saniye</Text> ekler. Yanlış kelimeleri "Atla" butonuyla geçebilirsiniz fakat <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>-5 saniye</Text> ceza alırsınız!
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            {/* ZINCIR */}
            <View style={styles.section}>
              <Text style={[styles.secTitle, { color: theme.colors.primaryLight }]}>⛓️ Kelime Zinciri</Text>
              <Text style={[styles.secText, { color: theme.colors.textSecondary }]}>
                Önceki kelimenin son harfiyle başlayan yeni bir kelime türetin. Kelime tahtasında olan kelimeleri kullanmalısınız. 3 can hakkınız vardır, her geçersiz kelime girişinde can kaybedersiniz. Zinciri uzattıkça kazandığınız XP katlanır!
              </Text>
            </View>

            <View style={{ height: SPACING.xl }} />
          </ScrollView>

          <TouchableOpacity style={styles.closeFullBtn} onPress={onClose}>
            <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.closeGrad}>
              <Text style={styles.closeText}>Tamam, Anladım</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: SPACING.md },
  content: { width: '100%', maxHeight: '85%', borderRadius: BORDER_RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1 },
  title: { fontSize: FONTS.size.lg, fontWeight: '800' },
  closeBtn: { padding: 4 },
  body: { padding: SPACING.md },
  section: { marginVertical: SPACING.sm },
  secTitle: { fontSize: FONTS.size.md, fontWeight: '800', marginBottom: 4 },
  secText: { fontSize: FONTS.size.sm, lineHeight: 20, marginBottom: SPACING.sm },
  divider: { height: 1, marginVertical: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  mockCell: { width: 36, height: 36, borderRadius: BORDER_RADIUS.sm, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  mockCellText: { fontSize: FONTS.size.md, fontWeight: '800', color: 'white' },
  indicator: { position: 'absolute', bottom: 1, right: 2 },
  indicatorText: { fontSize: 8, fontWeight: '900', color: 'white' },
  descText: { flex: 1, fontSize: FONTS.size.sm },
  closeFullBtn: { overflow: 'hidden' },
  closeGrad: { paddingVertical: SPACING.md, alignItems: 'center' },
  closeText: { color: 'white', fontWeight: '800', fontSize: FONTS.size.md },
});
