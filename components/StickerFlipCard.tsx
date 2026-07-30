import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Sticker } from '../constants/stickers';

interface StickerFlipCardProps {
  sticker: Sticker;
  isRevealed: boolean;
  theme: any;
  language: string;
  onReveal: () => void;
}

const RARITY_COLORS = {
  common: { text: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.1)', border: '#4B5563' },
  rare: { text: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', border: '#2563EB' },
  legendary: { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: '#D97706' },
};

export function StickerFlipCard({ sticker, isRevealed, theme, language, onReveal }: StickerFlipCardProps) {
  const flipValue = useSharedValue(isRevealed ? 1 : 0);

  React.useEffect(() => {
    if (isRevealed) {
      flipValue.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    }
  }, [isRevealed]);

  const containerStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 1], [0, 180]);
    return { transform: [{ rotateY: `${rotateY}deg` }] };
  });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: flipValue.value >= 0.5 ? '180deg' : '0deg' }],
  }));

  const rarityColor = RARITY_COLORS[sticker.rarity];

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onReveal} style={styles.wrapper}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: isRevealed ? rarityColor.border : theme.colors.border },
          containerStyle,
        ]}
      >
        <Animated.View style={[styles.content, contentStyle]}>
          {!isRevealed ? (
            <View style={styles.cardBack}>
              <Text style={styles.backLogo}>💎</Text>
              <Text style={[styles.backLabel, { color: theme.colors.primaryLight }]}>GQ</Text>
            </View>
          ) : (
            <View style={styles.cardFront}>
              <Text style={styles.emoji}>{sticker.emoji}</Text>
              <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
                {language === 'en' ? sticker.nameEn : sticker.nameTr}
              </Text>
              <View style={[styles.rarity, { backgroundColor: rarityColor.bg }]}>
                <Text style={[styles.rarityText, { color: rarityColor.text }]}>
                  {sticker.rarity.toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '31%', height: '100%' },
  card: { flex: 1, borderRadius: BORDER_RADIUS.lg, borderWidth: 2.5, overflow: 'hidden' },
  content: { flex: 1 },
  cardBack: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1E38', gap: 4 },
  backLogo: { fontSize: 32 },
  backLabel: { fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },
  cardFront: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xs, gap: 6 },
  emoji: { fontSize: 36 },
  name: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  rarity: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  rarityText: { fontSize: 8, fontWeight: '900' },
});
