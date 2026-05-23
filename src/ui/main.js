// Bucket List: Main Game Flow
// Orchestrates setup, gameplay, and UI updates

import { createGame, draftCard, placeCard, refreshMarket, getValidPlacementCells, getWinner, getGameStatus } from '../engine/game.js';
import { renderSetupScreen, renderGameScreen, renderEndScreen, updateMarketDisplay, updateGridDisplay, updateScoreDisplay, updateDeckInfo } from './board.js';
import { randomDraft, randomPlace } from '../bots/randomBot.js';
import { basicDraft, basicPlace } from '../bots/basicBot.js';
import { hardDraft, hardPlace } from '../bots/hardBot.js';
import { expertDraft, expertPlace } from '../bots/expertBot.js';
import { strategicDraft, strategicPlace } from '../bots/strategicBot.js';

const app = document.getElementById('app');
let gameState = null;
let undoStack = [];
let gameStartTime = null;

// Processing time in ms for each difficulty (each doubles)
const PROCESSING_TIMES = {
  'easy': 800,
  'medium': 1600,
  'hard': 3200,
  'expert': 6400,
  'strategic': 4800,
};

function getProcessingTime(difficulty) {
  return PROCESSING_TIMES[difficulty] || 1000;
}

// Helper function to restore Sets after JSON deserialization
function restoreGameState(state) {
  if (state && state.fieldNotes && state.fieldNotes.tickedCardIds) {
    const tickedIds = state.fieldNotes.tickedCardIds;
    // Convert whatever format it is (array, object, or Set) into a Set
    if (tickedIds instanceof Set) {
      // Already a Set, no conversion needed
      return state;
    } else if (Array.isArray(tickedIds)) {
      // It's an array, convert to Set
      state.fieldNotes.tickedCardIds = new Set(tickedIds);
    } else if (typeof tickedIds === 'object' && tickedIds !== null) {
      // It's an object (from JSON), extract the values as an array
      state.fieldNotes.tickedCardIds = new Set(Object.values(tickedIds));
    }
  }
  return state;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderSetupScreen(app, onGameStart);
});

// Game start handler
function onGameStart(config) {
  gameState = createGame(config.playerConfigs, config.fieldNotesCount, config.deck || 'australian');
  gameStartTime = Date.now();

  // Fire analytics event
  gtag?.('event', 'game_start', {
    player_count: config.playerConfigs.length,
    ai_players: config.playerConfigs.filter(p => !p.isHuman).length,
    ai_difficulties: config.playerConfigs.filter(p => !p.isHuman).map(p => p.aiDifficulty).join(','),
    field_notes_enabled: config.fieldNotesCount > 0,
    deck: config.deck || 'australian',
  });

  startGameLoop();
}

// Helper: save scroll positions of all scrollable elements in player areas
function saveScrollPositions() {
  const positions = {};
  // Check all player cells for any scrollable elements
  for (let i = 0; i < 4; i++) {
    const playerCell = document.getElementById(`playerCell${i}`);
    if (!playerCell) continue;

    // Save the player cell's scroll position
    if (playerCell.scrollLeft > 0 || playerCell.scrollTop > 0) {
      positions[`playerCell${i}`] = {
        scrollLeft: playerCell.scrollLeft,
        scrollTop: playerCell.scrollTop
      };
    }

    // Also check for any grid elements that might be scrolling
    const grid = playerCell.querySelector('.bl-grid');
    if (grid && (grid.scrollLeft > 0 || grid.scrollTop > 0)) {
      positions[`grid${i}`] = {
        scrollLeft: grid.scrollLeft,
        scrollTop: grid.scrollTop
      };
    }
  }
  return positions;
}

// Helper: restore scroll positions after re-render
function restoreScrollPositions(positions) {
  for (const [key, scroll] of Object.entries(positions)) {
    let element;

    if (key.startsWith('playerCell')) {
      element = document.getElementById(key);
    } else if (key.startsWith('grid')) {
      const cellIndex = key.replace('grid', '');
      const playerCell = document.getElementById(`playerCell${cellIndex}`);
      element = playerCell ? playerCell.querySelector('.bl-grid') : null;
    }

    if (element) {
      element.scrollLeft = scroll.scrollLeft;
      element.scrollTop = scroll.scrollTop;
    }
  }
}

