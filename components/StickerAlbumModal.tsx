import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { storageGetJSON, storageSetJSON } from '../services/storage.service';
import { useTheme } from '../hooks/useTheme';
import { audioService } from '../services/audio.service';
import { STICKERS, rollRandomStickers, Sticker } from '../constants/stickers';
import { StickerGridCard } from './StickerGridCard';
import { StickerFlipCard } from './StickerFlipCard';

interface StickerAlbumModalProps {
  visible: boolean;
  onClose: () => void;
  gems: number;
  onSpendGems: (amount: number) => Promise<boolean>;
}

export function StickerAlbumModal({ visible, onClose, gems, onSpendGems }: StickerAlbumModalProps) {
  const { theme, language } = useTheme();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'album' | 'pack'>('album');
  const [packStickers, setPackStickers] = useState<Sticker[]>([]);
  const [openedCards, setOpenedCards] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (visible) {
      loadUnlockedStickers();
      setViewMode('album');
    }
  }, [visible]);

  const loadUnlockedStickers = async () => {
    try {
      const val = await storageGetJSON<string[]>('gq_sticker_album');
      if (val) setUnlockedIds(val);
    } catch (e) {
      console.warn('Failed to load sticker album:', e);
    }
  };

  const saveUnlockedStickers = async (ids: string[]) => {
    try {
      await storageSetJSON('gq_sticker_album', ids);
      setUnlockedIds(ids);
    } catch (e) {
      console.warn('Failed to save sticker album:', e);
    }
  };

  const handleBuyPack = async () => {
    if (gems < 100) {
      Alert.alert(
        language === 'en' ? '💎 Insufficient Gems' : '💎 Yetersiz Gem',
        language === 'en' ? 'Mystery Sticker Pack costs 100 💎' : 'Gizemli Çıkartma Paketi 100 💎 gerektirir.'
      );
      return;
    }

    const success = await onSpendGems(100);
    if (!success) return;

    audioService.triggerHaptic('medium');
    audioService.play('win');

    const rolled = rollRandomStickers(3);
    setPackStickers(rolled);
    setOpenedCards([false, false, false]);
    setViewMode('pack');

    const updated = Array.from(new Set([...unlockedIds, ...rolled.map(s => s.id)]));
    await saveUnlockedStickers(updated);
  };

  const handleRevealCard = (idx: number) => {
    if (openedCards[idx]) return;
    audioService.triggerHaptic('light');
    audioService.play('click');
    setOpenedCards(prev => { const n = [...prev]; n[idx] = true; return n; });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={viewMode === 'pack' ? () => setViewMode('album') : onClose}
          >
            <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>
              ← {viewMode === 'pack' ? (language === 'en' ? 'Album' : 'Albüm') : (language === 'en' ? 'Close' : 'Kapat')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            🎫 {language === 'en' ? 'Sticker Album' : 'Çıkartma Albümü'}
          </Text>
          <View style={[styles.gemPill, { backgroundColor: theme.colors.card, borderColor: theme.colors.gem }]}>
            <Text style={[styles.gemText, { color: theme.colors.gem }]}>💎 {gems}</Text>
          </View>
        </View>

        {viewMode === 'album' ? (
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={[styles.packPromo, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.promoTextCol}>
                <Text style={[styles.promoTitle, { color: theme.colors.text }]}>
                  {language === 'en' ? 'Mystery Sticker Pack' : 'Gizemli Çıkartma Paketi'}
                </Text>
                <Text style={[styles.promoDesc, { color: theme.colors.textSecondary }]}>
                  {language === 'en' ? 'Get 3 random rarity sticker cards' : '3 adet rastgele nadirlikte kart kazan!'}
                </Text>
              </View>
              <TouchableOpacity style={styles.buyBtn} onPress={handleBuyPack}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.buyGrad}>
                  <Text style={styles.buyBtnText}>100 💎</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                {language === 'en' ? 'Completion Progress:' : 'Albüm Tamamlanma Oranı:'} {unlockedIds.length}/{STICKERS.length}
              </Text>
              <View style={[styles.progressBarBg, { backgroundColor: theme.colors.empty }]}>
                <View style={[styles.progressBarFill, { backgroundColor: theme.colors.primary, width: `${(unlockedIds.length / STICKERS.length) * 100}%` }]} />
              </View>
            </View>

            <View style={styles.albumGrid}>
              {STICKERS.map(item => (
                <StickerGridCard
                  key={item.id}
                  sticker={item}
                  isUnlocked={unlockedIds.includes(item.id)}
                  language={language}
                  theme={theme}
                />
              ))}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        ) : (
          <View style={styles.openingContainer}>
            <Text style={[styles.openingTitle, { color: theme.colors.text }]}>
              {language === 'en' ? 'Mystery Pack Opened!' : 'Gizemli Paket Açıldı!'}
            </Text>
            <Text style={[styles.openingDesc, { color: theme.colors.textSecondary }]}>
              {language === 'en' ? 'Tap on cards to reveal your stickers' : 'Kartların üzerine dokunarak çıkartmaları açın!'}
            </Text>

            <View style={styles.cardsRow}>
              {packStickers.map((sticker, idx) => (
                <StickerFlipCard
                  key={idx}
                  sticker={sticker}
                  isRevealed={openedCards[idx]}
                  theme={theme}
                  language={language}
                  onReveal={() => handleRevealCard(idx)}
                />
              ))}
            </View>

            {openedCards.every(c => c) && (
              <TouchableOpacity style={styles.doneBtn} onPress={() => setViewMode('album')}>
                <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.doneGrad}>
                  <Text style={styles.doneBtnText}>{language === 'en' ? 'Add to Album' : 'Albüme Ekle'} ✓</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
  },
  backBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  backText: { fontSize: FONTS.size.sm, fontWeight: '700' },
  title: { fontSize: FONTS.size.md, fontWeight: '900' },
  gemPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  gemText: { fontWeight: '700', fontSize: FONTS.size.sm },
  body: { flex: 1, paddingHorizontal: SPACING.md },
  packPromo: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5, marginBottom: SPACING.lg,
  },
  promoTextCol: { flex: 1, marginRight: SPACING.sm },
  promoTitle: { fontSize: FONTS.size.md, fontWeight: '800' },
  promoDesc: { fontSize: 10, marginTop: 2, lineHeight: 14 },
  buyBtn: { height: 40, borderRadius: BORDER_RADIUS.full, overflow: 'hidden', minWidth: 80 },
  buyGrad: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md },
  buyBtnText: { color: '#000', fontWeight: '900', fontSize: FONTS.size.sm },
  progressContainer: { marginBottom: SPACING.lg },
  progressLabel: { fontSize: FONTS.size.xs, fontWeight: '700', marginBottom: 6 },
  progressBarBg: { height: 8, borderRadius: BORDER_RADIUS.full, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: BORDER_RADIUS.full },
  albumGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'space-between' },
  openingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  openingTitle: { fontSize: 24, fontWeight: '900', marginBottom: 6 },
  openingDesc: { fontSize: FONTS.size.sm, textAlign: 'center', marginBottom: SPACING.xl },
  cardsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', height: 180, marginBottom: SPACING.xxl },
  doneBtn: { height: 48, borderRadius: BORDER_RADIUS.full, overflow: 'hidden', width: 200 },
  doneGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { color: '#fff', fontWeight: '900', fontSize: FONTS.size.md },
});
