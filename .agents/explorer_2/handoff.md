# Read-Only Audit Handoff Report: R1, R2, R3 (Economy, Progression, Retention Hooks, Design Flaws & Content Gaps)

**Target Codebase**: `C:\Users\mhmto\.gemini\antigravity\scratch\gemquest52\`  
**Agent**: Explorer 2  
**Date**: 2026-08-04  

---

## 1. Observation

Direct observations from exact source code locations in the codebase:

### Section 1.1: Currency, Economy Balance, Pricing, Rewards & Drop Rates
1. **Starting Gems & Balance**:
   - Initial gem balance is **150 Gems** defined in `store/progressStore.ts:57` and fallback in `services/storage.service.ts:70`.
   - Category unlocks cost **100 Gems** each (`constants/products.ts:52` hint cost, `components/StorePackList.tsx:25-28` pack cost).
   - Hint usage costs **50 Gems** (`constants/products.ts:52` `HINT_GEM_COST = 50`).
   - Sticker Packs cost **100 Gems** (`components/StickerAlbumModal.tsx:58`).

2. **Reward Scaling Discrepancy Across Modes**:
   - `constants/levels.ts:62-68` (`getWinRewardPreview`):
     - Classic Mode win preview: **10 Gems**, Base XP **50** (or +25/+50/+100 for difficulty).
     - Speed Mode win preview: **30 Gems**, Base XP **100** (2x multiplier).
     - Daily Challenge win preview: **100 Gems**, Base XP **150** (+100 daily bonus).
   - `constants/modes.ts:13-25` (`FIXED_REWARDS` table used by cards & UI):
     - `wordle`: 10 XP / 10 Gems (Discrepancy: `levels.ts` awards 50 XP base, but `modes.ts` displays 10 XP!).
     - `anagram`: 75 XP / 20 Gems (`app/anagram.tsx:54`).
     - `blitz`: 30 XP / 5 Gems (`app/blitz.tsx:38` vs end screen awarding `Math.floor(score/10)` XP and `wordsSolved * 5` Gems at lines 46-47).
     - `chain`: 5 XP / 0 Gems (`app/chain.tsx:29` earns `chain.length * 5` XP, 0 Gems).
     - `dordle`: 150 XP / 50 Gems (`app/dordle.tsx:123`).
     - `wordconnect`: 100 XP / 30 Gems (`app/wordconnect.tsx:117`).
     - `duel`: 200 XP / 50 Gems (`app/duel.tsx:101`).

3. **Sticker Pack Drop Rates**:
   - Drop probabilities defined in `constants/stickers.ts:36-40`:
     - Legendary: `rnd > 90` -> **10%** chance per sticker.
     - Rare: `rnd > 55` -> **35%** chance per sticker.
     - Common: `rnd <= 55` -> **55%** chance per sticker.

---

### Section 1.2: Progression Systems, Level Unlocks, Power Scaling & XP Formulas
1. **XP Formula vs Level Table Inconsistency**:
   - In `constants/levels.ts:9-24`, the `LEVELS` array defines non-linear level thresholds:
     - Level 1: 0 - 100 XP
     - Level 5: 700 - 1000 XP
     - Level 10: 3200 - 4000 XP
     - Level 15: 7000 - 12000 XP
     - Level 20: 12000 - 20000 XP
     - Level 30: 30000 - 50000 XP
     - Level 50: 100000 - Infinity XP
   - BUT `getLevelFromXP()` in `constants/levels.ts:70-89` completely **ignores** `LEVELS` min/max thresholds for calculation! Instead, it uses a custom linear accumulator loop:
     ```typescript
     // constants/levels.ts:71-78
     let level = 1;
     let accumulated = 0;
     while (accumulated + level * 150 <= xp) {
       accumulated += level * 150;
       level++;
       if (level > 50) break;
     }
     ```
     - For Level 2: `accumulated = 150` (vs `LEVELS` minXP 100).
     - For Level 10: `accumulated = 150 * (1+2+3+4+5+6+7+8+9) = 6750 XP` (vs `LEVELS` level 10 minXP 3200!).
     - For Level 20: `accumulated = 150 * 190 = 28500 XP` (vs `LEVELS` level 20 minXP 12000!).
     This creates a severe mismatch between the UI display titles in `LEVELS` and `getLevelFromXP()`.

2. **Level Unlocks & Power Scaling**:
   - There are **NO level-gated feature unlocks** in the entire codebase. All modes (`app/(tabs)/modes.tsx`), categories, and store items are available at Level 1 immediately.
   - Leveling up awards no statutory gems, no unlocked modes, no themes, and no stat power-ups. It is purely cosmetic (`title` and `color`).

---

### Section 1.3: Retention Mechanics & Hooks
1. **Daily Rewards / Daily Spin**:
   - `components/DailySpinModal.tsx:22-29`: Prizes are `[10, 20, 50, 100, 5, 15]` Gems.
   - Wheel selection uses equal uniform random `Math.floor(Math.random() * PRIZES.length)` (`DailySpinModal.tsx:90`), giving a 16.6% chance for 100 Gems daily.
   - Cooldown is 24 hours (`DailySpinModal.tsx:69-70`).

2. **Streak System & Streak Reset Flaw**:
   - Streak Bonus milestones in `constants/levels.ts:44-48` & `168-175`:
     - 3-day streak: 50 Gems + 25 XP
     - 7-day streak: 150 Gems + 75 XP
     - 30-day streak: 500 Gems + 300 XP
   - **Bug in `services/storage.service.ts:149-153`**:
     ```typescript
     // storage.service.ts:149-153
     } else {
       // On loss, streak is NOT broken immediately.
       // The streak will naturally break if the player doesn't win today or tomorrow.
       // We still save current streak values without changing them.
     }
     ```
     Losing a game does NOT reset `newCurrent`. Furthermore, in `updateStreak(won: true)` (`storage.service.ts:138`), it checks `lastDate === yesterday`. If a player misses 5 days and wins on day 6, `lastDate !== yesterday`, so `newCurrent` resets to 1. But if they play and lost every day for 5 days, `lastDate` was never updated to today on loss, so when they win on day 6, `lastDate` is 5 days ago (not yesterday), resetting to 1. However, if they lose today, `recordLoss` (`progressStore.ts:254`) calls `updateStreak(false)`, which returns `newCurrent` unchanged without updating `STREAK_DATE`. This leads to confusing user feedback where losing shows current streak unchanged in state.

3. **Achievements System**:
   - 16 achievements in `constants/achievements.ts:29-200`.
   - Rewards range from 25 Gems / 50 XP (First Step) to 300 Gems / 500 XP (Legendary Streak / Genius / Master Player).
   - Achievement tracking is triggered upon winning a game in `store/progressStore.ts:216-235`.

4. **Leaderboards**:
   - Local score history stored in AsyncStorage (`services/storage.service.ts:194-202`).
   - Global leaderboard stored via `cloudService` / Firebase (`services/leaderboard.service.ts` & `components/LeaderboardModal.tsx`).

5. **Referral / Friend Invite System**:
   - `services/referral.service.ts:7-8`: Claimer receives 50 Gems, Referrer receives 75 Gems.
   - Modal UI at `components/InviteModal.tsx`.

6. **Energy System**:
   - **Non-existent**. There is no energy / stamina system restricting daily playtime.

---

### Section 1.4: Economy Imbalances, Progression Bottlenecks, Paywalls/Grind Walls & Content Gaps

#### Issue 1: Severe XP Formula Discrepancy & Bottleneck
- **Location**: `constants/levels.ts:9-24` vs `constants/levels.ts:70-89`.
- **Evidence**:
  - `LEVELS` array states Level 20 is reached at **12,000 XP** (`levels.ts:21`).
  - `getLevelFromXP()` algorithm requires `150 * (1 + 2 + ... + 19) = 28,500 XP` to reach Level 20.
  - To reach Level 50 ("Logos Şampiyonu"): `getLevelFromXP` requires `150 * (50 * 51 / 2) = 191,250 XP` whereas `LEVELS` lists `100,000 XP`.
  - Player progression slows down quadratically because each level $N$ requires $N \times 150$ additional XP, creating an extreme grind wall past Level 15.

#### Issue 2: Hint Pricing vs Reward Balance (Economy Grind Wall)
- **Location**: `constants/products.ts:52` vs `constants/modes.ts:13-21`.
- **Evidence**:
  - Hint cost = **50 Gems** (`constants/products.ts:52`).
  - Winning a Classic game preview = **10 Gems** (`levels.ts:65`).
  - Winning a Blitz game preview = **5 Gems** (`modes.ts:16`).
  - A player must win **5 Classic games** or **10 Blitz games** just to afford a single single-letter hint in one game!

#### Issue 3: Content Gap in Sticker Album
- **Location**: `constants/stickers.ts:11-27` & `components/StickerAlbumModal.tsx:128-135`.
- **Evidence**:
  - Total stickers in pool: **15 stickers** (`stickers.ts:11-27`).
  - Album progress bar displays `unlockedIds.length / 15` (`StickerAlbumModal.tsx:130`).
  - Each pack gives 3 stickers for 100 Gems (`StickerAlbumModal.tsx:72`). With duplicates allowed, a player will collect all 15 stickers very quickly (~10-15 packs / 1,000-1,500 Gems total). There are no set bonuses, collection milestone rewards, or sticker categories.

#### Issue 4: Category Lock Content Gap & Inflation
- **Location**: `store/progressStore.ts:63` vs `components/StorePackList.tsx:24-28`.
- **Evidence**:
  - Default unlocked categories: `'random', 'hayvanlar', 'yiyecek', 'spor'` (4 categories).
  - Locked categories in store: `'sehirler', 'meslekler', 'doga'` (only 3 purchasable categories!).
  - Cost per category = 100 Gems.
  - Once a player spends 300 Gems, all categories in the game are permanently unlocked. The store has zero category content remaining.

#### Issue 5: Hard Paywall on Premium-Only Game Modes
- **Location**: `app/(tabs)/modes.tsx:27-33` & `constants/modes.ts:9`.
- **Evidence**:
  - `modes.tsx:27-33` checks `if (mode.isPremium && !progress.premium)` and blocks access with an alert asking user to purchase Premium.
  - Currently, no modes in `ALL_MODES` (`constants/modes.ts:27-97`) have `isPremium: true` set directly, BUT the check is present in `modes.tsx`. If a mode is flagged premium, non-paying players are 100% hard paywalled with no gem unlock alternative.

#### Issue 6: UI Reward Discrepancy between Modes Overview and Real Gameplay
- **Location**: `constants/modes.ts:13-21` vs `constants/levels.ts:62-68` vs mode screens.
- **Evidence**:
  - In `constants/modes.ts:14`, `wordle` rewards are listed as `{ xp: 10, gems: 10 }`.
  - In `constants/levels.ts:27`, `XP_REWARDS.WIN_BASE = 50`.
  - In `app/anagram.tsx:54`, `getModeRewards('anagram')` gives `{ xp: 75, gems: 20 }`.
  - In `app/blitz.tsx:46-47`, win awards `gemsEarned: Math.floor(game.wordsSolved * 5)` and `xpEarned: Math.floor(game.score / 10)`.
  - In `app/chain.tsx:29`, win awards `chain.length * 5` XP and 0 Gems.
  This inconsistency confuses players expecting the exact rewards shown on the Game Modes screen card preview.

---

## 2. Logic Chain

1. **Economy Loop Analysis**:
   - Initial Grant: 150 Gems.
   - Sinks: Hint (50 Gems), Category Unlock (100 Gems x 3 = 300 Gems), Sticker Pack (100 Gems), Theme unlocks (None in store).
   - Sources: Daily Spin (5-100 Gems, avg ~33 Gems/day), Win Rewards (5-50 Gems), Achievements (25-300 Gems), Referrals (50 Gems).
   - *Logic*: Because total permanent sinks (Categories = 300 Gems, Stickers = ~1200 Gems) total under 2,000 Gems, long-term engaged players run out of items to purchase, accumulating useless Gems. Conversely, short-term players face a steep grind wall for hints (50 Gems vs 10 Gems/win).

2. **Progression Scaling Analysis**:
   - `LEVELS` array in `constants/levels.ts` defines explicit level brackets designed for smooth early leveling (100 -> 250 -> 450 -> 700 XP).
   - `getLevelFromXP()` uses a linear $N \times 150$ step algorithm instead of matching `LEVELS`.
   - *Logic*: As a result, Level 2 requires 150 XP (instead of 100), Level 10 requires 6,750 XP (instead of 3,200), and Level 20 requires 28,500 XP (instead of 12,000). The progression UI (LevelBar) shows mismatched title milestones compared to actual level numbers calculated by Zustand `useProgressStore`.

3. **Retention & Streak Analysis**:
   - `updateStreak` in `services/storage.service.ts` attempts to protect streak on loss by doing nothing.
   - *Logic*: Failing to update `STREAK_DATE` on loss means if a player plays every day and loses, their streak isn't reset in state until they win again after missing a calendar day. This leads to erratic streak behavior and unearned streak milestone rewards.

---

## 3. Caveats

1. Codebase is in read-only audit mode; no code modifications were applied during this analysis.
2. Firebase Cloud integration (`services/cloud.service.ts` & `services/referral.service.ts`) was evaluated based on code structure; live backend database rules (`firestore.rules`) were inspected for schema compatibility.

---

## 4. Conclusion

The game codebase has a functional core economy and retention foundation, but suffers from **4 major balance flaws** and **3 significant content gaps**:

1. **Mismatched Level Formula**: `getLevelFromXP()` arithmetic formula is out of sync with `LEVELS` array definitions in `constants/levels.ts`, making higher levels (15+) 2.3x more grindy than documented.
2. **Hint vs Reward Inflation Bottleneck**: High hint cost (50 💎) relative to standard win rewards (10 💎) creates an early-game grind wall for casual players.
3. **Finite Economy Sink Gap**: Only 3 locked categories (300 💎 total) and 15 stickers exist in the game. Late-game players quickly exhaust all economy sinks.
4. **Streak Reset Logic Flaw**: Losing a game does not explicitly handle date tracking in `storage.service.ts:149`, creating inconsistent streak persistence.
5. **UI Reward Discrepancy**: Mode selector card previews (`modes.ts`) display fixed reward numbers that contradict actual dynamic rewards granted upon game completion.

---

## 5. Verification Method

To verify these observations and conclusions independently:

1. **Inspect XP Formula Mismatch**:
   - Read `constants/levels.ts` lines 9-24 (`LEVELS`) and lines 70-89 (`getLevelFromXP`).
   - Run `ts-node` or node evaluation: `getLevelFromXP(12000)` returns Level 12 instead of Level 20 as listed in `LEVELS`.

2. **Inspect Hint & Economy Prices**:
   - Check `constants/products.ts:52` (`HINT_GEM_COST = 50`).
   - Check `constants/levels.ts:65` (`gems: 10`).

3. **Inspect Category & Sticker Inventory**:
   - Inspect `components/StorePackList.tsx:24-28` (only 3 category items: `sehirler`, `meslekler`, `doga`).
   - Inspect `constants/stickers.ts:11-27` (15 total stickers).

4. **Inspect Streak Reset Code**:
   - Inspect `services/storage.service.ts:134-162`. Note line 149 where `won === false` leaves `STREAK_COUNT` and `STREAK_DATE` unchanged.

---
*Report compiled by Explorer 2.*
