import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { DefinitionItem } from '../services/definition.service';

interface DefinitionCardProps {
  index: number;
  item: DefinitionItem;
  theme: any;
  language: string;
}

export function DefinitionCard({ index, item, theme, language }: DefinitionCardProps) {
  return (
    <View style={[styles.defCard, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.defHeader}>
        <Text style={[styles.defIndex, { color: theme.colors.primary }]}>{index + 1}.</Text>
        {item.partOfSpeech && (
          <View style={[styles.partPill, { backgroundColor: theme.colors.primary + '22' }]}>
            <Text style={[styles.partText, { color: theme.colors.primaryLight }]}>
              {item.partOfSpeech.toLowerCase()}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.defText, { color: theme.colors.text }]}>
        {item.definition}
      </Text>
      {item.example && (
        <Text style={[styles.exampleText, { color: theme.colors.textSecondary }]}>
          💡 "{item.example}"
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  defCard: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  defHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  defIndex: {
    fontSize: FONTS.size.md,
    fontWeight: '800',
    marginRight: 6,
  },
  partPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  partText: {
    fontSize: 10,
    fontWeight: '800',
  },
  defText: {
    fontSize: FONTS.size.md,
    lineHeight: 22,
    fontWeight: '600',
  },
  exampleText: {
    fontSize: FONTS.size.sm,
    fontStyle: 'italic',
    marginTop: 6,
  },
});
