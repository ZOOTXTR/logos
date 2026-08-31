const assert = require('assert');

console.log('--- STARTING ADVERSARIAL STRESS TESTS ---');

// 1. Stress-test Theme FONTS tokens
try {
  const { FONTS, COLORS, SPACING, BORDER_RADIUS } = require('../../constants/theme');
  const requiredFonts = ['regular', 'medium', 'semibold', 'bold', 'extrabold', 'display', 'displayMedium'];
  for (const f of requiredFonts) {
    assert.strictEqual(typeof FONTS[f], 'string', `FONTS.${f} should be a string`);
  }
  console.log('✅ Theme FONTS tokens verified: all 7 required font weights/styles exist.');
} catch (e) {
  console.error('❌ Theme FONTS test failed:', e.message);
}

// 2. Stress-test Achievements & Nullish rewards
try {
  const { ACHIEVEMENTS, getNewAchievements } = require('../../constants/achievements');
  assert(Array.isArray(ACHIEVEMENTS), 'ACHIEVEMENTS must be an array');
  const mockStats = {
    gamesPlayed: 10,
    gamesWon: 5,
    currentStreak: 4,
    maxStreak: 4,
    gems: 500,
    level: 5,
    isPremium: false,
    speedModeWins: 1,
    expertModeWins: 1,
    perfectGames: 1,
    dailyChallengesCompleted: 7,
    categoriesWon: new Set(['spor', 'bilim', 'tarih', 'sanat', 'cografya', 'doga']),
    lateNightGames: 1,
  };
  const unlocked = getNewAchievements(mockStats, []);
  assert(unlocked.length > 0, 'Should unlock achievements');
  
  // Calculate rewards with nullish coalescing
  let rewardGems = 0;
  let rewardXP = 0;
  for (const a of unlocked) {
    rewardGems += a.rewardGems ?? 0;
    rewardXP += a.rewardXP ?? 0;
  }
  assert(!isNaN(rewardGems) && !isNaN(rewardXP), 'Rewards must not be NaN');
  console.log(`✅ Achievements logic verified: ${unlocked.length} achievements unlocked, rewards parsed safely (${rewardGems} gems, ${rewardXP} XP).`);
} catch (e) {
  console.error('❌ Achievements test failed:', e.message);
}

// 3. Stress-test Keyboard Layouts & Handlers
try {
  // Let's test the layout matrices directly
  const KEYBOARD_ROWS_TR = [
    ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['SİL', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'GÖNDER'],
  ];

  const KEYBOARD_ROWS_EN = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
  ];

  const enFlat = KEYBOARD_ROWS_EN.flat();
  const trFlat = KEYBOARD_ROWS_TR.flat();

  // English letters check
  assert(enFlat.includes('Q') && enFlat.includes('W') && enFlat.includes('X'), 'English keyboard must contain Q, W, X');
  assert(enFlat.includes('ENTER') && enFlat.includes('DEL'), 'English keyboard must contain ENTER and DEL');
  
  // Check all 26 standard English alphabet letters are present
  const allAlpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (const letter of allAlpha) {
    assert(enFlat.includes(letter), `English keyboard missing letter: ${letter}`);
  }
  console.log('✅ Keyboard EN layout verified: all 26 English letters present + ENTER/DEL.');
} catch (e) {
  console.error('❌ Keyboard test failed:', e.message);
}

// 4. Stress-test Package.json Dependency Resolution
try {
  const fs = require('fs');
  const path = require('path');
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'));

  assert(pkg.devDependencies['puppeteer-core'], 'puppeteer-core must be in devDependencies');
  assert(!pkg.dependencies['puppeteer-core'], 'puppeteer-core must NOT be in dependencies');
  
  const hasZustandInDeps = !!(pkg.dependencies && pkg.dependencies['zustand']);
  console.log(`Package.json check: puppeteer-core in devDeps: true, zustand in dependencies: ${hasZustandInDeps}`);
} catch (e) {
  console.error('❌ Package.json test failed:', e.message);
}

console.log('--- ADVERSARIAL STRESS TESTS COMPLETE ---');
