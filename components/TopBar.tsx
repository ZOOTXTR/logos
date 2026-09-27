import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Gem, Plus } from 'lucide-react-native';
import { sounds } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

interface TopBarProps {
  gems: number;
  onOpenStore?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ gems, onOpenStore }) => {
  const { activeTheme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: activeTheme.surface,
          borderBottomColor: activeTheme.border
        }
      ]}
    >
      {/* Left: Logos Wordmark & Badge */}
      <View style={styles.brandRow}>
        <View style={[styles.logoIconBadge, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
          <View style={styles.gridRow}>
            <View style={[styles.letterSquare, { backgroundColor: activeTheme.primary }]}>
              <Text style={styles.squareText}>L</Text>
            </View>
            <View style={[styles.letterSquare, { backgroundColor: '#22C55E' }]}>
              <Text style={styles.squareText}>O</Text>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={[styles.letterSquare, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.squareText}>G</Text>
            </View>
            <View style={[styles.letterSquare, { backgroundColor: activeTheme.accent }]}>
              <Text style={styles.squareText}>S</Text>
            </View>
          </View>
        </View>

        <Text style={styles.brandTitle}>Logos</Text>
      </View>

      {/* Right: Gem Pill Button */}
      <Pressable
        onPress={() => {
          sounds.playClick();
          haptics.buttonTap();
          if (onOpenStore) onOpenStore();
        }}
        style={({ pressed }) => [
          styles.gemButton,
          {
            backgroundColor: activeTheme.card,
            borderColor: activeTheme.border,
            opacity: pressed ? 0.8 : 1
          }
        ]}
      >
        <Gem size={14} color={activeTheme.accent} fill={`${activeTheme.accent}40`} />
        <Text style={[styles.gemText, { color: activeTheme.accent }]}>{gems}</Text>
        <View style={[styles.plusIconCircle, { backgroundColor: `${activeTheme.accent}25` }]}>
          <Plus size={10} color={activeTheme.accent} />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
    gap: 2
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2
  },
  letterSquare: {
    flex: 1,
    height: 10,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  squareText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800'
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F4F4F5',
    letterSpacing: -0.5
  },
  gemButton: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  gemText: {
    fontSize: 13,
    fontWeight: '700'
  },
  plusIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2
  }
});
