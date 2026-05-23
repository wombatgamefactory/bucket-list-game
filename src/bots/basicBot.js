// Bucket List: Heuristic AI Bot
// Strategy: build toward runs, prioritize wild cards

import { getValidPlacementCells } from '../engine/game.js';
import { calculateRunScore } from '../engine/scoring.js';

// Score a card based on how well it extends existing runs
function scoreCard(card, grid) {
  let score = 0;

  // Count adjacent cards that match habitat or diet
  for (let i = 0; i < 30; i++) {
    const existingCard = grid[i];
    if (!existingCard) continue;

    // Check if adjacent (4-adjacent neighbors)
    const row = Math.floor(i / 6);
    const col = i % 6;
    const cardRow = Math.floor(i / 6);
    const cardCol = i % 6;

    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ];

    for (const [nrow, ncol] of neighbors) {
      if (nrow >= 0 && nrow < 5 && ncol >= 0 && ncol < 6) {
        const nidx = nrow * 6 + ncol;
        if (nidx === i) continue;

        const neighborCard = grid[nidx];
        if (neighborCard) {
          // Check habitat match
          if (card.habitat === neighborCard.habitat ||
              card.habitat === 'WILD' ||
              neighborCard.habitat === 'WILD') {
            score += 2;
          }

          // Check diet match
          if (card.diet === neighborCard.diet ||
              card.diet === 'WILD' ||
              neighborCard.diet === 'WILD') {
            score += 2;
          }
        }
      }
    }
  }

  // Wild cards are always valuable
  if (card.habitat === 'WILD' || card.diet === 'WILD') {
    score += 4;
  }

  return score;
}

// Draft strategy: pick the highest-scoring market card
export function basicDraft(gameState) {
  const market = gameState.market;
  const player = gameState.players[gameState.currentPlayerIndex];
  const grid = player.grid;

  if (market.length === 0) {
    throw new Error('No cards in market');
  }

  let bestIndex = 0;
  let bestScore = -Infinity;

  for (let i = 0; i < market.length; i++) {
    const score = scoreCard(market[i], grid);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestIndex;
}

// Placement strategy: pick the cell that maximizes score delta
export function basicPlace(gameState, validCells) {
  const player = gameState.players[gameState.currentPlayerIndex];
  const grid = player.grid;
  const card = gameState.pendingCard;

  if (!card || validCells.length === 0) {
    throw new Error('Invalid placement state');
  }

  // Calculate current score
  const currentScore = calculateRunScore(grid).total;

  let bestCell = validCells[0];
  let bestDelta = -Infinity;

  for (const cellIndex of validCells) {
    // Simulate placement
    const testGrid = [...grid];
    testGrid[cellIndex] = card;

    // Calculate new score
    const newScore = calculateRunScore(testGrid).total;
    const delta = newScore - currentScore;

    // Tiebreak: prefer placing earlier in grid (top-left)
    if (delta > bestDelta || (delta === bestDelta && cellIndex < bestCell)) {
      bestDelta = delta;
      bestCell = cellIndex;
    }
  }

  return bestCell;
}
