import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  Animated,
  Alert,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShieldCheck,
  Gem,
  Award,
  Cloud,
  UserPlus,
  Flame,
  Zap,
  BarChart2,
  CheckCircle,
  Trophy,
  BookOpen,
  Lock,
  ChevronRight,
  Crown,
  Target,
  Clock,
  Activity,
  ArrowUpRight,
  Palette,
  Check,
  Plus,
  X,
} from 'lucide-react-native';
import { PlayerStats, Achievement } from '../types/game';
import { sounds } from '../utils/sound';
import { haptics } from '../utils/haptics';

const C = {
  card: '#17181D',
  surface: '#121317',
  border: '#26272B',
  primary: '#7C5CFF',
  primaryHover: '#6e4ef5',
  accent: '#38BDF8',
  text: '#F4F4F5',
  text2: '#A1A1AA',
  muted: '#71717A',
  green: '#22C55E',
  amber: '#F59E0B',
  orange: '#F97316',
  red: '#EF4444',
  purple: '#A855F7',
  violetLight: '#A78BFA',
  canvas: '#0B0C10',
};

export interface AvatarItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  rarity: 'Başlangıç' | 'Nadir' | 'Epik' | 'Efsanevi';
}

export interface FrameItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  rarity: 'Başlangıç' | 'Nadir' | 'Epik' | 'Efsanevi';
  color: string;
  glow: string;
  pulse?: boolean;
}

export const AVATAR_CATALOG: AvatarItem[] = [
  { id: 'avatar-default', name: 'Klasik İnisiyal', emoji: 'KY', description: 'Klasik sade harf arması.', cost: 0, rarity: 'Başlangıç' },
  { id: 'avatar-wizard', name: 'Kelime Sihirbazı', emoji: '🧙‍♂️', description: 'Harflere büyü yapan kelime üstadı.', cost: 0, rarity: 'Başlangıç' },
  { id: 'avatar-scholar', name: 'Bilge Baykuş', emoji: '🦉', description: 'Gece gündüz sözlük tarayan arif.', cost: 0, rarity: 'Başlangıç' },
  { id: 'avatar-detective', name: 'Sözlük Dedektifi', emoji: '🕵️‍♂️', description: 'En gizli anagramları çözen iz sürücü.', cost: 50, rarity: 'Nadir' },
  { id: 'avatar-phoenix', name: 'Zümrüdüanka', emoji: '🦅', description: 'Küllerinden doğan seriler yaratan efsane.', cost: 75, rarity: 'Nadir' },
  { id: 'avatar-ninja', name: 'Sessiz Çözücü', emoji: '🥷', description: 'Sessizce tek denemede bitiren usta.', cost: 100, rarity: 'Epik' },
  { id: 'avatar-astronaut', name: 'Kozmik Gezgin', emoji: '🚀', description: 'Galaksiler ötesi kelime kaşifi.', cost: 120, rarity: 'Epik' },
  { id: 'avatar-crown', name: 'Sözcük Hükümdarı', emoji: '👑', description: 'Kelime krallığının tahtında oturan hükümdar.', cost: 150, rarity: 'Efsanevi' },
  { id: 'avatar-dragon', name: 'Ejderha Efendisi', emoji: '🐉', description: 'Kelimelerin ateşini kontrol eden kadim güç.', cost: 200, rarity: 'Efsanevi' },
];

export const FRAME_CATALOG: FrameItem[] = [
  { id: 'frame-default', name: 'Mor Klasik', description: 'Logos standart neon mor çerçevesi.', cost: 0, rarity: 'Başlangıç', color: '#7C5CFF', glow: 'rgba(124,92,255,0.3)' },
  { id: 'frame-emerald', name: 'Zümrüt Işıltısı', description: 'Doğru harflerin canlı yeşil ışıltısı.', cost: 50, rarity: 'Nadir', color: '#22C55E', glow: 'rgba(34,197,94,0.45)' },
  { id: 'frame-gold', name: 'Kraliyet Altını', description: 'Saf altın parıltısıyla bezenmiş görkemli çerçeve.', cost: 80, rarity: 'Nadir', color: '#F59E0B', glow: 'rgba(245,158,11,0.5)' },
  { id: 'frame-neon-cyan', name: 'Siber Elmas', description: 'Yüksek teknoloji parıltılı siber elmas çerçevesi.', cost: 120, rarity: 'Epik', color: '#38BDF8', glow: 'rgba(56,189,248,0.6)', pulse: true },
  { id: 'frame-obsidian-flame', name: 'Alevli Obsidiyen', description: 'Kırmızı magma ve obsidiyen parıltısı.', cost: 150, rarity: 'Epik', color: '#EF4444', glow: 'rgba(239,68,68,0.6)' },
  { id: 'frame-cosmic-purple', name: 'Kozmik Galaksi', description: 'Yıldız tozu ve mor nebula aurası.', cost: 180, rarity: 'Efsanevi', color: '#A855F7', glow: 'rgba(168,85,247,0.7)' },
];

const DEFAULT_PLAYER_NAME = 'Oyuncu';

const glowStyle = (frame: FrameItem): ViewStyle => ({
  borderColor: frame.color,
  shadowColor: frame.color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.7,
  shadowRadius: 8,
  elevation: 8,
});

