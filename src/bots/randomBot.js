// Bucket List: Random AI Bot
// Baseline strategy: random decisions

// Pick a random card from the market
export function randomDraft(gameState) {
  const market = gameState.market;
  if (market.length === 0) {
    throw new Error('No cards in market');
  }
  return Math.floor(Math.random() * market.length);
}

// Pick a random valid placement cell
export function randomPlace(gameState, validCells) {
  if (validCells.length === 0) {
    throw new Error('No valid placement cells');
  }
  return validCells[Math.floor(Math.random() * validCells.length)];
}
