import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

type FeedbackType = 'bug' | 'suggestion' | 'complaint' | 'other';

interface FeedbackTypeSelectorProps {
  selectedType: FeedbackType;
  onSelect: (type: FeedbackType) => void;
  theme: any;
  language: string;
}

const feedbackTypes: Array<{ id: FeedbackType; labelTr: string; labelEn: string; emoji: string }> = [
  { id: 'bug', labelTr: 'Hata Bildir', labelEn: 'Report Bug', emoji: '🐛' },
  { id: 'suggestion', labelTr: 'Öneri / Fikir', labelEn: 'Suggestion', emoji: '💡' },
  { id: 'complaint', labelTr: 'Şikayet', labelEn: 'Complaint', emoji: '👎' },
  { id: 'other', labelTr: 'Diğer', labelEn: 'Other', emoji: '💬' },
];

export function FeedbackTypeSelector({ selectedType, onSelect, theme, language }: FeedbackTypeSelectorProps) {
  return (
    <>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {language === 'en' ? 'Feedback Category' : 'Geri Bildirim Türü'}
      </Text>
      <View style={styles.typeGrid}>
        {feedbackTypes.map((item) => {
          const isActive = selectedType === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.typeCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                isActive && { borderColor: theme.colors.primaryLight, backgroundColor: theme.colors.primary + '22' }
              ]}
              onPress={() => onSelect(item.id)}
            >
              <Text style={styles.typeEmoji}>{item.emoji}</Text>
              <Text style={[styles.typeLabel, { color: isActive ? theme.colors.primaryLight : theme.colors.textSecondary }]}>
                {language === 'en' ? item.labelEn : item.labelTr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: FONTS.size.md,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
  },
  typeEmoji: { fontSize: 20 },
  typeLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: '700',
  },
});
