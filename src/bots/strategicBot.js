// Bucket List: Strategic AI Bot
// Core principle: Always extend sequences. Every placement should match a neighbor.
// Strategy adapts by game phase, but productivity always comes first.

import { calculateRunScore } from '../engine/scoring.js';

function getGamePhase(totalCards, cardsPlaced) {
  const percentComplete = cardsPlaced / totalCards;
  if (percentComplete < 0.35) return 'early';
  if (percentComplete < 0.70) return 'mid';
  return 'late';
}

function getValidPlacementCells(grid) {
  const validCells = [];
  const isEmpty = grid.every(cell => cell === null);

  if (isEmpty) {
    for (let i = 0; i < 30; i++) {
      validCells.push(i);
    }
    return validCells;
  }

  for (let i = 0; i < 30; i++) {
    if (grid[i] !== null) continue;
    const row = Math.floor(i / 6);
    const col = i % 6;
    const neighbors = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];

    for (const [nrow, ncol] of neighbors) {
      if (nrow >= 0 && nrow < 5 && ncol >= 0 && ncol < 6) {
        const nidx = nrow * 6 + ncol;
        if (grid[nidx] !== null) {
          validCells.push(i);
          break;
        }
      }
    }
  }
  return validCells;
}

function cardMatches(card1, card2, axis) {
  if (axis === 'habitat') {
    return card1.habitat === card2.habitat || card1.habitat === 'WILD' || card2.habitat === 'WILD';
  }
  if (axis === 'diet') {
    return card1.diet === card2.diet || card1.diet === 'WILD' || card2.diet === 'WILD';
  }
  // Neither axis specified: match on either
  return (card1.habitat === card2.habitat || card1.habitat === 'WILD' || card2.habitat === 'WILD') ||
         (card1.diet === card2.diet || card1.diet === 'WILD' || card2.diet === 'WILD');
}

function getNeighbors(cellIndex) {
  const row = Math.floor(cellIndex / 6);
  const col = cellIndex % 6;
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];
}

function getNeighborCards(cellIndex, grid) {
  const neighbors = getNeighbors(cellIndex);
  const cards = [];

  for (const [nrow, ncol] of neighbors) {
    if (nrow >= 0 && nrow < 5 && ncol >= 0 && ncol < 6) {
      const nidx = nrow * 6 + ncol;
      if (grid[nidx] !== null) {
        cards.push({ card: grid[nidx], index: nidx });
      }
    }
  }
  return cards;
}

// Count how long a sequence extends in one direction
function countSequenceInDirection(grid, cellIndex, card, axis, dr, dc) {
  let count = 0;
  let row = Math.floor(cellIndex / 6) + dr;
  let col = cellIndex % 6 + dc;

  while (row >= 0 && row < 5 && col >= 0 && col < 6) {
    const idx = row * 6 + col;
    const cell = grid[idx];
    if (cell && cardMatches(cell, card, axis)) {
      count++;
      row += dr;
      col += dc;
    } else {
      break;
    }
  }
  return count;
}

// Measure a sequence: count total matching cards (including the test card)
function measureSequence(testGrid, cellIndex, card, axis) {
  let total = 1;
  const directions = axis === 'habitat'
    ? [[-1, 0], [1, 0]]  // vertical for habitat
    : [[0, -1], [0, 1]]; // horizontal for diet

  for (const [dr, dc] of directions) {
    total += countSequenceInDirection(testGrid, cellIndex, card, axis, dr, dc);
  }
  return total;
}

// Is this placement immediately productive (extends habitat or diet)?
function isProductive(card, grid, cellIndex) {
  const neighbors = getNeighborCards(cellIndex, grid);
  return neighbors.length > 0 && neighbors.some(n => cardMatches(card, n.card));
}

// Count how many neighbors this placement would extend
function countExtendedNeighbors(card, grid, cellIndex) {
  const neighbors = getNeighborCards(cellIndex, grid);
  return neighbors.filter(n => cardMatches(card, n.card)).length;
}

