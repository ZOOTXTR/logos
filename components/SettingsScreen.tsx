import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Volume2,
  Volume1,
  VolumeX,
  Vibrate,
  Eye,
  Globe,
  Shield,
  Sparkles,
  Gem,
  ArrowUpCircle,
  XCircle,
  Sliders,
  MessageSquare,
  Bug,
  Lightbulb,
  Send,
  Trash2,
  Clock,
  CheckCircle2,
  BookOpen,
  Palette,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { ThemeSelector } from './ThemeSelector';
import { sounds } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { audioService } from '../services/audio.service';
import { cloudService } from '../services/cloud.service';
import { deleteAccount } from '../services/firebase';
import { storageGet, storageGetJSON, storageSet, storageSetJSON, storageRemove } from '../services/storage.service';

const C = {
  card: '#17181D',
  surface: '#121317',
  border: '#26272B',
  primary: '#7C5CFF',
  accent: '#38BDF8',
  amber: '#F59E0B',
  green: '#22C55E',
  red: '#EF4444',
  violetLight: '#A78BFA',
  text: '#F4F4F5',
  text2: '#A1A1AA',
  muted: '#71717A',
};

const FEEDBACK_DRAFT_KEY = 'gq_feedback_draft_v1';
type FeedbackType = 'bug' | 'feature' | 'suggestion';

interface Draft { type?: FeedbackType; subject?: string; message?: string; email?: string; savedAt?: string }

const VolumeSlider: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const width = useRef(1);
  const setFromX = (x: number) => onChange(Math.max(0, Math.min(100, Math.round((x / width.current) * 100 / 5) * 5)));
  return (
    <View style={styles.sliderTrack} onLayout={(e) => { width.current = Math.max(1, e.nativeEvent.layout.width); }}>
      <View style={[styles.sliderFill, { width: `${value}%` }]} />
      <View style={[styles.sliderThumb, { left: `${value}%` }]} />
      <Pressable style={StyleSheet.absoluteFill} onPress={(e) => setFromX(e.nativeEvent.locationX)} onTouchMove={(e) => setFromX(e.nativeEvent.locationX)} />
    </View>
  );
};

