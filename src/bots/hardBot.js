// Bucket List: Hard AI Bot
// Strategy: extend sequences; minimize damage to existing patterns

import { calculateRunScore } from '../engine/scoring.js';

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

    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ];

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

function cardMatches(card1, card2) {
  return (card1.habitat === card2.habitat ||
          card1.habitat === 'WILD' ||
          card2.habitat === 'WILD' ||
          card1.diet === card2.diet ||
          card1.diet === 'WILD' ||
          card2.diet === 'WILD');
}

function getMatchingNeighbors(card, grid, cellIndex) {
  const matches = { habitat: [], diet: [] };
  const row = Math.floor(cellIndex / 6);
  const col = cellIndex % 6;

  const neighbors = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];

  for (const [nrow, ncol] of neighbors) {
    if (nrow >= 0 && nrow < 5 && ncol >= 0 && ncol < 6) {
      const nidx = nrow * 6 + ncol;
      const neighborCard = grid[nidx];

      if (neighborCard) {
        if (card.habitat === neighborCard.habitat ||
            card.habitat === 'WILD' ||
            neighborCard.habitat === 'WILD') {
          matches.habitat.push(nidx);
        }
        if (card.diet === neighborCard.diet ||
            card.diet === 'WILD' ||
            neighborCard.diet === 'WILD') {
          matches.diet.push(nidx);
        }
      }
    }
  }

  return matches;
}

function countSequenceLength(grid, startIndex, matchesWith) {
  let length = 1;
  const row = Math.floor(startIndex / 6);
  const col = startIndex % 6;

  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  for (const { dr, dc } of directions) {
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < 5 && c >= 0 && c < 6) {
      const idx = r * 6 + c;
      const cell = grid[idx];
      if (cell && cardMatches(cell, matchesWith)) {
        length++;
        r += dr;
        c += dc;
      } else {
        break;
      }
    }
  }

  return length;
}

function calculatePlacementDamage(card, grid, cellIndex) {
  let damage = 0;
  const row = Math.floor(cellIndex / 6);
  const col = cellIndex % 6;

  const neighbors = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];

  for (const [nrow, ncol] of neighbors) {
    if (nrow >= 0 && nrow < 5 && ncol >= 0 && ncol < 6) {
      const nidx = nrow * 6 + ncol;
      const neighborCard = grid[nidx];

      if (neighborCard && !cardMatches(card, neighborCard)) {
        const seqLength = countSequenceLength(grid, nidx, neighborCard);
        damage += seqLength;
      }
    }
  }

  return damage;
}

function countRunExtensionPotential(card, grid, cellIndex) {
  const matches = getMatchingNeighbors(card, grid, cellIndex);
  return matches.habitat.length + matches.diet.length;
}

function getProductivePlacementCells(card, grid, validCells) {
  return validCells.filter(cellIndex => {
    if (grid.every(cell => cell === null)) return true;
    const matches = getMatchingNeighbors(card, grid, cellIndex);
    return matches.habitat.length > 0 || matches.diet.length > 0;
  });
}

function evaluateCardForDraft(card, grid) {
  const validCells = getValidPlacementCells(grid);
  if (validCells.length === 0) return 0;

  const productiveCells = getProductivePlacementCells(card, grid, validCells);
  if (productiveCells.length === 0) return 0;

  const currentScore = calculateRunScore(grid).total;
  let bestDelta = -Infinity;

  for (const cellIndex of productiveCells) {
    const testGrid = [...grid];
    testGrid[cellIndex] = card;
    const newScore = calculateRunScore(testGrid).total;
    const delta = newScore - currentScore;
    bestDelta = Math.max(bestDelta, delta);
  }

  return bestDelta;
}

export function hardDraft(gameState) {
  const market = gameState.market;
  const player = gameState.players[gameState.currentPlayerIndex];
  const grid = player.grid;

  if (market.length === 0) {
    throw new Error('No cards in market');
  }

  let bestIndex = 0;
  let bestScore = -Infinity;

  for (let i = 0; i < market.length; i++) {
    const score = evaluateCardForDraft(market[i], grid);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestIndex;
}

export function hardPlace(gameState, validCells) {
  const player = gameState.players[gameState.currentPlayerIndex];
  const grid = player.grid;
  const card = gameState.pendingCard;
  const currentScore = calculateRunScore(grid).total;

  if (!card || validCells.length === 0) {
    throw new Error('Invalid placement state');
  }

  const productiveCells = getProductivePlacementCells(card, grid, validCells);

  // Try productive placements first
  if (productiveCells.length > 0) {
    let bestCell = productiveCells[0];
    let bestDelta = -Infinity;
    let bestExtensionPotential = 0;

    for (const cellIndex of productiveCells) {
      const testGrid = [...grid];
      testGrid[cellIndex] = card;
      const newScore = calculateRunScore(testGrid).total;
      const delta = newScore - currentScore;
      const extensionPotential = countRunExtensionPotential(card, grid, cellIndex);

      if (delta > bestDelta) {
        bestDelta = delta;
        bestExtensionPotential = extensionPotential;
        bestCell = cellIndex;
      } else if (delta === bestDelta && extensionPotential > bestExtensionPotential) {
        bestExtensionPotential = extensionPotential;
        bestCell = cellIndex;
      } else if (delta === bestDelta && extensionPotential === bestExtensionPotential && cellIndex < bestCell) {
        bestCell = cellIndex;
      }
    }

    return bestCell;
  }

  // No productive placements: minimize damage
  let bestCell = validCells[0];
  let leastDamage = Infinity;

  for (const cellIndex of validCells) {
    const damage = calculatePlacementDamage(card, grid, cellIndex);

    if (damage < leastDamage || (damage === leastDamage && cellIndex < bestCell)) {
      leastDamage = damage;
      bestCell = cellIndex;
    }
  }

  return bestCell;
}
