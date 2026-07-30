import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { GameMode, Category, Difficulty } from '../constants/words';
import { LevelInfo } from '../constants/levels';
import { ModeSelector } from '../components/ModeSelector';
import { StoreModal } from '../components/StoreModal';
import { DailySpinModal } from '../components/DailySpinModal';
import { HelpModal } from '../components/HelpModal';
import { GemShower } from '../components/GemShower';
import { LevelBar } from '../components/LevelBar';
import { StreakBanner } from '../components/StreakBanner';
import { audioService } from '../services/audio.service';

interface GameMenuScreenProps {
  theme: any;
  language: string;
  colorBlind: boolean;
  gems: number;
  xp: number;
  levelInfo: LevelInfo | null;
  streak: number;
  streakBonus: number;
  premium: boolean;
  unlockedCategories: string[];
  dailyDone: boolean;
  showGemShower: boolean;
  onStartGame: (mode: GameMode, category: Category, difficulty: Difficulty) => void;
  onAddGems: (amount: number) => Promise<number>;
  onUnlockCategory: (cat: string) => Promise<string[]>;
  onUnlockPremium: () => Promise<void>;
  onShowGemShower: (v: boolean) => void;
}

export function GameMenuScreen({
  theme, language, colorBlind,
  gems, xp, levelInfo, streak, streakBonus,
  premium, unlockedCategories, dailyDone,
  showGemShower,
  onStartGame, onAddGems, onUnlockCategory,
  onUnlockPremium, onShowGemShower,
}: GameMenuScreenProps) {
  const [showStore, setShowStore] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSpin, setShowSpin] = useState(false);

  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.logo, { color: theme.colors.text }]}>💎 Logos</Text>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 6, margin: 0 }]}
            onPress={() => { audioService.triggerHaptic('light'); setShowHelp(true); }}
          >
            <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', fontSize: 12 }}>❓ {language === 'en' ? 'Help' : 'Yardım'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gemPill, { backgroundColor: theme.colors.card, borderColor: theme.colors.gem }]} onPress={() => setShowStore(true)}>
            <Text style={[styles.gemPillText, { color: theme.colors.gem }]}>💎 {gems}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {levelInfo && (
        <View style={styles.levelBarWrap}>
          <LevelBar xp={xp} levelInfo={levelInfo} />
        </View>
      )}

      <StreakBanner streak={streak} bonusGems={streakBonus} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <ModeSelector
          onStart={onStartGame}
          gems={gems}
          streak={streak}
          levelTitle={levelInfo?.title ?? ''}
          level={levelInfo?.level ?? 1}
          dailyDone={dailyDone}
          unlockedCategories={unlockedCategories}
          onOpenStore={() => { audioService.triggerHaptic('light'); setShowStore(true); }}
        />

        <TouchableOpacity
          style={[styles.spinBanner, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={() => { audioService.triggerHaptic('light'); setShowSpin(true); }}
          activeOpacity={0.8}
        >
          <Text style={styles.spinBannerEmoji}>🎡</Text>
          <View style={styles.spinBannerTextContainer}>
            <Text style={[styles.spinBannerTitle, { color: theme.colors.text }]}>
              {language === 'en' ? 'Lucky Daily Spin' : 'Günlük Şans Çarkı'}
            </Text>
            <Text style={[styles.spinBannerDesc, { color: theme.colors.textSecondary }]}>
              {language === 'en' ? 'Spin once a day to win free gems!' : 'Günde 1 kez döndür, bedava Gem kazan!'}
            </Text>
          </View>
          <Text style={[styles.spinBannerArrow, { color: theme.colors.primaryLight }]}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      <StoreModal
        visible={showStore}
        onClose={() => setShowStore(false)}
        gems={gems}
        isPremium={premium}
        onPurchase={async (_, gemAmount) => { await onAddGems(gemAmount); }}
        onPurchasePremium={onUnlockPremium}
        unlockedCategories={unlockedCategories}
        onUnlockCategory={async (cat) => {
          const spent = true;
          const ok = await onUnlockCategory(cat);
          return ok;
        }}
      />
      <DailySpinModal
        visible={showSpin}
        onClose={() => setShowSpin(false)}
        gems={gems}
        onAddGems={(g) => { onAddGems(g); onShowGemShower(true); }}
      />
      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />
      <GemShower active={showGemShower} onComplete={() => onShowGemShower(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.md },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: SPACING.md,
  },
  logo: { fontSize: FONTS.size.xl, fontWeight: '900', color: COLORS.text },
  levelBarWrap: { marginBottom: SPACING.sm },
  backBtn: {
    backgroundColor: COLORS.card, paddingHorizontal: SPACING.sm,
    paddingVertical: 6, borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: COLORS.border,
  },
  gemPill: {
    backgroundColor: COLORS.card, paddingHorizontal: SPACING.sm,
    paddingVertical: 6, borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: COLORS.gem,
  },
  gemPillText: { color: COLORS.gem, fontWeight: '700', fontSize: FONTS.size.sm },
  spinBanner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, marginTop: SPACING.md, gap: SPACING.md },
  spinBannerEmoji: { fontSize: 32 },
  spinBannerTextContainer: { flex: 1 },
  spinBannerTitle: { fontSize: FONTS.size.md, fontWeight: '800' },
  spinBannerDesc: { fontSize: FONTS.size.xs, marginTop: 2 },
  spinBannerArrow: { fontSize: 24, fontWeight: '300' },
});
