import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Play, Zap, Trophy, Calendar, Sparkles, ChevronRight } from 'lucide-react-native';
import { GameMode } from '../types/game';
import { sounds } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

interface ModesScreenProps {
  onSelectAndPlay: (mode: GameMode) => void;
}

export const ModesScreen: React.FC<ModesScreenProps> = ({ onSelectAndPlay }) => {
  const { activeTheme } = useTheme();

  const modes = [
    {
      id: 'klasik' as GameMode,
      title: 'Klasik Mod',
      desc: 'Standart 6 haklı sakin ve odaklanmış kelime oyunu. Kendi hızında düşün.',
      icon: Play,
      badge: 'Popüler',
      badgeColor: activeTheme.primary,
      multiplier: '1.0x Puan'
    },
    {
      id: 'hizli' as GameMode,
      title: 'Hızlı Blitz',
      desc: 'Süreye karşı 60 saniye! Hızlı düşün, kelimeleri ardı ardına çöz.',
      icon: Zap,
      badge: 'Aksiyon',
      badgeColor: '#F59E0B',
      multiplier: '1.5x Puan'
    },
    {
      id: 'turnuva' as GameMode,
      title: 'Haftalık Turnuva',
      desc: 'Lig sıralamasında yüksel, turnuva liderlik tablosunda büyük ödülü kazan.',
      icon: Trophy,
      badge: '2.5x Puan',
      badgeColor: '#EF4444',
      multiplier: 'Büyük Ödül'
    },
    {
      id: 'gunluk' as GameMode,
      title: 'Günün Kelimesi',
      desc: 'Tüm oyuncularla ortak gizli kelimeyi 24 saat içinde ilk denemede çöz.',
      icon: Calendar,
      badge: 'Günlük',
      badgeColor: activeTheme.accent,
      multiplier: 'Sabit Ödül'
    }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Oyun Modları</Text>
        <Text style={styles.subtitle}>İstediğin mücadele tarzını seç ve hemen başla</Text>
      </View>

      <View style={styles.list}>
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <Pressable
              key={m.id}
              onPress={() => {
                sounds.playVictory();
                haptics.submitGuess();
                onSelectAndPlay(m.id);
              }}
              style={({ pressed }) => [
                styles.modeCard,
                {
                  backgroundColor: activeTheme.card,
                  borderColor: activeTheme.border,
                  opacity: pressed ? 0.85 : 1
                }
              ]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: `${m.badgeColor}20` }]}>
                  <Icon size={22} color={m.badgeColor} />
                </View>
                <View style={[styles.badgePill, { backgroundColor: `${m.badgeColor}20` }]}>
                  <Text style={[styles.badgeText, { color: m.badgeColor }]}>{m.badge}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.modeTitle}>{m.title}</Text>
                <Text style={styles.modeDesc}>{m.desc}</Text>
              </View>

              <View style={[styles.cardFooter, { borderTopColor: activeTheme.border }]}>
                <Text style={[styles.multiplierText, { color: activeTheme.accent }]}>{m.multiplier}</Text>
                <View style={styles.rowAlign}>
                  <Text style={[styles.playNowText, { color: activeTheme.primary }]}>Hemen Oyna</Text>
                  <ChevronRight size={14} color={activeTheme.primary} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 16
  },
  header: {
    gap: 4
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  subtitle: {
    fontSize: 12,
    color: '#A1A1AA'
  },
  list: {
    gap: 12
  },
  modeCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  cardBody: {
    gap: 4
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  modeDesc: {
    fontSize: 12,
    color: '#A1A1AA',
    lineHeight: 18
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1
  },
  multiplierText: {
    fontSize: 11,
    fontWeight: '700'
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  playNowText: {
    fontSize: 12,
    fontWeight: '700'
  }
});
