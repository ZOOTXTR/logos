import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet
} from 'react-native';
import {
  Play,
  Flame,
  Award,
  Swords,
  Sparkles,
  Lock,
  Trophy,
  Zap,
  BookOpen,
  Gem,
  Check,
  ChevronRight
} from 'lucide-react-native';
import {
  GameMode,
  CategoryId,
  DifficultyId,
  PlayerStats,
  Category,
  Difficulty,
  DailyQuest
} from '../types/game';
import { sounds } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

interface HomeScreenProps {
  stats: PlayerStats;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  selectedDifficulty: DifficultyId;
  onSelectDifficulty: (diff: DifficultyId) => void;
  onStartGame: () => void;
  onOpenWheel: () => void;
  onOpenDuel: () => void;
  dailyQuests: DailyQuest[];
  onClaimQuestReward: (questId: string) => void;
  onOpenStore?: () => void;
}

const CATEGORIES: Category[] = [
  { id: 'karisik', name: 'Karışık', emoji: '✨' },
  { id: 'hayvanlar', name: 'Hayvanlar', emoji: '🐾' },
  { id: 'sehirler', name: 'Şehirler', emoji: '🏛️' },
  { id: 'yiyecek', name: 'Yiyecek', emoji: '🍲' },
  { id: 'meslekler', name: 'Meslekler', emoji: '💼' },
  { id: 'doga', name: 'Doğa', emoji: '🌿' },
  { id: 'spor', name: 'Spor', emoji: '⚽' }
];

