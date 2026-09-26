import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './CustomText';
import { Check } from 'lucide-react-native';
import { THEMES, Theme } from '../constants/themes';
import { useTheme } from '../hooks/useTheme';

interface ThemeSelectorProps {
  onSelect: (id: string, gemCost: number) => void;
}

// AI Studio ThemeSelector'ın birebir RN karşılığı: canlı aktif tema bandı + 2 sütunlu palet grid.
export function ThemeSelector({ onSelect }: ThemeSelectorProps) {
  const { theme: active, language, unlockedThemes } = useTheme();

  const label = (t: Theme) => (language === 'en' ? (t.nameEn ?? t.name) : t.name);
  const desc = (t: Theme) => (language === 'en' ? (t.descEn ?? t.description) : t.description);

  const badge = (t: Theme) => {
    if (t.gemCost === -1) return '👑 Premium';
    if (t.gemCost === 0) return language === 'en' ? 'Free' : 'Ücretsiz';
    return `${t.gemCost} 💎`;
  };

  const swatches = (t: Theme) => [t.colors.primary, t.colors.accent, t.colors.background, t.colors.surface];

  return (
    <View style={styles.wrap}>
      {/* Live Active Theme Preview Banner */}
      <View style={[styles.banner, { backgroundColor: active.colors.surface, borderColor: active.colors.primary }]}>
        <View style={styles.bannerLeft}>
          <View style={[styles.tile, { backgroundColor: active.colors.primary }]}>
            <Text style={styles.tileText}>L</Text>
          </View>
          <View style={styles.bannerInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: active.colors.text }]} numberOfLines={1}>{label(active)}</Text>
              <View style={[styles.activeBadge, { backgroundColor: active.colors.primary + '26', borderColor: active.colors.primary }]}>
                <Text style={[styles.activeBadgeText, { color: active.colors.primary }]}>{language === 'en' ? 'Active' : 'Aktif'}</Text>
              </View>
            </View>
            <Text style={[styles.desc, { color: active.colors.textSecondary }]} numberOfLines={1}>{desc(active)}</Text>
          </View>
        </View>
        <View style={styles.swatchPill}>
          {swatches(active).map((c, i) => (
            <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
          ))}
        </View>
      </View>

      {/* Palette Selection Grid */}
      <View style={styles.grid}>
        {THEMES.map((t) => {
          const selected = t.id === active.id;
          const unlocked = unlockedThemes.includes(t.id);
          return (
            <TouchableOpacity
              key={t.id}
              accessibilityRole="button"
              accessibilityLabel={label(t)}
              activeOpacity={0.9}
              onPress={() => onSelect(t.id, t.gemCost)}
              style={[
                styles.card,
                { backgroundColor: selected ? t.colors.surface : active.colors.card, borderColor: selected ? t.colors.primary : active.colors.border },
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={[styles.cardName, { color: selected ? '#FFFFFF' : active.colors.text }]} numberOfLines={1}>{label(t)}</Text>
                {selected ? (
                  <View style={[styles.check, { backgroundColor: t.colors.primary }]}>
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </View>
                ) : (
                  <Text style={[styles.badgeText, { color: active.colors.textMuted }]}>
                    {unlocked ? (language === 'en' ? 'Select' : 'Seç') : badge(t)}
                  </Text>
                )}
              </View>

              <View style={styles.cardSwatches}>
                {swatches(t).map((c, i) => (
                  <View key={i} style={[styles.swatchSm, { backgroundColor: c }]} />
                ))}
              </View>

              <Text style={[styles.cardDesc, { color: active.colors.textMuted }]} numberOfLines={1}>{desc(t)}</Text>

              <View style={[styles.glow, { backgroundColor: t.colors.primary, opacity: selected ? 1 : 0.2 }]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  tile: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tileText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  bannerInfo: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 12, fontWeight: '700', flexShrink: 1 },
  activeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  activeBadgeText: { fontSize: 9, fontWeight: '700' },
  desc: { fontSize: 11, marginTop: 2 },
  swatchPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.4)', padding: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  swatch: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 8 },
  cardName: { fontSize: 12, fontWeight: '700', flexShrink: 1 },
  check: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 9, fontWeight: '700', backgroundColor: '#121317', borderWidth: 1, borderColor: '#26272B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  cardSwatches: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  swatchSm: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  cardDesc: { fontSize: 10, marginTop: 6 },
  glow: { width: '100%', height: 2, borderRadius: 1, marginTop: 8 },
});
