import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { useProgress } from '../../hooks/useProgress';
import { useTheme } from '../../hooks/useTheme';
import { TRANSLATIONS } from '../../constants/translations';
import { ALL_MODES, GameModeCard } from '../../constants/modes';

export default function ModesScreen() {
  const router = useRouter();
  const progress = useProgress();
  const { theme, language } = useTheme();
  const t = TRANSLATIONS[language];

  const GAME_MODES = ALL_MODES(t, language);

  const handleModePress = (mode: GameModeCard) => {
    if (mode.badge === 'Yakında' || mode.badge === 'Soon') {
      Alert.alert(language === 'en' ? '🚧 Coming Soon' : '🚧 Yakında', language === 'en' ? 'This mode is coming soon!' : 'Bu mod yakında geliyor!');
      return;
    }
    if (mode.isPremium && !progress.premium) {
      Alert.alert(
        language === 'en' ? '👑 Premium Required' : '👑 Premium Gerekli',
        language === 'en' ? 'This mode is exclusive to Premium members!\nPurchase premium from your Profile tab.' : 'Bu mod Premium üyelere özel!\nProfil sekmesinden Premium satın alabilirsiniz.'
      );
      return;
    }
    router.push(mode.route as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>🎮 {language === 'en' ? 'Game Modes' : 'Oyun Modları'}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                {language === 'en' ? 'Pick your favorite mode and play!' : 'Favori modunu seç ve oyna!'}
              </Text>
            </View>
            <View style={[styles.gemPill, { backgroundColor: theme.colors.card, borderColor: theme.colors.gem }]}>
              <Text style={[styles.gemText, { color: theme.colors.gem }]}>💎 {progress.gems}</Text>
            </View>
          </View>

          {/* Mod Kartları */}
          {GAME_MODES.map(mode => (
            <TouchableOpacity
              key={mode.id}
              style={styles.modeCard}
              onPress={() => handleModePress(mode)}
              activeOpacity={0.85}
              accessibilityLabel={`Play ${mode.title}`}
            >
              <LinearGradient
                colors={mode.gradient}
                style={styles.modeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.modeLeft}>
                  <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                  <View>
                    <Text style={styles.modeTitle}>{mode.title}</Text>
                    <Text style={styles.modeDesc}>{mode.description}</Text>
                  </View>
                </View>
                <View style={styles.modeRight}>
                  {mode.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{mode.badge}</Text>
                    </View>
                  )}
                  {mode.isPremium && !progress.premium && (
                    <Text style={styles.premiumIcon}>👑</Text>
                  )}
                  <Text style={styles.modeArrow}>›</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}

          {/* Günlük Meydan Okuma Kartı */}
          <LinearGradient
            colors={['#F59E0B33', '#F59E0B11']}
            style={[styles.dailyCard, { borderColor: theme.colors.accent + '44' }]}
          >
            <Text style={styles.dailyEmoji}>🌟</Text>
            <View style={styles.dailyText}>
              <Text style={[styles.dailyTitle, { color: theme.colors.text }]}>{t.dailyChallenge}</Text>
              <Text style={[styles.dailyDesc, { color: theme.colors.textSecondary }]}>{t.dailyChallengeDesc}</Text>
            </View>
            <TouchableOpacity
              style={[styles.dailyBtn, { backgroundColor: theme.colors.accent }]}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.dailyBtnText}>{t.play} →</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Tema önizlemesi */}
          <View style={[styles.themeBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.themeBarLabel, { color: theme.colors.textSecondary }]}>
              {language === 'en' ? 'Active Theme:' : 'Aktif Tema:'} {theme.emoji} {theme.name}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
              <Text style={[styles.themeBarLink, { color: theme.colors.primaryLight }]}>{language === 'en' ? 'Change →' : 'Değiştir →'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: SPACING.md },
  title: { fontSize: FONTS.size.xxl, fontWeight: '900' },
  subtitle: { fontSize: FONTS.size.sm, marginTop: 2 },
  gemPill: { paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  gemText: { fontWeight: '700', fontSize: FONTS.size.sm },
  modeCard: { marginBottom: SPACING.md, borderRadius: BORDER_RADIUS.xl, overflow: 'hidden' },
  modeGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
  modeLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  modeEmoji: { fontSize: 40 },
  modeTitle: { color: '#FFF', fontSize: FONTS.size.lg, fontWeight: '800' },
  modeDesc: { color: 'rgba(255,255,255,0.85)', fontSize: FONTS.size.sm, marginTop: 2, maxWidth: 200 },
  modeRight: { alignItems: 'flex-end', gap: 4 },
  badge: { backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDER_RADIUS.full },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  premiumIcon: { fontSize: 20 },
  modeArrow: { color: 'rgba(255,255,255,0.7)', fontSize: FONTS.size.xxl, fontWeight: '300' },
  dailyCard: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, borderWidth: 1, gap: SPACING.md },
  dailyEmoji: { fontSize: 36 },
  dailyText: { flex: 1 },
  dailyTitle: { fontSize: FONTS.size.md, fontWeight: '800' },
  dailyDesc: { fontSize: FONTS.size.sm, marginTop: 2 },
  dailyBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full },
  dailyBtnText: { color: '#000', fontWeight: '800', fontSize: FONTS.size.sm },
  themeBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: BORDER_RADIUS.md, padding: SPACING.md, borderWidth: 1 },
  themeBarLabel: { fontSize: FONTS.size.sm },
  themeBarLink: { fontSize: FONTS.size.sm, fontWeight: '700' },
});
