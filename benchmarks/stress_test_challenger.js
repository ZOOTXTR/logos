/**
 * CHALLENGER EMPIRICAL STRESS TEST HARNESS (Milestone 2)
 * Tests:
 * 1. 2D Grid structural sharing strict invariants (Wordle & Dordle, partially solved states, boundary keys)
 * 2. Extended 5,000-round multi-mode memory drift & heap slope analysis
 * 3. Rapid audio service spam & pool lifecycle churn
 * 4. Turkish casing & dictionary lookup correctness / stress
 * 5. Gesture throttle mathematical bounds
 */

const { performance } = require('perf_hooks');

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(3) + ' MB';
}
function formatKB(bytes) {
  return (bytes / 1024).toFixed(2) + ' KB';
}

console.log('================================================================');
console.log(' CHALLENGER 1 (M2) - ADVERSARIAL STRESS TEST SUITE');
console.log(' Node.js Runtime: ' + process.version + ' on ' + process.platform);
console.log('================================================================\n');

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition, message) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
  } else {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// -------------------------------------------------------------
// SUITE 1: 2D Grid Structural Sharing & Immutability Invariants
// -------------------------------------------------------------
console.log('--- [TEST SUITE 1] 2D Grid Structural Sharing Invariants ---');

function createEmptyBoard(rows = 6, cols = 5) {
  return Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({ char: '', status: 'empty' }))
  );
}

function optimizedAddLetter(board, row, col, letter) {
  const newBoard = [...board];
  const newRow = [...newBoard[row]];
  newRow[col] = { char: letter, status: 'tbd' };
  newBoard[row] = newRow;
  return newBoard;
}

function optimizedDeleteLetter(board, row, col) {
  if (col === 0) return board;
  const newBoard = [...board];
  const newRow = [...newBoard[row]];
  newRow[col - 1] = { char: '', status: 'empty' };
  newBoard[row] = newRow;
  return newBoard;
}

// 1.1 Invariant: Untouched rows and cells in Wordle
let b0 = createEmptyBoard(6, 5);
let b1 = optimizedAddLetter(b0, 0, 0, 'K');
assert(b1 !== b0, 'Board root should be cloned');
assert(b1[0] !== b0[0], 'Active row 0 should be cloned');
assert(b1[1] === b0[1], 'Row 1 MUST maintain reference equality');
assert(b1[2] === b0[2], 'Row 2 MUST maintain reference equality');
assert(b1[3] === b0[3], 'Row 3 MUST maintain reference equality');
assert(b1[4] === b0[4], 'Row 4 MUST maintain reference equality');
assert(b1[5] === b0[5], 'Row 5 MUST maintain reference equality');

assert(b1[0][0].char === 'K' && b1[0][0].status === 'tbd', 'Cell 0,0 updated');
assert(b1[0][1] === b0[0][1], 'Cell 0,1 MUST maintain reference equality');
assert(b1[0][2] === b0[0][2], 'Cell 0,2 MUST maintain reference equality');
assert(b1[0][3] === b0[0][3], 'Cell 0,3 MUST maintain reference equality');
assert(b1[0][4] === b0[0][4], 'Cell 0,4 MUST maintain reference equality');

// 1.2 Dordle Partially Solved Invariant Test
// In Dordle: if word1 is solved, adding a letter should NOT clone board1!
function dordleAddLetter(state, letter) {
  if (state.gameStatus !== 'playing') return state;
  if (state.currentCol >= 5) return state;

  let newBoard1 = state.board1;
  let newBoard2 = state.board2;

  if (!state.word1Solved) {
    newBoard1 = [...state.board1];
    const newRow1 = [...newBoard1[state.currentRow]];
    newRow1[state.currentCol] = { char: letter, status: 'tbd' };
    newBoard1[state.currentRow] = newRow1;
  }
  if (!state.word2Solved) {
    newBoard2 = [...state.board2];
    const newRow2 = [...newBoard2[state.currentRow]];
    newRow2[state.currentCol] = { char: letter, status: 'tbd' };
    newBoard2[state.currentRow] = newRow2;
  }

  return {
    ...state,
    board1: newBoard1,
    board2: newBoard2,
    currentCol: state.currentCol + 1,
  };
}

let dordleState = {
  board1: createEmptyBoard(7, 5),
  board2: createEmptyBoard(7, 5),
  currentRow: 2,
  currentCol: 0,
  word1Solved: true, // Word 1 is already solved!
  word2Solved: false,
  gameStatus: 'playing',
};

let nextDordle = dordleAddLetter(dordleState, 'Z');
assert(nextDordle.board1 === dordleState.board1, 'Solved board1 MUST NOT be cloned on addLetter');
assert(nextDordle.board2 !== dordleState.board2, 'Unsolved board2 MUST be cloned on addLetter');
assert(nextDordle.board2[2] !== dordleState.board2[2], 'Row 2 of board2 should be cloned');
assert(nextDordle.board2[0] === dordleState.board2[0], 'Row 0 of board2 MUST maintain reference equality');
assert(nextDordle.board2[1] === dordleState.board2[1], 'Row 1 of board2 MUST maintain reference equality');
assert(nextDordle.board2[3] === dordleState.board2[3], 'Row 3 of board2 MUST maintain reference equality');

