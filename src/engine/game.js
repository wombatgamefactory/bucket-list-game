// Bucket List: Game Engine
// Pure game state and rules (no DOM, fully testable)

import { AUSTRALIAN_BIRDS, HABITATS, DIETS } from './cards.js';
import { calculateRunScore, calculateFieldNotesScore } from './scoring.js';

// Create and initialize a new game
export function createGame(playerConfigs, fieldNotesCount = 0) {
  // Validate input
  if (playerConfigs.length < 1 || playerConfigs.length > 4) {
    throw new Error('Game requires 1-4 players');
  }

  // Build the card deck: exactly 20 cards per player
  const deck = [...AUSTRALIAN_BIRDS].sort(() => Math.random() - 0.5);
  const deckSize = 20 * playerConfigs.length;
  const gameDeck = deck.slice(0, deckSize);

  // Seed Field Notes: randomly mark some cards as ticked
  const tickedCardIds = new Set();
  if (fieldNotesCount > 0) {
    const tickedBirds = deck.slice(0, fieldNotesCount);
    tickedBirds.forEach(bird => tickedCardIds.add(bird.id));
  }

  // Initialize players
  const players = playerConfigs.map((config, idx) => ({
    id: idx,
    name: config.name || `Player ${idx + 1}`,
    isHuman: config.isHuman !== false,
    aiDifficulty: config.aiDifficulty || null,
    grid: Array(30).fill(null),
    score: 0,
    fieldNotesScore: 0,
  }));

  // Create initial market (5 cards from deck)
  const market = [];
  for (let i = 0; i < 5 && gameDeck.length > 0; i++) {
    market.push(gameDeck.pop());
  }

  const gameState = {
    players,
    market,
    deck: gameDeck,
    currentPlayerIndex: 0,
    gamePhase: 'draft', // draft | place | gameover
    gameOver: false,
    turnsCompleted: 0,
    totalTurns: 20,
    pendingCard: null,
    fieldNotes: {
      enabled: fieldNotesCount > 0,
      tickedCardIds,
    },
    canRefreshMarket: false,
    marketRefreshOffered: false,
  };

  updateMarketRefreshFlag(gameState);
  return gameState;
}

// Update the canRefreshMarket flag based on current market
function updateMarketRefreshFlag(gameState) {
  const marketSymbols = new Map();

  for (const card of gameState.market) {
    // Count habitat occurrences
    const habitat = card.habitat;
    marketSymbols.set(habitat, (marketSymbols.get(habitat) || 0) + 1);

    // Count diet occurrences
    const diet = card.diet;
    marketSymbols.set(diet, (marketSymbols.get(diet) || 0) + 1);
  }

  // Check if any symbol appears 3+ times
  gameState.canRefreshMarket = Array.from(marketSymbols.values()).some(count => count >= 3);
  gameState.marketRefreshOffered = false;
}

// Refresh the market (clears and refills from deck)
export function refreshMarket(gameState) {
  if (!gameState.canRefreshMarket) {
    throw new Error('Cannot refresh market');
  }

  gameState.market = [];
  for (let i = 0; i < 5 && gameState.deck.length > 0; i++) {
    gameState.market.push(gameState.deck.pop());
  }

  updateMarketRefreshFlag(gameState);
}

// Draft a card from the market
export function draftCard(gameState, cardIndex) {
  if (gameState.gamePhase !== 'draft') {
    throw new Error('Not in draft phase');
  }

  if (cardIndex < 0 || cardIndex >= gameState.market.length) {
    throw new Error('Invalid card index');
  }

  const card = gameState.market[cardIndex];
  gameState.pendingCard = card;
  gameState.market.splice(cardIndex, 1);
  gameState.gamePhase = 'place';
}

