import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/CustomText';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { SPACING, BORDER_RADIUS } from '../../constants/theme';
import { useProgress } from '../../hooks/useProgress';
import { useTheme } from '../../hooks/useTheme';
import { TRANSLATIONS } from '../../constants/translations';
import { ALL_MODES, GameModeCard } from '../../constants/modes';
import { TopBar } from '../../components/TopBar';
import type { LucideIcon } from 'lucide-react-native';
import {
  SpellCheck, Zap, Shuffle, Link2, Filter, Waypoints, Swords, Lock, ChevronRight,
} from 'lucide-react-native';

const MODE_META: Record<string, { icon: LucideIcon; color: string }> = {
  wordle: { icon: SpellCheck, color: '#7C5CFF' },
  anagram: { icon: Shuffle, color: '#A78BFA' },
  blitz: { icon: Zap, color: '#F59E0B' },
  chain: { icon: Link2, color: '#22C55E' },
  dordle: { icon: Filter, color: '#8B5CF6' },
  wordconnect: { icon: Waypoints, color: '#EC4899' },
  duel: { icon: Swords, color: '#38BDF8' },
};

type Filter = 'all' | 'solo' | 'multi';

export default function ModesScreen() {
  const router = useRouter();
  const progress = useProgress();
  const { theme, language } = useTheme();
  const t = TRANSLATIONS[language];
  const GAME_MODES = ALL_MODES(t, language);
  const [filter, setFilter] = useState<Filter>('all');

  const handleModePress = (mode: GameModeCard) => {
    if (mode.badge === 'Yakında' || mode.badge === 'Soon') {
      Alert.alert(language === 'en' ? '🚧 Coming Soon' : '🚧 Yakında', language === 'en' ? 'This mode is coming soon!' : 'Bu mod yakında geliyor!');
      return;
    }
    if (mode.isPremium && !progress.premium) {
      Alert.alert(
        language === 'en' ? '👑 Premium Required' : '👑 Premium Gerekli',
        language === 'en' ? 'This mode is exclusive to Premium members!' : 'Bu mod Premium üyelere özel!'
      );
      return;
    }
    router.push(mode.route as Href);
  };

  const filtered = GAME_MODES.filter((m) => (filter === 'solo' ? m.category === 'solo' : filter === 'multi' ? m.category === 'multi' : true));

  const segBtn = (id: Filter, label: string) => {
    const active = filter === id;
    return (
      <TouchableOpacity
        key={id}
        accessibilityRole="button"
        onPress={() => setFilter(id)}
        style={[styles.segBtn, active && { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }]}
      >
        <Text style={[styles.segText, { color: active ? theme.colors.text : theme.colors.textMuted }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <TopBar gems={progress.gems} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>
              {language === 'en' ? 'LIBRARY' : 'KÜTÜPHANE'}
            </Text>
            <Text style={[styles.eyebrowCount, { color: theme.colors.textMuted }]}>
              • {language === 'en' ? `${GAME_MODES.length} Modes Ready` : `${GAME_MODES.length} Mod Hazır`}
            </Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>{language === 'en' ? 'Game Modes' : 'Oyun Modları'}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {language === 'en' ? 'Test yourself, expand your vocabulary.' : 'Kendini test et, kelime hazneni genişlet.'}
          </Text>
        </View>

        {/* Segmented Filter */}
        <View style={[styles.segmented, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {segBtn('all', `${language === 'en' ? 'All' : 'Tümü'} (${GAME_MODES.length})`)}
          {segBtn('solo', language === 'en' ? 'Solo' : 'Tek Oyunculu')}
          {segBtn('multi', '1v1')}
        </View>

        {/* Mode cards */}
        <View style={styles.list}>
          {filtered.map((mode) => {
            const meta = MODE_META[mode.id] || { icon: SpellCheck, color: theme.colors.primary };
            const Icon = meta.icon;
            const locked = mode.isPremium && !progress.premium;
            return (
              <TouchableOpacity
                key={mode.id}
                accessibilityRole="button"
                accessibilityLabel={mode.title}
                onPress={() => handleModePress(mode)}
                activeOpacity={0.8}
                style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, locked && { opacity: 0.65 }]}
              >
                <View style={[styles.iconTile, { backgroundColor: meta.color + '15', borderColor: theme.colors.border }]}>
                  <Icon size={20} color={meta.color} />
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>{mode.title}</Text>
                    {mode.badge ? (
                      <Text style={[styles.tag, { color: meta.color, backgroundColor: meta.color + '15' }]}>{mode.badge}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]} numberOfLines={2}>{mode.description}</Text>
                  <View style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}>
                    {locked ? (
                      <View style={styles.footLeft}>
                        <Lock size={12} color={theme.colors.textMuted} />
                        <Text style={[styles.footText, { color: theme.colors.textMuted }]}>{language === 'en' ? 'Locked' : 'Kilitli'}</Text>
                      </View>
                    ) : (
                      <View style={styles.footLeft}>
                        <View style={styles.dot} />
                        <Text style={[styles.footText, { color: theme.colors.correct }]}>{language === 'en' ? 'Active' : 'Aktif'}</Text>
                      </View>
                    )}
                    <Text style={[styles.play, { color: theme.colors.text }]}>
                      {locked ? (language === 'en' ? 'View' : 'İncele') : (language === 'en' ? 'Play' : 'Oyna')}
                      <ChevronRight size={14} color={theme.colors.primary} />
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: SPACING.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, maxWidth: 600, alignSelf: 'center', width: '100%' },
  header: { marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  eyebrowCount: { fontSize: 11, fontWeight: '500' },
  title: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  subtitle: { fontSize: 12, marginTop: 2 },
  segmented: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 14, borderWidth: 1, padding: 4, marginBottom: 16 },
  segBtn: { flex: 1, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segText: { fontSize: 12, fontWeight: '600' },
  list: { gap: 10 },
  card: { borderRadius: BORDER_RADIUS.lg, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconTile: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  tag: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  cardDesc: { fontSize: 12, lineHeight: 17, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 10 },
  footLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footText: { fontSize: 11, fontWeight: '600' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  play: { fontSize: 12, fontWeight: '700', flexDirection: 'row', alignItems: 'center', gap: 2 },
});
