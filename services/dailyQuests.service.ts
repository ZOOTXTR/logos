import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'gq_daily_quests';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  iconName: 'book' | 'trophy' | 'zap';
  target: number;
  reward: number;
}

// Günlük 3 görev — ilerleme gerçek oyun verisiyle (kazanma sayısı) artar,
// her gün sıfırlanır ve ödül bir kez toplanabilir.
export const DAILY_QUESTS: DailyQuest[] = [
  { id: 'quest-words', title: '5 Kelime Bul', description: 'Herhangi bir zorlukta 5 kelimeyi doğru tahmin et.', iconName: 'book', target: 5, reward: 40 },
  { id: 'quest-win', title: '1 Maç Kazan', description: 'Günün ilk zaferini elde ederek seriyi başlat.', iconName: 'trophy', target: 1, reward: 50 },
  { id: 'quest-blitz', title: 'Hızlı Modda Oyna', description: 'Süreye karşı hızlı modda 1 oyun tamamla.', iconName: 'zap', target: 1, reward: 30 },
];

export interface QuestState {
  date: string;
  progress: Record<string, number>;
  claimed: string[];
}

async function loadState(): Promise<QuestState> {
  const today = new Date().toDateString();
  let s: QuestState = { date: today, progress: {}, claimed: [] };
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) s = JSON.parse(raw);
  } catch {}
  if (s.date !== today) {
    s = { date: today, progress: {}, claimed: [] };
  }
  return s;
}

async function saveState(s: QuestState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}

export async function getDailyQuestState(): Promise<QuestState> {
  return loadState();
}

export async function incrementQuestProgress(id: string, amount = 1): Promise<QuestState> {
  const s = await loadState();
  if (s.claimed.includes(id)) return s;
  const quest = DAILY_QUESTS.find((q) => q.id === id);
  if (!quest) return s;
  s.progress[id] = Math.min(quest.target, (s.progress[id] || 0) + amount);
  await saveState(s);
  return s;
}

export async function claimQuest(id: string): Promise<{ ok: boolean; reward: number }> {
  const s = await loadState();
  const quest = DAILY_QUESTS.find((q) => q.id === id);
  if (!quest || s.claimed.includes(id)) return { ok: false, reward: 0 };
  if ((s.progress[id] || 0) < quest.target) return { ok: false, reward: 0 };
  s.claimed = [...s.claimed, id];
  await saveState(s);
  return { ok: true, reward: quest.reward };
}
