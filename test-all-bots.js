// Comprehensive bot comparison test
// Tests Strategic vs all existing bots

import { createGame, draftCard, placeCard, getValidPlacementCells } from './src/engine/game.js';
import { strategicDraft, strategicPlace } from './src/bots/strategicBot.js';
import { expertDraft, expertPlace } from './src/bots/expertBot.js';
import { hardDraft, hardPlace } from './src/bots/hardBot.js';
import { basicDraft, basicPlace } from './src/bots/basicBot.js';

function playBot(gameState, bot) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  if (bot === 'strategic') {
    if (gameState.gamePhase === 'draft') return strategicDraft(gameState);
    else return strategicPlace(gameState, getValidPlacementCells(gameState));
  } else if (bot === 'expert') {
    if (gameState.gamePhase === 'draft') return expertDraft(gameState);
    else return expertPlace(gameState, getValidPlacementCells(gameState));
  } else if (bot === 'hard') {
    if (gameState.gamePhase === 'draft') return hardDraft(gameState);
    else return hardPlace(gameState, getValidPlacementCells(gameState));
  } else if (bot === 'basic') {
    if (gameState.gamePhase === 'draft') return basicDraft(gameState);
    else return basicPlace(gameState, getValidPlacementCells(gameState));
  }
}

function simulateGame(bot1, bot2) {
  const gameState = createGame(
    [
      { name: bot1.charAt(0).toUpperCase() + bot1.slice(1), isHuman: false, aiDifficulty: bot1 },
      { name: bot2.charAt(0).toUpperCase() + bot2.slice(1), isHuman: false, aiDifficulty: bot2 },
    ],
    0,
    'australian'
  );

  while (!gameState.gameOver) {
    if (gameState.gamePhase === 'draft') {
      const cardIndex = playBot(gameState, gameState.players[gameState.currentPlayerIndex].aiDifficulty);
      draftCard(gameState, cardIndex);
    } else if (gameState.gamePhase === 'place') {
      const cellIndex = playBot(gameState, gameState.players[gameState.currentPlayerIndex].aiDifficulty);
      placeCard(gameState, cellIndex);
    }
  }

  return {
    player1: gameState.players[0].score,
    player2: gameState.players[1].score,
  };
}

console.log('🤖 Comprehensive Bot Comparison\n');
console.log('Testing each bot against each other (3 games per matchup)\n');

const bots = ['strategic', 'expert', 'hard', 'basic'];
const results = {};

for (const bot1 of bots) {
  for (const bot2 of bots) {
    if (bot1 >= bot2) continue; // Only test each pair once

    const matchup = `${bot1} vs ${bot2}`;
    const scores = [];

    for (let i = 0; i < 3; i++) {
      const game = simulateGame(bot1, bot2);
      scores.push({ [bot1]: game.player1, [bot2]: game.player2 });
    }

    const avg1 = scores.reduce((sum, s) => sum + s[bot1], 0) / 3;
    const avg2 = scores.reduce((sum, s) => sum + s[bot2], 0) / 3;
    const wins1 = scores.filter(s => s[bot1] > s[bot2]).length;

    console.log(`${matchup}:`);
    console.log(`  ${bot1}: ${avg1.toFixed(1)} avg (${wins1}/3 wins)`);
    console.log(`  ${bot2}: ${avg2.toFixed(1)} avg (${3 - wins1}/3 wins)`);
    console.log();

    results[matchup] = { [bot1]: avg1, [bot2]: avg2 };
  }
}

// Calculate overall ranking
const scores = {};
for (const bot of bots) scores[bot] = 0;

for (const matchup in results) {
  const [bot1, bot2] = matchup.split(' vs ');
  const score1 = results[matchup][bot1];
  const score2 = results[matchup][bot2];
  scores[bot1] += score1;
  scores[bot2] += score2;
}

console.log('📊 Overall Rankings (by total score across all matchups):\n');
const ranking = Object.entries(scores).sort((a, b) => b[1] - a[1]);
ranking.forEach((entry, idx) => {
  console.log(`${idx + 1}. ${entry[0].toUpperCase()}: ${entry[1].toFixed(1)} points`);
});
