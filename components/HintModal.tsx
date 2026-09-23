import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Text } from './CustomText';
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
  language?: 'tr' | 'en';
}

export function HintModal({
  visible,
  onClose,
  gems,
  isPremium,
  onWatchAd,
  onSpendGems,
  onGoToStore,
  language = 'tr',
}: HintModalProps) {
  const [loading, setLoading] = useState<'ad' | 'gem' | null>(null);
  const en = language === 'en';

  const handleWatchAd = async () => {
    setLoading('ad');
    try {
      await onWatchAd();
      onClose();
    } finally {
      setLoading(null);
    }
  };

  const handleSpendGems = async () => {
    setLoading('gem');
    try {
      const success = await onSpendGems();
      if (success) onClose();
    } finally {
      setLoading(null);
    }
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
            <Text style={styles.title}>{en ? 'Get a Hint' : 'İpucu Al'}</Text>
            <Text style={styles.subtitle}>
              {en ? 'Learn the position of a letter!' : 'Bir harfin yerini öğren!'}
            </Text>
          </LinearGradient>

          <View style={styles.body}>
            {isPremium ? (
              <HintOptionCard
                emoji="👑"
                title={en ? 'Premium — Free' : 'Premium — Ücretsiz'}
                description={en ? 'You have unlimited hints!' : 'Sınırsız ipucu hakkın var!'}
                onPress={handleSpendGems}
                disabled={loading !== null}
                loading={loading === 'gem'}
              />
            ) : (
              <>
                <HintOptionCard
                  emoji="📺"
                  title={en ? 'Watch Ad' : 'Reklam İzle'}
                  description={en ? '~30 seconds • Completely free' : '~30 saniye • Tamamen ücretsiz'}
                  onPress={handleWatchAd}
                  disabled={loading !== null}
                  loading={loading === 'ad'}
                />
                <HintOptionCard
                  emoji="💎"
                  title={canAffordGems ? (en ? 'Spend Gems' : 'Gem Harca') : (en ? 'Buy Gems' : 'Gem Satın Al')}
                  description={canAffordGems
                    ? (en ? `${HINT_GEM_COST} Gems • Balance: ${gems} 💎` : `${HINT_GEM_COST} Gem • Bakiye: ${gems} 💎`)
                    : (en ? `You have ${gems} gems, ${HINT_GEM_COST} needed` : `${gems} Gem var, ${HINT_GEM_COST} gerekli`)}
                  onPress={canAffordGems ? handleSpendGems : onGoToStore}
                  disabled={loading !== null}
                  loading={loading === 'gem'}
                />
              </>
            )}

            <TouchableOpacity style={styles.closeBtn} accessibilityRole="button" accessibilityLabel={en ? 'Close' : 'Kapat'} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} onPress={onClose}>
              <Text style={styles.closeText}>{en ? 'Cancel' : 'Vazgeç'}</Text>
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
