// Bucket List: Scoring engine
// Detects runs of 4+ matching cards, calculates scores

// Helper: get card at position in grid
function getCardAt(grid, cellIndex) {
  return grid[cellIndex] || null;
}

// Helper: convert cellIndex to row, col
function indexToRowCol(index) {
  return {
    row: Math.floor(index / 6),
    col: index % 6,
  };
}

// Helper: convert row, col to cellIndex
function rowColToIndex(row, col) {
  return row * 6 + col;
}

// Check if two cards can be part of the same run (both share symbol or one is WILD)
function symbolsMatch(card1Symbol, card2Symbol) {
  if (!card1Symbol || !card2Symbol) return false;
  if (card1Symbol === 'WILD' || card2Symbol === 'WILD') return true;
  return card1Symbol === card2Symbol;
}

// Find all runs of 4+ in a line of cards
// Returns array of { startIdx, length } where length >= 4
function findRunsInLine(cards) {
  const runs = [];
  let currentRun = null;

  for (let i = 0; i < cards.length; i++) {
    if (cards[i] === null) {
      // Empty cell breaks the run
      if (currentRun && currentRun.length >= 4) {
        runs.push(currentRun);
      }
      currentRun = null;
    } else {
      if (!currentRun) {
        currentRun = { startIdx: i, length: 1, symbol: cards[i] };
      } else if (symbolsMatch(currentRun.symbol, cards[i])) {
        currentRun.length += 1;
      } else {
        // Symbol changed, end current run
        if (currentRun.length >= 4) {
          runs.push(currentRun);
        }
        currentRun = { startIdx: i, length: 1, symbol: cards[i] };
      }
    }
  }

  // Don't forget the last run
  if (currentRun && currentRun.length >= 4) {
    runs.push(currentRun);
  }

  return runs;
}

// Score a single line (row or column) by one symbol type
// Returns total points for runs in that line
function scoreLineBySymbol(grid, line, symbolType) {
  const cards = line.map(idx => {
    const card = getCardAt(grid, idx);
    if (!card) return null;
    return symbolType === 'habitat' ? card.habitat : card.diet;
  });

  const runs = findRunsInLine(cards);
  return runs.reduce((sum, run) => sum + (run.length - 3), 0);
}

// Calculate run score for entire grid
export function calculateRunScore(grid) {
  let habitatScore = 0;
  let dietScore = 0;

  // Score each row (5 rows, 6 cells wide)
  for (let row = 0; row < 5; row++) {
    const rowIndices = [];
    for (let col = 0; col < 6; col++) {
      rowIndices.push(rowColToIndex(row, col));
    }
    habitatScore += scoreLineBySymbol(grid, rowIndices, 'habitat');
    dietScore += scoreLineBySymbol(grid, rowIndices, 'diet');
  }

  // Score each column (6 columns, 5 cells tall)
  for (let col = 0; col < 6; col++) {
    const colIndices = [];
    for (let row = 0; row < 5; row++) {
      colIndices.push(rowColToIndex(row, col));
    }
    habitatScore += scoreLineBySymbol(grid, colIndices, 'habitat');
    dietScore += scoreLineBySymbol(grid, colIndices, 'diet');
  }

  return {
    habitatScore,
    dietScore,
    total: habitatScore + dietScore,
  };
}

// Calculate Field Notes bonus
// 1 point for each complete row/column where all cards are ticked
export function calculateFieldNotesScore(grid, tickedCardIds) {
  let bonusScore = 0;

  // Check each row
  for (let row = 0; row < 5; row++) {
    const rowIndices = [];
    for (let col = 0; col < 6; col++) {
      rowIndices.push(rowColToIndex(row, col));
    }

    const rowCards = rowIndices.map(idx => getCardAt(grid, idx));
    const hasEmpty = rowCards.some(card => card === null);
    if (!hasEmpty) {
      // Row is complete, check if all cards are ticked
      const allTicked = rowCards.every(card => tickedCardIds.has(card.id));
      if (allTicked) bonusScore += 1;
    }
  }

  // Check each column
  for (let col = 0; col < 6; col++) {
    const colIndices = [];
    for (let row = 0; row < 5; row++) {
      colIndices.push(rowColToIndex(row, col));
    }

    const colCards = colIndices.map(idx => getCardAt(grid, idx));
    const hasEmpty = colCards.some(card => card === null);
    if (!hasEmpty) {
      // Column is complete, check if all cards are ticked
      const allTicked = colCards.every(card => tickedCardIds.has(card.id));
      if (allTicked) bonusScore += 1;
    }
  }

  return bonusScore;
}

// Get highlighted cells for run visualization
// Returns array of { cellIndex, types: ['habitat', 'diet', or both] }
export function getHighlightedCells(grid) {
  const highlighted = new Map(); // cellIndex -> Set of types

  // Check rows for runs
  for (let row = 0; row < 5; row++) {
    const rowIndices = [];
    for (let col = 0; col < 6; col++) {
      rowIndices.push(rowColToIndex(row, col));
    }

    // Check habitat runs
    const habitatCards = rowIndices.map(idx => getCardAt(grid, idx)?.habitat || null);
    const habitatRuns = findRunsInLine(habitatCards);
    for (const run of habitatRuns) {
      for (let i = 0; i < run.length; i++) {
        const idx = rowIndices[run.startIdx + i];
        if (!highlighted.has(idx)) highlighted.set(idx, new Set());
        highlighted.get(idx).add('habitat');
      }
    }

    // Check diet runs
    const dietCards = rowIndices.map(idx => getCardAt(grid, idx)?.diet || null);
    const dietRuns = findRunsInLine(dietCards);
    for (const run of dietRuns) {
      for (let i = 0; i < run.length; i++) {
        const idx = rowIndices[run.startIdx + i];
        if (!highlighted.has(idx)) highlighted.set(idx, new Set());
        highlighted.get(idx).add('diet');
      }
    }
  }

  // Check columns for runs
  for (let col = 0; col < 6; col++) {
    const colIndices = [];
    for (let row = 0; row < 5; row++) {
      colIndices.push(rowColToIndex(row, col));
    }

    // Check habitat runs
    const habitatCards = colIndices.map(idx => getCardAt(grid, idx)?.habitat || null);
    const habitatRuns = findRunsInLine(habitatCards);
    for (const run of habitatRuns) {
      for (let i = 0; i < run.length; i++) {
        const idx = colIndices[run.startIdx + i];
        if (!highlighted.has(idx)) highlighted.set(idx, new Set());
        highlighted.get(idx).add('habitat');
      }
    }

    // Check diet runs
    const dietCards = colIndices.map(idx => getCardAt(grid, idx)?.diet || null);
    const dietRuns = findRunsInLine(dietCards);
    for (const run of dietRuns) {
      for (let i = 0; i < run.length; i++) {
        const idx = colIndices[run.startIdx + i];
        if (!highlighted.has(idx)) highlighted.set(idx, new Set());
        highlighted.get(idx).add('diet');
      }
    }
  }

  return Array.from(highlighted.entries()).map(([cellIndex, types]) => ({
    cellIndex,
    types: Array.from(types),
  }));
}

// Get preview of current score (for UI display during turn)
export function previewScore(grid, tickedCardIds = new Set()) {
  const runs = calculateRunScore(grid);
  const fieldNotes = calculateFieldNotesScore(grid, tickedCardIds);
  return {
    habitatScore: runs.habitatScore,
    dietScore: runs.dietScore,
    runTotal: runs.total,
    fieldNotesScore: fieldNotes,
    total: runs.total + fieldNotes,
  };
}
