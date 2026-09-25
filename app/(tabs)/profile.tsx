import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/CustomText';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { getStats, getUnlockedAchievements, getScores, FullStats, ScoreEntry, storageGet } from '../../services/storage.service';
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

import { AuraBackground } from '../../components/design/AuraBackground';
import { WidgetCard } from '../../components/design/WidgetCard';

export default function ProfileScreen() {
  const progress = useProgress();
  const { theme, language } = useTheme();
  const t = TRANSLATIONS[language];
  const [stats, setStats] = useState<FullStats | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showStore, setShowStore] = useState(false);
  const [showAlbum, setShowAlbum] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    Promise.all([
      getStats(),
      getUnlockedAchievements(),
      getScores(),
      storageGet('gq_user_email'),
      storageGet('gq_user_photo'),
      storageGet('gq_user_name'),
    ]).then(([s, ua, sc, email, photo, name]) => {
      setStats(s);
      setUnlockedIds(ua);
      setScores(sc);
      setUserEmail(email);
      setUserPhoto(photo);
      setUserName(name);
    });
  }, []);

  useEffect(() => {
    if (!showSync) {
      storageGet('gq_user_email').then(setUserEmail);
      storageGet('gq_user_photo').then(setUserPhoto);
      storageGet('gq_user_name').then(setUserName);
    }
  }, [showSync]);

  if (progress.loading || !stats) {
    return <LoadingView message={language === 'en' ? 'Loading Profile...' : 'Profil Yükleniyor...'} />;
  }

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const unlockedCount = unlockedIds.length;
  const totalAchievements = ACHIEVEMENTS.length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.id === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.colors.background} />
      <AuraBackground theme={theme} />
      
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Profil Başlık */}
          <WidgetCard theme={theme} variant="glass" style={{ marginVertical: SPACING.xl, paddingVertical: SPACING.lg, alignItems: 'center' }}>
            <View style={[styles.avatarContainer, { borderColor: progress.premium ? '#F59E0B' : theme.colors.primary }]}>
              {userPhoto ? (
                <Image source={{ uri: userPhoto }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={progress.premium ? ['#F59E0B', '#D97706'] : [theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarEmoji}>{progress.premium ? '👑' : '🎮'}</Text>
                </LinearGradient>
              )}
              {progress.premium && (
                <View style={styles.premiumIconBadge}>
                  <Text style={styles.premiumIconText}>✨</Text>
                </View>
              )}
            </View>

            <Text style={[styles.usernameText, { color: theme.colors.text }]}>
              {userName || (language === 'en' ? 'Player' : 'Oyuncu')}
            </Text>
            {userEmail && (
              <View style={[styles.emailBadge, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface + '80' }]}>
                <Text style={[styles.emailText, { color: theme.colors.textSecondary }]}>{userEmail}</Text>
              </View>
            )}

            {progress.premium && (
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM</Text>
              </LinearGradient>
            )}
          </WidgetCard>

          {/* Level Bar (Bento stil) */}
          {progress.levelInfo && (
            <WidgetCard theme={theme} variant="glass" style={{ marginBottom: SPACING.lg }}>
              <LevelBar xp={progress.xp} levelInfo={progress.levelInfo} />
            </WidgetCard>
          )}

          {/* Aksiyon Buttonları (4lü Bento Grid) */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg }}>
            <WidgetCard span={1} theme={theme} variant="glass" onPress={() => setShowStore(true)} style={{ flex: 1, minWidth: '45%', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>💎</Text>
              <Text style={{ color: theme.colors.text, fontSize: FONTS.size.sm, fontWeight: '800' }}>{progress.gems} Gem</Text>
              <Text style={{ color: theme.colors.accent, fontSize: FONTS.size.xs, fontWeight: '700', marginTop: 4 }}>+ Al</Text>
            </WidgetCard>

            <WidgetCard span={1} theme={theme} variant="glass" onPress={() => setShowAlbum(true)} style={{ flex: 1, minWidth: '45%', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🎫</Text>
              <Text style={{ color: theme.colors.text, fontSize: FONTS.size.sm, fontWeight: '800' }}>{language === 'en' ? 'Album' : 'Albüm'}</Text>
            </WidgetCard>

            <WidgetCard span={1} theme={theme} variant="glass" onPress={() => setShowSync(true)} style={{ flex: 1, minWidth: '45%', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>☁️</Text>
              <Text style={{ color: theme.colors.text, fontSize: FONTS.size.sm, fontWeight: '800' }}>{language === 'en' ? 'Cloud Sync' : 'Bulut'}</Text>
            </WidgetCard>

            <WidgetCard span={1} theme={theme} variant="glass" onPress={() => setShowInvite(true)} style={{ flex: 1, minWidth: '45%', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🎉</Text>
              <Text style={{ color: theme.colors.text, fontSize: FONTS.size.sm, fontWeight: '800' }}>{language === 'en' ? 'Invite' : 'Davet'}</Text>
            </WidgetCard>
          </View>

          {stats && (
            <WidgetCard theme={theme} variant="glass" style={{ marginBottom: SPACING.lg }}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 {language === 'en' ? 'Stats' : 'İstatistikler'}</Text>
              <View style={styles.statsGrid}>
                <ProfileStatsCard emoji="🎮" value={stats.gamesPlayed} label={language === 'en' ? 'Played' : 'Oynanan'} theme={theme} />
                <ProfileStatsCard emoji="🏆" value={stats.gamesWon} label={language === 'en' ? 'Wins' : 'Kazanma'} theme={theme} />
                <ProfileStatsCard emoji="📈" value={`${winRate}%`} label={language === 'en' ? 'Rate' : 'Oran'} theme={theme} />
                <ProfileStatsCard emoji="🔥" value={progress.streak.max} label={language === 'en' ? 'Max Streak' : 'Mak. Seri'} theme={theme} />
                <ProfileStatsCard emoji="⚡" value={stats.speedModeWins} label={language === 'en' ? 'Speed' : 'Hızlı'} theme={theme} />
                <ProfileStatsCard emoji="🎯" value={stats.perfectGames} label={language === 'en' ? 'Perfect' : 'Mükemmel'} theme={theme} />
              </View>
            </WidgetCard>
          )}

          {stats && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 {language === 'en' ? 'Performance Charts' : 'Performans Grafikleri'}</Text>
              
              <WidgetCard theme={theme} variant="glass" style={{ padding: SPACING.md }}>
                <Text style={[styles.chartTitle, { color: theme.colors.textSecondary }]}>
                  📊 {language === 'en' ? 'Guess Distribution' : 'Tahmin Dağılımı'}
                </Text>
                <GuessDistributionChart distribution={stats.guessDistribution || {}} theme={theme} language={language} />
              </WidgetCard>

              <WidgetCard theme={theme} variant="glass" style={{ padding: SPACING.md, marginTop: SPACING.md }}>
                <Text style={[styles.chartTitle, { color: theme.colors.textSecondary }]}>
                  ⚡ {language === 'en' ? 'Solve Speed History' : 'Hız/Süre Gelişimi'}
                </Text>
                <TimeHistoryChart scores={scores || []} theme={theme} language={language} />
              </WidgetCard>
            </View>
          )}

          {/* Başarımlar */}
          <WidgetCard theme={theme} variant="glass" style={{ marginBottom: SPACING.lg }}>
            <View style={styles.achievHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>🏅 {t.achievementsHeader}</Text>
              <Text style={[styles.achievCount, { color: theme.colors.accent }]}>{unlockedCount}/{totalAchievements}</Text>
            </View>
            <ProfileAchievementList achievements={ACHIEVEMENTS} unlockedIds={unlockedIds} theme={theme} language={language} />
          </WidgetCard>

          {/* Premium */}
          {!progress.premium && (
            <WidgetCard theme={theme} variant="primary" onPress={() => setShowStore(true)} style={{ padding: 0, overflow: 'hidden', marginBottom: SPACING.lg }}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.premiumGrad}>
                <Text style={styles.promoTitle}>👑 {t.upgradePremium}</Text>
                <Text style={styles.promoDesc}>{t.premiumPromo}</Text>
                <Text style={styles.promoPrice}>{t.pricePromo}</Text>
              </LinearGradient>
            </WidgetCard>
          )}

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </View>

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
  container: { flex: 1, paddingHorizontal: SPACING.md, maxWidth: 600, alignSelf: 'center', width: '100%' },
  profileHeaderContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    padding: 2,
    marginBottom: SPACING.md,
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    flex: 1,
    borderRadius: 50,
    width: '100%',
    height: '100%',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  premiumIconBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#000',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  premiumIconText: {
    fontSize: 14,
  },
  usernameText: {
    fontSize: FONTS.size.xxl,
    fontWeight: '900',
    marginBottom: SPACING.xs,
  },
  emailBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  emailText: {
    fontSize: FONTS.size.sm,
    fontWeight: '600',
  },
  premiumBadge: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: FONTS.size.xs,
    letterSpacing: 1.5,
  },
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
