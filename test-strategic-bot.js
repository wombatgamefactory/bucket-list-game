// Test script to validate Strategic bot productivity and scoring
// Run with: node test-strategic-bot.js

import { createGame, draftCard, placeCard, getValidPlacementCells } from './src/engine/game.js';
import { strategicDraft, strategicPlace } from './src/bots/strategicBot.js';
import { expertDraft, expertPlace } from './src/bots/expertBot.js';
import { hardDraft, hardPlace } from './src/bots/hardBot.js';

function simulateGame(playerConfigs) {
  const gameState = createGame(playerConfigs, 0, 'australian');
  const startTime = Date.now();

  while (!gameState.gameOver) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Draft phase
    if (gameState.gamePhase === 'draft') {
      let cardIndex;
      if (currentPlayer.aiDifficulty === 'strategic') {
        cardIndex = strategicDraft(gameState);
      } else if (currentPlayer.aiDifficulty === 'expert') {
        cardIndex = expertDraft(gameState);
      } else if (currentPlayer.aiDifficulty === 'hard') {
        cardIndex = hardDraft(gameState);
      }
      draftCard(gameState, cardIndex);
    }

    // Place phase
    if (gameState.gamePhase === 'place') {
      const validCells = getValidPlacementCells(gameState);
      let cellIndex;
      if (currentPlayer.aiDifficulty === 'strategic') {
        cellIndex = strategicPlace(gameState, validCells);
      } else if (currentPlayer.aiDifficulty === 'expert') {
        cellIndex = expertPlace(gameState, validCells);
      } else if (currentPlayer.aiDifficulty === 'hard') {
        cellIndex = hardPlace(gameState, validCells);
      }
      placeCard(gameState, cellIndex);
    }
  }

  const duration = Date.now() - startTime;
  return {
    scores: gameState.players.map(p => ({ name: p.name, score: p.score })),
    grids: gameState.players.map(p => p.grid.filter(c => c !== null).length),
    duration,
  };
}

console.log('🧪 Testing Strategic Bot Productivity\n');
console.log('Running 5 games: Strategic vs Expert (2-player games)\n');

const results = [];
for (let game = 1; game <= 5; game++) {
  console.log(`Game ${game}: Strategic (AI) vs Expert (AI)`);
  const result = simulateGame([
    { name: 'Strategic', isHuman: false, aiDifficulty: 'strategic' },
    { name: 'Expert', isHuman: false, aiDifficulty: 'expert' },
  ]);

  console.log(`  Strategic: ${result.scores[0].score} pts (${result.grids[0]} cards)`);
  console.log(`  Expert:    ${result.scores[1].score} pts (${result.grids[1]} cards)`);
  console.log(`  Time: ${result.duration}ms\n`);
  results.push(result);
}

console.log('📊 Summary:\n');
const strategicScores = results.map(r => r.scores[0].score);
const expertScores = results.map(r => r.scores[1].score);
const strategicAvg = strategicScores.reduce((a, b) => a + b) / strategicScores.length;
const expertAvg = expertScores.reduce((a, b) => a + b) / expertScores.length;

console.log(`Strategic average score: ${strategicAvg.toFixed(1)}`);
console.log(`Expert average score:    ${expertAvg.toFixed(1)}\n`);

if (strategicAvg > 5 && expertAvg > 5) {
  console.log('✅ Both bots are producing reasonable scores (5+)');
} else {
  console.log('⚠️  Low scores detected - may need further debugging');
}

if (strategicAvg >= expertAvg * 0.9) {
  console.log('✅ Strategic bot is competitive with Expert');
} else {
  console.log('⚠️  Strategic bot scoring significantly lower than Expert');
}
