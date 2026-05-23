# Bucket List: Australian Birds — Strategic Framework for AI Play

## Overview

This document outlines the strategic principles that make a strong player in Bucket List: Australian Birds. It's organized by **game phase** (early/mid/late) and **cross-game principles** that apply throughout.

The core insight: **Bucket List is a game about grid management over card evaluation.** Most weak plays come from treating it as "maximize this turn's score" rather than "build a board state that scores later."

---

## Game Phases

### Phase 1: Early Game (Turns 1–7, ~35% of cards placed)

**Goal:** Establish flexibility and foundation.  
**Mindset:** "Spread out, not crowd."

#### Core Principle: Avoid Grid Congestion

You have a 6×5 grid (30 cells) but will only place 20 cards. **10 cells must stay empty.** Congestion early is your biggest enemy because:
- Placing too densely blocks future placements
- You lose the ability to place cards where they'd extend sequences
- Opponents also have plenty of cards to place, so you can't predict what you'll get

**Tactic:** Aim for 2–3 separate clusters of 2–3 cards each, with space between them.

#### Placement Priority (Early Game)

1. **First card:** Place near the center of the grid (row 2–3, col 2–4) to maximize future neighbor options (4 neighbors vs 2–3 at edges).

2. **Flexible cards:** Prioritize cards with common symbols or WILD cards. These work with more future cards.

3. **Spread clusters:** When placing a second card in a cluster, leave a gap. If your first card is at [2, 2], place the second at [2, 4], not [2, 3]. This lets you densify later.

4. **Avoid blocking:** If a placement would block a future 4-run (rare in early game), avoid it. But early game is NOT about blocking opponents.

#### Card Drafting (Early Game)

- **Prioritize:** Wildcards (contest them), diverse symbols (habitat + diet both common), medium-frequency symbols.
- **Avoid:** Cards with rare habitat/diet combos unless you already have that cluster.
- **Market refresh rule:** If 3+ cards share the same symbol, you MAY clear and redraw. Early game: only do this if the market is useless (5 rare cards).

#### Sequence Scoring (Early Game)

You will not score any 4-runs in early game. **This is intentional.** You're building 2-runs and 1-runs that will bloom into 4-runs later. Avoid forcing early scores—it locks your grid.

---

### Phase 2: Mid-Game (Turns 8–14, ~35–70% of cards placed)

**Goal:** Build sequence momentum without completing runs prematurely.  
**Mindset:** "Start running, don't complete."

#### Core Principle: 3-Runs Are Currency

A "3-run" is three adjacent cards with matching symbols (habitat or diet), with room to extend.