const DIFFICULTIES: Difficulty[] = [
  { id: 'kolay', label: 'Kolay', letters: 4, multiplier: '1.0x', maxAttempts: 6 },
  { id: 'normal', label: 'Normal', letters: 5, multiplier: '1.2x', maxAttempts: 6 },
  { id: 'zor', label: 'Zor', letters: 6, multiplier: '1.5x', maxAttempts: 6 },
  { id: 'uzman', label: 'Uzman', letters: 7, multiplier: '2.0x', maxAttempts: 6 }
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  selectedMode,
  onSelectMode,
  selectedCategory,
  onSelectCategory,
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  onOpenWheel,
  onOpenDuel,
  dailyQuests,
  onClaimQuestReward,
  onOpenStore
}) => {
  const { activeTheme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Quick Stats Header Strip */}
      <View style={[styles.statsStrip, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <View style={styles.statItem}>
          <View style={[styles.statIconBadge, { backgroundColor: `${activeTheme.primary}20` }]}>
            <Trophy size={14} color={activeTheme.primary} />
          </View>
          <View>
            <Text style={styles.statLabel}>Seviye</Text>
            <Text style={styles.statVal}>{stats.level}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: activeTheme.border }]} />

        <View style={styles.statItem}>
          <View style={[styles.statIconBadge, { backgroundColor: '#F59E0B20' }]}>
            <Flame size={14} color="#F59E0B" />
          </View>
          <View>
            <Text style={styles.statLabel}>Seri</Text>
            <Text style={[styles.statVal, { color: '#F59E0B' }]}>{stats.streak} Gün</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: activeTheme.border }]} />

        <Pressable
          onPress={() => {
            sounds.playClick();
            haptics.buttonTap();
            if (onOpenStore) onOpenStore();
          }}
          style={styles.statItem}
        >
          <View style={[styles.statIconBadge, { backgroundColor: `${activeTheme.accent}20` }]}>
            <Gem size={14} color={activeTheme.accent} />
          </View>
          <View>
            <Text style={styles.statLabel}>Elmas</Text>
            <Text style={[styles.statVal, { color: activeTheme.accent }]}>{stats.gems}</Text>
          </View>
        </Pressable>
      </View>

      {/* 2. Interactive Quick Features (Wheel & Duel) */}
      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => {
            sounds.playClick();
            haptics.buttonTap();
            onOpenWheel();
          }}
          style={[styles.featureCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
        >
          <View style={[styles.featureIconBox, { backgroundColor: `${activeTheme.primary}25` }]}>
            <Award size={20} color={activeTheme.primary} />
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitle}>Şans Çarkı</Text>
            <Text style={styles.featureSubtitle}>Günlük Ücretsiz</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            sounds.playClick();
            haptics.buttonTap();
            onOpenDuel();
          }}
          style={[styles.featureCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
        >
          <View style={[styles.featureIconBox, { backgroundColor: '#EF444425' }]}>
            <Swords size={20} color="#EF4444" />
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitle}>1v1 Düello</Text>
            <Text style={styles.featureSubtitle}>Ödüllü Mücadele</Text>
          </View>
        </Pressable>
      </View>

      {/* 3. Difficulty Selector */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionHeader}>Zorluk Seviyesi</Text>
        <View style={styles.diffRow}>
          {DIFFICULTIES.map((d) => {
            const isSelected = selectedDifficulty === d.id;
            return (
              <Pressable
                key={d.id}
                onPress={() => {
                  sounds.playClick();
                  haptics.buttonTap();
                  onSelectDifficulty(d.id);
                }}
                style={[
                  styles.diffBtn,
                  {
                    backgroundColor: isSelected ? activeTheme.primary : activeTheme.card,
                    borderColor: isSelected ? activeTheme.primary : activeTheme.border
                  }
                ]}
              >
                <Text style={[styles.diffLabel, { color: isSelected ? '#FFFFFF' : '#F4F4F5' }]}>
                  {d.label}
                </Text>
                <Text style={[styles.diffLetters, { color: isSelected ? '#E0E7FF' : '#71717A' }]}>
                  {d.letters} Harf
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 4. Category Selector (Horizontal Scroll) */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionHeader}>Kategori</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => {
                  sounds.playClick();
                  haptics.buttonTap();
                  onSelectCategory(cat.id);
                }}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: isSelected ? `${activeTheme.primary}20` : activeTheme.card,
                    borderColor: isSelected ? activeTheme.primary : activeTheme.border
                  }
                ]}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryName, { color: isSelected ? activeTheme.primary : '#D4D4D8' }]}>
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. Big Main Play CTA Button */}
      <Pressable
        onPress={() => {
          sounds.playVictory();
          haptics.submitGuess();
          onStartGame();
        }}
        style={({ pressed }) => [
          styles.playBtn,
          {
            backgroundColor: activeTheme.primary,
            opacity: pressed ? 0.9 : 1
          }
        ]}
      >
        <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
        <Text style={styles.playBtnText}>Oyunu Başlat</Text>
      </Pressable>

      {/* 6. Daily Quests Section */}
      <View style={[styles.questsCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <View style={styles.questsHeader}>
          <View style={styles.rowAlign}>
            <Sparkles size={16} color={activeTheme.primary} />
            <Text style={styles.questsTitle}>Günlük Görevler</Text>
          </View>
          <Text style={styles.questsSub}>Her gün 00:00'da yenilenir</Text>
        </View>

        <View style={styles.questsList}>
          {dailyQuests.map((q) => {
            const isComplete = q.currentProgress >= q.targetProgress;

            return (
              <View
                key={q.id}
                style={[
                  styles.questRow,
                  { backgroundColor: activeTheme.surface, borderColor: activeTheme.border }
                ]}
              >
                <View style={styles.questLeft}>
                  <View style={[styles.questIconBox, { backgroundColor: isComplete ? '#22C55E20' : `${activeTheme.primary}15` }]}>
                    {q.iconName === 'book' && <BookOpen size={16} color={isComplete ? '#22C55E' : activeTheme.primary} />}
                    {q.iconName === 'trophy' && <Trophy size={16} color={isComplete ? '#22C55E' : activeTheme.primary} />}
                    {q.iconName === 'zap' && <Zap size={16} color={isComplete ? '#22C55E' : activeTheme.primary} />}
                  </View>
                  <View style={styles.questDetails}>
                    <Text style={styles.questName}>{q.title}</Text>
                    <Text style={styles.questProgress}>
                      {q.currentProgress}/{q.targetProgress} Tamamlandı
                    </Text>
                  </View>
                </View>

                {q.claimed ? (
                  <View style={styles.claimedBadge}>
                    <Check size={12} color="#71717A" />
                    <Text style={styles.claimedText}>Alındı</Text>
                  </View>
                ) : isComplete ? (
                  <Pressable
                    onPress={() => {
                      sounds.playGemEarned();
                      haptics.gemReward();
                      onClaimQuestReward(q.id);
                    }}
                    style={[styles.claimBtn, { backgroundColor: activeTheme.accent }]}
                  >
                    <Text style={styles.claimBtnText}>+{q.rewardGems} 💎 Al</Text>
                  </Pressable>
                ) : (
                  <Text style={[styles.pendingReward, { color: activeTheme.accent }]}>
                    +{q.rewardGems} 💎
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    gap: 16
  },
  statsStrip: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statLabel: {
    fontSize: 10,
    color: '#71717A',
    fontWeight: '600'
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  divider: {
    width: 1,
    height: 24
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12
  },
  featureCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureTextBox: {
    flex: 1
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  featureSubtitle: {
    fontSize: 10,
    color: '#A1A1AA',
    marginTop: 1
  },
  sectionWrap: {
    gap: 8
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A1A1AA',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  diffRow: {
    flexDirection: 'row',
    gap: 8
  },
  diffBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2
  },
  diffLabel: {
    fontSize: 12,
    fontWeight: '700'
  },
  diffLetters: {
    fontSize: 10
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 2
  },
  categoryCard: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  categoryEmoji: {
    fontSize: 16
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600'
  },
  playBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  questsCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12
  },
  questsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  questsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  questsSub: {
    fontSize: 10,
    color: '#71717A'
  },
  questsList: {
    gap: 8
  },
  questRow: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  questLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  questIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  questDetails: {
    flex: 1
  },
  questName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F4F4F5'
  },
  questProgress: {
    fontSize: 10,
    color: '#71717A',
    marginTop: 1
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#26272B'
  },
  claimedText: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '600'
  },
  claimBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  claimBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800'
  },
  pendingReward: {
    fontSize: 11,
    fontWeight: '700'
  }
});