export const SettingsScreen: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
  const [volume, setVolume] = useState(Math.round(sounds.volume * 100));
  const [vibrationEnabled, setVibrationEnabled] = useState(haptics.enabled);
  const [hardMode, setHardMode] = useState(false);
  const [activeTestSound, setActiveTestSound] = useState<string | null>(null);

  useEffect(() => {
    storageGet('gq_hard_mode').then((v) => setHardMode(v === 'true')).catch(() => {});
  }, []);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    storageGetJSON<Draft>(FEEDBACK_DRAFT_KEY).then((parsed) => {
      if (!parsed) return;
      if (parsed.type) setFeedbackType(parsed.type);
      if (parsed.subject) setFeedbackSubject(parsed.subject);
      if (parsed.message) setFeedbackMessage(parsed.message);
      if (parsed.email) setFeedbackEmail(parsed.email);
      if (parsed.savedAt) setDraftSavedTime(parsed.savedAt);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (feedbackSubmitted) return;
    if (!feedbackSubject.trim() && !feedbackMessage.trim() && !feedbackEmail.trim()) return;
    const timer = setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      storageSetJSON(FEEDBACK_DRAFT_KEY, { type: feedbackType, subject: feedbackSubject, message: feedbackMessage, email: feedbackEmail, savedAt: timeStr });
      setDraftSavedTime(timeStr);
    }, 400);
    return () => clearTimeout(timer);
  }, [feedbackType, feedbackSubject, feedbackMessage, feedbackEmail, feedbackSubmitted]);

  const handleDiscardDraft = () => {
    sounds.playDelete();
    setFeedbackSubject(''); setFeedbackMessage(''); setFeedbackEmail(''); setDraftSavedTime(null);
    storageRemove(FEEDBACK_DRAFT_KEY);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) return;
    const full = feedbackSubject.trim() ? `${feedbackSubject.trim()}: ${feedbackMessage.trim()}` : feedbackMessage.trim();
    const ok = await cloudService.submitFeedback(feedbackEmail.trim(), full, 5);
    if (!ok) return;
    sounds.playGemEarned(); haptics.winGame();
    setFeedbackSubmitted(true);
    storageRemove(FEEDBACK_DRAFT_KEY);
    setDraftSavedTime(null);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    audioService.setSoundEnabled(next); // oyun içi sesle senkronla
    if (next) sounds.playClick();
  };

  const handleVolumeChange = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, v));
    setVolume(clamped);
    sounds.setVolume(clamped / 100);
    audioService.setVolume(clamped / 100); // oyun içi sesle senkronla
    if (clamped > 0 && !soundEnabled) { setSoundEnabled(true); sounds.setEnabled(true); audioService.setSoundEnabled(true); }
    sounds.playKey();
  }, [soundEnabled]);

  const handleTestSound = (type: 'incorrect' | 'hint' | 'gem' | 'level', fn: () => void) => {
    setActiveTestSound(type);
    fn();
    setTimeout(() => setActiveTestSound(null), 600);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Hesabı Sil', 'Tüm kayıtlı oyun verileriniz ve elmaslarınız silinecektir. Onaylıyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        const ok = await deleteAccount();
        if (ok) Alert.alert('Hesap Silindi', 'Oturum başarıyla sıfırlandı.');
        else Alert.alert('Hata', 'Hesap silinemedi. Lütfen tekrar deneyin.');
      } },
    ]);
  };

  const soundTest = [
    { id: 'incorrect', icon: <XCircle size={16} color={C.red} />, title: 'Yanlış Kelime', sub: 'Düşük Dissonant', color: C.red, fn: () => sounds.playIncorrect() },
    { id: 'hint', icon: <Sparkles size={16} color={C.primary} />, title: 'İpucu Kullanımı', sub: 'Büyülü Arpej', color: C.primary, fn: () => sounds.playHint() },
    { id: 'gem', icon: <Gem size={16} color={C.accent} />, title: 'Elmas Kazanımı', sub: 'Kristal Kaskad', color: C.accent, fn: () => sounds.playGemEarned() },
    { id: 'level', icon: <ArrowUpCircle size={16} color={C.amber} />, title: 'Seviye Atlama', sub: 'Kraliyet Fanfarı', color: C.amber, fn: () => sounds.playLevelUp() },
  ];

  const feedbackTypes = [
    { id: 'bug' as const, icon: <Bug size={14} color={feedbackType === 'bug' ? '#fff' : C.muted} />, label: 'Hata Bildir', activeBg: C.red, activeText: '#fff' },
    { id: 'feature' as const, icon: <Lightbulb size={14} color={feedbackType === 'feature' ? '#000' : C.muted} />, label: 'Özellik İste', activeBg: C.amber, activeText: '#000' },
    { id: 'suggestion' as const, icon: <BookOpen size={14} color={feedbackType === 'suggestion' ? '#fff' : C.muted} />, label: 'Öneri / Kelime', activeBg: C.primary, activeText: '#fff' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Ayarlar</Text>
        <Text style={styles.subtitle}>Oyun tercihleri, ses seviyesi ve kişiselleştirme.</Text>
      </View>

      {/* 1. Tema */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Palette size={14} color={C.primary} />
          <Text style={styles.sectionTitle}>Tema ve Renk Paleti</Text>
        </View>
        <ThemeSelector />
      </View>

      {/* 2. Ses ve Efektler */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Ses ve Efektler</Text>
          <Text style={styles.sectionValue}>{soundEnabled ? `%${volume}` : 'Sessiz'}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(124,92,255,0.15)', borderColor: 'rgba(124,92,255,0.3)' }]}>
                {!soundEnabled || volume === 0 ? <VolumeX size={16} color={C.muted} /> : volume < 50 ? <Volume1 size={16} color={C.primary} /> : <Volume2 size={16} color={C.primary} />}
              </View>
              <View>
                <Text style={styles.rowLabel}>Ana Ses Anahtarı</Text>
                <Text style={styles.rowSub}>{soundEnabled ? 'Oyun sesleri ve ipuçları açık' : 'Tüm ses efektleri kapalı'}</Text>
              </View>
            </View>
            <Switch value={soundEnabled} onChange={handleToggleSound} />
          </View>

          <View style={styles.divider} />

          <View style={[styles.volumeBlock]}>
            <View style={styles.volumeHeader}>
              <View style={styles.rowLeft}>
                <Sliders size={14} color={C.accent} />
                <Text style={styles.rowLabel}>Genel Oyun Ses Seviyesi</Text>
              </View>
              <View style={styles.volBadge}><Text style={styles.volBadgeText}>%{volume}</Text></View>
            </View>
            <VolumeSlider value={soundEnabled ? volume : 0} onChange={handleVolumeChange} />
            <View style={styles.presetRow}>
              {[{ l: 'Sessiz', v: 0 }, { l: '%30', v: 30 }, { l: '%70', v: 70 }, { l: '%100', v: 100 }].map((p) => {
                const sel = soundEnabled && volume === p.v;
                return (
                  <Pressable key={p.l} onPress={() => handleVolumeChange(p.v)} style={[styles.presetBtn, sel && styles.presetBtnActive]}>
                    <Text style={[styles.presetText, sel && { color: C.violetLight }]}>{p.l}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Vibrate size={16} color={C.accent} />
              <View>
                <Text style={styles.rowLabel}>Titreşim (Haptik)</Text>
                <Text style={styles.rowSub}>Dokunsal geri bildirim</Text>
              </View>
            </View>
            <Switch value={vibrationEnabled} onChange={() => { const v = !vibrationEnabled; setVibrationEnabled(v); haptics.setEnabled(v); audioService.setHapticEnabled(v); sounds.playClick(); }} />
          </View>
        </View>
      </View>

      {/* 3. Ses Kütüphanesi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ses Kütüphanesi &amp; Önizleme</Text>
        <View style={[styles.card, { padding: 12, gap: 10 }]}>
          <Text style={styles.libDesc}>Oyundaki 4 özel sentezlenmiş ses ipucunu anında dinleyin:</Text>
          <View style={styles.libGrid}>
            {soundTest.map((s) => {
              const active = activeTestSound === s.id;
              return (
                <Pressable key={s.id} onPress={() => handleTestSound(s.id as 'incorrect' | 'hint' | 'gem' | 'level', s.fn)} style={[styles.libBtn, { backgroundColor: active ? `${s.color}33` : C.surface, borderColor: active ? s.color : C.border }]}>
                  <View style={styles.libBtnLeft}>
                    {s.icon}
                    <View style={{ minWidth: 0 }}>
                      <Text style={styles.libBtnTitle} numberOfLines={1}>{s.title}</Text>
                      <Text style={styles.libBtnSub} numberOfLines={1}>{s.sub}</Text>
                    </View>
                  </View>
                  <Text style={[styles.libPlay, { color: s.color }]}>▶</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* 4. Oynanış */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Oynanış</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Eye size={16} color={C.amber} />
              <View>
                <Text style={styles.rowLabel}>Zor Mod</Text>
                <Text style={styles.rowSub}>Açılan ipucu harfleri sonraki tahminde zorunlu</Text>
              </View>
            </View>
            <Switch value={hardMode} onChange={() => { const v = !hardMode; setHardMode(v); storageSet('gq_hard_mode', v ? 'true' : 'false').catch(() => {}); sounds.playClick(); }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Globe size={16} color={C.green} />
              <View>
                <Text style={styles.rowLabel}>Kelime Dağarcığı</Text>
                <Text style={styles.rowSub}>Türkçe Sözlük (TDK Uyumlu)</Text>
              </View>
            </View>
            <View style={styles.pill}><Text style={styles.pillText}>Türkçe</Text></View>
          </View>
        </View>
      </View>

      {/* 5. Yardım ve Geri Bildirim */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yardım ve Geri Bildirim</Text>
        <View style={styles.card}>
          <Pressable onPress={() => { sounds.playClick(); setIsHelpOpen(!isHelpOpen); }} style={styles.accordionHeader}>
            <View style={styles.accordionLeft}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(124,92,255,0.15)', borderColor: 'rgba(124,92,255,0.3)' }]}>
                <MessageSquare size={16} color={C.primary} />
              </View>
              <View>
                <Text style={styles.accordionTitle}>Nasıl Oynanır?</Text>
                <Text style={styles.accordionSub}>Kurallar, renk kodları ve ipuçları</Text>
              </View>
            </View>
            {isHelpOpen ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
          </Pressable>
          {isHelpOpen && (
            <View style={styles.helpContent}>
              <Text style={styles.helpText}>Logos&apos;ta amaç gizli Türkçe kelimeyi 6 denemede bulmaktır. Her tahmin geçerli bir kelime olmalıdır.</Text>
              {[{ c: C.green, l: 'A', t: 'Yeşil', d: 'Harf kelimede var ve yeri doğru.' }, { c: C.amber, l: 'K', t: 'Sarı', d: 'Harf kelimede var fakat yeri yanlış.' }, { c: C.border, l: 'Z', t: 'Gri', d: 'Harf gizli kelimede yer almıyor.' }].map((r) => (
                <View key={r.l} style={styles.ruleItem}>
                  <View style={[styles.colorSquare, { backgroundColor: r.c }]}><Text style={[styles.colorSquareText, { color: r.c === C.border ? '#fff' : '#000' }]}>{r.l}</Text></View>
                  <Text style={styles.ruleText}><Text style={{ color: r.c === C.border ? C.muted : r.c, fontWeight: '700' }}>{r.t}</Text>: {r.d}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          <View style={[styles.card, { borderWidth: 0, padding: 14, gap: 12 }]}>
            <View style={styles.fbHeader}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(56,189,248,0.15)', borderColor: 'rgba(56,189,248,0.3)' }]}>
                  <MessageSquare size={16} color={C.accent} />
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.rowLabel}>Geri Bildirim &amp; Hata Bildirimi</Text>
                  <Text style={styles.rowSub}>Taslaklar otomatik kaydedilir</Text>
                </View>
              </View>
              {draftSavedTime && !feedbackSubmitted && (
                <View style={styles.draftBadge}><Clock size={10} color={C.accent} /><Text style={styles.draftBadgeText}>Taslak {draftSavedTime}</Text></View>
              )}
            </View>

            {feedbackSubmitted ? (
              <View style={styles.fbSuccess}>
                <View style={styles.fbSuccessIcon}><CheckCircle2 size={24} color={C.green} /></View>
                <Text style={styles.fbSuccessTitle}>Geri Bildiriminiz Alındı!</Text>
                <Text style={styles.fbSuccessSub}>Logos&apos;u geliştirmemize yardımcı olduğunuz için teşekkürler.</Text>
                <Pressable onPress={() => { sounds.playClick(); setFeedbackSubmitted(false); setFeedbackSubject(''); setFeedbackMessage(''); setFeedbackEmail(''); }} style={styles.fbNewBtn}>
                  <Text style={styles.fbNewBtnText}>Yeni Bir Bildirim Gönder</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <View style={styles.fbTypeRow}>
                  {feedbackTypes.map((t) => {
                    const active = feedbackType === t.id;
                    return (
                      <Pressable key={t.id} onPress={() => { sounds.playClick(); setFeedbackType(t.id); }} style={[styles.fbTypeBtn, active && { backgroundColor: t.activeBg }]}>
                        {t.icon}
                        <Text style={[styles.fbTypeText, active && { color: t.activeText }]}>{t.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <TextInput
                  value={feedbackSubject}
                  onChangeText={setFeedbackSubject}
                  placeholder={feedbackType === 'bug' ? 'Örn: Klavyede İ harfi bazen takılıyor...' : feedbackType === 'feature' ? 'Örn: Arkadaşlarla özel oda kurabilme...' : 'Örn: Sözlüğe eklenebilecek yeni kelime önerisi...'}
                  placeholderTextColor="#52525B"
                  style={styles.input}
                />

                <View style={{ gap: 4 }}>
                  <View style={styles.msgHeader}>
                    <Text style={styles.fieldLabel}>AÇIKLAMA / MESAJ <Text style={{ color: C.red }}>*</Text></Text>
                    <Text style={styles.charCount}>{feedbackMessage.length}/500</Text>
                  </View>
                  <TextInput
                    value={feedbackMessage}
                    onChangeText={(v) => setFeedbackMessage(v.slice(0, 500))}
                    placeholder={feedbackType === 'bug' ? 'Karşılaştığınız sorunu, cihazınızı ve nasıl oluştuğunu açıklayınız...' : 'Görmek istediğiniz fikri ve oyuna nasıl katkı sağlayacağını anlatınız...'}
                    placeholderTextColor="#52525B"
                    multiline
                    numberOfLines={3}
                    style={[styles.input, styles.textArea]}
                  />
                </View>

                <TextInput
                  value={feedbackEmail}
                  onChangeText={setFeedbackEmail}
                  placeholder="adiniz@example.com"
                  placeholderTextColor="#52525B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />

                <View style={styles.fbActions}>
                  {(feedbackSubject || feedbackMessage || feedbackEmail) ? (
                    <Pressable onPress={handleDiscardDraft} style={styles.discardBtn}>
                      <Trash2 size={14} color={C.muted} />
                      <Text style={styles.discardBtnText}>Taslağı Temizle</Text>
                    </Pressable>
                  ) : <View />}
                  <Pressable disabled={!feedbackMessage.trim()} onPress={handleSubmitFeedback} style={[styles.sendBtn, !feedbackMessage.trim() && styles.sendBtnDisabled]}>
                    <Send size={14} color={feedbackMessage.trim() ? '#fff' : C.muted} />
                    <Text style={[styles.sendBtnText, !feedbackMessage.trim() && { color: C.muted }]}>Gönder</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 6. Uygulama */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uygulama &amp; Çevrimdışı Mod</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}><Shield size={16} color={C.green} /><Text style={styles.rowLabel}>Google Play Store Uyumlu</Text></View>
            <View style={styles.okPill}><Text style={styles.okPillText}>Hazır ✓</Text></View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}><Sparkles size={16} color={C.accent} /><Text style={styles.rowLabel}>Çevrimdışı Kelime Bankası</Text></View>
            <Text style={styles.rowSub}>Önbelleğe Alındı</Text>
          </View>
        </View>
      </View>

      {/* 7. Uygulama Bilgisi */}
      <View style={[styles.card, { padding: 16 }]}>
        <View style={styles.infoRow}>
          <Text style={styles.appTitle}>Logos Bulmaca</Text>
          <Text style={styles.appVer}>v1.0.99 (Play Store)</Text>
        </View>
        <Text style={styles.appDesc}>Minimal, sakin ve odaklanmış Türkçe kelime bulmaca deneyimi. Çevrimdışı tam erişim, sentezlenmiş sesler ve haftalık turnuvalar.</Text>
        <Pressable onPress={handleDeleteAccount} style={styles.deleteBtn}>
          <Trash2 size={14} color={C.red} />
          <Text style={styles.deleteBtnText}>Hesabı ve İlerlemeyi Sıfırla</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const Switch: React.FC<{ value: boolean; onChange: () => void }> = ({ value, onChange }) => (
  <Pressable onPress={onChange} style={[styles.switch, { backgroundColor: value ? C.primary : C.border }]}>
    <View style={[styles.switchThumb, { transform: [{ translateX: value ? 20 : 0 }] }]} />
  </Pressable>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 16 },
  header: { gap: 4 },
  title: { fontSize: 20, fontWeight: '700', color: C.text },
  subtitle: { fontSize: 12, color: C.text2 },
  section: { gap: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionValue: { fontSize: 11, fontWeight: '700', color: C.text2 },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 18, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 13, fontWeight: '600', color: C.text },
  rowSub: { fontSize: 11, color: C.muted, marginTop: 1 },
  divider: { height: 1, backgroundColor: C.border },
  switch: { width: 44, height: 24, borderRadius: 999, padding: 2, justifyContent: 'center' },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  volumeBlock: { padding: 14, gap: 10, backgroundColor: 'rgba(18,19,23,0.5)' },
  volumeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  volBadge: { backgroundColor: 'rgba(56,189,248,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  volBadgeText: { fontSize: 11, fontWeight: '800', color: C.accent },
  sliderTrack: { height: 8, backgroundColor: C.border, borderRadius: 8, justifyContent: 'center' },
  sliderFill: { position: 'absolute', height: 8, backgroundColor: C.primary, borderRadius: 8 },
  sliderThumb: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', marginLeft: -8 },
  presetRow: { flexDirection: 'row', gap: 6, paddingTop: 4 },
  presetBtn: { flex: 1, height: 28, borderRadius: 8, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  presetBtnActive: { backgroundColor: 'rgba(124,92,255,0.2)', borderColor: C.primary },
  presetText: { fontSize: 10, fontWeight: '700', color: C.muted },
  libDesc: { fontSize: 11, color: C.text2, lineHeight: 16 },
  libGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  libBtn: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 12, borderWidth: 1 },
  libBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  libBtnTitle: { fontSize: 11, fontWeight: '700', color: C.text },
  libBtnSub: { fontSize: 9, color: C.muted },
  libPlay: { fontSize: 10, fontWeight: '900' },
  pill: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 999 },
  pillText: { fontSize: 12, color: C.text2 },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  accordionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accordionTitle: { fontSize: 13, fontWeight: '600', color: C.text },
  accordionSub: { fontSize: 11, color: C.muted, marginTop: 1 },
  helpContent: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, gap: 10 },
  helpText: { fontSize: 12, color: C.text2, lineHeight: 18 },
  ruleItem: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  colorSquare: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  colorSquareText: { fontSize: 12, fontWeight: '800' },
  ruleText: { fontSize: 11, color: C.text2, flex: 1 },
  fbHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  draftBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(56,189,248,0.1)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  draftBadgeText: { fontSize: 10, color: C.accent },
  fbTypeRow: { flexDirection: 'row', gap: 6, padding: 4, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  fbTypeBtn: { flex: 1, height: 32, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  fbTypeText: { fontSize: 11, fontWeight: '700', color: C.muted },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 12, backgroundColor: C.surface, paddingHorizontal: 12, paddingVertical: 9, color: C.text, fontSize: 12 },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  fieldLabel: { fontSize: 10, fontWeight: '600', color: C.muted, letterSpacing: 0.4 },
  msgHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  charCount: { fontSize: 10, color: '#52525B' },
  fbActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  discardBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  discardBtnText: { fontSize: 11, fontWeight: '600', color: C.muted },
  sendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 16, borderRadius: 10, backgroundColor: C.primary },
  sendBtnDisabled: { backgroundColor: C.border },
  sendBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  fbSuccess: { alignItems: 'center', padding: 16, gap: 6, borderRadius: 14, backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  fbSuccessIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(34,197,94,0.2)', alignItems: 'center', justifyContent: 'center' },
  fbSuccessTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  fbSuccessSub: { fontSize: 12, color: C.text2, textAlign: 'center' },
  fbNewBtn: { marginTop: 4, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  fbNewBtnText: { fontSize: 12, fontWeight: '600', color: C.text },
  okPill: { backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  okPillText: { fontSize: 10, fontWeight: '700', color: C.green },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appTitle: { fontSize: 13, fontWeight: '700', color: C.text },
  appVer: { fontSize: 11, color: C.muted },
  appDesc: { fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 17 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, alignSelf: 'flex-start' },
  deleteBtnText: { color: C.red, fontSize: 11, fontWeight: '600' },
});
