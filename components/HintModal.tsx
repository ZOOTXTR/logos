import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { HINT_GEM_COST } from '../constants/products';
import { HintOptionCard } from './HintOptionCard';

interface HintModalProps {
  visible: boolean;
  onClose: () => void;
  gems: number;
  isPremium: boolean;
  onWatchAd: () => Promise<void>;
  onSpendGems: () => Promise<boolean>;
  onGoToStore: () => void;
}

export function HintModal({
  visible,
  onClose,
  gems,
  isPremium,
  onWatchAd,
  onSpendGems,
  onGoToStore,
}: HintModalProps) {
  const [loading, setLoading] = useState<'ad' | 'gem' | null>(null);

  const handleWatchAd = async () => {
    setLoading('ad');
    await onWatchAd();
    setLoading(null);
    onClose();
  };

  const handleSpendGems = async () => {
    setLoading('gem');
    const success = await onSpendGems();
    setLoading(null);
    if (success) onClose();
  };

  const canAffordGems = gems >= HINT_GEM_COST;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.header}
          >
            <Text style={styles.emoji}>💡</Text>
            <Text style={styles.title}>İpucu Al</Text>
            <Text style={styles.subtitle}>
              Bir harfin yerini öğren!
            </Text>
          </LinearGradient>

          <View style={styles.body}>
            {isPremium ? (
              <HintOptionCard
                emoji="👑"
                title="Premium — Ücretsiz"
                description="Sınırsız ipucu hakkın var!"
                onPress={handleSpendGems}
                disabled={loading !== null}
                loading={loading === 'gem'}
              />
            ) : (
              <>
                <HintOptionCard
                  emoji="📺"
                  title="Reklam İzle"
                  description="~30 saniye • Tamamen ücretsiz"
                  onPress={handleWatchAd}
                  disabled={loading !== null}
                  loading={loading === 'ad'}
                />
                <HintOptionCard
                  emoji="💎"
                  title={canAffordGems ? 'Gem Harca' : 'Gem Satın Al'}
                  description={canAffordGems
                    ? `${HINT_GEM_COST} Gem • Bakiye: ${gems} 💎`
                    : `${gems} Gem var, ${HINT_GEM_COST} gerekli`}
                  onPress={canAffordGems ? handleSpendGems : onGoToStore}
                  disabled={loading !== null}
                  loading={loading === 'gem'}
                />
              </>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Vazgeç</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  header: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONTS.size.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONTS.size.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  body: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  closeText: {
    color: COLORS.textMuted,
    fontSize: FONTS.size.md,
  },
});
