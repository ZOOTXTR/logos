import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { sounds } from '../utils/sound';
import { haptics } from '../utils/haptics';

export const ThemeSelector: React.FC = () => {
  const { activeTheme, themeId, setTheme, palettes } = useTheme();

  const handleSelectTheme = (id: string) => {
    if (id === themeId) return;
    sounds.playClick();
    haptics.gemReward();
    setTheme(id);
  };

  return (
    <View style={styles.container}>
      {/* Live Active Theme Preview Banner */}
      <View
        style={[
          styles.previewBanner,
          {
            backgroundColor: activeTheme.surface,
            borderColor: activeTheme.primary
          }
        ]}
      >
        <View style={styles.previewLeft}>
          <View style={[styles.avatarTile, { backgroundColor: activeTheme.primary }]}>
            <Text style={styles.avatarTileText}>L</Text>
          </View>

          <View style={styles.previewInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.themeTitleText}>{activeTheme.name}</Text>
              <View style={[styles.activePill, { backgroundColor: `${activeTheme.primary}25` }]}>
                <Text style={[styles.activePillText, { color: activeTheme.primary }]}>Aktif</Text>
              </View>
            </View>
            <Text style={styles.themeDescText} numberOfLines={1}>
              {activeTheme.description}
            </Text>
          </View>
        </View>

        {/* 4 Swatch Dots */}
        <View style={styles.swatchPill}>
          {activeTheme.previewColors.map((color, idx) => (
            <View
              key={idx}
              style={[styles.dotCircle, { backgroundColor: color }]}
            />
          ))}
        </View>
      </View>

      {/* 2-Column Grid of Palettes */}
      <View style={styles.grid}>
        {palettes.map((palette) => {
          const isSelected = palette.id === themeId;

          return (
            <Pressable
              key={palette.id}
              onPress={() => handleSelectTheme(palette.id)}
              style={({ pressed }) => [
                styles.paletteCard,
                {
                  backgroundColor: isSelected ? palette.surface : '#17181D',
                  borderColor: isSelected ? palette.primary : '#26272B',
                  opacity: pressed ? 0.85 : 1
                }
              ]}
            >
              <View style={styles.paletteHeader}>
                <Text
                  style={[
                    styles.paletteName,
                    { color: isSelected ? '#FFFFFF' : '#F4F4F5' }
                  ]}
                  numberOfLines={1}
                >
                  {palette.name}
                </Text>

                {isSelected ? (
                  <View style={[styles.checkCircle, { backgroundColor: palette.primary }]}>
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  </View>
                ) : (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{palette.badge}</Text>
                  </View>
                )}
              </View>

              {/* Swatches */}
              <View style={styles.swatchRow}>
                {palette.previewColors.map((c, i) => (
                  <View
                    key={i}
                    style={[styles.smallDot, { backgroundColor: c }]}
                  />
                ))}
              </View>

              <Text style={styles.paletteSubtext} numberOfLines={1}>
                {palette.description}
              </Text>

              {/* Accent Line */}
              <View
                style={[
                  styles.bottomBar,
                  {
                    backgroundColor: palette.primary,
                    opacity: isSelected ? 1 : 0.25
                  }
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  previewBanner: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  previewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  avatarTile: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarTileText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900'
  },
  previewInfo: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  themeTitleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  activePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800'
  },
  themeDescText: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 2
  },
  swatchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  dotCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between'
  },
  paletteCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6
  },
  paletteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  paletteName: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgePill: {
    backgroundColor: '#121317',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#26272B'
  },
  badgeText: {
    color: '#71717A',
    fontSize: 9,
    fontWeight: '600'
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginVertical: 2
  },
  smallDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  paletteSubtext: {
    color: '#71717A',
    fontSize: 10
  },
  bottomBar: {
    height: 3,
    borderRadius: 2,
    marginTop: 2
  }
});
