import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet
} from 'react-native';
import { X, Gem, Sparkles, Check, Crown, Shield } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { PlayerStats, IAPProduct } from '../types/game';
import { sounds } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { verifyPurchase } from '../services/firebase';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats
}) => {
  const { activeTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'gems' | 'cosmetics' | 'premium'>('gems');
  const [purchasedId, setPurchasedId] = useState<string | null>(null);

  const gemPacks: IAPProduct[] = [
    { id: 'gem_pack_1', name: 'Avuç Dolusu Elmas', gems: 100, price: '₺19.99', type: 'consumable' },
    { id: 'gem_pack_2', name: 'Kese Dolusu Elmas', gems: 250, price: '₺44.99', type: 'consumable', bonusText: '+25 Bonus' },
    { id: 'gem_pack_3', name: 'Sandık Dolusu Elmas', gems: 500, price: '₺79.99', type: 'consumable', bonusText: 'Popüler • +75 Bonus' },
    { id: 'gem_pack_4', name: 'Hazine Sandığı', gems: 1200, price: '₺169.99', type: 'consumable', bonusText: 'En İyi Değer' },
    { id: 'gem_pack_5', name: 'Kraliyet Hazinesi', gems: 3000, price: '₺349.99', type: 'consumable', bonusText: 'Maksimum Paket' }
  ];

  const avatars = [
    { id: 'avatar-scholar', name: 'Bilgin Baykuş', cost: 150, emoji: '🦉' },
    { id: 'avatar-wizard', name: 'Mistik Büyücü', cost: 250, emoji: '🧙‍♂️' },
    { id: 'avatar-dragon', name: 'Kozmik Ejder', cost: 400, emoji: '🐲' },
    { id: 'avatar-lion', name: 'Kral Aslan', cost: 600, emoji: '🦁' }
  ];

  const frames = [
    { id: 'frame-gold', name: 'Altın Çerçeve', cost: 200, color: '#F59E0B' },
    { id: 'frame-neon', name: 'Neon Siber', cost: 350, color: '#EC4899' },
    { id: 'frame-emerald', name: 'Zümrüt Taç', cost: 500, color: '#10B981' }
  ];

  const handleBuyGemPack = async (pack: IAPProduct) => {
    sounds.playClick();
    haptics.buttonTap();
    setPurchasedId(pack.id);

    // Call Firebase verifyPurchase service
    await verifyPurchase(pack.id);

    setTimeout(() => {
      sounds.playGemEarned();
      haptics.gemReward();
      onUpdateStats({ gems: stats.gems + (pack.gems || 0) });
      setPurchasedId(null);
    }, 400);
  };

  const handleBuyAvatar = (avatar: { id: string; cost: number }) => {
    if (stats.gems < avatar.cost) {
      sounds.playIncorrect();
      haptics.invalidGuess();
      return;
    }
    sounds.playGemEarned();
    haptics.gemReward();
    onUpdateStats({
      gems: stats.gems - avatar.cost,
      unlockedAvatars: [...(stats.unlockedAvatars || ['avatar-default']), avatar.id],
      selectedAvatar: avatar.id
    });
  };

  const handleBuyFrame = (frame: { id: string; cost: number }) => {
    if (stats.gems < frame.cost) {
      sounds.playIncorrect();
      haptics.invalidGuess();
      return;
    }
    sounds.playGemEarned();
    haptics.gemReward();
    onUpdateStats({
      gems: stats.gems - frame.cost,
      unlockedFrames: [...(stats.unlockedFrames || ['frame-default']), frame.id],
      selectedFrame: frame.id
    });
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: activeTheme.canvas, borderColor: activeTheme.border }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: activeTheme.surface, borderBottomColor: activeTheme.border }]}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: `${activeTheme.primary}20` }]}>
                <Sparkles size={18} color={activeTheme.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Logos Mağazası</Text>
                <Text style={styles.headerSubtitle}>Elmas paketleri, kozmetikler ve abonelik</Text>
              </View>
            </View>

            <Pressable
              onPress={() => {
                sounds.playClick();
                haptics.buttonTap();
                onClose();
              }}
              style={styles.closeBtn}
            >
              <X size={20} color="#A1A1AA" />
            </Pressable>
          </View>

          {/* Current Gem Balance */}
          <View style={[styles.balanceBar, { backgroundColor: activeTheme.card, borderBottomColor: activeTheme.border }]}>
            <Text style={styles.balanceLabel}>Mevcut Bakiyeniz:</Text>
            <View style={styles.balancePill}>
              <Gem size={14} color={activeTheme.accent} />
              <Text style={[styles.balanceVal, { color: activeTheme.accent }]}>{stats.gems} Elmas</Text>
            </View>
          </View>

          {/* Tab Selector */}
          <View style={[styles.tabsRow, { backgroundColor: activeTheme.surface, borderBottomColor: activeTheme.border }]}>
            {[
              { id: 'gems', label: 'Elmas Paketleri' },
              { id: 'cosmetics', label: 'Avatar & Çerçeve' },
              { id: 'premium', label: 'Premium VIP' }
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => {
                    sounds.playClick();
                    haptics.buttonTap();
                    setActiveTab(tab.id as any);
                  }}
                  style={[
                    styles.tabItem,
                    isSelected && { borderBottomColor: activeTheme.primary, borderBottomWidth: 2 }
                  ]}
                >
                  <Text style={[styles.tabText, { color: isSelected ? activeTheme.primary : '#71717A', fontWeight: isSelected ? '700' : '500' }]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Scrollable Content */}
          <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* GEMS TAB */}
            {activeTab === 'gems' && (
              <View style={styles.itemsList}>
                {gemPacks.map((pack) => (
                  <View
                    key={pack.id}
                    style={[styles.gemCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
                  >
                    <View style={styles.gemLeft}>
                      <View style={[styles.gemIconWrap, { backgroundColor: `${activeTheme.accent}15` }]}>
                        <Gem size={22} color={activeTheme.accent} />
                      </View>
                      <View>
                        <View style={styles.rowAlign}>
                          <Text style={styles.gemPackTitle}>{pack.name}</Text>
                          {pack.bonusText && (
                            <View style={[styles.bonusTag, { backgroundColor: `${activeTheme.primary}20` }]}>
                              <Text style={[styles.bonusTagText, { color: activeTheme.primary }]}>{pack.bonusText}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.gemCountText, { color: activeTheme.accent }]}>+{pack.gems} Elmas</Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => handleBuyGemPack(pack)}
                      style={[styles.buyBtn, { backgroundColor: activeTheme.primary }]}
                    >
                      <Text style={styles.buyBtnText}>{pack.price}</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* COSMETICS TAB */}
            {activeTab === 'cosmetics' && (
              <View style={styles.cosmeticsWrap}>
                <Text style={styles.sectionHeader}>Özel Avatarlar</Text>
                <View style={styles.avatarGrid}>
                  {avatars.map((av) => {
                    const isUnlocked = stats.unlockedAvatars?.includes(av.id);
                    const isSelected = stats.selectedAvatar === av.id;

                    return (
                      <View key={av.id} style={[styles.avatarItem, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                        <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                        <Text style={styles.avatarName}>{av.name}</Text>

                        {isUnlocked ? (
                          <Pressable
                            onPress={() => {
                              sounds.playClick();
                              haptics.buttonTap();
                              onUpdateStats({ selectedAvatar: av.id });
                            }}
                            style={[styles.smallBtn, { backgroundColor: isSelected ? activeTheme.primary : '#26272B' }]}
                          >
                            <Text style={styles.smallBtnText}>{isSelected ? 'Aktif' : 'Seç'}</Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            onPress={() => handleBuyAvatar(av)}
                            style={[styles.smallBtn, { backgroundColor: `${activeTheme.accent}20` }]}
                          >
                            <Text style={[styles.smallBtnText, { color: activeTheme.accent }]}>{av.cost} 💎</Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>

                <Text style={[styles.sectionHeader, { marginTop: 14 }]}>Işıltılı Çerçeveler</Text>
                <View style={styles.framesGrid}>
                  {frames.map((fr) => {
                    const isUnlocked = stats.unlockedFrames?.includes(fr.id);
                    const isSelected = stats.selectedFrame === fr.id;

                    return (
                      <View key={fr.id} style={[styles.frameItem, { backgroundColor: activeTheme.card, borderColor: fr.color }]}>
                        <View style={[styles.frameCirclePreview, { borderColor: fr.color }]}>
                          <Text style={{ fontSize: 20 }}>👑</Text>
                        </View>
                        <Text style={styles.avatarName}>{fr.name}</Text>

                        {isUnlocked ? (
                          <Pressable
                            onPress={() => {
                              sounds.playClick();
                              haptics.buttonTap();
                              onUpdateStats({ selectedFrame: fr.id });
                            }}
                            style={[styles.smallBtn, { backgroundColor: isSelected ? fr.color : '#26272B' }]}
                          >
                            <Text style={styles.smallBtnText}>{isSelected ? 'Aktif' : 'Kullan'}</Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            onPress={() => handleBuyFrame(fr)}
                            style={[styles.smallBtn, { backgroundColor: `${fr.color}25` }]}
                          >
                            <Text style={[styles.smallBtnText, { color: fr.color }]}>{fr.cost} 💎</Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* PREMIUM TAB */}
            {activeTab === 'premium' && (
              <View style={[styles.premiumCard, { backgroundColor: activeTheme.surface, borderColor: activeTheme.primary }]}>
                <View style={[styles.crownBadge, { backgroundColor: `${activeTheme.primary}25` }]}>
                  <Crown size={32} color={activeTheme.primary} />
                </View>
                <Text style={styles.premiumTitle}>Logos VIP Premium</Text>
                <Text style={styles.premiumDesc}>Tüm reklamsız deneyim, sınırsız günlük jokerler ve özel turnuva ödülleri</Text>

                <View style={styles.perksList}>
                  {[
                    'Sıfır reklam ve kesintisiz deneyim',
                    'Her gün +50 Ücretsiz Bonus Elmas',
                    'Özel VIP Altın Profil Rozeti',
                    '2.5x Turnuva Skoru Katlayıcısı'
                  ].map((perk, i) => (
                    <View key={i} style={styles.perkRow}>
                      <Check size={16} color="#22C55E" strokeWidth={3} />
                      <Text style={styles.perkText}>{perk}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  onPress={() => {
                    sounds.playGemEarned();
                    haptics.winGame();
                    onUpdateStats({ isPremium: true, gems: stats.gems + 500 });
                  }}
                  style={[styles.subscribeBtn, { backgroundColor: activeTheme.primary }]}
                >
                  <Text style={styles.subscribeBtnText}>₺49.99 / Ay ile Katıl</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden'
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 2
  },
  closeBtn: {
    padding: 6
  },
  balanceBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  balanceLabel: {
    fontSize: 12,
    color: '#A1A1AA'
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  balanceVal: {
    fontSize: 13,
    fontWeight: '800'
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabText: {
    fontSize: 12
  },
  contentScroll: {
    padding: 16,
    paddingBottom: 32
  },
  itemsList: {
    gap: 10
  },
  gemCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  gemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  gemIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  gemPackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  bonusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  bonusTagText: {
    fontSize: 9,
    fontWeight: '800'
  },
  gemCountText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2
  },
  buyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  cosmeticsWrap: {
    gap: 10
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F4F4F5'
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  avatarItem: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6
  },
  avatarEmoji: {
    fontSize: 32
  },
  avatarName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F4F4F5'
  },
  smallBtn: {
    width: '100%',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4
  },
  smallBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  framesGrid: {
    flexDirection: 'row',
    gap: 10
  },
  frameItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 6
  },
  frameCirclePreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  premiumCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 10
  },
  crownBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  premiumDesc: {
    fontSize: 12,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 18
  },
  perksList: {
    width: '100%',
    marginVertical: 10,
    gap: 8
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  perkText: {
    color: '#D4D4D8',
    fontSize: 12,
    fontWeight: '500'
  },
  subscribeBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});