// Main game loop
function startGameLoop() {
  function updateDisplay() {
    const container = app;
    const scrollPositions = saveScrollPositions();

    if (gameState.gamePhase === 'gameover') {
      renderEndScreen(container, gameState, onRematch);
    } else {
      renderGameScreen(container, gameState, {
        onDraftCard: onHumanDraft,
        onPlaceCard: onHumanPlace,
        getValidPlacementCells: () => getValidPlacementCells(gameState),
        onRefreshMarket: onHumanRefreshMarket,
        onCancel: onHumanCancel,
      });
    }

    // Restore scroll position - use multiple attempts to ensure it sticks
    requestAnimationFrame(() => {
      restoreScrollPositions(scrollPositions);
      // Set again after a short delay to ensure it persists
      setTimeout(() => {
        restoreScrollPositions(scrollPositions);
      }, 10);
    });
  }

  updateDisplay();

  function showProcessingIndicator(difficulty) {
    const processingTime = getProcessingTime(difficulty);
    const startTime = Date.now();

    return new Promise(resolve => {
      const updateProgress = () => {
        const indicator = app.querySelector('#processingIndicator');
        const progressFill = app.querySelector('#progressFill');
        const progressPercent = app.querySelector('#progressPercent');

        if (indicator && progressFill && progressPercent) {
          indicator.style.display = 'block';
          const elapsed = Date.now() - startTime;
          const progress = Math.min(100, (elapsed / processingTime) * 100);
          progressFill.style.width = progress + '%';
          progressPercent.textContent = Math.floor(progress);
        }

        const elapsed = Date.now() - startTime;
        if (elapsed >= processingTime) {
          const indicator = app.querySelector('#processingIndicator');
          if (indicator) {
            indicator.style.display = 'none';
          }
          resolve();
        } else {
          requestAnimationFrame(updateProgress);
        }
      };

      updateProgress();
    });
  }

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
        const processingTime = getProcessingTime(aiDifficulty);
        let draftPromise = null;

        // Only show indicator for delays >= 1 second
        if (processingTime >= 1000) {
          draftPromise = showProcessingIndicator(aiDifficulty);
        } else {
          // Short delay without indicator
          draftPromise = new Promise(r => setTimeout(r, processingTime));
        }

        let cardIndex;
        if (aiDifficulty === 'strategic') {
          cardIndex = strategicDraft(gameState);
        } else if (aiDifficulty === 'expert') {
          cardIndex = expertDraft(gameState);
        } else if (aiDifficulty === 'hard') {
          cardIndex = hardDraft(gameState);
        } else if (aiDifficulty === 'medium') {
          cardIndex = basicDraft(gameState);
        } else {
          cardIndex = randomDraft(gameState);
        }

        draftCard(gameState, cardIndex);
        updateDisplay();
        await draftPromise;
      }

      // Place phase (instant, no processing indicator needed)
      if (gameState.gamePhase === 'place') {
        const validCells = getValidPlacementCells(gameState);
        let cellIndex;

        if (aiDifficulty === 'strategic') {
          cellIndex = strategicPlace(gameState, validCells);
        } else if (aiDifficulty === 'expert') {
          cellIndex = expertPlace(gameState, validCells);
        } else if (aiDifficulty === 'hard') {
          cellIndex = hardPlace(gameState, validCells);
        } else if (aiDifficulty === 'medium') {
          cellIndex = basicPlace(gameState, validCells);
        } else {
          cellIndex = randomPlace(gameState, validCells);
        }

        placeCard(gameState, cellIndex);
        updateDisplay();
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

  function onHumanCancel() {
    // Undo the draft action to go back to draft phase
    if (undoStack.length > 0) {
      gameState = restoreGameState(undoStack.pop());
      updateDisplay();
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
  gameState = restoreGameState(undoStack.pop());
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
