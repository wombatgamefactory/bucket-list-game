# Strategic Bot Implementation Summary

## What Was Created

You now have a **comprehensive AI strategy framework** for Bucket List: Australian Birds, along with a new **Strategic difficulty bot** that implements it.

### 1. **STRATEGY_FRAMEWORK.md** — Your Playbook

This document outlines the strategic principles that make a strong player:

**Game Phases:**
- **Early Game (35% of cards):** Spread out, avoid congestion, build flexibility
- **Mid-Game (35–70% of cards):** Build 3-runs in parallel, prioritize imminent scoring
- **Late Game (70–100% of cards):** Complete runs aggressively, defend selectively

**Key Concepts:**
- The 10-cell problem: You only place 20 of 30 cards, so 10 must stay empty
- 3-runs as currency: A 3-run ready to extend is your primary strategic asset
- Grid zones: Center cells have more neighbors (flexibility); edges are less flexible
- Cross-sequences: A cell extending both a row and column run is premium
- Wildcard strategy: Contest them, save them for 3-run completion

**Decision Hierarchy:**
1. Immediate scoring (extend 3-run to 4-run) = +1 point now
2. Imminent scoring (create 3-run) = +1 point in 1–2 turns
3. Potential scoring (create 2-run) = +1 point in 3+ turns
4. Speculative (isolated card) = only acceptable in early game

### 2. **strategicBot.js** — The AI Implementation

A new bot that:
- **Understands game phases** and adjusts strategy accordingly
- **Tracks sequence quality** (immediate vs imminent vs potential)
- **Manages grid zones** (prefers high-neighbor cells early, specific placements late)
- **Evaluates placements holistically** rather than just immediate score gain
- **Prioritizes wisely** using the decision hierarchy from the framework

**How It's Different from Existing Bots:**

| Aspect | Basic/Hard | Expert | Strategic |
|--------|-----------|--------|-----------|
| Understands game phases | ❌ | ❌ | ✅ |
| Adapts strategy per phase | ❌ | ❌ | ✅ |
| Avoids early congestion | ❌ | ❌ | ✅ |
| Prioritizes 3-runs | ❌ | ❌ | ✅ |
| Flexibility preference early | ❌ | ✅ | ✅ |
| Evaluates sequences holistically | ❌ | ❌ | ✅ |

### 3. **Integration into Game UI**

The Strategic bot is now available as a difficulty option:
- Setup screen includes a **"Strategic" button** alongside Easy, Medium, Hard, Expert
- You can select it for any AI player
- Processing time: 4800ms (between Hard 3200ms and Expert 6400ms)

## How to Use

1. **Play against it:** Select "Strategic" as a difficulty for an AI opponent
2. **Study it:** Watch how the Strategic bot makes different moves in early/mid/late game compared to the other AIs
3. **Iterate:** Use the framework and bot as a baseline. You can now:
   - A/B test against your other bots
   - Tweak the scoring weights in `strategicBot.js` if you want adjustments
   - Add additional strategic concepts to the framework

## Key Insights from the Framework

### Why Spreading Out Early Matters
- You have 30 cells, place 20 cards. That's 10 empty cells by necessity.
- Placing 3–4 cards in a dense cluster early means those cells are locked.
- If your first 7 turns cluster cards, you may have only 5–6 placement options left by turn 15.
- Spreading into 2–3 separate clusters gives you flexibility: "I can build this cluster to habitat-5 or pivot to diet-3 depending on what the market gives me."

### Why 3-Runs Are Currency
- A 2-run scores 0 points. A 4-run scores 1 point.
- A 3-run + one card = 1 point. This card is within reach; you just need to draft or see it.
- By mid-game, a player with three 3-runs is in a strong position: "Any of these three could complete next turn if I draft the right card."
- This shifts your draft strategy: you draft not "what scores now" but "what completes my nearest threats."

### Why Market Awareness Matters Late Game
- Early game: market is huge (100 cards), prediction is noisy.
- Late game: only ~15–20 cards remain in deck. If you've seen habitat X 4 times, the 5th is probably still in the deck.
- This lets you focus your late-game drafts on the symbols you know are coming.

### Why Blocking Is Situational
- Blocking an opponent's 3-run costs you 1 cell you could have used for scoring.
- Net swing: you prevent them +1, you lose 0, but the grid is 1 cell closer to full.
- Only block if you have no 3-runs of your own to extend. If you do, completing your own run (+1) is better than blocking theirs (preventing −1 for them).

## Next Steps

1. **Test the Strategic bot** against your existing bots in a few games
2. **Observe** how it spaces out early, builds 3-runs mid-game, and scores aggressively late
3. **Compare scores** to see if the framework actually produces stronger play
4. **Iterate** if needed:
   - If it seems too aggressive early, decrease the early-game flexibility bonus
   - If it seems too conservative late, increase the immediate-scoring priority
   - If it's taking too long to compute, reduce the lookahead complexity

## Files Modified/Created

- ✅ `.claude/STRATEGY_FRAMEWORK.md` — Strategic playbook (read this first!)
- ✅ `.claude/STRATEGIC_BOT_SUMMARY.md` — This file
- ✅ `src/bots/strategicBot.js` — New bot implementation
- ✅ `src/ui/main.js` — Integrated Strategic difficulty
- ✅ `src/ui/board.js` — Added "Strategic" button to setup screen

## The Strategic Framework as a Living Document

As you iterate on the game or the AI, the framework can evolve. For example:
- If you add a new scoring rule, update the decision hierarchy
- If you change grid size, adjust the zone values
- If you notice a dominant strategy, add a principle to block it

The framework is designed to be a **shared reference** between you (the designer), the AI (the implementation), and future iterations.
