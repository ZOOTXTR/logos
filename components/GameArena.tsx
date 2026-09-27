import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Gem, Shuffle, Sparkles, RotateCcw, Swords, Trophy, Lightbulb,
  Heart, Crown, Gift, Flame, Zap, Award,
} from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { useGame } from '../hooks/useGame';
import { GameBoard } from './GameBoard';
import { Keyboard } from './Keyboard';
import { GuessHistory } from './GuessHistory';
import { audioService } from '../services/audio.service';
import { fetchDefinition } from '../services/definition.service';
import { storageGet, storageSet } from '../services/storage.service';

const FREE_GEMS_KEY = 'gq_last_free_gems';
const todayKey = () => new Date().toISOString().slice(0, 10);
import { GameMode, CategoryId, DifficultyId, PlayerStats } from '../types/game';
import {
  GameMode as GQMode, Category as GQCategory, Difficulty as GQDifficulty,
  GAME_MODE_INFO, DIFFICULTY_INFO,
} from '../constants/words';

interface GameArenaProps {
  mode: GameMode;
  category: CategoryId;
  difficulty: DifficultyId;
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onBack: () => void;
  onOpenWheel?: () => void;
  onOpenStore?: () => void;
  onRecordWin?: (opts: {
    guesses: number;
    mode: string;
    difficulty: string;
    category: string;
    isSpeed: boolean;
    isExpert: boolean;
    isPerfect: boolean;
    isDaily: boolean;
    elapsedSeconds: number;
    xpEarned: number;
    gemsEarned?: number;
  }) => void;
  onRecordLoss?: (difficulty: string) => void;
}

const MODE_MAP: Record<GameMode, GQMode> = { klasik: 'classic', hizli: 'speed', gunluk: 'daily', turnuva: 'turnuva' };
const CAT_MAP: Record<CategoryId, GQCategory> = {
  karisik: 'random', hayvanlar: 'hayvanlar', sehirler: 'sehirler', yiyecek: 'yiyecek',
  meslekler: 'meslekler', doga: 'doga', spor: 'spor',
};
const DIFF_MAP: Record<DifficultyId, GQDifficulty> = { kolay: 'easy', normal: 'normal', zor: 'hard', uzman: 'expert' };

const CLUE_COST = 25;
const HINT_COST = 40;
const SWEEP_COST = 30;
const FIFTY_COST = 35;
const SECOND_CHANCE_COST = 50;
const MILESTONE_REWARD = 50;

type RewardRow = { label: string; amount: number; kind: 'gem' | 'xp'; color: string; icon?: 'flame' | 'zap' | 'crown' };

