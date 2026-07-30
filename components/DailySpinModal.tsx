import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { storageGet, storageSet } from '../services/storage.service';
import { useTheme } from '../hooks/useTheme';
import { audioService } from '../services/audio.service';
import { CustomAlert } from './CustomAlert';
import { SpinWheel } from './SpinWheel';
import { Prize } from './SpinWheelCanvas';
import { SpinPrizeTable } from './SpinPrizeTable';

interface DailySpinModalProps {
  visible: boolean;
  onClose: () => void;
  gems: number;
  onAddGems: (g: number) => void;
}

const PRIZES: Prize[] = [
  { label: '10 💎', value: 10,  color: '#4F46E5', gradientFrom: '#6D28D9' },
  { label: '20 💎', value: 20,  color: '#10B981', gradientFrom: '#059669' },
  { label: '50 💎', value: 50,  color: '#F59E0B', gradientFrom: '#D97706' },
  { label: '100 💎', value: 100, color: '#EC4899', gradientFrom: '#BE185D' },
  { label: '5 💎',  value: 5,   color: '#EF4444', gradientFrom: '#B91C1C' },
  { label: '15 💎', value: 15,  color: '#8B5CF6', gradientFrom: '#6D28D9' },
];

const SLICE_ANGLE = (2 * Math.PI) / PRIZES.length;

export function DailySpinModal({ visible, onClose, gems, onAddGems }: DailySpinModalProps) {
  const { theme, language } = useTheme();
  const [canSpin, setCanSpin] = useState(true);
  const [cooldownText, setCooldownText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const currentAngle = useRef(0);

  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{ text: string; onPress?: () => void; style?: 'cancel' | 'default' | 'destructive' }>;
  }>({ visible: false, title: '', message: '', buttons: [] });

  const showCustomAlert = (title: string, message: string, buttons?: any[]) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      buttons: buttons || [{
        text: 'Tamam',
        onPress: () => setCustomAlert(prev => ({ ...prev, visible: false }))
      }]
    });
  };

  useEffect(() => {
    if (visible) checkCooldown();
  }, [visible]);

  const checkCooldown = async () => {
    const lastSpin = await storageGet('gq_last_spin_time');
    if (!lastSpin) { setCanSpin(true); return; }
    const diff = Date.now() - parseInt(lastSpin, 10);
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    if (diff < ONE_DAY_MS) {
      setCanSpin(false);
      const rem = ONE_DAY_MS - diff;
      const h = Math.floor(rem / 3600000);
      const m = Math.floor((rem % 3600000) / 60000);
      setCooldownText(language === 'en' ? `Next spin in: ${h}h ${m}m` : `Kalan Süre: ${h}sa ${m}dk`);
    } else {
      setCanSpin(true);
    }
  };

  const handleSpin = () => {
    if (!canSpin || isSpinning) return;
    audioService.triggerHaptic('medium');
    setIsSpinning(true);

    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const prize = PRIZES[prizeIndex];

    const targetSliceCenter = -(prizeIndex * SLICE_ANGLE + SLICE_ANGLE / 2);
    const targetDeg = (targetSliceCenter * 180 / Math.PI) + 5 * 360;
    const fromDeg = currentAngle.current;

    spinAnim.setValue(fromDeg);
    Animated.timing(spinAnim, {
      toValue: fromDeg + targetDeg,
      duration: 4500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      currentAngle.current = fromDeg + targetDeg;
      handleSpinComplete(prize);
    });
  };

  const handleSpinComplete = async (prize: Prize) => {
    audioService.triggerHaptic('success');
    audioService.play('win');
    onAddGems(prize.value);
    await storageSet('gq_last_spin_time', String(Date.now()));
    showCustomAlert(
      language === 'en' ? '🎉 Congratulations!' : '🎉 Tebrikler!',
      language === 'en' ? `You won ${prize.label}!` : `Kazandınız: ${prize.label}!`,
      [{
        text: 'Tamam!',
        onPress: () => {
          setCustomAlert(prev => ({ ...prev, visible: false }));
          setIsSpinning(false);
          setCanSpin(false);
          checkCooldown();
        }
      }]
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => { if (!isSpinning) onClose(); }}
      >
        <View style={styles.overlay}>
          <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>

            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.header}
            >
              <Text style={styles.headerTitle}>
                🎡 {language === 'en' ? 'Lucky Daily Spin' : 'Günlük Şans Çarkı'}
              </Text>
              {!isSpinning && (
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>

            <SpinPrizeTable prizes={PRIZES} theme={theme} language={language} />

            <SpinWheel
              theme={theme}
              language={language}
              prizes={PRIZES}
              spinning={isSpinning}
              canSpin={canSpin}
              cooldownText={cooldownText}
              spinAnim={spinAnim}
              onPressSpin={handleSpin}
            />

          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={customAlert.visible}
        title={customAlert.title}
        message={customAlert.message}
        buttons={customAlert.buttons}
        onClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  content: {
    width: '90%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    color: '#fff',
    fontSize: FONTS.size.lg,
    fontWeight: '800',
  },
  closeBtn: { padding: 4 },
  closeBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 'bold' },
});
