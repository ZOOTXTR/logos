import React, { useRef, useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { X, Gem } from 'lucide-react-native';
import { sounds } from '../utils/sound';
import { storageGet, storageSet } from '../services/storage.service';

const SPIN_KEY = 'gq_last_wheel_spin';
const todayStr = () => new Date().toISOString().slice(0, 10);

interface WheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (gems: number) => void;
}

const PRIZES = [25, 50, 10, 100, 15, 75, 20, 150];
const SIZE = 224;
const RADIUS = 85;
const CENTER = SIZE / 2;
const SLICE_DEG = 360 / PRIZES.length;

export const WheelModal: React.FC<WheelModalProps> = ({ isOpen, onClose, onReward }) => {
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<number | null>(null);
  const [canSpin, setCanSpin] = useState(true);
  const spin = useRef(new Animated.Value(0)).current;
  const currentDeg = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    storageGet(SPIN_KEY)
      .then((v) => { if (alive) setCanSpin(v !== todayStr()); })
      .catch(() => {});
    return () => { alive = false; };
  }, [isOpen]);

  const rotate = spin.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  const handleSpin = () => {
    if (spinning || !canSpin) return;
    sounds.playClick();
    setSpinning(true);
    setWonPrize(null);

    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const baseDeg = (360 - prizeIndex * SLICE_DEG) % 360;
    const currentMod = ((currentDeg.current % 360) + 360) % 360;
    const delta = (baseDeg - currentMod + 360) % 360;
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const final = currentDeg.current + extraRounds * 360 + delta;
    currentDeg.current = final;

    Animated.timing(spin, {
      toValue: final,
      duration: 3200,
      easing: Easing.bezier(0.15, 0.9, 0.2, 1),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      const prize = PRIZES[prizeIndex];
      setWonPrize(prize);
      setCanSpin(false);
      storageSet(SPIN_KEY, todayStr()).catch(() => {});
      sounds.playVictory();
      onReward(prize);
    });
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={() => { sounds.playClick(); onClose(); }} style={styles.closeBtn}>
            <X size={16} color="#A1A1AA" />
          </Pressable>

          <View style={styles.titleRow}>
            <Text style={styles.titleEmoji}>🎡</Text>
            <Text style={styles.title}>Günlük Şans Çarkı</Text>
          </View>
          <Text style={styles.subtitle}>Her gün çarkı çevir, ücretsiz elmas ödüllerini topla!</Text>

          <View style={styles.wheelWrap}>
            <View style={styles.pointer} />
            <Animated.View style={[styles.wheel, { transform: [{ rotate }] }]}>
              {PRIZES.map((p, i) => {
                const a = (SLICE_DEG * i * Math.PI) / 180;
                const x = CENTER + RADIUS * Math.sin(a) - 22;
                const y = CENTER - RADIUS * Math.cos(a) - 8;
                return (
                  <View key={i} style={[styles.prizeLabel, { left: x, top: y }]}>
                    <Text style={styles.prizeText}>+{p}</Text>
                    <Gem size={10} color="#38BDF8" />
                  </View>
                );
              })}
              <View style={styles.hub}>
                <Text style={styles.hubText}>LOGOS</Text>
              </View>
            </Animated.View>
          </View>

          {wonPrize !== null && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Kazandığın Ödül:</Text>
              <View style={styles.resultValueRow}>
                <Text style={styles.resultValue}>+{wonPrize} Elmas</Text>
                <Gem size={16} color="#38BDF8" />
              </View>
            </View>
          )}

          <Pressable disabled={spinning || !canSpin} onPress={handleSpin} style={[styles.spinBtn, (spinning || !canSpin) && styles.spinBtnDisabled]}>
            <Text style={styles.spinBtnText}>{spinning ? 'Çark Dönüyor...' : canSpin ? 'Ücretsiz Çevir' : 'Yarın tekrar gel'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 340, backgroundColor: '#17181D', borderWidth: 1, borderColor: '#26272B', borderRadius: 24, padding: 20, alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: '#121317', borderWidth: 1, borderColor: '#26272B', alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  titleEmoji: { fontSize: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#F4F4F5' },
  subtitle: { fontSize: 12, color: '#71717A', textAlign: 'center', marginBottom: 18 },
  wheelWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  pointer: { position: 'absolute', top: -8, zIndex: 10, width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 16, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#F59E0B' },
  wheel: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: 4, borderColor: '#26272B', backgroundColor: '#121317', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  prizeLabel: { position: 'absolute', width: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 },
  prizeText: { fontSize: 12, fontWeight: '700', color: '#38BDF8' },
  hub: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#17181D', borderWidth: 2, borderColor: '#7C5CFF', alignItems: 'center', justifyContent: 'center' },
  hubText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  resultRow: { marginTop: 12, alignItems: 'center' },
  resultLabel: { fontSize: 12, color: '#A1A1AA' },
  resultValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  resultValue: { fontSize: 20, fontWeight: '700', color: '#38BDF8' },
  spinBtn: { width: '100%', height: 48, marginTop: 18, borderRadius: 16, backgroundColor: '#7C5CFF', alignItems: 'center', justifyContent: 'center' },
  spinBtnDisabled: { opacity: 0.5 },
  spinBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