export const GameArena: React.FC<GameArenaProps> = ({
  mode, category, difficulty, stats, onUpdateStats, onBack, onOpenWheel, onOpenStore, onRecordWin, onRecordLoss,
}) => {
  const { theme, language } = useTheme();
  const c = theme.colors;

  const gqMode = MODE_MAP[mode];
  const gqCat = CAT_MAP[category];
  const gqDiff = DIFF_MAP[difficulty];

  const [hardMode, setHardMode] = useState(false);
  useEffect(() => {
    storageGet('gq_hard_mode').then((v) => setHardMode(v === 'true')).catch(() => {});
  }, []);

  const game = useGame(gqDiff, gqMode, gqCat, language, hardMode);

  const [ended, setEnded] = useState(false);
  const [shakeToken, setShakeToken] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [clueUnlocked, setClueUnlocked] = useState(false);
  const [clueText, setClueText] = useState<string | null>(null);
  const [clueLoading, setClueLoading] = useState(false);
  const [reward, setReward] = useState<RewardRow[]>([]);
  const [rewardTotal, setRewardTotal] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [lowGems, setLowGems] = useState<{ feature: string; needed: number } | null>(null);
  const [freeGemsAvailable, setFreeGemsAvailable] = useState(true);

  useEffect(() => {
    let alive = true;
    storageGet(FREE_GEMS_KEY)
      .then((v) => { if (alive) setFreeGemsAvailable(v !== todayKey()); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const [localStreak, setLocalStreak] = useState(0);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [secondChanceUsed, setSecondChanceUsed] = useState(false);

  const modeInfo = GAME_MODE_INFO[gqMode];
  const diffInfo = DIFFICULTY_INFO[gqDiff];

  const timeMultiplier = elapsed < 30 ? 1 : elapsed < 60 ? 1.2 : elapsed < 90 ? 1.4 : 1.6;
  const getSmartCost = (base: number) => Math.round(base * timeMultiplier) + (game.hintsUsed * 5);

  useEffect(() => {
    if (game.gameStatus !== 'playing') return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - game.startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [game.gameStatus, game.startTime]);

  const spend = (cost: number, feature: string): boolean => {
    if (stats.isPremium) return true;
    if (stats.gems < cost) { setLowGems({ feature, needed: cost }); return false; }
    onUpdateStats({ gems: stats.gems - cost });
    return true;
  };

  const handleKey = useCallback((k: string) => { if (game.gameStatus === 'playing') { audioService.triggerHaptic('keyPress'); game.addLetter(k); } }, [game]);
  const handleDelete = useCallback(() => { audioService.triggerHaptic('keyDelete'); game.deleteLetter(); }, [game]);
  const handleSubmit = useCallback(() => {
    audioService.triggerHaptic('submitGuess');
    const res = game.submitGuess();
    if (res === 'short' || res === 'not_valid' || res === 'hard_mode') {
      audioService.triggerHaptic('invalidGuess');
      setShakeToken((t) => t + 1);
    }
  }, [game]);

  useEffect(() => {
    if ((game.gameStatus === 'won' || game.gameStatus === 'lost') && !ended) {
      setEnded(true);
      const won = game.gameStatus === 'won';
      audioService.triggerHaptic(won ? 'winGame' : 'loseGame');
      if (won) {
        const g = game.currentRow + 1;
        const isSpeed = gqMode === 'speed';
        const isDaily = gqMode === 'daily';
        const isTour = gqMode === 'turnuva';
        const base = isDaily ? 100 : isSpeed ? 30 : 10;
        const tourBonus = isTour ? Math.round(base * 2.5) - base : 0;
        const streakBonus = Math.min(50, stats.streak * 5);
        const speedBonus = elapsed <= 60 ? 15 : 0;
        const rows: RewardRow[] = [
          { label: language === 'en' ? 'Base Win' : 'Temel Zafer', amount: base, kind: 'gem', color: c.gem },
          ...(tourBonus > 0 ? [{ label: language === 'en' ? 'Tournament 2.5x' : 'Turnuva 2.5x', amount: tourBonus, kind: 'gem' as const, color: c.present, icon: 'crown' as const }] : []),
          { label: language === 'en' ? 'Streak Bonus' : 'Seri Bonusu', amount: streakBonus, kind: 'gem', color: '#F59E0B', icon: 'flame' },
          { label: language === 'en' ? 'Speed / Guess' : 'Hız / Tahmin', amount: speedBonus, kind: 'gem', color: c.gem, icon: 'zap' },
          { label: language === 'en' ? 'Level Progress' : 'Seviye İlerlemesi', amount: base, kind: 'xp', color: c.primaryLight },
        ];
        const totalGems = base + tourBonus + streakBonus + speedBonus;
        setReward(rows);
        setRewardTotal(totalGems);
        onRecordWin?.({
          guesses: g, mode: gqMode, difficulty: gqDiff, category: gqCat,
          isSpeed, isExpert: gqDiff === 'expert', isPerfect: g === 1, isDaily,
          elapsedSeconds: elapsed, xpEarned: base, gemsEarned: totalGems,
        });
        const nextStreak = localStreak + 1;
        setLocalStreak(nextStreak);
        if (nextStreak % 5 === 0) setMilestone(nextStreak);
      } else {
        setLocalStreak(0);
        onRecordLoss?.(gqDiff);
      }
    }
  }, [game.gameStatus]);

  const loadClue = async () => {
    setClueLoading(true); setClueUnlocked(true);
    try {
      const defs = await fetchDefinition(game.targetWord, language);
      setClueText(defs?.[0]?.definition ?? null);
    } catch { setClueText(null); }
    finally { setClueLoading(false); }
  };
  const onClue = () => {
    if (clueUnlocked) return;
    if (stats.isPremium) { loadClue(); return; }
    if (spend(getSmartCost(CLUE_COST), language === 'en' ? 'Word Clue' : 'Kelime İpucu')) { audioService.triggerHaptic('gemReward'); loadClue(); }
  };

  const onHint = () => { if (game.gameStatus === 'playing' && spend(getSmartCost(HINT_COST), language === 'en' ? 'Reveal Letter' : 'Harf Aç')) { audioService.triggerHaptic('hintUsed'); game.useHint(language); } };
  const onSweep = () => { if (game.gameStatus === 'playing' && spend(getSmartCost(SWEEP_COST), language === 'en' ? 'Sweep' : 'Süpürge')) { audioService.triggerHaptic('gemReward'); game.useSweeper(); } };
  const onFifty = () => { if (game.gameStatus === 'playing' && spend(getSmartCost(FIFTY_COST), '50/50')) { audioService.triggerHaptic('gemReward'); game.useFiftyFifty(); } };

  const restart = () => {
    setEnded(false); setElapsed(0); setClueUnlocked(false); setClueText(null);
    setReward([]); setRewardTotal(0); setClaimed(false); setSecondChanceUsed(false);
    game.resetGame(gqDiff, gqMode, gqCat, language);
  };

  const handleSecondChance = () => {
    if (secondChanceUsed) return;
    if (!spend(SECOND_CHANCE_COST, language === 'en' ? 'Second Chance' : 'Son Şans')) return;
    setSecondChanceUsed(true);
    setEnded(false);
    game.revive(); // aynı kelimeye +1 hak (yeni kelime değil)
  };

  const claimMilestone = () => {
    onUpdateStats({ gems: stats.gems + MILESTONE_REWARD });
    audioService.triggerHaptic('gemReward');
    setMilestone(null);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Üst bar */}
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={onBack} style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}>
          <ArrowLeft size={18} color={c.text} />
        </Pressable>
        <View style={styles.pills}>
          <Text style={[styles.pill, { color: c.textSecondary, backgroundColor: c.card, borderColor: c.border }]}>{modeInfo.label} · {diffInfo.label}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onOpenStore} style={[styles.gemPill, { backgroundColor: c.card, borderColor: c.gem }]}>
          <Gem size={13} color={c.gem} />
          <Text style={{ color: c.gem, fontWeight: '800', fontSize: 13 }}>{stats.gems}</Text>
        </Pressable>
      </View>

      {/* Kelime İpucu */}
      {game.gameStatus === 'playing' && (
        <Pressable accessibilityRole="button" onPress={onClue} style={[styles.clue, { backgroundColor: clueUnlocked ? c.card : c.surface, borderColor: clueUnlocked ? c.primary : c.border }]}>
          <View style={[styles.clueIcon, { backgroundColor: clueUnlocked ? c.primary + '26' : c.present + '26' }]}>
            <Lightbulb size={14} color={clueUnlocked ? c.primaryLight : c.present} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.clueTitle, { color: c.text }]} numberOfLines={1}>
              {clueUnlocked ? (language === 'en' ? 'Word Clue (unlocked)' : 'Kelime İpucu (açıldı)') : (language === 'en' ? 'Word Clue & Meaning' : 'Kelime İpucu & Anlamı')}
            </Text>
            <Text style={[styles.clueSub, { color: c.textMuted }]} numberOfLines={2}>
              {clueUnlocked
                ? (clueLoading ? (language === 'en' ? 'Loading...' : 'Yükleniyor...') : (clueText ?? (language === 'en' ? 'No definition found' : 'Anlam bulunamadı')))
                : (language === 'en' ? 'Reveal the dictionary meaning' : 'Kelimenin sözlük anlamını aç')}
            </Text>
          </View>
          {!clueUnlocked && (
            <View style={[styles.clueBuy, { borderColor: c.present + '66' }]}>
              <Text style={{ color: c.present, fontWeight: '800', fontSize: 11 }}>{getSmartCost(CLUE_COST)} 💎</Text>
            </View>
          )}
        </Pressable>
      )}

      <View style={styles.boardWrap}>
        <GameBoard board={game.board} currentRow={game.currentRow} shakeToken={shakeToken} revealedCells={game.revealedCells} />
      </View>

      {game.gameStatus === 'playing' && (
        <GuessHistory board={game.board} currentRow={game.currentRow} maxGuesses={game.maxGuesses} theme={theme} language={language} />
      )}

      {game.gameStatus === 'playing' ? (
        <>
          <View style={styles.smartStrip}>
            <Text style={[styles.smartText, { color: timeMultiplier > 1 ? c.present : c.textMuted }]}>
              ⚡ {language === 'en' ? 'Smart price' : 'Akıllı Fiyat'}: {timeMultiplier > 1 ? `${timeMultiplier}x` : '1.0x'}
            </Text>
            <Text style={[styles.smartText, { color: c.textMuted }]}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</Text>
          </View>
          <View style={styles.boosters}>
            <Booster theme={theme} icon={<Sparkles size={14} color={c.primaryLight} />} label={`${language === 'en' ? 'Reveal' : 'Harf Aç'} (${getSmartCost(HINT_COST)})`} onPress={onHint} />
            <Booster theme={theme} icon={<RotateCcw size={14} color={c.textSecondary} />} label={`${language === 'en' ? 'Sweep' : 'Süpürge'} (${getSmartCost(SWEEP_COST)})`} onPress={onSweep} />
            <Booster theme={theme} icon={<Swords size={14} color={c.present} />} label={`50/50 (${getSmartCost(FIFTY_COST)})`} onPress={onFifty} />
            <Booster theme={theme} icon={<Shuffle size={14} color={c.accent} />} label={language === 'en' ? 'Shuffle' : 'Karıştır'} onPress={() => game.shuffleRow()} />
            <Booster theme={theme} icon={<Trophy size={14} color={c.present} />} label={language === 'en' ? 'First' : 'İlk Harf'} onPress={() => game.revealFirstLetter()} />
          </View>
          <Keyboard onKey={handleKey} onDelete={handleDelete} onSubmit={handleSubmit} revealedLetters={game.revealedLetters} language={language} />
        </>
      ) : null}

      {/* VICTORY MODAL */}
      <Modal visible={ended && game.gameStatus === 'won'} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.victoryCard}>
            <View style={styles.victoryGlow} pointerEvents="none" />
            <FloatingGem />
            <View style={styles.sparkleBadge}><Sparkles size={14} color={c.present} /></View>

            <Text style={[styles.victoryTitle, { color: c.text }]}>{language === 'en' ? 'A Splendid Victory!' : 'Harika Bir Zafer!'}</Text>
            <Text style={[styles.victorySub, { color: c.correct }]}>{language === 'en' ? 'You found the word!' : 'Kelimeyi Buldun!'}</Text>

            <View style={styles.wordTiles}>
              {game.targetWord.split('').map((ch, i) => (
                <View key={i} style={[styles.wordTile, { backgroundColor: c.correct }]}>
                  <Text style={styles.wordTileText}>{ch}</Text>
                </View>
              ))}
            </View>
            {!!clueText && <Text style={[styles.victoryHint, { color: c.textSecondary }]} numberOfLines={2}>{clueText}</Text>}

            <View style={[styles.rewardCard, { backgroundColor: c.surface, borderColor: c.gem + '66' }]}>
              <View style={styles.rewardHeader}>
                <Text style={[styles.rewardHeaderText, { color: c.text }]}>{language === 'en' ? 'Gem Rewards' : 'Elmas Ödülleri'}</Text>
                <Text style={{ color: c.gem, fontWeight: '900', fontSize: 15 }}>+{rewardTotal} 💎</Text>
              </View>
              {reward.map((r) => (
                <View key={r.label} style={styles.rewardRow}>
                  <View style={styles.rewardRowLeft}>
                    {r.icon === 'flame' && <Flame size={12} color={r.color} />}
                    {r.icon === 'zap' && <Zap size={12} color={r.color} />}
                    {r.icon === 'crown' && <Crown size={12} color={r.color} />}
                    <Text style={{ color: c.textSecondary, fontSize: 12 }}>{r.label}</Text>
                  </View>
                  <Text style={{ color: r.color, fontWeight: '800', fontSize: 12 }}>{r.kind === 'xp' ? `+${r.amount} XP` : `+${r.amount} 💎`}</Text>
                </View>
              ))}
            </View>

            <Pressable accessibilityRole="button" onPress={() => { audioService.triggerHaptic('gemReward'); setClaimed(true); }} style={styles.claimWrap} disabled={claimed}>
              <LinearGradient colors={claimed ? [c.correct, c.correct] : [c.gem, c.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.claimBtn}>
                <Text style={styles.claimText}>{claimed ? (language === 'en' ? 'Added to Vault ✓' : 'Kasaya Eklendi ✓') : (language === 'en' ? `Claim Reward (+${rewardTotal} 💎)` : `Ödülü Kasaya Ekle (+${rewardTotal} 💎)`)}</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.resultActions}>
              <Pressable onPress={restart} style={[styles.resultBtn, { backgroundColor: c.primary }]}>
                <Text style={styles.resultBtnText}>{language === 'en' ? 'New Word' : 'Yeni Kelime Oyna'}</Text>
              </Pressable>
              <Pressable onPress={onBack} style={[styles.resultBtnGhost, { borderColor: c.border }]}>
                <Text style={[styles.resultBtnGhostText, { color: c.text }]}>{language === 'en' ? 'Home' : 'Ana Sayfaya Dön'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* DEFEAT MODAL */}
      <Modal visible={ended && game.gameStatus === 'lost'} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.defeatCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={[styles.defeatTile, { backgroundColor: c.error + '26' }]}>
              <Text style={{ fontSize: 30 }}>💔</Text>
            </View>
            <Text style={[styles.victoryTitle, { color: c.text }]}>{language === 'en' ? 'Out of Tries' : 'Hakların Tükendi'}</Text>
            <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 2 }}>{language === 'en' ? 'Word' : 'Kelime'}</Text>
            <View style={styles.wordTiles}>
              {game.targetWord.split('').map((ch, i) => (
                <View key={i} style={[styles.wordTile, { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }]}>
                  <Text style={[styles.wordTileText, { color: c.text }]}>{ch}</Text>
                </View>
              ))}
            </View>
            {!!clueText && <Text style={[styles.victoryHint, { color: c.textSecondary }]} numberOfLines={2}>{clueText}</Text>}

            {!secondChanceUsed && (
              <View style={[styles.secondChance, { borderColor: c.present + '50' }]}>
                <Text style={[styles.scTitle, { color: c.text }]}>{language === 'en' ? 'Keep your streak / Last chance!' : 'Seriyi Koru / Son Şans!'}</Text>
                <Pressable onPress={handleSecondChance} style={styles.scBtnWrap}>
                  <LinearGradient colors={[c.present, '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.scBtn}>
                    <Heart size={14} color="#000" fill="#000" />
                    <Text style={styles.scBtnText}>{language === 'en' ? `Buy +1 Try (${SECOND_CHANCE_COST} 💎)` : `+1 Hak Satın Al (${SECOND_CHANCE_COST} 💎)`}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}

            <View style={styles.resultActions}>
              <Pressable onPress={restart} style={[styles.resultBtn, { backgroundColor: c.primary }]}>
                <Text style={styles.resultBtnText}>{language === 'en' ? 'New Word' : 'Yeni Kelime Oyna'}</Text>
              </Pressable>
              <Pressable onPress={onBack} style={[styles.resultBtnGhost, { borderColor: c.border }]}>
                <Text style={[styles.resultBtnGhostText, { color: c.text }]}>{language === 'en' ? 'Home' : 'Ana Sayfaya Dön'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* LOW GEMS MODAL */}
      <Modal visible={!!lowGems} transparent animationType="fade" onRequestClose={() => setLowGems(null)}>
        <View style={styles.overlay}>
          <View style={[styles.lowGemsCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={[styles.defeatTile, { backgroundColor: c.gem + '26' }]}>
              <Gem size={24} color={c.gem} fill={c.gem} />
            </View>
            <Text style={[styles.victoryTitle, { color: c.text }]}>{language === 'en' ? 'Not Enough Gems' : 'Elmas Yetersiz'}</Text>
            <Text style={[styles.lowGemsDesc, { color: c.textSecondary }]}>
              {lowGems?.feature} — {language === 'en' ? 'required' : 'gereken'}: <Text style={{ color: c.gem, fontWeight: '800' }}>{lowGems?.needed} 💎</Text>
              {'  '}({language === 'en' ? 'balance' : 'bakiye'}: {stats.gems})
            </Text>

            {freeGemsAvailable && (
              <Pressable onPress={() => {
                setFreeGemsAvailable(false);
                storageSet(FREE_GEMS_KEY, todayKey()).catch(() => {});
                onUpdateStats({ gems: stats.gems + 100 });
                audioService.triggerHaptic('gemReward');
                setLowGems(null);
              }} style={[styles.optBtn, { backgroundColor: c.gem }]}>
                <Gift size={14} color="#0B0C10" />
                <Text style={styles.optBtnTextDark}>{language === 'en' ? 'Free +100 💎' : '🎁 Ücretsiz +100 💎 Al'}</Text>
              </Pressable>
            )}
            <Pressable onPress={() => { setLowGems(null); onOpenStore?.(); }} style={styles.optBtnWrap}>
              <LinearGradient colors={[c.gem, c.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.optBtnGradient}>
                <Gem size={14} color="#fff" />
                <Text style={styles.optBtnText}>{language === 'en' ? 'Go to Gem Store (100 - 3000)' : '💎 Elmas Mağazasına Git (100 - 3000)'}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => { setLowGems(null); onOpenWheel?.(); }} style={[styles.optBtn, { backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 1, borderColor: c.present + '66' }]}>
              <Award size={14} color={c.present} />
              <Text style={{ color: c.present, fontWeight: '800', fontSize: 13 }}>{language === 'en' ? 'Spin the Wheel' : '🎡 Şans Çarkını Çevir'}</Text>
            </Pressable>
            <Pressable onPress={() => setLowGems(null)} style={{ paddingVertical: 8 }}>
              <Text style={{ color: c.textMuted, fontWeight: '700', fontSize: 13 }}>{language === 'en' ? 'Cancel' : 'Vazgeç'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 5-WORD MILESTONE */}
      <Modal visible={milestone !== null} transparent animationType="fade" onRequestClose={claimMilestone}>
        <View style={styles.overlay}>
          <View style={styles.milestoneCard}>
            <View style={styles.milestoneGlow} pointerEvents="none" />
            <FloatingGem />
            <View style={styles.crownBadge}><Crown size={14} color="#0B0C10" fill="#0B0C10" /></View>
            <Text style={styles.milestoneTitle}>{language === 'en' ? '5-Word Success Streak!' : '5 Kelime Başarı Serisi!'}</Text>
            <Text style={styles.milestoneSub}>{milestone}. {language === 'en' ? 'Word Completed!' : 'Kelime Tamamlandı!'}</Text>
            <View style={styles.milestoneCapsule}><Text style={styles.milestoneCapsuleText}>+{MILESTONE_REWARD} {language === 'en' ? 'GEMS' : 'ELMAS'}</Text></View>
            <Pressable onPress={claimMilestone} style={styles.claimWrap}>
              <LinearGradient colors={[c.present, '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.claimBtn}>
                <Text style={styles.claimText}>{language === 'en' ? `Claim Reward (+${MILESTONE_REWARD} 💎)` : `Ödülü Kasaya Ekle (+${MILESTONE_REWARD} 💎)`}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const FloatingGem: React.FC = () => {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [y]);
  return (
    <Animated.View style={[styles.gemHalo, { transform: [{ translateY: y }] }]}>
      <Text style={{ fontSize: 34 }}>💎</Text>
    </Animated.View>
  );
};

const Booster = ({ theme, icon, label, onPress, disabled }: { theme: { colors: { card: string; border: string; text: string } }; icon: React.ReactNode; label: string; onPress: () => void; disabled?: boolean }) => (
  <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.booster, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, opacity: disabled ? 0.5 : 1 }]}>
    {icon}
    <Text style={[styles.boosterText, { color: theme.colors.text }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pills: { flexDirection: 'row', gap: 6 },
  pill: { fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  gemPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  clue: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 14, borderWidth: 1, marginBottom: 4 },
  clueIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  clueTitle: { fontSize: 12, fontWeight: '800' },
  clueSub: { fontSize: 10, marginTop: 1 },
  clueBuy: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  boardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  smartStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, marginBottom: 4 },
  smartText: { fontSize: 10, fontWeight: '600' },
  boosters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 12, marginBottom: 8 },
  booster: { flexGrow: 1, flexBasis: '30%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5 },
  boosterText: { fontSize: 10, fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(11,12,16,0.85)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  gemHalo: { position: 'absolute', top: 18, right: 26 },
  sparkleBadge: { position: 'absolute', top: 22, left: 30 },
  victoryCard: { width: '100%', maxWidth: 340, borderRadius: 26, backgroundColor: '#121317', borderWidth: 1, borderColor: 'rgba(56,189,248,0.4)', padding: 20, alignItems: 'center', overflow: 'hidden' },
  victoryGlow: { position: 'absolute', top: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(56,189,248,0.12)' },
  victoryTitle: { fontSize: 20, fontWeight: '900', marginTop: 6 },
  victorySub: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  wordTiles: { flexDirection: 'row', gap: 6, marginTop: 12 },
  wordTile: { width: 38, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  wordTileText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  victoryHint: { fontSize: 11, fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
  rewardCard: { width: '100%', borderRadius: 14, borderWidth: 1, padding: 12, marginTop: 14, gap: 6 },
  rewardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  rewardHeaderText: { fontSize: 12, fontWeight: '800' },
  rewardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rewardRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  claimWrap: { width: '100%', marginTop: 14, borderRadius: 14, overflow: 'hidden' },
  claimBtn: { height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  claimText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  resultActions: { flexDirection: 'row', gap: 8, marginTop: 10, width: '100%' },
  resultBtn: { flex: 1, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  resultBtnGhost: { flex: 1, height: 42, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  resultBtnGhostText: { fontWeight: '800', fontSize: 13 },
  defeatCard: { width: '100%', maxWidth: 340, borderRadius: 26, borderWidth: 1, padding: 20, alignItems: 'center' },
  defeatTile: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  secondChance: { width: '100%', borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', padding: 12, marginTop: 14, alignItems: 'center', gap: 8 },
  scTitle: { fontSize: 12, fontWeight: '800' },
  scBtnWrap: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  scBtn: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12 },
  scBtnText: { color: '#000', fontWeight: '900', fontSize: 13 },
  lowGemsCard: { width: '100%', maxWidth: 320, borderRadius: 22, borderWidth: 1, padding: 20, alignItems: 'center', gap: 8 },
  lowGemsDesc: { fontSize: 13, textAlign: 'center', marginBottom: 4 },
  optBtn: { width: '100%', height: 44, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  optBtnWrap: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  optBtnGradient: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12 },
  optBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  optBtnTextDark: { color: '#0B0C10', fontWeight: '800', fontSize: 13 },
  milestoneCard: { width: '100%', maxWidth: 340, borderRadius: 26, borderWidth: 2, borderColor: 'rgba(245,158,11,0.6)', padding: 22, alignItems: 'center', overflow: 'hidden', backgroundColor: '#17181D' },
  milestoneGlow: { position: 'absolute', top: -50, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(124,92,255,0.12)' },
  crownBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center', marginTop: 34 },
  milestoneTitle: { fontSize: 19, fontWeight: '900', color: '#fff', marginTop: 10, textAlign: 'center' },
  milestoneSub: { fontSize: 12, color: '#A1A1AA', marginTop: 2 },
  milestoneCapsule: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.5)' },
  milestoneCapsuleText: { color: '#F59E0B', fontWeight: '900', fontSize: 13 },
});
