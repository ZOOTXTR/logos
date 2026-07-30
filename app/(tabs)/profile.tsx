import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, StatusBar, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { getStats, getUnlockedAchievements, getScores, FullStats, ScoreEntry } from '../../services/storage.service';
import { ACHIEVEMENTS } from '../../constants/achievements';
import { LevelBar } from '../../components/LevelBar';
import { StoreModal } from '../../components/StoreModal';
import { useProgress } from '../../hooks/useProgress';
import { useTheme } from '../../hooks/useTheme';
import { TRANSLATIONS } from '../../constants/translations';
import { StickerAlbumModal } from '../../components/StickerAlbumModal';
import { CloudSyncModal } from '../../components/CloudSyncModal';
import { audioService } from '../../services/audio.service';
import { LoadingView } from '../../components/LoadingView';
import { InviteModal } from '../../components/InviteModal';
import { ProfileStatsCard } from '../../components/ProfileStatsCard';
import { ProfileAchievementList } from '../../components/ProfileAchievementList';

import { GuessDistributionChart } from '../../components/GuessDistributionChart';
import { TimeHistoryChart } from '../../components/TimeHistoryChart';

export default function ProfileScreen() {
  const progress = useProgress();
  const { theme, language } = useTheme();
  const t = TRANSLATIONS[language];
  const [stats, setStats] = useState<FullStats | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [showStore, setShowStore] = useState(false);
  const [showAlbum, setShowAlbum] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    Promise.all([getStats(), getUnlockedAchievements(), getScores()]).then(([s, ua, sc]) => {
      setStats(s);
      setUnlockedIds(ua);
      setScores(sc);
    });
  }, []);

  if (progress.loading) {
    return <LoadingView />;
  }

  const winRate = stats && stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const unlockedCount = unlockedIds.length;
  const totalAchievements = ACHIEVEMENTS.length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Profil Başlık */}
          <LinearGradient
            colors={progress.premium ? ['#F59E0B', '#D97706'] : [theme.colors.primary, theme.colors.primaryDark]}
            style={styles.profileCard}
          >
            <Text style={styles.avatar}>{progress.premium ? '👑' : '🎮'}</Text>
            <Text style={styles.username}>
              {language === 'en' ? 'Logos Player' : 'Logos Oyuncusu'}
            </Text>
            {progress.premium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>✨ {t.premiumMember}</Text>
              </View>
            )}
          </LinearGradient>

          {/* Level Bar */}
          {progress.levelInfo && (
            <View style={styles.section}>
              <LevelBar xp={progress.xp} levelInfo={progress.levelInfo} />
            </View>
          )}          {/* Çıkartma Albümü */}
          <TouchableOpacity 
            style={[styles.albumCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.primaryLight }]} 
            onPress={() => {
              audioService.triggerHaptic('light');
              setShowAlbum(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.albumEmoji}>🎫</Text>
            <View style={styles.albumTextContainer}>
              <Text style={[styles.albumTitle, { color: theme.colors.text }]}>
                {language === 'en' ? 'Sticker Album' : 'Çıkartma Albümü'}
              </Text>
              <Text style={[styles.albumDesc, { color: theme.colors.textSecondary }]}>
                {language === 'en' ? 'Collect unique stickers and earn gems!' : 'Eşsiz çıkartmaları biriktir, gem kazan!'}
              </Text>
            </View>
            <Text style={[styles.albumArrow, { color: theme.colors.primaryLight }]}>›</Text>
          </TouchableOpacity>

          {/* Bulut Yedekleme Portal Kartı */}
          <TouchableOpacity 
            style={[styles.albumCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.primaryLight }]} 
            onPress={() => {
              audioService.triggerHaptic('light');
              setShowSync(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.albumEmoji}>☁️</Text>
            <View style={styles.albumTextContainer}>
              <Text style={[styles.albumTitle, { color: theme.colors.text }]}>
                {language === 'en' ? 'Cloud Backup Portal' : 'Bulut Yedekleme Portalı'}
              </Text>
              <Text style={[styles.albumDesc, { color: theme.colors.textSecondary }]}>
                {language === 'en' ? 'Link your account and sync your progress.' : 'Hesabını bağla ve ilerlemeni yedekle.'}
              </Text>
            </View>
            <Text style={[styles.albumArrow, { color: theme.colors.primaryLight }]}>›</Text>
          </TouchableOpacity>
          {/* Gem Kartı */}
          <TouchableOpacity style={[styles.gemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.gem }]} onPress={() => setShowStore(true)}>
            <Text style={[styles.gemValue, { color: theme.colors.gem }]}>💎 {progress.gems}</Text>
            <Text style={[styles.gemLabel, { color: theme.colors.textSecondary }]}>{t.gemBalance}</Text>
            <View style={[styles.gemBtn, { backgroundColor: theme.colors.gem }]}>
              <Text style={styles.gemBtnText}>{language === 'en' ? '+ Buy' : '+ Satın Al'}</Text>
            </View>
          </TouchableOpacity>

          {/* Invite Friends */}
          <TouchableOpacity
            style={[styles.albumCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.primaryLight }]}
            onPress={() => {
              audioService.triggerHaptic('light');
              setShowInvite(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.albumEmoji}>🎉</Text>
            <View style={styles.albumTextContainer}>
              <Text style={[styles.albumTitle, { color: theme.colors.text }]}>
                {language === 'en' ? 'Invite Friends' : 'Arkadaş Davet Et'}
              </Text>
              <Text style={[styles.albumDesc, { color: theme.colors.textSecondary }]}>
                {language === 'en' ? 'Invite friends and earn 50 💎 each!' : 'Arkadaşlarını davet et, her biri için 50 💎 kazan!'}
              </Text>
            </View>
            <Text style={[styles.albumArrow, { color: theme.colors.primaryLight }]}>›</Text>
          </TouchableOpacity>

          {/* İstatistikler */}
          {stats && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 {t.statsHeader}</Text>
              <View style={styles.statsGrid}>
                <ProfileStatsCard emoji="🎮" value={stats.gamesPlayed} label={language === 'en' ? 'Games' : 'Oyun'} theme={theme} />
                <ProfileStatsCard emoji="🏆" value={stats.gamesWon} label={language === 'en' ? 'Wins' : 'Kazanma'} theme={theme} />
                <ProfileStatsCard emoji="📈" value={`${winRate}%`} label={language === 'en' ? 'Rate' : 'Oran'} theme={theme} />
                <ProfileStatsCard emoji="🔥" value={progress.streak.max} label={language === 'en' ? 'Max Streak' : 'Mak. Seri'} theme={theme} />
                <ProfileStatsCard emoji="⚡" value={stats.speedModeWins} label="Speed" theme={theme} />
                <ProfileStatsCard emoji="🎯" value={stats.perfectGames} label={language === 'en' ? 'Perfect' : 'Mükemmel'} theme={theme} />
              </View>
            </View>
          )}

          {stats && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 {language === 'en' ? 'Performance Charts' : 'Performans Grafikleri'}</Text>
              
              <View style={[styles.chartCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.chartTitle, { color: theme.colors.textSecondary }]}>
                  📊 {language === 'en' ? 'Guess Distribution' : 'Tahmin Dağılımı'}
                </Text>
                <GuessDistributionChart distribution={stats.guessDistribution} theme={theme} />
              </View>

              <View style={[styles.chartCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: SPACING.md }]}>
                <Text style={[styles.chartTitle, { color: theme.colors.textSecondary }]}>
                  ⚡ {language === 'en' ? 'Solve Speed History' : 'Hız/Süre Gelişimi (Son 6 Oyun)'}
                </Text>
                <TimeHistoryChart scores={scores} theme={theme} language={language} />
              </View>
            </View>
          )}

          {/* Başarımlar */}
          <View style={styles.section}>
            <View style={styles.achievHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🏅 {t.achievementsHeader}</Text>
              <Text style={[styles.achievCount, { color: theme.colors.accent }]}>{unlockedCount}/{totalAchievements}</Text>
            </View>
            <ProfileAchievementList achievements={ACHIEVEMENTS} unlockedIds={unlockedIds} theme={theme} language={language} />
          </View>

          {/* Premium */}
          {!progress.premium && (
            <TouchableOpacity style={styles.premiumPromo} onPress={() => setShowStore(true)}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.premiumGrad}>
                <Text style={styles.promoTitle}>👑 {t.upgradePremium}</Text>
                <Text style={styles.promoDesc}>{t.premiumPromo}</Text>
                <Text style={styles.promoPrice}>{t.pricePromo}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </LinearGradient>

      <StoreModal
        visible={showStore}
        onClose={() => setShowStore(false)}
        gems={progress.gems}
        isPremium={progress.premium}
        onPurchase={async (_, g) => { await progress.addGems(g); }}
        onPurchasePremium={progress.unlockPremium}
        unlockedCategories={progress.unlockedCategories}
        onUnlockCategory={async (cat) => {
          const spent = await progress.spendGems(100);
          if (spent) {
            await progress.unlockCategory(cat);
            return true;
          }
          return false;
        }}
      />
      <StickerAlbumModal
        visible={showAlbum}
        onClose={() => setShowAlbum(false)}
        gems={progress.gems}
        onSpendGems={progress.spendGems}
      />
      <CloudSyncModal
        visible={showSync}
        onClose={() => setShowSync(false)}
      />
      <InviteModal visible={showInvite} onClose={() => setShowInvite(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: SPACING.md },
  profileCard: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl,
    alignItems: 'center', marginVertical: SPACING.md,
  },
  avatar: { fontSize: 64, marginBottom: SPACING.sm },
  username: { fontSize: FONTS.size.xl, fontWeight: '800' },
  premiumBadge: {
    marginTop: SPACING.sm, backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: SPACING.md, paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  premiumText: { color: COLORS.text, fontWeight: '800', fontSize: FONTS.size.sm, letterSpacing: 1 },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.size.md, fontWeight: '700', marginBottom: SPACING.sm },
  gemCard: {
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg,
    borderWidth: 2, gap: SPACING.xs,
  },
  gemValue: { fontSize: FONTS.size.xxxl, fontWeight: '900' },
  gemLabel: { fontSize: FONTS.size.sm },
  gemBtn: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full, marginTop: SPACING.xs,
  },
  gemBtnText: { color: '#000', fontWeight: '800', fontSize: FONTS.size.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },

  achievHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  achievCount: { fontWeight: '800', fontSize: FONTS.size.sm },

  premiumPromo: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.lg },
  premiumGrad: { padding: SPACING.lg },
  promoTitle: { fontSize: FONTS.size.xl, fontWeight: '800', color: '#000' },
  promoDesc: { color: '#1A1A1A', fontSize: FONTS.size.sm, marginVertical: SPACING.xs },
  promoPrice: { fontWeight: '800', color: '#000', fontSize: FONTS.size.md },
  chartCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: FONTS.size.xs,
    fontWeight: '800',
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  albumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  albumEmoji: {
    fontSize: 32,
  },
  albumTextContainer: {
    flex: 1,
  },
  albumTitle: {
    fontSize: FONTS.size.md,
    fontWeight: '800',
  },
  albumDesc: {
    fontSize: FONTS.size.xs,
    marginTop: 2,
    lineHeight: 14,
  },
  albumArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
});