// Get valid placement cells (adjacent to existing cards)
export function getValidPlacementCells(gameState) {
  const player = gameState.players[gameState.currentPlayerIndex];
  const grid = player.grid;
  const valid = new Set();

  // Check if grid is empty
  const isEmpty = grid.every(cell => cell === null);
  if (isEmpty) {
    // First card can go anywhere
    for (let i = 0; i < 30; i++) {
      valid.add(i);
    }
    return Array.from(valid);
  }

  // Find all empty cells adjacent to filled cells
  for (let i = 0; i < 30; i++) {
    if (grid[i] !== null) continue; // Only check empty cells

    // Check 4-adjacent neighbors
    const row = Math.floor(i / 6);
    const col = i % 6;

    const neighbors = [
      { r: row - 1, c: col }, // up
      { r: row + 1, c: col }, // down
      { r: row, c: col - 1 }, // left
      { r: row, c: col + 1 }, // right
    ];

    for (const n of neighbors) {
      if (n.r >= 0 && n.r < 5 && n.c >= 0 && n.c < 6) {
        const nIdx = n.r * 6 + n.c;
        if (grid[nIdx] !== null) {
          valid.add(i);
          break;
        }
      }
    }
  }

  return Array.from(valid).sort((a, b) => a - b);
}

// Place a card in the grid
export function placeCard(gameState, cellIndex) {
  if (gameState.gamePhase !== 'place') {
    throw new Error('Not in place phase');
  }

  if (!gameState.pendingCard) {
    throw new Error('No pending card');
  }

  const validCells = getValidPlacementCells(gameState);
  if (!validCells.includes(cellIndex)) {
    throw new Error('Invalid placement cell');
  }

  // Place the card
  const player = gameState.players[gameState.currentPlayerIndex];
  player.grid[cellIndex] = gameState.pendingCard;
  gameState.pendingCard = null;
  gameState.turnsCompleted += 1;

  // Refill market from deck
  while (gameState.market.length < 5 && gameState.deck.length > 0) {
    gameState.market.push(gameState.deck.pop());
  }

  // Check if game is over
  if (gameState.deck.length === 0 && gameState.market.length === 0) {
    gameState.gamePhase = 'gameover';
    gameState.gameOver = true;
    calculateScores(gameState);
  } else {
    // Move to next player
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    gameState.gamePhase = 'draft';
    updateMarketRefreshFlag(gameState);
  }
}

// Calculate final scores
export function calculateScores(gameState) {
  for (const player of gameState.players) {
    const runs = calculateRunScore(player.grid);
    const fieldNotes = calculateFieldNotesScore(player.grid, gameState.fieldNotes.tickedCardIds);

    player.score = runs.total;
    player.fieldNotesScore = fieldNotes;
  }
}

// Utility: Get current game state summary for UI
export function getGameStatus(gameState) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  return {
    phase: gameState.gamePhase,
    currentPlayer: currentPlayer.name,
    currentPlayerIsHuman: currentPlayer.isHuman,
    turnsCompleted: gameState.turnsCompleted,
    totalTurns: gameState.totalTurns,
    cardsInDeck: gameState.deck.length,
    cardsInMarket: gameState.market.length,
    canRefreshMarket: gameState.canRefreshMarket && !gameState.marketRefreshOffered,
    gameOver: gameState.gameOver,
  };
}

// Utility: Get a player's current score preview
export function getPlayerScore(gameState, playerIndex) {
  const player = gameState.players[playerIndex];
  const runs = calculateRunScore(player.grid);
  const fieldNotes = calculateFieldNotesScore(player.grid, gameState.fieldNotes.tickedCardIds);

  return {
    habitatScore: runs.habitatScore,
    dietScore: runs.dietScore,
    runTotal: runs.total,
    fieldNotesScore: fieldNotes,
    total: runs.total + fieldNotes,
  };
}

// Get winner (highest score)
export function getWinner(gameState) {
  if (!gameState.gameOver) {
    return null;
  }

  let maxScore = -1;
  let winners = [];

  for (const player of gameState.players) {
    const totalScore = player.score + player.fieldNotesScore;
    if (totalScore > maxScore) {
      maxScore = totalScore;
      winners = [player];
    } else if (totalScore === maxScore) {
      winners.push(player);
    }
  }

  return {
    players: winners,
    score: maxScore,
    isTie: winners.length > 1,
  };
}
