import { getFirebaseDb, FIRESTORE_COLLECTIONS } from '../config/firebase';
import { collection, doc, query, where, limit, getDocs, setDoc, updateDoc, onSnapshot, serverTimestamp, runTransaction } from 'firebase/firestore';
import { ALL_WORDS } from '../constants/words';

export type DuelStatus = 'waiting' | 'playing' | 'finished';

export interface DuelSession {
  id: string;
  status: DuelStatus;
  player1: string;
  player1Name: string;
  player1Progress: number; // 0 to 100
  player1Status: 'playing' | 'won' | 'lost' | 'waiting';
  
  player2: string | null;
  player2Name: string | null;
  player2Progress: number; // 0 to 100
  player2Status: 'playing' | 'won' | 'lost' | 'waiting';

  targetWord: string;
  winner: string | null;
  createdAt: unknown;
}

const getRandomWord = () => {
  const words = ALL_WORDS;
  return words[Math.floor(Math.random() * words.length)];
};

export const duelService = {
  async findOrCreateMatch(userId: string, userName: string): Promise<string> {
    const db = getFirebaseDb();
    const duelsRef = collection(db, FIRESTORE_COLLECTIONS.DUELS);

    // Try to find a waiting match
    const q = query(duelsRef, where('status', '==', 'waiting'), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Found a match, join it
      const duelDoc = snapshot.docs[0];
      const duelId = duelDoc.id;
      
      // Ensure we don't join our own match
      if (duelDoc.data().player1 !== userId) {
        await updateDoc(doc(db, FIRESTORE_COLLECTIONS.DUELS, duelId), {
          player2: userId,
          player2Name: userName,
          player2Status: 'playing',
          status: 'playing',
        });
        return duelId;
      }
    }

    // Create a new match
    const newDuelRef = doc(duelsRef);
    const newDuel: DuelSession = {
      id: newDuelRef.id,
      status: 'waiting',
      player1: userId,
      player1Name: userName,
      player1Progress: 0,
      player1Status: 'playing',
      player2: null,
      player2Name: null,
      player2Progress: 0,
      player2Status: 'waiting',
      targetWord: getRandomWord(),
      winner: null,
      createdAt: serverTimestamp(),
    };

    await setDoc(newDuelRef, newDuel);
    return newDuelRef.id;
  },

  subscribeToDuel(duelId: string, callback: (duel: DuelSession) => void) {
    const db = getFirebaseDb();
    return onSnapshot(doc(db, FIRESTORE_COLLECTIONS.DUELS, duelId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as DuelSession);
      }
    });
  },

  async updateProgress(duelId: string, userId: string, isPlayer1: boolean, progress: number) {
    const db = getFirebaseDb();
    const updateField = isPlayer1 ? 'player1Progress' : 'player2Progress';
    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.DUELS, duelId), {
      [updateField]: progress,
    });
  },

  async finishMatch(duelId: string, userId: string, isPlayer1: boolean, didWin: boolean) {
    const db = getFirebaseDb();
    const duelRef = doc(db, FIRESTORE_COLLECTIONS.DUELS, duelId);
    
    await runTransaction(db, async (transaction) => {
      const duelDoc = await transaction.get(duelRef);
      if (!duelDoc.exists()) return;
      
      const data = duelDoc.data() as DuelSession;
      if (data.status === 'finished') return; // Already finished

      const statusField = isPlayer1 ? 'player1Status' : 'player2Status';
      
      if (didWin) {
        transaction.update(duelRef, {
          [statusField]: 'won',
          status: 'finished',
          winner: userId,
        });
      } else {
        transaction.update(duelRef, {
          [statusField]: 'lost',
        });
        
        // If the other player also lost, finish the match with no winner
        const otherStatus = isPlayer1 ? data.player2Status : data.player1Status;
        if (otherStatus === 'lost') {
          transaction.update(duelRef, {
            status: 'finished'
          });
        }
      }
    });
  }
};