**Why 3-runs matter:**
- A 3-run with an adjacent empty cell = potential 4-run next turn (1 point).
- A 3-run with two adjacent empty cells = defensive position (opponent can't easily block).
- A 3-run with opposing threats nearby = "race condition" (who scores first?).

**Tactic:** Build multiple 3-runs in parallel. Avoid completing any single 4-run unless forced.

#### Sequence Prioritization

In mid-game, rank placements by this hierarchy:

1. **Extend a 3-run to a 4-run** (if it's an opponent's 3-run that threatens to block you, OR your own 3-run that is already locked into the grid).
2. **Create a new 3-run** (3 adjacent cards, matching symbols, with open cells nearby).
3. **Extend a 2-run toward 3** (add the third card of a two-run).
4. **Create a 2-run** (2 adjacent cards, matching symbols).
5. **Extend a 1-run** (place a card adjacent to an existing card, even if symbols don't yet match—rarely done in mid-game, but safe).

#### Grid Management (Mid-Game)

- **Clustering:** Start consolidating your 2–3 early clusters into 1–2 dense clusters. But leave gaps.
- **Cross-sequences:** A cell can extend both a habitat run AND a diet run (e.g., a row and a column). These are **premium placements**—prioritize them.
- **Edge placement:** By mid-game, you should avoid the edges. Dense clusters in the center are easier to extend.
- **Empty cells:** You still have 8–12 empty cells left to allocate. Don't panic. Use them strategically to prevent congestion.

#### Card Drafting (Mid-Game)

- **Prioritize:** Cards that extend your existing 2-runs (move them toward 3-runs), wildcards.
- **Block:** If an opponent has an obvious 3-run threat, occasionally draft a blocking card, but only if it also works in your grid.
- **Avoid:** Dead cards that don't extend any of your clusters. Rare combos that isolate.

#### Market Awareness

- Watch opponent grids for emerging 3-runs.
- If the market fills with your rare symbols, consider triggering the refresh (3+ same symbol clears the market).
- By mid-game, keep a mental tally: "I need habitat X to score habitat sequences, diet Y to score diet sequences."

---

### Phase 3: Late Game (Turns 15–20, ~70–100% of cards placed)

**Goal:** Maximize scoring, minimize damage, finish strong.  
**Mindset:** "Complete runs, don't block carelessly."

#### Core Principle: Scarcity Changes Everything

You have 5–10 empty cells left. **Every placement matters.** Mistakes are irreversible.

#### Sequence Prioritization (Late Game)

1. **Complete a 3-run to a 4-run** (your own or, rarely, prevent opponent).
2. **Create a 4-run from scratch** (only if you have 4+ adjacent cells of matching symbols—very rare late game).
3. **Block opponent 3-runs** (but only if you can't score yourself).
4. **Fill dead space** (place cards that don't score but take up cells so opponents can't use them).

#### Card Drafting (Late Game)

- **Ruthless filtering:** ONLY draft cards that extend existing 3-runs or 2-runs in your grid.
- **Wildcards:** Still contest them; they complete 3-runs instantly.
- **Rare combos:** Ignore them unless you have an isolated 2-run of that combo.
- **Speculative cards:** Never. The game is nearly done.

#### Grid Management (Late Game)

- **Finalization:** Your grid is mostly set. You're optimizing the last 5–10 placements.
- **Avoid creating cross-blocking situations:** e.g., placing a card that extends your habitat run but blocks your diet run.
- **Accept empty cells:** Some cells will stay empty. That's fine—you filled 20 of 30.
- **Opponent interference:** Calculate carefully. Blocking an opponent run costs you 1 cell you could have used. Is that worth it?

#### Endgame Calculation

Before each placement in late game, ask:
- "Does this complete a 4-run? +1 point."
- "Does this extend a 3-run closer to 4? +0 points now, but +1 if I draw a matching card next."
- "Does this block an opponent 3-run? Saves opponent +1 point."
- "Does this waste a cell? -1 potential future placement."

Default to "complete runs" over "block opponent."

---

## Cross-Game Principles

### 1. Grid Zones and Neighbor Value

**Neighbor count = placement flexibility.**

- **Center cells (rows 1–4, cols 1–5):** 4 neighbors. Highest flexibility. Ideal for early-game placements.
- **Edge cells (rows 1–4, cols 0 or 5; rows 0 or 4, cols 1–4):** 3 neighbors. Medium flexibility. OK mid-game.
- **Corner cells:** 2 neighbors. Low flexibility. Avoid unless you're densifying a cluster.

**Early game:** Prefer high-neighbor cells to keep options open.  
**Late game:** Place cards in corners/edges if they extend specific sequences; lose the flexibility, gain the score.

---

### 2. Sequence Interaction: Rows vs Columns

A cell can contribute to both a **row sequence** (habitat/diet match horizontally) and a **column sequence** (habitat/diet match vertically).

**Premium placements** extend both simultaneously:
- A cell at [row, col] that matches its row-neighbors on habitat AND its column-neighbors on diet = +2 points (if both are 4-runs).

**Cross-blocking:** The dangerous case:
- You have a 3-run in a row. You place a card in that row to extend it to a 4-run. But that same card blocks a column sequence.
- Calculate the trade: +1 (complete row) vs. −X (opponent's column threat). If X > 1, sometimes it's correct to NOT place the card.

---

### 3. Wildcard Strategy

Wildcards (5 wild-habitat + 5 wild-diet) are the most flexible cards.

**Early game:** If you see a wildcard in the market and have ANY cluster, consider drafting it. It's a future flexibility tool.

**Mid-game:** Draft wildcards to complete 3-runs. A 3-run + wildcard = guaranteed 4-run.

**Late game:** Use wildcards to instantly close 3-runs. Never use a wildcard speculatively (e.g., "I might have a 3-run later").

**Opponent wildcards:** If an opponent has a 3-run and you see a wildcard in the market, consider drafting it to deny them the instant 4-run.

---

### 4. Market Awareness

**Deck composition:** 100 birds total. 20 × player count are in play. ~50% of the deck sits unseen.

As the game progresses, your ability to predict the market decreases. But **late-game markets are smaller**—fewer unseen cards, so your predictions improve again.

**Rare symbols:** If you've seen 4 of 5 habitats X cards, the 5th is still in the deck. This card becomes **hot** in late game.

**Refresh rule:** If 3+ market cards share a symbol, you MAY clear and redraw. Use this:
- Early game: never (bad outcomes).
- Mid-game: rarely (only if market is useless for you).
- Late game: occasionally (if the refresh gives you better odds for a needed symbol).

---

### 5. Defensive Blocking

**When to block an opponent's 3-run:**
- They have a 3-run + adjacent empty cell. Next turn, they could score +1.
- You have no 3-runs of your own to extend.
- Placing a blocking card doesn't cost you a critical sequence (i.e., it doesn't prevent YOUR 4-run completion).

**When NOT to block:**
- You have a 3-run to extend or 2-run to grow toward 3. Always prioritize your own score.
- The opponent's 3-run is far from completion (no adjacent empty cell).
- The blocking card is a wildcard. Wildcards are too valuable to waste on defense.

**Example:** You have a 3-run (habitat match) ready to score +1. Opponent has a 3-run (diet match) with an adjacent empty. Your choice: extend your run (+1), or block their run (save them −1). **Extend your own run.** The net difference is: you +1, they −1 = +2 total swing in your favor.

---

### 6. The "Potential" Hierarchy

When deciding which card to draft or where to place it, rank placements:

1. **Immediate scoring** (extends 3-run to 4-run): +1 point now.
2. **Imminent scoring** (creates 3-run or extends 2-run to 3-run): +1 point within 1–2 turns (likely).
3. **Potential scoring** (creates 2-run or extends 1-run to 2-run): +1 point within 3+ turns (less likely).
4. **Speculative** (places isolated card): no near-term score. Only do in early game for flexibility.

**Tactic:** In mid-game, aim for "imminent" placements. In late game, only do "immediate" or "imminent." In early game, "potential" and "speculative" are OK.

---

### 7. Risk / Reward Framework

Every placement on the grid carries risk:

- **Safe placement:** Extends one of your existing 2-runs or 1-runs. Low risk, moderate reward (+1 eventual point).
- **Medium-risk placement:** Creates or extends two adjacent clusters, hoping to connect them later. Moderate risk, high reward (if sequences align, +2 points).
- **High-risk placement:** Isolated card placed far from clusters, hoping to cluster later. High risk, speculative reward.

**Early game:** Embrace medium-risk. Clusters that don't connect are fine; you had the flexibility.  
**Mid-game:** Mix safe and medium-risk. Avoid high-risk.  
**Late game:** Only safe placements. High-risk is wasted.

---

## Advanced Concepts

### Multi-Symbol Sequences

Some placements extend both a habitat and a diet sequence:

Row: [Card A (Rainforest/Insects), Card B (Rainforest/Insects), **EMPTY**, Card D (Rainforest/Insects)]
Col: [Card X (Bushland/Insects), **EMPTY**, Card Z (Rainforest/Insects)]

Placing a (Rainforest/Insects) card at [row, col] extends the row toward a 4-run AND completes the column as a 4-run. This is a **dual-scoring placement** = +2 points.

**Tactic:** In mid-game, look for cells that extend multiple sequences. In late-game, these are priority placements.

---

### Sequence Competition

Two sequences of the same type (both habitat, or both diet) can compete for the same cards or cells.

**Example:**
- Row 1: [Rainforest, Rainforest, Bushland, **EMPTY**]
- Row 2: [Rainforest, **EMPTY**, Rainforest, Bushland]

A Rainforest card at [Row 1, Col 3] could extend Row 1 toward a 4-run. But that same card placed at [Row 2, Col 1] extends Row 2 differently. **You can only place it once.** This is a strategic tension.

**Tactic:** In mid-game, visualize placements across all your sequences. Prioritize the placement that creates the most leverage (e.g., unlocks both row and column simultaneously).

---

### The "Blocked Future" Scenario

**Risk:** You place a card that doesn't score now but blocks a future 4-run.

**Example:**
- Your grid: [A, A, **EMPTY**, B, B] (row)
- You place a C card to extend a different sequence.
- Now your row is: [A, A, C, B, B] (blocked—C breaks the As and the Bs).

**Prevention:** Before mid/late-game placements, check: "Does this card break a future sequence I'm planning?"

**Tactic:** Early game, this is inevitable. Accept it and spread out to reduce the damage. Mid/late game, avoid it unless you gain more than you lose.

---

## Decision-Making Summary

| Scenario | Early Game | Mid-Game | Late Game |
|----------|-----------|----------|-----------|
| Draft a wildcard? | Maybe (if any cluster exists). | Yes (unless hand-limit prevents it). | Only if you have a 3-run to complete. |
| Block an opponent? | No. | Only if your 3-runs don't exist. | Selectively (high-value threats only). |
| Place a speculative card? | Yes (for flexibility). | Rarely. | Never. |
| Refresh the market? | No. | Maybe (if desperate). | Occasionally (late-game odds). |
| Aim for immediate scoring? | No. | Sometimes (if you have 3-runs). | Always. |
| Prioritize grid flexibility? | Yes. | Somewhat. | No. |
| Accept empty cells? | Cautiously. | Yes (plan for ~10 total). | Yes (accept the rest). |

---

## Summary: What Makes a Strong Player

1. **Spreads out early** to maximize flexibility and prevent congestion.
2. **Builds 3-runs in mid-game** without completing them prematurely.
3. **Completes runs aggressively in late-game** when cells are scarce.
4. **Defends strategically**, not emotionally (block threats, not every opponent move).
5. **Manages wildcards** as premium resources (save for 3-run completion).
6. **Understands sequence interaction** (rows ↔ columns, habitat ↔ diet).
7. **Adapts placement strategy** to the game phase and available options.
8. **Minimizes wasted cells** by aiming for "imminent" or "immediate" scoring placements in mid/late game.
