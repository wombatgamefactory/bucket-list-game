// Bucket List: Main Game Flow
// Orchestrates setup, gameplay, and UI updates

import { createGame, draftCard, placeCard, refreshMarket, getValidPlacementCells, getWinner, getGameStatus } from '../engine/game.js';
import { renderSetupScreen, renderGameScreen, renderEndScreen, updateMarketDisplay, updateGridDisplay, updateScoreDisplay, updateDeckInfo } from './board.js';
import { randomDraft, randomPlace } from '../bots/randomBot.js';
import { basicDraft, basicPlace } from '../bots/basicBot.js';

const app = document.getElementById('app');
let gameState = null;
let undoStack = [];
let gameStartTime = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderSetupScreen(app, onGameStart);
});

// Game start handler
function onGameStart(config) {
  gameState = createGame(config.playerConfigs, config.fieldNotesCount);
  gameStartTime = Date.now();

  // Fire analytics event
  gtag?.('event', 'game_start', {
    player_count: config.playerConfigs.length,
    ai_players: config.playerConfigs.filter(p => !p.isHuman).length,
    ai_difficulties: config.playerConfigs.filter(p => !p.isHuman).map(p => p.aiDifficulty).join(','),
    field_notes_enabled: config.fieldNotesCount > 0,
  });

  startGameLoop();
}

// Main game loop
function startGameLoop() {
  function updateDisplay() {
    const container = app;
    if (gameState.gamePhase === 'gameover') {
      renderEndScreen(container, gameState, onRematch);
    } else {
      renderGameScreen(container, gameState, {
        onDraftCard: onHumanDraft,
        onPlaceCard: onHumanPlace,
        getValidPlacementCells: () => getValidPlacementCells(gameState),
        onRefreshMarket: onHumanRefreshMarket,
      });
    }
  }

  updateDisplay();

  async function autoPlayNextTurn() {
    while (!gameState.gameOver) {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      // Check if it's a human player's turn
      if (currentPlayer.isHuman) {
        break; // Wait for human input
      }

      // AI turn
      updateDisplay();
      await new Promise(r => setTimeout(r, 500));

      const aiDifficulty = currentPlayer.aiDifficulty;

      // Draft phase
      if (gameState.gamePhase === 'draft') {
        const cardIndex = aiDifficulty === 'basic'
          ? basicDraft(gameState)
          : randomDraft(gameState);

        draftCard(gameState, cardIndex);
        updateDisplay();
        await new Promise(r => setTimeout(r, 800));
      }

      // Place phase
      if (gameState.gamePhase === 'place') {
        const validCells = getValidPlacementCells(gameState);
        const cellIndex = aiDifficulty === 'basic'
          ? basicPlace(gameState, validCells)
          : randomPlace(gameState, validCells);

        placeCard(gameState, cellIndex);
        updateDisplay();
        await new Promise(r => setTimeout(r, 600));
      }
    }

    // If game is over, show end screen
    if (gameState.gameOver) {
      const duration = Math.round((Date.now() - gameStartTime) / 1000);
      const winner = getWinner(gameState);

      gtag?.('event', 'game_complete', {
        duration_seconds: duration,
        winner_name: winner.players[0].name,
        winner_score: winner.score,
        player_count: gameState.players.length,
      });

      updateDisplay();
    }
  }

  function onHumanDraft(cardIndex) {
    if (gameState.gamePhase !== 'draft') return;

    // Snapshot for undo
    pushUndoSnapshot();

    try {
      draftCard(gameState, cardIndex);
      gameState.marketRefreshOffered = true; // Mark refresh as offered
      updateDisplay();

      // After a brief delay, auto-advance if next phase is complete
      setTimeout(() => {
        if (gameState.gamePhase === 'place' && gameState.gameOver) {
          autoPlayNextTurn();
        }
      }, 100);
    } catch (e) {
      console.error('Draft error:', e);
      popUndoSnapshot();
    }
  }

  function onHumanPlace(cellIndex) {
    if (gameState.gamePhase !== 'place') return;

    try {
      placeCard(gameState, cellIndex);
      updateDisplay();

      // Auto-advance to next turn
      setTimeout(() => {
        autoPlayNextTurn();
      }, 100);
    } catch (e) {
      console.error('Place error:', e);
      alert('Invalid placement: ' + e.message);
    }
  }

  function onHumanRefreshMarket() {
    if (!gameState.canRefreshMarket) return;

    try {
      refreshMarket(gameState);
      gameState.marketRefreshOffered = true;
      updateDisplay();
    } catch (e) {
      console.error('Refresh error:', e);
    }
  }

  function onRematch() {
    renderSetupScreen(app, onGameStart);
  }

  // Start the game loop
  autoPlayNextTurn();
}

function pushUndoSnapshot() {
  undoStack.push(JSON.parse(JSON.stringify(gameState)));
}

function popUndoSnapshot() {
  if (undoStack.length === 0) return;
  gameState = undoStack.pop();
  const container = app;
  renderGameScreen(container, gameState, {
    onDraftCard: () => {},
    onPlaceCard: () => {},
    getValidPlacementCells: () => getValidPlacementCells(gameState),
    onRefreshMarket: () => {},
  });
}

// Global analytics function (no-op if GA not loaded)
window.gtag = window.gtag || function() {};
