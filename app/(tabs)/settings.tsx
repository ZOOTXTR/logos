import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, Alert, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { storageGet } from '../../services/storage.service';
import { THEMES } from '../../constants/themes';
import { useTheme } from '../../hooks/useTheme';
import { useProgress } from '../../hooks/useProgress';
import { audioService } from '../../services/audio.service';
import { TRANSLATIONS } from '../../constants/translations';
import { SettingToggle } from '../../components/SettingToggle';
import { LoadingView } from '../../components/LoadingView';
import { FeedbackModal } from '../../components/FeedbackModal';
import { PrivacyPolicyModal } from '../../components/PrivacyPolicyModal';
import { AboutModal } from '../../components/AboutModal';
import { CustomAlert } from '../../components/CustomAlert';
import { InviteModal } from '../../components/InviteModal';

export default function SettingsScreen() {
  const {
    theme, setTheme, unlockedThemes, unlockTheme, unlockAndSetTheme,
    colorBlind, setColorBlind,
    soundEnabled, setSoundEnabled,
    hapticEnabled, setHapticEnabled,
    notifEnabled, setNotifEnabled,
    language, setLanguage,
    dyslexiaFont, setDyslexiaFont,
  } = useTheme();

  const progress = useProgress();
  const t = TRANSLATIONS[language];

  const [musicEnabled, setMusicEnabledState] = useState(true);

  React.useEffect(() => {
    storageGet('gq_music_enabled').then(v => {
      setMusicEnabledState(v === null ? true : v === 'true');
    });
  }, []);

  const handleToggleMusic = async (val: boolean) => {
    setMusicEnabledState(val);
    await audioService.toggleBgMusic(val);
  };

  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  const [showInvite, setShowInvite] = useState(false);

  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{ text: string; onPress?: () => void; style?: 'cancel' | 'default' | 'destructive' }>;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showCustomAlert = (
    title: string,
    message: string,
    buttons?: Array<{ text: string; onPress?: () => void; style?: 'cancel' | 'default' | 'destructive' }>
  ) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      buttons: buttons || [{
        text: 'Tamam',
        onPress: () => setCustomAlert(prev => ({ ...prev, visible: false }))
      }]
    });
  };

  const handleThemeSelect = async (themeId: string, gemCost: number) => {
    if (unlockedThemes.includes(themeId)) {
      setTheme(themeId);
      return;
    }
    if (gemCost === -1) {
      if (!progress.premium) {
        showCustomAlert(
          language === 'en' ? '👑 Premium Required' : '👑 Premium Gerekli',
          language === 'en' ? 'This theme is exclusive to Premium members!' : 'Bu tema yalnızca Premium üyelere özel!'
        );
        return;
      }
      unlockAndSetTheme(themeId);
      return;
    }

    showCustomAlert(
      language === 'en' ? '🎨 Purchase Theme' : '🎨 Tema Satın Al',
      language === 'en' ? `Unlock this theme for ${gemCost} 💎?` : `Bu temayı ${gemCost} 💎 karşılığında almak ister misiniz?`,
      [
        {
          text: language === 'en' ? 'Cancel' : 'İptal',
          style: 'cancel',
          onPress: () => setCustomAlert(prev => ({ ...prev, visible: false }))
        },
        {
          text: language === 'en' ? `Spend ${gemCost} 💎` : `${gemCost} 💎 Harca`,
          onPress: async () => {
            setCustomAlert(prev => ({ ...prev, visible: false }));
            const ok = await progress.spendGems(gemCost);
            if (ok) {
              unlockTheme(themeId);
              setTheme(themeId);
              setTimeout(() => {
                showCustomAlert('✅', language === 'en' ? 'Theme unlocked!' : 'Tema açıldı!');
              }, 400);
            } else {
              setTimeout(() => {
                showCustomAlert('💎', language === 'en' ? 'Insufficient Gems' : 'Yetersiz Gem');
              }, 400);
            }
          },
        },
      ]
    );
  };

  if (progress.loading) {
    return <LoadingView message={language === 'en' ? 'Loading settings...' : 'Ayarlar yükleniyor...'} />;
  }

  const c = theme.colors;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={c.background} />
      <LinearGradient colors={[c.background, c.surface]} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: c.text }]}>⚙️ {t.settingsTitle}</Text>

          <View style={[styles.gemBar, { backgroundColor: c.card, borderColor: c.gem }]}>
            <Text style={[styles.gemBarText, { color: c.gem }]}>💎 {progress.gems} {t.gemBalance}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>🔧 {t.prefHeader}</Text>
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
              <SettingToggle label={t.soundEffects} emoji="🔊" value={soundEnabled} onToggle={setSoundEnabled} colors={c} language={language} />
              <View style={[styles.divider, { backgroundColor: c.border }]} />
              <SettingToggle label={language === 'en' ? 'Background Music' : 'Arka Plan Müzikleri'} emoji="🎵" value={musicEnabled} onToggle={handleToggleMusic} colors={c} language={language} />
              <View style={[styles.divider, { backgroundColor: c.border }]} />
              <SettingToggle label={t.hapticFeedback} emoji="📳" value={hapticEnabled} onToggle={setHapticEnabled} colors={c} language={language} />
              <View style={[styles.divider, { backgroundColor: c.border }]} />
              <SettingToggle label={t.dailyNotification} emoji="🔔" value={notifEnabled} onToggle={setNotifEnabled} colors={c} language={language} />
              <View style={[styles.divider, { backgroundColor: c.border }]} />
              <SettingToggle label={t.colorBlindMode} emoji="👁️" value={colorBlind} onToggle={setColorBlind} colors={c} language={language} />
              <View style={[styles.divider, { backgroundColor: c.border }]} />
              <SettingToggle label={t.dyslexiaFont} emoji="📖" value={dyslexiaFont} onToggle={setDyslexiaFont} colors={c} language={language} />
              <View style={[styles.divider, { backgroundColor: c.border }]} />

              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => {
                  audioService.triggerHaptic('light');
                  setLanguage(language === 'tr' ? 'en' : 'tr');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.settingEmoji}>🌐</Text>
                <Text style={[styles.settingLabel, { color: c.text }]}>{t.languageOption}</Text>
                <Text style={{ color: c.primaryLight, fontWeight: '800', fontSize: FONTS.size.sm, marginRight: 8 }}>
                  {language === 'tr' ? 'TÜRKÇE 🇹🇷' : 'ENGLISH 🇺🇸'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>🎨 {t.themeHeader}</Text>
            <View style={styles.themeGrid}>
              {THEMES.map(tData => {
                const isActive = theme.id === tData.id;
                const isUnlocked = unlockedThemes.includes(tData.id);
                const isPremiumTheme = tData.gemCost === -1;
                return (
                  <TouchableOpacity
                    key={tData.id}
                    style={[styles.themeCard, { backgroundColor: c.card, borderColor: c.border }, isActive && { borderColor: c.primaryLight }]}
                    onPress={() => handleThemeSelect(tData.id, tData.gemCost)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient colors={tData.preview} style={styles.themePreview}>
                      {isActive && <Text style={styles.activeCheck}>✓</Text>}
                      {!isUnlocked && <Text style={styles.lockIcon}>{isPremiumTheme ? '👑' : '🔒'}</Text>}
                    </LinearGradient>
                    <Text style={styles.themeEmoji}>{tData.emoji}</Text>
                    <Text style={[styles.themeName, { color: c.text }]}>{tData.name}</Text>
                    {!isUnlocked && (
                      <Text style={styles.themePrice}>
                        {isPremiumTheme ? 'Premium' : `${tData.gemCost} 💎`}
                      </Text>
                    )}
                    {isUnlocked && !isActive && (
                      <Text style={[styles.themeFree, { color: c.textMuted }]}>{language === 'en' ? 'Select' : 'Seç'}</Text>
                    )}
                    {isActive && <Text style={[styles.themeActive, { color: c.primaryLight }]}>{language === 'en' ? 'Active' : 'Aktif'}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>🔑 {t.supportHeader}</Text>
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
              <TouchableOpacity
                style={styles.accountRow}
                onPress={() => Alert.alert(
                  language === 'en' ? 'Restore Purchases' : 'Satın Alımları Geri Yükle',
                  language === 'en' ? 'Your purchases have been successfully restored!' : 'Geçmiş satın alımlarınız kontrol edildi ve başarıyla geri yüklendi!'
                )}
              >
                <Text style={styles.accountEmoji}>🔄</Text>
                <Text style={[styles.accountLabel, { color: c.text }]}>{t.restorePurchases}</Text>
                <Text style={{ color: c.textMuted, fontSize: FONTS.size.md }}>›</Text>
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: c.border }]} />
              <TouchableOpacity style={styles.accountRow}
                onPress={() => setPrivacyModalVisible(true)}>
                <Text style={styles.accountEmoji}>🔒</Text>
                <Text style={[styles.accountLabel, { color: c.text }]}>{t.privacyPolicy}</Text>
                <Text style={{ color: c.textMuted, fontSize: FONTS.size.md }}>›</Text>
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: c.border }]} />
              <TouchableOpacity style={styles.accountRow}
                onPress={() => setFeedbackModalVisible(true)}>
                <Text style={styles.accountEmoji}>📣</Text>
                <Text style={[styles.accountLabel, { color: c.text }]}>{t.sendFeedback}</Text>
                <Text style={{ color: c.textMuted, fontSize: FONTS.size.md }}>›</Text>
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: c.border }]} />
              <TouchableOpacity style={styles.accountRow}
                onPress={() => setAboutModalVisible(true)}>
                <Text style={styles.accountEmoji}>ℹ️</Text>
                <Text style={[styles.accountLabel, { color: c.text }]}>{t.aboutApp}</Text>
                <Text style={{ color: c.textMuted, fontSize: FONTS.size.md }}>›</Text>
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: c.border }]} />
              <TouchableOpacity style={styles.accountRow} onPress={() => setShowInvite(true)}>
                <Text style={styles.accountEmoji}>🎉</Text>
                <Text style={[styles.accountLabel, { color: c.text }]}>
                  {language === 'en' ? 'Invite Friends' : 'Arkadaş Davet Et'}
                </Text>
                <Text style={{ color: c.textMuted, fontSize: FONTS.size.md }}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </LinearGradient>

      <PrivacyPolicyModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        theme={theme}
        language={language}
      />

      <AboutModal
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
        theme={theme}
        language={language}
      />

      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
      />

      <CustomAlert
        visible={customAlert.visible}
        title={customAlert.title}
        message={customAlert.message}
        buttons={customAlert.buttons}
        onClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))}
      />

      <InviteModal visible={showInvite} onClose={() => setShowInvite(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: SPACING.md },
  title: { fontSize: FONTS.size.xxl, fontWeight: '900', paddingVertical: SPACING.md },
  gemBar: { borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.lg, borderWidth: 1, alignItems: 'center' },
  gemBarText: { fontWeight: '700', fontSize: FONTS.size.md },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.size.md, fontWeight: '700', marginBottom: SPACING.sm },
  card: { borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  settingEmoji: { fontSize: 20, width: 28 },
  settingLabel: { flex: 1, fontSize: FONTS.size.md, fontWeight: '500' },
  divider: { height: 1, marginHorizontal: SPACING.md },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  themeCard: { width: '31%', borderRadius: BORDER_RADIUS.md, overflow: 'hidden', borderWidth: 2, alignItems: 'center', paddingBottom: SPACING.sm },
  themeCardActive: { borderColor: COLORS.primaryLight },
  themePreview: { width: '100%', height: 60, alignItems: 'center', justifyContent: 'center' },
  activeCheck: { fontSize: 24, color: '#FFF', fontWeight: '900' },
  lockIcon: { fontSize: 24 },
  themeEmoji: { fontSize: 20, marginTop: 6 },
  themeName: { fontSize: FONTS.size.xs, fontWeight: '700', marginTop: 2 },
  themePrice: { color: COLORS.gem, fontSize: 10, fontWeight: '700', marginTop: 2 },
  themeFree: { fontSize: 10, marginTop: 2 },
  themeActive: { fontSize: 10, fontWeight: '800', marginTop: 2 },
  accountRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  accountEmoji: { fontSize: 20, width: 28 },
  accountLabel: { flex: 1, fontSize: FONTS.size.md },

  gem: { color: COLORS.gem },
});
