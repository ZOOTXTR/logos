import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './CustomText';
import { Gem, Plus } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

interface TopBarProps {
  gems: number;
  onOpenStore?: () => void;
}

// AI Studio TopBar'ın birebir RN karşılığı: marka rozeti (L/O/G/S) + gem pill.
export function TopBar({ gems, onOpenStore }: TopBarProps) {
  const c = useTheme().theme.colors;

  return (
    <View style={[styles.bar, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
      <View style={styles.left}>
        <View style={[styles.badge, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.q, { backgroundColor: c.primary }]}><Text style={styles.qText}>L</Text></View>
          <View style={[styles.q, { backgroundColor: '#22C55EE6' }]}><Text style={styles.qText}>O</Text></View>
          <View style={[styles.q, { backgroundColor: '#F59E0BE6' }]}><Text style={styles.qText}>G</Text></View>
          <View style={[styles.q, { backgroundColor: c.accent }]}><Text style={styles.qText}>S</Text></View>
        </View>
        <Text style={[styles.wordmark, { color: c.text }]}>Logos</Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Elmas Bakiyesi"
        onPress={onOpenStore}
        style={[styles.pill, { backgroundColor: c.card, borderColor: c.border }]}
      >
        <Gem size={14} color={c.gem} fill={c.gem + '40'} />
        <Text style={[styles.count, { color: c.gem }]}>{gems}</Text>
        <View style={[styles.plus, { backgroundColor: c.gem + '20' }]}>
          <Plus size={10} color={c.gem} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, padding: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  q: { width: 10, height: 10, borderRadius: 2, alignItems: 'center', justifyContent: 'center' },
  qText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  wordmark: { fontSize: 18, fontWeight: '700' },
  pill: { height: 32, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  count: { fontSize: 13, fontWeight: '700' },
  plus: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