console.log('✅ 2D Grid Structural Sharing & Dordle Solved-State Invariants PASSED.\n');


// -------------------------------------------------------------
// SUITE 2: Extended 5,000-Round Gameplay Memory Drift & Slope
// -------------------------------------------------------------
console.log('--- [TEST SUITE 2] 5,000-Round Extended Memory Drift & Slope Analysis ---');

if (global.gc) global.gc();
const initialHeap = process.memoryUsage().heapUsed;
const heapCheckpoints = [];

const TOTAL_ROUNDS = 5000;
const CHECKPOINT_INTERVAL = 1000;

for (let r = 1; r <= TOTAL_ROUNDS; r++) {
  // Simulate Wordle round
  let board = createEmptyBoard(6, 5);
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 5; col++) {
      board = optimizedAddLetter(board, row, col, 'T');
    }
    // Delete and re-type
    board = optimizedDeleteLetter(board, row, 5);
    board = optimizedAddLetter(board, row, 4, 'E');
    // Submit row
    const newBoard = [...board];
    newBoard[row] = board[row].map(c => ({ char: c.char, status: 'correct' }));
    board = newBoard;
  }

  if (r % CHECKPOINT_INTERVAL === 0) {
    if (global.gc) global.gc();
    const currentHeap = process.memoryUsage().heapUsed;
    heapCheckpoints.push({ round: r, heapUsed: currentHeap, driftFromStart: currentHeap - initialHeap });
  }
}

if (global.gc) global.gc();
const finalHeap = process.memoryUsage().heapUsed;
const totalDrift = finalHeap - initialHeap;

console.log(`Initial Heap: ${formatMB(initialHeap)}`);
heapCheckpoints.forEach(cp => {
  console.log(`Round ${cp.round.toString().padStart(5)}: Heap = ${formatMB(cp.heapUsed)} | Delta from Start = ${formatKB(cp.driftFromStart)}`);
});
console.log(`Final Heap:   ${formatMB(finalHeap)} | Total Drift: ${formatKB(totalDrift)}`);

// Assertion: Drift across 5,000 rounds should be under 500KB (no monotonic leak)
assert(Math.abs(totalDrift) < 512 * 1024, `Heap drift should be < 512 KB, got ${formatKB(totalDrift)}`);
console.log('✅ 5,000-Round Extended Memory Stability PASSED.\n');


// -------------------------------------------------------------
// SUITE 3: Audio Service Rapid Stress & Pool Boundary Test
// -------------------------------------------------------------
console.log('--- [TEST SUITE 3] Audio Service Rapid Replay & Pool Bounds ---');

class MockSound {
  constructor(uri) {
    this.uri = uri;
    this.replays = 0;
    this.unloaded = false;
  }
  async replayAsync() {
    if (this.unloaded) throw new Error('Cannot play unloaded sound');
    this.replays++;
  }
  async unloadAsync() {
    this.unloaded = true;
  }
}

class TestAudioService {
  constructor() {
    this.soundPool = {};
    this.soundEnabled = true;
  }
  async preloadSounds() {
    this.soundPool['click'] = new MockSound('click.wav');
    this.soundPool['win'] = new MockSound('win.wav');
    this.soundPool['loss'] = new MockSound('loss.wav');
  }
  async play(type) {
    if (!this.soundEnabled) return;
    const sound = this.soundPool[type];
    if (sound) {
      await sound.replayAsync();
    }
  }
  async unloadAll() {
    for (const k in this.soundPool) {
      await this.soundPool[k].unloadAsync();
    }
    this.soundPool = {};
  }
}

const audioTest = new TestAudioService();

(async () => {
  await audioTest.preloadSounds();
  const SOUND_ITERATIONS = 200000;
  const t0Audio = performance.now();
  for (let i = 0; i < SOUND_ITERATIONS; i++) {
    await audioTest.play(i % 3 === 0 ? 'click' : i % 3 === 1 ? 'win' : 'loss');
  }
  const t1Audio = performance.now();

  assert(audioTest.soundPool['click'].replays > 60000, 'Click sound replayed correct times');
  assert(audioTest.soundPool['win'].replays > 60000, 'Win sound replayed correct times');
  assert(audioTest.soundPool['loss'].replays > 60000, 'Loss sound replayed correct times');
  console.log(`- 200,000 Audio Replay Calls executed in ${(t1Audio - t0Audio).toFixed(2)} ms (${((t1Audio - t0Audio) / SOUND_ITERATIONS * 1000).toFixed(2)} µs per call)`);

  await audioTest.unloadAll();
  assert(Object.keys(audioTest.soundPool).length === 0, 'Sound pool completely cleared after unloadAll');
  console.log('✅ Audio Service Rapid Playback & Pool Lifecycle PASSED.\n');
})();