// Evaluate a placement on the core hierarchy
function evaluatePlacement(card, grid, cellIndex, gamePhase) {
  const testGrid = [...grid];
  testGrid[cellIndex] = card;

  // ===== TIER 1: PRODUCTIVITY (Always prioritize) =====
  const productive = isProductive(card, grid, cellIndex);
  if (!productive) {
    // Non-productive placement: only acceptable in early game for flexibility
    if (gamePhase === 'early') {
      // Prefer center cells for future connectivity
      const row = Math.floor(cellIndex / 6);
      const col = cellIndex % 6;
      const distance = Math.abs(row - 2.5) + Math.abs(col - 2.5);
      return 10 + (10 - distance); // Lower distance = higher score
    }
    // Mid/late game: non-productive is bad
    return -1000;
  }

  // ===== TIER 2: SEQUENCE QUALITY (Immediate > Imminent > Potential) =====
  const newScore = calculateRunScore(testGrid).total;
  const oldScore = calculateRunScore(grid).total;
  const scoreDelta = newScore - oldScore;

  let baseScore = 500; // Start high for all productive placements

  // Immediate: completes a 4-run (+1 point now)
  if (scoreDelta > 0) {
    baseScore += 500 + (scoreDelta * 100);
    return baseScore;
  }

  // Imminent: creates a 3-run (will likely score next turn)
  // Check if this placement creates a sequence of length 3+
  const neighbors = getNeighborCards(cellIndex, grid);
  let createsThreeRun = false;

  for (const { card: neighborCard } of neighbors) {
    if (cardMatches(card, neighborCard, 'habitat')) {
      const seqLen = measureSequence(testGrid, cellIndex, card, 'habitat');
      if (seqLen >= 3) {
        createsThreeRun = true;
        baseScore += 200 + (seqLen * 20);
      }
    }
    if (cardMatches(card, neighborCard, 'diet')) {
      const seqLen = measureSequence(testGrid, cellIndex, card, 'diet');
      if (seqLen >= 3) {
        createsThreeRun = true;
        baseScore += 200 + (seqLen * 20);
      }
    }
  }

  // Potential: extends existing sequences (2-run)
  const extendedCount = countExtendedNeighbors(card, grid, cellIndex);
  baseScore += 100 + (extendedCount * 30);

  // ===== TIER 3: PHASE-SPECIFIC ADJUSTMENTS =====
  if (gamePhase === 'early') {
    // Early game: prefer flexibility (spread out)
    // Avoid densifying around one cluster
    const filledNeighbors = getNeighborCards(cellIndex, grid).length;
    if (filledNeighbors <= 1) {
      baseScore += 50; // Prefer cells with fewer neighbors (more spread)
    } else {
      baseScore -= 30; // Penalize adding to already-dense areas
    }
  } else if (gamePhase === 'late') {
    // Late game: prioritize sure wins
    // 3-runs are now critical
    if (createsThreeRun || extendedCount > 1) {
      baseScore += 100;
    }
  }

  // Wildcard bonus: versatile, worth a small premium
  if (card.habitat === 'WILD' || card.diet === 'WILD') {
    baseScore += 10;
  }

  return baseScore;
}

function evaluateCardForDraft(card, grid, gamePhase) {
  const validCells = getValidPlacementCells(grid);
  if (validCells.length === 0) return 0;

  let bestScore = -Infinity;
  for (const cellIndex of validCells) {
    const score = evaluatePlacement(card, grid, cellIndex, gamePhase);
    bestScore = Math.max(bestScore, score);
  }

  // Wildcard draft bonus: always valuable
  if (card.habitat === 'WILD' || card.diet === 'WILD') {
    bestScore += 20;
  }

  return bestScore;
}

export function strategicDraft(gameState) {
  const market = gameState.market;
  const player = gameState.players[gameState.currentPlayerIndex];
  const grid = player.grid;
  const totalCards = 20;
  const cardsPlaced = grid.filter(cell => cell !== null).length;
  const gamePhase = getGamePhase(totalCards, cardsPlaced);

  if (market.length === 0) {
    throw new Error('No cards in market');
  }

  let bestIndex = 0;
  let bestScore = -Infinity;

  for (let i = 0; i < market.length; i++) {
    const score = evaluateCardForDraft(market[i], grid, gamePhase);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestIndex;
}

export function strategicPlace(gameState, validCells) {
  const player = gameState.players[gameState.currentPlayerIndex];
  const grid = player.grid;
  const card = gameState.pendingCard;
  const totalCards = 20;
  const cardsPlaced = grid.filter(cell => cell !== null).length;
  const gamePhase = getGamePhase(totalCards, cardsPlaced);

  if (!card || validCells.length === 0) {
    throw new Error('Invalid placement state');
  }

  let bestCell = validCells[0];
  let bestScore = -Infinity;

  for (const cellIndex of validCells) {
    const score = evaluatePlacement(card, grid, cellIndex, gamePhase);
    if (score > bestScore) {
      bestScore = score;
      bestCell = cellIndex;
    }
  }

  return bestCell;
}
