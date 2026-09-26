import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from './CustomText';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Theme } from '../constants/themes';

interface FilterChip {
  id: string;
  label: string;
  emoji: string;
}

interface Props {
  filters: FilterChip[];
  active: string;
  onSelect: (id: string) => void;
  theme: Theme;
  language: string;
}

export function FilterChips({ filters, active, onSelect, theme }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: SPACING.xs }}>
      {filters.map(f => {
        const isActive = active === f.id;
        return (
          <TouchableOpacity
            key={f.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${f.emoji} ${f.label}`}
            style={[
              styles.filterChip,
              { backgroundColor: theme.colors.card, borderColor: isActive ? theme.colors.primaryLight : theme.colors.border },
              isActive && { backgroundColor: theme.colors.primary + '33' }
            ]}
            onPress={() => onSelect(f.id)}
          >
            <Text style={[styles.filterChipText, { color: isActive ? theme.colors.primaryLight : theme.colors.textSecondary }]}>
              {f.emoji} {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterScroll: { marginBottom: SPACING.md, flexGrow: 0 },
  filterChip: { borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, minHeight: 32 },
  filterChipText: { fontSize: FONTS.size.sm, fontWeight: '700' },
});