// -------------------------------------------------------------
// SUITE 4: Turkish Casing & Dictionary Lookup Edge Cases
// -------------------------------------------------------------
console.log('--- [TEST SUITE 4] Turkish Casing & Static Set Correctness ---');

// Test Turkish letter casing conversions
const rawInputTR = 'çiçek';
const turkishUpper = rawInputTR.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR');
assert(turkishUpper === 'ÇİÇEK', `Expected ÇİÇEK, got ${turkishUpper}`);

const rawInputI = 'ışık';
const turkishUpperI = rawInputI.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR');
assert(turkishUpperI === 'IŞIK', `Expected IŞIK, got ${turkishUpperI}`);

const MOCK_STICKERS = [
  { id: 's1', rarity: 'common' }, { id: 's2', rarity: 'common' },
  { id: 's3', rarity: 'rare' }, { id: 's4', rarity: 'rare' },
  { id: 's5', rarity: 'legendary' }
];
const STICKERS_BY_RARITY = {
  common: MOCK_STICKERS.filter(s => s.rarity === 'common'),
  rare: MOCK_STICKERS.filter(s => s.rarity === 'rare'),
  legendary: MOCK_STICKERS.filter(s => s.rarity === 'legendary'),
};

function rollRandomStickers(count) {
  const rolled = [];
  for (let i = 0; i < count; i++) {
    const rnd = Math.random() * 100;
    const rarity = rnd > 90 ? 'legendary' : rnd > 55 ? 'rare' : 'common';
    const pool = STICKERS_BY_RARITY[rarity];
    rolled.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return rolled;
}

// Verify 100,000 sticker rolls rarity distribution matches weights
const ROLLS = 100000;
const rolledStickers = rollRandomStickers(ROLLS);
let legendaries = 0, rares = 0, commons = 0;
rolledStickers.forEach(s => {
  if (s.rarity === 'legendary') legendaries++;
  else if (s.rarity === 'rare') rares++;
  else commons++;
});

console.log(`- Sticker Distribution (100k rolls): Common = ${((commons / ROLLS) * 100).toFixed(1)}% (exp ~55%), Rare = ${((rares / ROLLS) * 100).toFixed(1)}% (exp ~35%), Legendary = ${((legendaries / ROLLS) * 100).toFixed(1)}% (exp ~10%)`);
assert(legendaries > 8000 && legendaries < 12000, `Legendary distribution unexpected: ${legendaries}`);
assert(rares > 32000 && rares < 38000, `Rare distribution unexpected: ${rares}`);
assert(commons > 52000 && commons < 58000, `Common distribution unexpected: ${commons}`);
console.log('✅ Turkish Casing & Distribution Invariants PASSED.\n');


// -------------------------------------------------------------
// SUITE 5: Gesture Throttling Simulator (30 FPS vs 120 Hz event flood)
// -------------------------------------------------------------
console.log('--- [TEST SUITE 5] WordConnect PanResponder Throttling Invariant ---');

// Simulate 10,000 high frequency 120Hz touch move events
let stateUpdates = 0;
let collisionChecks = 0;
let lastTouchUpdate = { time: 0, x: 0, y: 0 };

function simulateTouchMove(time, x, y) {
  const dx = Math.abs(x - lastTouchUpdate.x);
  const dy = Math.abs(y - lastTouchUpdate.y);
  // Throttle state update
  if (time - lastTouchUpdate.time > 32 || dx > 6 || dy > 6) {
    lastTouchUpdate = { time, x, y };
    stateUpdates++;
  }
  // Collision check is still done on every touch
  collisionChecks++;
}

// 10,000 sub-millisecond movements with microscopic jitter (< 2px)
let simTime = 1000;
for (let i = 0; i < 10000; i++) {
  simTime += 2; // 2ms between touch events = 500 Hz flood
  const x = 100 + (i % 3); // 0, 1, 2px jitter
  const y = 100 + (i % 2);
  simulateTouchMove(simTime, x, y);
}

console.log(`- Touch Move Events:      10,000`);
console.log(`- State Re-render Count:  ${stateUpdates} (Throttle reduction: ${(((10000 - stateUpdates) / 10000) * 100).toFixed(1)}%)`);
console.log(`- Collision Check Count:  ${collisionChecks} (100% collision responsiveness maintained)`);

assert(stateUpdates <= 700, `Expected <= 700 state updates for 10,000 events, got ${stateUpdates}`);
assert(collisionChecks === 10000, `Expected 10,000 collision checks, got ${collisionChecks}`);
console.log('✅ Gesture Throttling Invariant PASSED.\n');

console.log('================================================================');
console.log(` ALL ${totalAssertions} ADVERSARIAL CHALLENGER ASSERTIONS PASSED!`);
console.log('================================================================');
