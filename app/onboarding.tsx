import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, StatusBar, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useProgress } from '../hooks/useProgress';
import { storageSet } from '../services/storage.service';

const { width } = Dimensions.get('window');

interface Slide {
  title: string;
  desc: string;
  emoji: string;
  gradient: [string, string];
}

const SLIDES: Slide[] = [
  {
    title: '💎 Logos\'e Hoş Geldiniz!',
    desc: 'Harfleri eşleştirin, kelimeleri bulun ve seviye atlayarak yeni temaların kilidini açın!',
    emoji: '👑',
    gradient: ['#7C3AED', '#4F46E5'],
  },
  {
    title: '🎮 5 Farklı Oyun Modu',
    desc: 'Klasik Wordle, Anagram, Süreli Hızlı Mod (Blitz), Kelime Zinciri ve Dordle modlarıyla beyninizi zorlayın!',
    emoji: '⚡',
    gradient: ['#F59E0B', '#D97706'],
  },
  {
    title: '🎮 7 Farklı Oyun Modu',
    desc: 'Klasik, Hızlı, Günlük, Anagram, Dordle, Düello ve Kelime Zinciri — her zevke göre bir mod!',
    emoji: '🎮',
    gradient: ['#3B82F6', '#1D4ED8'],
  },
  {
    title: '🎁 150 Gem Hoş Geldin Hediyesi!',
    desc: 'Başlangıç için hediye gemlerinizi alın, ipuçları kullanın ve mağazadan premium tasarımları edinin.',
    emoji: '💎',
    gradient: ['#10B981', '#059669'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const progress = useProgress();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // Set onboarded as true and award startup gems
      await storageSet('gq_onboarded', 'true');
      await progress.addGems(150);
      router.replace('/(tabs)');
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <LinearGradient colors={[COLORS.background, '#0F0F23']} style={styles.container}>
        <View style={styles.content}>
          
          {/* Progress Indicator */}
          <View style={styles.indicatorRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.indicator,
                  i === currentSlide && styles.indicatorActive,
                ]}
              />
            ))}
          </View>

          {/* Icon/Emoji Box */}
          <LinearGradient colors={slide.gradient} style={styles.emojiCard}>
            <Text style={styles.emojiText}>{slide.emoji}</Text>
          </LinearGradient>

          {/* Text Info */}
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideDesc}>{slide.desc}</Text>

          {/* Action Button */}
          <TouchableOpacity style={styles.btn} onPress={handleNext} activeOpacity={0.85}>
            <LinearGradient
              colors={slide.gradient}
              style={styles.btnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>
                {currentSlide === SLIDES.length - 1 ? '🎁 Gemleri Al ve Başla' : 'İleri'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Skip option */}
          {currentSlide < SLIDES.length - 1 && (
            <TouchableOpacity
              onPress={async () => {
                await storageSet('gq_onboarded', 'true');
                await progress.addGems(150);
                router.replace('/(tabs)');
              }}
              style={styles.skipBtn}
            >
              <Text style={styles.skipText}>Geç</Text>
            </TouchableOpacity>
          )}

        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { width: '85%', alignItems: 'center', gap: SPACING.md },
  indicatorRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.lg },
  indicator: { width: 16, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
  indicatorActive: { width: 32, backgroundColor: COLORS.primaryLight },
  emojiCard: { width: 140, height: 140, borderRadius: BORDER_RADIUS.xl, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, marginBottom: SPACING.lg },
  emojiText: { fontSize: 72 },
  slideTitle: { fontSize: FONTS.size.xxl, fontWeight: '900', color: COLORS.text, textAlign: 'center' },
  slideDesc: { fontSize: FONTS.size.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: SPACING.sm, marginBottom: SPACING.xl },
  btn: { width: '100%', borderRadius: BORDER_RADIUS.full, overflow: 'hidden' },
  btnGrad: { paddingVertical: SPACING.md, alignItems: 'center' },
  btnText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: '800' },
  skipBtn: { padding: SPACING.sm },
  skipText: { color: COLORS.textMuted, fontSize: FONTS.size.sm, fontWeight: '600' },
});