const FramedAvatar: React.FC<{ frame: FrameItem; size: number; children: React.ReactNode }> = ({ frame, size, children }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!frame.pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.55, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [frame.pulse, pulse]);

  return (
    <Animated.View
      style={[
        styles.framedAvatar,
        { width: size, height: size, borderRadius: size / 2 },
        glowStyle(frame),
        frame.pulse ? { opacity: pulse } : null,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface ProfileScreenProps {
  stats: PlayerStats;
  onOpenStore?: () => void;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  displayName?: string;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ stats, onOpenStore, onUpdateStats, displayName }) => {
  const playerName = (displayName && displayName.trim()) || DEFAULT_PLAYER_NAME;
  const playerHandle = '@' + playerName.toLowerCase().replace(/[^a-z0-9]+/gi, '').slice(0, 16) || '@oyuncu';
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<'avatars' | 'frames'>('avatars');
  const [previewAvatarId, setPreviewAvatarId] = useState<string>(stats.selectedAvatar || 'avatar-default');
  const [previewFrameId, setPreviewFrameId] = useState<string>(stats.selectedFrame || 'frame-default');
  const [customizerToast, setCustomizerToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const achievements: Achievement[] = [
    { id: 'first-win', title: 'First Win', description: 'İlk kelime bulmacasını başarıyla çöz ve zaferle başla.', iconName: 'Trophy', badgeColor: '#22C55E', badgeBg: 'rgba(34, 197, 94, 0.15)', currentProgress: Math.min(1, stats.gamesWon), targetProgress: 1, unlocked: stats.gamesWon >= 1, rewardGems: 50 },
    { id: '10-day-streak', title: '10-Day Streak', description: 'Aralıksız 10 gün boyunca her gün en az 1 kelime çözerek seriyi koru.', iconName: 'Flame', badgeColor: '#F59E0B', badgeBg: 'rgba(245, 158, 11, 0.15)', currentProgress: Math.min(10, Math.max(stats.streak, stats.bestStreak)), targetProgress: 10, unlocked: Math.max(stats.streak, stats.bestStreak) >= 10, rewardGems: 150 },
    { id: 'word-master', title: 'Word Master', description: 'Toplam 100 kelimeyi başarıyla bilerek kelime ustalığı mertebesine eriş.', iconName: 'BookOpen', badgeColor: '#7C5CFF', badgeBg: 'rgba(124, 92, 255, 0.15)', currentProgress: Math.min(100, stats.gamesWon * 8 + stats.gamesPlayed), targetProgress: 100, unlocked: stats.gamesWon * 8 + stats.gamesPlayed >= 100, rewardGems: 300 },
    { id: 'lightning-speed', title: 'Işık Hızı', description: 'Herhangi bir 5 harfli kelimeyi 30 saniyenin altında hatasız çöz.', iconName: 'Zap', badgeColor: '#38BDF8', badgeBg: 'rgba(56, 189, 248, 0.15)', currentProgress: 1, targetProgress: 1, unlocked: true, rewardGems: 75 },
  ];

  const achIcon = (name: string, color: string, unlocked: boolean) => {
    const c = unlocked ? color : C.muted;
    if (name === 'Trophy') return <Trophy size={20} color={c} />;
    if (name === 'Flame') return <Flame size={20} color={c} />;
    if (name === 'BookOpen') return <BookOpen size={20} color={c} />;
    if (name === 'Zap') return <Zap size={20} color={c} />;
    return <Award size={20} color={c} />;
  };

  const distribution = stats.distribution || { 1: 4, 2: 18, 3: 84, 4: 68, 5: 42, 6: 22 };
  const maxVal = Math.max(...Object.values(distribution), 1);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const currentAvatarId = stats.selectedAvatar || 'avatar-default';
  const currentFrameId = stats.selectedFrame || 'frame-default';
  const unlockedAvatars = stats.unlockedAvatars || ['avatar-default', 'avatar-wizard', 'avatar-scholar'];
  const unlockedFrames = stats.unlockedFrames || ['frame-default'];

  const activeAvatar = AVATAR_CATALOG.find((a) => a.id === currentAvatarId) || AVATAR_CATALOG[0];
  const activeFrame = FRAME_CATALOG.find((f) => f.id === currentFrameId) || FRAME_CATALOG[0];
  const previewAvatar = AVATAR_CATALOG.find((a) => a.id === previewAvatarId) || activeAvatar;
  const previewFrame = FRAME_CATALOG.find((f) => f.id === previewFrameId) || activeFrame;

  const showToast = (message: string, type: 'success' | 'error') => {
    setCustomizerToast({ message, type });
    setTimeout(() => setCustomizerToast(null), 2500);
  };

  const openCustomizer = () => {
    sounds.playClick();
    setPreviewAvatarId(currentAvatarId);
    setPreviewFrameId(currentFrameId);
    setIsCustomizerOpen(true);
  };

  const handleEquipAvatar = (avatarId: string) => {
    sounds.playClick();
    onUpdateStats({ selectedAvatar: avatarId });
    showToast('Avatar başarıyla kuşandı!', 'success');
  };

  const handleEquipFrame = (frameId: string) => {
    sounds.playClick();
    onUpdateStats({ selectedFrame: frameId });
    showToast('Çerçeve başarıyla kuşandı!', 'success');
  };

  const handleBuyAvatar = (avatar: AvatarItem) => {
    if (stats.gems < avatar.cost) {
      sounds.playDelete();
      showToast(`Yetersiz elmas! ${avatar.cost} 💎 gerekiyor.`, 'error');
      return;
    }
    sounds.playGemEarned();
    haptics.gemReward();
    onUpdateStats({ gems: stats.gems - avatar.cost, unlockedAvatars: [...unlockedAvatars, avatar.id], selectedAvatar: avatar.id });
    showToast(`${avatar.name} satın alındı ve kuşandı!`, 'success');
  };

  const handleBuyFrame = (frame: FrameItem) => {
    if (stats.gems < frame.cost) {
      sounds.playDelete();
      showToast(`Yetersiz elmas! ${frame.cost} 💎 gerekiyor.`, 'error');
      return;
    }
    sounds.playGemEarned();
    haptics.gemReward();
    onUpdateStats({ gems: stats.gems - frame.cost, unlockedFrames: [...unlockedFrames, frame.id], selectedFrame: frame.id });
    showToast(`${frame.name} satın alındı ve kuşandı!`, 'success');
  };

  const quickTiles = [
    { icon: <Gem size={16} color={C.accent} />, bg: 'rgba(56,189,248,0.15)', title: `${stats.gems} Elmas`, sub: 'Elmaslarım', subColor: C.muted, onPress: () => { sounds.playClick(); onOpenStore?.(); } },
    { icon: <Award size={16} color={C.amber} />, bg: 'rgba(245,158,11,0.15)', title: 'Rozetler', sub: `${unlockedCount}/${achievements.length} Açık`, subColor: C.muted, onPress: () => sounds.playClick() },
    { icon: <Cloud size={16} color={C.primary} />, bg: 'rgba(124,92,255,0.15)', title: 'Bulut Senk.', sub: 'Tamamlandı', subColor: C.green, onPress: undefined },
    { icon: <UserPlus size={16} color={C.violetLight} />, bg: 'rgba(167,139,250,0.15)', title: 'Arkadaş Davet', sub: '+100 Elmas', subColor: C.accent, onPress: () => { sounds.playClick(); Alert.alert('Davet', 'Davet bağlantın kopyalandı: https://logos.app/ref/keremyilmaz'); } },
  ];

  const career = [
    { value: `${stats.gamesPlayed}`, color: C.text, label: 'Oynanan' },
    { value: `%${stats.winRate}`, color: C.green, label: 'Kazanma' },
    { value: `${stats.streak}`, color: C.text, label: 'Güncel Seri', flame: true },
    { value: `${stats.bestStreak}`, color: C.amber, label: 'En İyi Seri' },
    { value: `${stats.perfectGames ?? 0}`, color: C.primary, label: 'Kusursuz' },
    { value: `${stats.dailyChallengesCompleted ?? 0}`, color: C.text, label: 'Günlük' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Profile Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Pressable onPress={openCustomizer} style={styles.avatarWrap}>
            <FramedAvatar frame={activeFrame} size={56}>
              {activeAvatar.emoji === 'KY' ? (
                <Text style={styles.avatarInitials}>KY</Text>
              ) : (
                <Text style={styles.avatarEmoji}>{activeAvatar.emoji}</Text>
              )}
            </FramedAvatar>
            <View style={styles.paletteBadge}>
              <Palette size={12} color="#fff" />
            </View>
          </Pressable>

          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>{playerName}</Text>
              {stats.isPremium ? (
                <View style={styles.premiumPill}>
                  <Crown size={10} color={C.amber} fill={C.amber} />
                  <Text style={styles.premiumPillText}>PREMİUM</Text>
                </View>
              ) : (
                <Pressable onPress={() => { sounds.playClick(); onOpenStore?.(); }} style={styles.freePill}>
                  <Text style={styles.freePillText}>Ücretsiz Plan</Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.handle}>{playerHandle}</Text>
            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Text style={styles.chipPrimary}>Seviye {stats.level}</Text>
                <Text style={styles.chipMuted}>•</Text>
                <Text style={styles.chipPrimary}>{activeAvatar.name}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipMuted}>Çerçeve:</Text>
                <Text style={styles.chipWhite}>{activeFrame.name}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Market Banner */}
        <Pressable onPress={openCustomizer} style={styles.marketBanner}>
          <View style={styles.marketLeft}>
            <View style={styles.marketIcon}>
              <Palette size={16} color={C.violetLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.marketTitle}>Avatar &amp; Çerçeve Mağazası</Text>
              <Text style={styles.marketSub}>Elmaslar ile özel görünümler satın al ve kuşan</Text>
            </View>
          </View>
          <View style={styles.marketCta}>
            <Text style={styles.marketCtaText}>Mağaza</Text>
            <ChevronRight size={12} color={C.accent} />
          </View>
        </Pressable>

        <View style={styles.headerFooter}>
          <View style={styles.verified}>
            <ShieldCheck size={14} color={C.green} />
            <Text style={styles.verifiedText}>Doğrulanmış Kelime Ustası</Text>
          </View>
          <Text style={styles.footerMuted}>Katılım: Devam Ediyor</Text>
        </View>
      </View>

      {/* 2. Quick Action Tiles */}
      <View style={styles.quickGrid}>
        {quickTiles.map((t) => (
          <Pressable key={t.title} onPress={t.onPress} style={styles.quickTile}>
            <View style={[styles.quickIcon, { backgroundColor: t.bg }]}>{t.icon}</View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.quickTitle} numberOfLines={1}>{t.title}</Text>
              <Text style={[styles.quickSub, { color: t.subColor }]} numberOfLines={1}>{t.sub}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* 3. Achievements */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Award size={14} color={C.amber} />
            <Text style={styles.sectionLabel}>Başarımlar (Achievements)</Text>
          </View>
          <Text style={styles.sectionCount}>{unlockedCount} / {achievements.length} Rozet</Text>
        </View>

        {achievements.map((ach) => {
          const pct = Math.min(100, Math.round((ach.currentProgress / ach.targetProgress) * 100));
          return (
            <Pressable key={ach.id} onPress={() => { sounds.playClick(); setSelectedAchievement(ach); }} style={[styles.achCard, !ach.unlocked && { opacity: 0.8 }]}>
              <View style={[styles.achBadge, { backgroundColor: ach.unlocked ? ach.badgeBg : C.surface, borderColor: ach.unlocked ? `${ach.badgeColor}40` : C.border }]}>
                {achIcon(ach.iconName, ach.badgeColor, ach.unlocked)}
                {ach.unlocked ? (
                  <View style={[styles.achCorner, { backgroundColor: C.green }]}>
                    <CheckCircle size={10} color="#fff" />
                  </View>
                ) : (
                  <View style={[styles.achCorner, { backgroundColor: C.border }]}>
                    <Lock size={10} color={C.muted} />
                  </View>
                )}
              </View>

              <View style={styles.achInfo}>
                <View style={styles.achTopRow}>
                  <View style={styles.achTitleWrap}>
                    <Text style={styles.achTitle} numberOfLines={1}>{ach.title}</Text>
                    {ach.unlocked && (
                      <View style={[styles.achUnlockedTag, { backgroundColor: ach.badgeBg }]}>
                        <Text style={[styles.achUnlockedText, { color: ach.badgeColor }]}>AÇILDI</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.achReward}>
                    <Text style={styles.achRewardText}>+{ach.rewardGems}</Text>
                    <Gem size={12} color={C.accent} />
                  </View>
                </View>
                <Text style={styles.achDesc} numberOfLines={1}>{ach.description}</Text>
                <View style={styles.achProgressRow}>
                  <View style={styles.achTrack}>
                    <View style={[styles.achFill, { width: `${pct}%`, backgroundColor: ach.unlocked ? ach.badgeColor : C.muted }]} />
                  </View>
                  <Text style={styles.achProgressNum}>{ach.currentProgress}/{ach.targetProgress}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* 4. Career Stats Grid */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Kariyer İstatistikleri</Text>
          <Text style={styles.sectionAllTime}>Tüm Zamanlar</Text>
        </View>
        <View style={styles.careerGrid}>
          {career.map((c) => (
            <View key={c.label} style={styles.careerBox}>
              <View style={styles.careerValueRow}>
                {c.flame && <Flame size={14} color={C.amber} />}
                <Text style={[styles.careerValue, { color: c.color }]}>{c.value}</Text>
              </View>
              <Text style={styles.careerLabel}>{c.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 5. Guess Distribution Histogram */}
      <View style={styles.histCard}>
        <View style={styles.histHeader}>
          <View style={styles.sectionHeaderLeft}>
            <BarChart2 size={16} color={C.primary} />
            <Text style={styles.histTitle}>Tahmin Dağılımı</Text>
          </View>
          {/* En sık: X. Hak (mode) */}
          <Text style={styles.footerMuted}>
            En sık: 
            {(() => {
              if (!distribution || Object.keys(distribution).length === 0) return 'Veri yok';
              const entries = Object.entries(distribution).map(([k, v]) => ({ attempt: Number(k), count: v }));
              if (entries.length === 0) return 'Veri yok';
              const maxEntry = entries.reduce((a, b) => (a.count > b.count ? a : b));
              return `${maxEntry.attempt}. Hak`;
            })()}
          </Text>
        </View>
        {[1, 2, 3, 4, 5, 6].map((attempt) => {
          const count = distribution[attempt] || 0;
          const maxVal = Math.max(...Object.values(distribution).filter(v => v !== undefined), 0);
          const pct = maxVal > 0 ? Math.round((count / maxVal) * 100) : 0;
          return (
            <View key={attempt} style={styles.histRow}>
              <Text style={styles.histAttempt}>{attempt}</Text>
              <View style={styles.histTrack}>
                <View style={[styles.histFill, { width: `${Math.max(10, pct)}%`, backgroundColor: C.primary }]}>
                  <Text style={styles.histCount}>{count}</Text>
                </View>
              </View>
              <Text style={styles.histPct}>%{pct}</Text>
            </View>
          );
        })}
      </View>

      {/* 6. Detailed Performance Analytics (Premium gated) */}
      <View style={styles.analyticsCard}>
        <View style={styles.analyticsHeader}>
          <View style={styles.sectionHeaderLeft}>
            <LinearGradient colors={['rgba(124,92,255,0.2)', 'rgba(245,158,11,0.2)']} style={styles.brainTile}>
              <Activity size={16} color={C.amber} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <View style={styles.analyticsTitleRow}>
                <Text style={styles.analyticsTitle}>Detaylı Performans Analizi</Text>
                {stats.isPremium && <Crown size={14} color={C.amber} fill={C.amber} />}
              </View>
              <Text style={styles.analyticsSub}>Gelişmiş lingvistik ve oyun motoru metrikleri</Text>
            </View>
          </View>
          {stats.isPremium ? (
            <View style={styles.openPill}>
              <View style={styles.openDot} />
              <Text style={styles.openPillText}>AÇIK</Text>
            </View>
          ) : (
            <View style={styles.lockPill}>
              <Lock size={10} color={C.amber} />
              <Text style={styles.lockPillText}>PREMİUM</Text>
            </View>
          )}
        </View>

        {stats.isPremium ? (
          <PremiumAnalytics onOpenStore={onOpenStore} />
        ) : (
          <LockedAnalytics onOpenStore={onOpenStore} />
        )}
      </View>

      {/* Achievement Detail Modal */}
      <Modal visible={!!selectedAchievement} transparent animationType="fade" onRequestClose={() => setSelectedAchievement(null)}>
        <View style={styles.modalOverlayCenter}>
          {selectedAchievement && (
            <View style={styles.achModalCard}>
              <View style={[styles.achModalBadge, { backgroundColor: selectedAchievement.unlocked ? selectedAchievement.badgeBg : C.surface, borderColor: selectedAchievement.unlocked ? `${selectedAchievement.badgeColor}50` : C.border }]}>
                {achIcon(selectedAchievement.iconName, selectedAchievement.badgeColor, selectedAchievement.unlocked)}
              </View>
              <Text style={styles.achModalTitle}>{selectedAchievement.title}</Text>
              <View style={[styles.achModalTag, { backgroundColor: selectedAchievement.unlocked ? selectedAchievement.badgeBg : C.surface }]}>
                <Text style={[styles.achModalTagText, { color: selectedAchievement.unlocked ? selectedAchievement.badgeColor : C.muted }]}>
                  {selectedAchievement.unlocked ? 'KAZANILDI • ROZET AKTİF' : 'KİLİTLİ HEDEF'}
                </Text>
              </View>
              <Text style={styles.achModalDesc}>{selectedAchievement.description}</Text>
              <View style={styles.achModalReward}>
                <Text style={styles.footerMuted}>Rozet Ödülü:</Text>
                <View style={styles.achReward}>
                  <Text style={styles.achRewardText}>+{selectedAchievement.rewardGems} Elmas</Text>
                  <Gem size={14} color={C.accent} />
                </View>
              </View>
              <Pressable onPress={() => { sounds.playClick(); setSelectedAchievement(null); }} style={styles.achModalBtn}>
                <Text style={styles.achModalBtnText}>Kapat</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>

      {/* Avatar & Frame Customizer Modal */}
      <Modal visible={isCustomizerOpen} transparent animationType="fade" onRequestClose={() => setIsCustomizerOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.customizerCard}>
            {/* Header */}
            <View style={styles.customizerHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Palette size={16} color={C.primary} />
                <Text style={styles.customizerTitle}>Avatar &amp; Çerçeve Mağazası</Text>
              </View>
              <View style={styles.customizerHeaderRight}>
                <Pressable onPress={() => { sounds.playClick(); setIsCustomizerOpen(false); onOpenStore?.(); }} style={styles.balancePill}>
                  <Gem size={12} color={C.accent} fill={C.accent} />
                  <Text style={styles.balanceText}>{stats.gems}</Text>
                  <Plus size={10} color={C.accent} />
                </Pressable>
                <Pressable onPress={() => { sounds.playClick(); setIsCustomizerOpen(false); }} style={styles.closeBtn}>
                  <X size={14} color={C.muted} />
                </Pressable>
              </View>
            </View>

            {customizerToast && (
              <View style={[styles.toast, customizerToast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
                <Text style={[styles.toastText, { color: customizerToast.type === 'success' ? C.green : C.red }]}>{customizerToast.message}</Text>
              </View>
            )}

            {/* Preview */}
            <LinearGradient colors={[C.surface, C.card]} style={styles.previewBox}>
              <FramedAvatar frame={previewFrame} size={80}>
                {previewAvatar.emoji === 'KY' ? (
                  <Text style={styles.previewInitials}>KY</Text>
                ) : (
                  <Text style={styles.previewEmoji}>{previewAvatar.emoji}</Text>
                )}
              </FramedAvatar>
              <View style={styles.previewNames}>
                <Text style={styles.previewAvatarName}>{previewAvatar.name}</Text>
                <Text style={styles.chipMuted}>•</Text>
                <Text style={styles.previewFrameName}>{previewFrame.name}</Text>
              </View>
              <Text style={styles.previewHint}>Seçtiğiniz öğeyi aşağıdan inceleyin ve kuşanın</Text>
            </LinearGradient>

            {/* Tabs */}
            <View style={styles.tabsRow}>
              <Pressable onPress={() => { sounds.playClick(); setCustomizerTab('avatars'); }} style={[styles.tabBtn, customizerTab === 'avatars' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, customizerTab === 'avatars' && styles.tabTextActive]}>Avatarlar</Text>
                <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{AVATAR_CATALOG.length}</Text></View>
              </Pressable>
              <Pressable onPress={() => { sounds.playClick(); setCustomizerTab('frames'); }} style={[styles.tabBtn, customizerTab === 'frames' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, customizerTab === 'frames' && styles.tabTextActive]}>Profil Çerçeveleri</Text>
                <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{FRAME_CATALOG.length}</Text></View>
              </Pressable>
            </View>

            {/* Items */}
            <ScrollView style={styles.itemsScroll} contentContainerStyle={styles.itemsContent} showsVerticalScrollIndicator={false}>
              {customizerTab === 'avatars' ? (
                <View style={styles.avatarGrid}>
                  {AVATAR_CATALOG.map((item) => {
                    const isUnlocked = unlockedAvatars.includes(item.id);
                    const isEquipped = currentAvatarId === item.id;
                    const isPreviewed = previewAvatarId === item.id;
                    return (
                      <Pressable key={item.id} onPress={() => { sounds.playClick(); setPreviewAvatarId(item.id); }} style={[styles.itemCard, styles.itemCardAvatar, isPreviewed && styles.itemCardActive]}>
                        <View style={styles.itemEmojiCircle}>
                          {item.emoji === 'KY' ? <Text style={styles.itemInitials}>KY</Text> : <Text style={styles.itemEmoji}>{item.emoji}</Text>}
                        </View>
                        <View style={{ width: '100%' }}>
                          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                          <Text style={styles.itemRarity} numberOfLines={1}>{item.rarity}</Text>
                        </View>
                        {isEquipped ? (
                          <View style={styles.equippedPill}>
                            <Check size={10} color={C.green} />
                            <Text style={styles.equippedText}>Kuşanıldı</Text>
                          </View>
                        ) : isUnlocked ? (
                          <Pressable onPress={(e) => { e.stopPropagation?.(); handleEquipAvatar(item.id); }} style={styles.equipBtn}>
                            <Text style={styles.equipBtnText}>Kuşan</Text>
                          </Pressable>
                        ) : (
                          <Pressable onPress={(e) => { e.stopPropagation?.(); handleBuyAvatar(item); }} style={[styles.buyBtn, stats.gems >= item.cost ? styles.buyBtnActive : styles.buyBtnDisabled]}>
                            <Gem size={10} color={stats.gems >= item.cost ? C.accent : C.muted} fill={stats.gems >= item.cost ? C.accent : C.muted} />
                            <Text style={[styles.buyBtnText, { color: stats.gems >= item.cost ? C.accent : C.muted }]}>{item.cost}</Text>
                          </Pressable>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.frameGrid}>
                  {FRAME_CATALOG.map((item) => {
                    const isUnlocked = unlockedFrames.includes(item.id);
                    const isEquipped = currentFrameId === item.id;
                    const isPreviewed = previewFrameId === item.id;
                    return (
                      <Pressable key={item.id} onPress={() => { sounds.playClick(); setPreviewFrameId(item.id); }} style={[styles.itemCard, styles.itemCardFrame, isPreviewed && styles.itemCardActive]}>
                        <View style={[styles.frameMini, { borderColor: item.color, shadowColor: item.color }]}>
                          <Palette size={16} color={C.text2} />
                        </View>
                        <View style={{ width: '100%' }}>
                          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                          <Text style={styles.itemRarity} numberOfLines={1}>{item.rarity}</Text>
                        </View>
                        {isEquipped ? (
                          <View style={styles.equippedPill}>
                            <Check size={10} color={C.green} />
                            <Text style={styles.equippedText}>Kuşanıldı</Text>
                          </View>
                        ) : isUnlocked ? (
                          <Pressable onPress={(e) => { e.stopPropagation?.(); handleEquipFrame(item.id); }} style={styles.equipBtn}>
                            <Text style={styles.equipBtnText}>Kuşan</Text>
                          </Pressable>
                        ) : (
                          <Pressable onPress={(e) => { e.stopPropagation?.(); handleBuyFrame(item); }} style={[styles.buyBtn, stats.gems >= item.cost ? styles.buyBtnActive : styles.buyBtnDisabled]}>
                            <Gem size={12} color={stats.gems >= item.cost ? C.accent : C.muted} fill={stats.gems >= item.cost ? C.accent : C.muted} />
                            <Text style={[styles.buyBtnText, { color: stats.gems >= item.cost ? C.accent : C.muted }]}>{item.cost} 💎</Text>
                          </Pressable>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            <View style={styles.customizerFooter}>
              <Pressable onPress={() => { sounds.playClick(); setIsCustomizerOpen(false); }} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>Tamam</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const PremiumAnalytics: React.FC<{ onOpenStore?: () => void }> = ({ onOpenStore }) => (
  <View style={styles.premiumBody}>
    <View style={styles.advGrid}>
      <AdvStat icon={<Clock size={12} color={C.accent} />} label="Ort. Çözüm Hızı" badge="+%14" badgeColor={C.green} value="32.4" suffix="saniye" valueColor="#fff" foot="Rekor: 11.8s (5 Harfli)" footColor={C.accent} />
      <AdvStat icon={<Target size={12} color={C.green} />} label="1. Tahmin İsabeti" badge="Yüksek" badgeColor={C.green} value="%44.8" valueColor={C.green} foot="İlk denemede doğru harf" />
      <AdvStat icon={<BookOpen size={12} color={C.primary} />} label="Kelime Dağarcığı" badge="Elit %5" badgeColor={C.primary} value="94" suffix="/ 100" valueColor={C.primary} foot="112 farklı eşsiz kelime" />
      <AdvStat icon={<Activity size={12} color={C.amber} />} label="Seri Kararlılığı" badge="Kararlı" badgeColor={C.amber} value="%68" valueColor={C.amber} foot="Son 20 oyunun dengesi" />
    </View>

    <View style={styles.catCard}>
      <View style={styles.catHeader}>
        <Text style={styles.catTitle}>Kategori Hakimiyet Dağılımı</Text>
        <Text style={styles.footerMuted}>Doğruluk %</Text>
      </View>
      <CatBar label="🏙️ Şehirler" pct={90} color={C.green} />
      <CatBar label="🍕 Yiyecekler" pct={85} color={C.accent} />
      <CatBar label="✨ Karışık" pct={82} color={C.primary} />
      <CatBar label="🐾 Hayvanlar" pct={78} color={C.amber} />
    </View>

    <View style={styles.insightGrid}>
      <View style={styles.insightBox}>
        <Text style={styles.insightLabel}>İpucu Bağımlılığı</Text>
        <Text style={[styles.insightValue, { color: C.green }]}>Düşük (%18)</Text>
        <Text style={styles.insightFoot}>Organik kelime çözücü</Text>
      </View>
      <View style={styles.insightBox}>
        <Text style={styles.insightLabel}>Zirve Odaklanma</Text>
        <Text style={[styles.insightValue, { color: C.accent }]}>21:00 - 23:00</Text>
        <Text style={styles.insightFoot}>En yüksek kazanma saati</Text>
      </View>
    </View>

    <Pressable onPress={() => { sounds.playClick(); onOpenStore?.(); }} style={styles.manageBtn}>
      <Crown size={14} color={C.amber} fill={C.amber} />
      <Text style={styles.manageBtnText}>Premium Ayrıcalıklarını &amp; Günlük Elmasları Yönet</Text>
    </Pressable>
  </View>
);

const AdvStat: React.FC<{ icon: React.ReactNode; label: string; badge: string; badgeColor: string; value: string; suffix?: string; valueColor: string; foot: string; footColor?: string }> = ({ icon, label, badge, badgeColor, value, suffix, valueColor, foot, footColor }) => (
  <View style={styles.advCard}>
    <View style={styles.advTop}>
      <View style={styles.sectionHeaderLeft}>{icon}<Text style={styles.advLabel}>{label}</Text></View>
      <View style={styles.sectionHeaderLeft}>
        {badge.startsWith('+') && <ArrowUpRight size={10} color={badgeColor} />}
        <Text style={[styles.advBadge, { color: badgeColor }]}>{badge}</Text>
      </View>
    </View>
    <View style={styles.advValueRow}>
      <Text style={[styles.advValue, { color: valueColor }]}>{value}</Text>
      {suffix && <Text style={styles.advSuffix}>{suffix}</Text>}
    </View>
    <Text style={[styles.advFoot, footColor ? { color: footColor } : null]}>{foot}</Text>
  </View>
);

const CatBar: React.FC<{ label: string; pct: number; color: string }> = ({ label, pct, color }) => (
  <View style={styles.catRow}>
    <View style={styles.catRowTop}>
      <Text style={styles.catLabel}>{label}</Text>
      <Text style={[styles.catPct, { color }]}>%{pct}</Text>
    </View>
    <View style={styles.catTrack}>
      <View style={[styles.catFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const LockedAnalytics: React.FC<{ onOpenStore?: () => void }> = ({ onOpenStore }) => (
  <View style={styles.lockedWrap}>
    <View style={styles.lockedPreview} pointerEvents="none">
      <View style={styles.advGrid}>
        <View style={styles.advCard}><Text style={styles.advLabel}>Ort. Çözüm Hızı</Text><Text style={styles.lockedValue}>32.4 sn</Text></View>
        <View style={styles.advCard}><Text style={styles.advLabel}>1. Tahmin İsabeti</Text><Text style={[styles.lockedValue, { color: C.green }]}>%44.8</Text></View>
      </View>
    </View>
    <View style={styles.lockOverlay}>
      <View style={styles.lockCrown}>
        <Crown size={20} color={C.amber} fill="rgba(245,158,11,0.3)" />
      </View>
      <Text style={styles.lockTitle}>Gelişmiş Performans Analitiği Kilitli</Text>
      <Text style={styles.lockDesc}>Ortalama hız, ilk harf doğruluğu, lingvistik dağarcık endeksi ve kategori dağılımlarını görmek için Premium'a geç.</Text>
      <Pressable onPress={() => { sounds.playClick(); onOpenStore?.(); }}>
        <LinearGradient colors={[C.amber, C.orange, C.amber]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.premiumCta}>
          <Crown size={14} color="#000" fill="#000" />
          <Text style={styles.premiumCtaText}>Premium ile Analizi Aç (₺49,99/ay)</Text>
        </LinearGradient>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, gap: 12 },
  headerCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 16, gap: 12 },
  headerTop: { flexDirection: 'row', gap: 14 },
  avatarWrap: { position: 'relative' },
  framedAvatar: { backgroundColor: C.surface, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 1 },
  avatarEmoji: { fontSize: 26 },
  paletteBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: C.primary, borderRadius: 999, padding: 4, borderWidth: 2, borderColor: C.card },
  headerInfo: { flex: 1, minWidth: 0, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  userName: { fontSize: 16, fontWeight: '700', color: C.text },
  premiumPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(245,158,11,0.2)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  premiumPillText: { color: C.amber, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  freePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  freePillText: { color: C.muted, fontSize: 10, fontWeight: '600' },
  handle: { fontSize: 12, color: C.muted },
  chipsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  chipPrimary: { fontSize: 10, fontWeight: '600', color: C.primary },
  chipWhite: { fontSize: 10, fontWeight: '600', color: '#fff' },
  chipMuted: { fontSize: 10, color: C.muted },
  marketBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(124,92,255,0.3)' },
  marketLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  marketIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(124,92,255,0.15)', borderWidth: 1, borderColor: 'rgba(124,92,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  marketTitle: { fontSize: 12, fontWeight: '700', color: C.text },
  marketSub: { fontSize: 10, color: C.text2 },
  marketCta: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(56,189,248,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  marketCtaText: { fontSize: 11, fontWeight: '700', color: C.accent },
  headerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, marginTop: 2 },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 11, color: C.green },
  footerMuted: { fontSize: 11, color: C.muted },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickTile: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  quickIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { fontSize: 12, fontWeight: '700', color: C.text },
  quickSub: { fontSize: 10 },
  sectionWrap: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionCount: { fontSize: 11, fontWeight: '600', color: C.primary },
  sectionAllTime: { fontSize: 11, color: C.primary },
  achCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  achBadge: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  achCorner: { position: 'absolute', bottom: -4, right: -4, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  achInfo: { flex: 1, minWidth: 0, gap: 2 },
  achTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  achTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  achTitle: { fontSize: 12, fontWeight: '700', color: C.text },
  achUnlockedTag: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999 },
  achUnlockedText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  achReward: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  achRewardText: { fontSize: 11, fontWeight: '600', color: C.accent },
  achDesc: { fontSize: 11, color: C.muted },
  achProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  achTrack: { flex: 1, height: 6, backgroundColor: C.surface, borderRadius: 999, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(38,39,43,0.6)' },
  achFill: { height: '100%', borderRadius: 999 },
  achProgressNum: { fontSize: 10, fontWeight: '600', color: C.text2 },
  careerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  careerBox: { flexBasis: '30%', flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 6, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  careerValueRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  careerValue: { fontSize: 16, fontWeight: '700' },
  careerLabel: { fontSize: 10, color: C.muted, marginTop: 2 },
  histCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 14, gap: 6 },
  histHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  histTitle: { fontSize: 12, fontWeight: '700', color: C.text, textTransform: 'uppercase', letterSpacing: 0.6 },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  histAttempt: { width: 12, textAlign: 'center', fontSize: 11, fontWeight: '700', color: C.muted },
  histTrack: { flex: 1, height: 20, borderRadius: 6, backgroundColor: C.surface, overflow: 'hidden', padding: 2, justifyContent: 'center' },
  histFill: { height: '100%', borderRadius: 4, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 8 },
  histCount: { fontSize: 10, fontWeight: '700' },
  histPct: { width: 30, textAlign: 'right', fontSize: 10, color: C.muted },
  analyticsCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 16, gap: 12, overflow: 'hidden' },
  analyticsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brainTile: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)', alignItems: 'center', justifyContent: 'center' },
  analyticsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  analyticsTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  analyticsSub: { fontSize: 10, color: C.muted },
  openPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  openPillText: { fontSize: 10, fontWeight: '700', color: C.green },
  lockPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  lockPillText: { fontSize: 10, fontWeight: '700', color: C.amber },
  premiumBody: { gap: 12 },
  advGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  advCard: { flexBasis: '47%', flexGrow: 1, padding: 12, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, gap: 4 },
  advTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  advLabel: { fontSize: 10, color: C.muted },
  advBadge: { fontSize: 9, fontWeight: '700' },
  advValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  advValue: { fontSize: 18, fontWeight: '900' },
  advSuffix: { fontSize: 12, color: C.muted },
  advFoot: { fontSize: 9, color: C.text2 },
  catCard: { padding: 12, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, gap: 8 },
  catHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catTitle: { fontSize: 12, fontWeight: '600', color: C.text },
  catRow: { gap: 3 },
  catRowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  catLabel: { fontSize: 10, color: C.text2 },
  catPct: { fontSize: 10, fontWeight: '700' },
  catTrack: { height: 6, width: '100%', backgroundColor: C.card, borderRadius: 999, overflow: 'hidden' },
  catFill: { height: '100%', borderRadius: 999 },
  insightGrid: { flexDirection: 'row', gap: 8 },
  insightBox: { flex: 1, padding: 10, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  insightLabel: { fontSize: 10, color: C.muted },
  insightValue: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  insightFoot: { fontSize: 9, color: C.text2, marginTop: 2 },
  manageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 36, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  manageBtnText: { fontSize: 11, fontWeight: '600', color: C.amber },
  lockedWrap: { position: 'relative', paddingTop: 4, minHeight: 150 },
  lockedPreview: { opacity: 0.4 },
  lockedValue: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 4 },
  lockOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 12 },
  lockCrown: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(245,158,11,0.2)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.5)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  lockTitle: { fontSize: 12, fontWeight: '700', color: C.text },
  lockDesc: { fontSize: 10, color: C.text2, textAlign: 'center', maxWidth: 260, marginTop: 2 },
  premiumCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 16, height: 36, borderRadius: 12 },
  premiumCtaText: { color: '#000', fontWeight: '900', fontSize: 11 },
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  achModalCard: { width: '100%', maxWidth: 320, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 20, alignItems: 'center' },
  achModalBadge: { width: 64, height: 64, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  achModalTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  achModalTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginTop: 4 },
  achModalTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  achModalDesc: { fontSize: 12, color: C.text2, textAlign: 'center', marginTop: 10, lineHeight: 18 },
  achModalReward: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 16, padding: 10, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  achModalBtn: { width: '100%', height: 40, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  achModalBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(11,12,16,0.85)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  customizerCard: { width: '100%', maxWidth: 370, maxHeight: '88%', borderRadius: 24, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  customizerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: 'rgba(18,19,23,0.8)' },
  customizerTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  customizerHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balancePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(56,189,248,0.15)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  balanceText: { fontSize: 12, fontWeight: '700', color: C.accent },
  closeBtn: { width: 28, height: 28, borderRadius: 999, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  toast: { paddingVertical: 6, paddingHorizontal: 12, borderBottomWidth: 1 },
  toastSuccess: { backgroundColor: 'rgba(34,197,94,0.15)', borderBottomColor: 'rgba(34,197,94,0.4)' },
  toastError: { backgroundColor: 'rgba(239,68,68,0.15)', borderBottomColor: 'rgba(239,68,68,0.4)' },
  toastText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  previewBox: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: C.border },
  previewInitials: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  previewEmoji: { fontSize: 36 },
  previewNames: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  previewAvatarName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  previewFrameName: { fontSize: 12, fontWeight: '600', color: C.violetLight },
  previewHint: { fontSize: 10, color: C.muted, marginTop: 2 },
  tabsRow: { flexDirection: 'row', gap: 6, padding: 8, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: 'rgba(18,19,23,0.4)' },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 6, borderRadius: 10 },
  tabBtnActive: { backgroundColor: C.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: C.muted },
  tabTextActive: { color: '#fff' },
  tabBadge: { paddingHorizontal: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)' },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  itemsScroll: { maxHeight: 320 },
  itemsContent: { padding: 12 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  frameGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  itemCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 10, alignItems: 'center', gap: 6 },
  itemCardAvatar: { flexBasis: '30%', flexGrow: 1 },
  itemCardFrame: { flexBasis: '47%', flexGrow: 1 },
  itemCardActive: { backgroundColor: 'rgba(124,92,255,0.15)', borderColor: C.primary },
  itemEmojiCircle: { width: 48, height: 48, borderRadius: 999, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  itemInitials: { fontSize: 14, fontWeight: '700', color: '#fff' },
  itemEmoji: { fontSize: 22 },
  itemName: { fontSize: 11, fontWeight: '700', color: '#fff', textAlign: 'center' },
  itemRarity: { fontSize: 9, color: C.muted, textAlign: 'center' },
  equippedPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, width: '100%', paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(34,197,94,0.2)' },
  equippedText: { fontSize: 10, fontWeight: '800', color: C.green },
  equipBtn: { width: '100%', paddingVertical: 4, borderRadius: 8, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  equipBtnText: { fontSize: 10, fontWeight: '700', color: C.text },
  buyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, width: '100%', paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  buyBtnActive: { backgroundColor: 'rgba(56,189,248,0.2)', borderColor: 'rgba(56,189,248,0.4)' },
  buyBtnDisabled: { backgroundColor: C.border, borderColor: C.border },
  buyBtnText: { fontSize: 10, fontWeight: '700' },
  frameMini: { width: 48, height: 48, borderRadius: 999, backgroundColor: C.card, borderWidth: 2, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6 },
  customizerFooter: { padding: 12, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: 'rgba(18,19,23,0.8)' },
  doneBtn: { height: 40, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
