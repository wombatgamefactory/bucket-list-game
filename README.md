# Bucket List: Australian Birds — Web Game

A browser-playable version of the tabletop card game **Bucket List: Australian Birds**. Draft birds from a shared market, build a 6×5 grid, and score points for runs of 4+ adjacent cards sharing the same habitat or diet symbol.

## Features

- **Pure ES6 modules** — No build step, no dependencies
- **Responsive design** — Works on desktop, tablet, and mobile
- **AI opponents** — Play against random or heuristic AI bots
- **Field Notes** — Track birds you've personally seen (Field Notes variant)
- **Live scoring** — See your score update as you build runs
- **Beautiful UI** — Habitat-themed card colours, smooth transitions

## Play Online

🎮 **[Play now on GitHub Pages](https://cardboard-gaming.github.io/bucket-list-game/)**

(Note: Update the GitHub Pages URL once the repo is deployed)

## Development

### Local Play

```bash
npm run dev
# Open http://localhost:8080
```

The dev server uses `npx http-server` with no caching (`-c-1`), so changes to `style.css` and JavaScript are visible immediately. Just refresh the browser.

### Game Rules

**Setup:**
- 2–5 players
- Deal 20 cards per player from the shuffled deck (e.g. 60 cards for 3 players)
- Create a 5-card face-up market

**Turn:**
1. **Draft** — Take one card from the market
2. **Place** — Add it to your 6×5 grid (orthogonally adjacent to existing cards, or anywhere if it's your first)
3. **Refill** — Market refills to 5 cards. _(Optional: if 3+ market cards share a symbol, you can refresh the entire market before drafting.)_

**Scoring (at game end):**
- **Runs of 4:** 1 point per run of 4 adjacent cards with the same habitat (or diet) symbol
- **Overlapping:** A row of 5 matching cards scores 2 points (two overlapping runs of 4)
- **Wild cards:** Match any symbol
- **Field Notes (optional):** 1 bonus point for each complete row/column where every card is ticked

## Architecture

```
src/
├── engine/
│   ├── cards.js       — 100 Australian bird card data
│   ├── game.js        — Pure game state & actions
│   └── scoring.js     — Run detection & score calculation
├── ui/
│   ├── main.js        — Game flow & event handling
│   ├── board.js       — DOM rendering
│   └── cardRenderer.js — Card HTML generation
└── bots/
    ├── randomBot.js   — Random move selection
    └── basicBot.js    — Heuristic AI (run-building strategy)
```

**Design principle:** Game engine is pure (no DOM, fully testable). UI layer is separate (reads state, fires events).

## Deployment to GitHub Pages

```bash
# Configure your repo
git remote add origin https://github.com/YOUR_ORG/bucket-list-game.git
git branch -M main

# Commit and push
git add .
git commit -m "Initial Bucket List web game

Add complete game engine, UI, and AI bots for Bucket List: Australian Birds.
Includes: card drafting, grid building, run scoring, Field Notes variant,
responsive design, and both random and heuristic AI opponents."

git push -u origin main

# Enable GitHub Pages in repo settings:
# Settings > Pages > Deploy from a branch > main > / (root)
# Your game will be live at: https://YOUR_ORG.github.io/bucket-list-game/
```

## Customization

### Add British Birds Edition

1. Convert `bucket_list_british_birds_cards.csv` to a `BRITISH_BIRDS` constant in `src/engine/cards.js`
2. Add a version selector on the setup screen
3. Pass the selected card set to `createGame()`

### Change Colors

Edit the habitat/diet color maps in `src/engine/cards.js` and update `--habitat-*` and `--diet-*` CSS variables in `style.css`.

### Analytics

Replace `G-PLACEHOLDER` in `index.html` with your Google Analytics 4 tracking ID.

## Testing

All game logic is pure and testable:

```bash
node -e "
import { createGame, draftCard, placeCard } from './src/engine/game.js';
const game = createGame([{ name: 'Test', isHuman: true }], 0);
draftCard(game, 0);
placeCard(game, 0);
console.log('✅ Basic flow works');
"
```

## License

This is a fan-made web version of **Bucket List: Australian Birds**, created with permission for demonstration purposes.

Physical game info: [Bucket List on BoardGameGeek](https://boardgamegeek.com/search/boardgame?search=bucket+list)

---

Made with ❤️ for bird enthusiasts and board game fans.
