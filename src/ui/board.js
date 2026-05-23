// Bucket List: Board Rendering
// All DOM manipulation (only file that touches DOM)

import { renderMarketCard, renderGridCard } from './cardRenderer.js';
import { getPlayerScore, getWinner } from '../engine/game.js';
import { getHighlightedCells } from '../engine/scoring.js';

// Render the setup screen
export function renderSetupScreen(container, onStart) {
  container.innerHTML = `
    <div class="bl-screen bl-setup-screen">
      <div class="bl-setup-form">
        <h1>🐦 Bucket List</h1>
        <p class="subtitle">Australian Birds</p>
        <p style="color: var(--color-text-muted); margin-bottom: 2rem; font-size: 14px;">
          Draft birds, build your grid, score runs of 4.
        </p>

        <div class="form-group">
          <label for="playerName">Your Name</label>
          <input type="text" id="playerName" placeholder="Player" value="You">
        </div>

        <div class="form-group">
          <label for="aiDifficulty">AI Opponents</label>
          <select id="aiDifficulty">
            <option value="none">None (solo)</option>
            <option value="random">1 × Easy (Random)</option>
            <option value="easy-hard">1 × Medium (Heuristic)</option>
            <option value="two-easy">2 × Easy</option>
            <option value="two-hard">2 × Medium</option>
            <option value="three-easy">3 × Easy</option>
          </select>
        </div>

        <div class="form-group">
          <label for="fieldNotesToggle">Field Notes (Long-term bird ticking)</label>
          <div style="display: flex; gap: 8px; align-items: center; margin-top: 8px;">
            <input type="checkbox" id="fieldNotesToggle" checked>
            <label for="fieldNotesToggle" style="margin: 0; font-weight: normal;">Enable for this game</label>
          </div>
        </div>

        <div class="form-group" id="fieldNotesCountGroup">
          <label for="fieldNotesCount">How many Australian birds have you seen? (0–100)</label>
          <input type="range" id="fieldNotesCount" min="0" max="100" value="25">
          <span class="slider-value" id="countDisplay">25 birds ticked</span>
          <p class="form-hint">We'll randomly mark that many cards as ticked.</p>
        </div>

        <div class="button-row">
          <button class="btn btn-primary" id="startButton">Start Game</button>
        </div>
      </div>
    </div>
  `;

  // Event listeners
  const startButton = container.querySelector('#startButton');
  const fieldNotesToggle = container.querySelector('#fieldNotesToggle');
  const fieldNotesCountGroup = container.querySelector('#fieldNotesCountGroup');
  const fieldNotesCount = container.querySelector('#fieldNotesCount');
  const countDisplay = container.querySelector('#countDisplay');

  fieldNotesToggle.addEventListener('change', () => {
    fieldNotesCountGroup.style.display = fieldNotesToggle.checked ? 'block' : 'none';
  });

  fieldNotesCount.addEventListener('input', () => {
    countDisplay.textContent = `${fieldNotesCount.value} birds ticked`;
  });

  startButton.addEventListener('click', () => {
    const playerName = container.querySelector('#playerName').value || 'You';
    const aiDifficultyStr = container.querySelector('#aiDifficulty').value;
    const enableFieldNotes = fieldNotesToggle.checked;
    const fieldNotesCountValue = parseInt(fieldNotesCount.value);

    const playerConfigs = [
      { name: playerName, isHuman: true, aiDifficulty: null }
    ];

    // Parse AI difficulty string
    if (aiDifficultyStr !== 'none') {
      let aiDifficulty = 'random';
      let aiCount = 1;

      if (aiDifficultyStr === 'easy-hard' || aiDifficultyStr.includes('hard')) {
        aiDifficulty = 'basic';
      }
      if (aiDifficultyStr.includes('two')) {
        aiCount = 2;
      } else if (aiDifficultyStr.includes('three')) {
        aiCount = 3;
      }

      for (let i = 0; i < aiCount; i++) {
        playerConfigs.push({
          name: `AI ${i + 1}`,
          isHuman: false,
          aiDifficulty,
        });
      }
    }

    onStart({
      playerConfigs,
      fieldNotesCount: enableFieldNotes ? fieldNotesCountValue : 0,
    });
  });
}

// Render the main game screen
export function renderGameScreen(container, gameState, handlers) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const scoreLiveData = getPlayerScore(gameState, gameState.currentPlayerIndex);

  container.innerHTML = `
    <div class="bl-screen bl-game-screen">
      <div class="bl-header">
        <h2>🐦 Bucket List: Australian Birds</h2>
        <div class="bl-score-display">Score: ${scoreLiveData.total}</div>
      </div>

      <div class="bl-game-container">
        <!-- Market -->
        <div class="bl-market">
          <div class="bl-market-title">Market</div>
          <div class="bl-market-cards" id="marketContainer"></div>
          <div class="bl-deck-info">
            Deck: ${gameState.deck.length}<br>
            Market: ${gameState.market.length}
          </div>
          ${gameState.gamePhase === 'draft' && gameState.canRefreshMarket && !gameState.marketRefreshOffered ? `
            <button class="btn btn-secondary btn-small" id="refreshButton">Refresh Market</button>
          ` : ''}
        </div>

        <!-- Player Grid -->
        <div class="bl-player-section">
          <div class="bl-grid-title">Your 6×5 Grid</div>
          <div class="bl-grid" id="gridContainer"></div>
        </div>

        <!-- Info Panel -->
        <div class="bl-info-panel">
          <div class="bl-info-section">
            <div class="bl-info-section-title">Phase</div>
            <div class="bl-info-value" style="text-transform: capitalize;">
              ${gameState.gamePhase === 'draft' ? '📋 Draft' : '📍 Place'}
            </div>
          </div>

          <div class="bl-info-section">
            <div class="bl-info-section-title">Progress</div>
            <div class="bl-info-value">${gameState.turnsCompleted} / 20</div>
          </div>

          <div class="bl-info-section">
            <div class="bl-info-section-title">Score Breakdown</div>
            <div class="bl-score-breakdown">
              <div class="bl-score-line">
                <span class="bl-score-label">Habitat Runs:</span>
                <span>${scoreLiveData.habitatScore}</span>
              </div>
              <div class="bl-score-line">
                <span class="bl-score-label">Diet Runs:</span>
                <span>${scoreLiveData.dietScore}</span>
              </div>
              ${gameState.fieldNotes.enabled ? `
                <div class="bl-score-line">
                  <span class="bl-score-label">Field Notes:</span>
                  <span>${scoreLiveData.fieldNotesScore}</span>
                </div>
              ` : ''}
              <div class="bl-score-line" style="border-top: 1px solid var(--color-border); padding-top: 8px; margin-top: 8px; font-weight: 600;">
                <span>Total:</span>
                <span>${scoreLiveData.total}</span>
              </div>
            </div>
          </div>

          ${currentPlayer.isHuman === false ? `
            <div class="bl-info-section">
              <div style="text-align: center; padding: 16px; background: #F0F8F5; border-radius: 6px;">
                🤖 AI is thinking...
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // Render market cards
  const marketContainer = container.querySelector('#marketContainer');
  gameState.market.forEach((card, index) => {
    const isTicked = gameState.fieldNotes.tickedCardIds.has(card.id);
    const cardHtml = renderMarketCard(card, index, isTicked);
    const cardElement = document.createElement('div');
    cardElement.innerHTML = cardHtml;
    const cardEl = cardElement.firstElementChild;

    if (gameState.gamePhase === 'draft') {
      cardEl.addEventListener('click', () => handlers.onDraftCard(index));
    }

    marketContainer.appendChild(cardEl);
  });

  // Render player grid
  const gridContainer = container.querySelector('#gridContainer');
  const highlighted = getHighlightedCells(gameState.players[gameState.currentPlayerIndex].grid);
  const highlightedSet = new Set(highlighted.map(h => JSON.stringify({ idx: h.cellIndex, types: h.types })));

  for (let i = 0; i < 30; i++) {
    const cell = document.createElement('div');
    const card = gameState.players[gameState.currentPlayerIndex].grid[i];

    if (card) {
      const isTicked = gameState.fieldNotes.tickedCardIds.has(card.id);
      const cardHtml = renderGridCard(card, isTicked);
      cell.innerHTML = cardHtml;
      cell.classList.add('bl-grid-cell', 'has-card');

      // Check for highlighting
      const key = JSON.stringify({ idx: i, types: ['habitat'] });
      const key2 = JSON.stringify({ idx: i, types: ['diet'] });
      const key3 = JSON.stringify({ idx: i, types: ['habitat', 'diet'] });

      const highlightedEntry = highlighted.find(h => h.cellIndex === i);
      if (highlightedEntry) {
        if (highlightedEntry.types.includes('habitat') && highlightedEntry.types.includes('diet')) {
          cell.classList.add('highlighted-both');
        } else if (highlightedEntry.types.includes('diet')) {
          cell.classList.add('highlighted-diet');
        } else if (highlightedEntry.types.includes('habitat')) {
          cell.classList.add('highlighted-habitat');
        }
      }
    } else {
      cell.classList.add('bl-grid-cell');
      if (gameState.gamePhase === 'place') {
        const validCells = handlers.getValidPlacementCells();
        if (validCells.includes(i)) {
          cell.classList.add('valid-placement');
          cell.addEventListener('click', () => handlers.onPlaceCard(i));
        }
      }
    }

    gridContainer.appendChild(cell);
  }

  // Refresh button
  const refreshButton = container.querySelector('#refreshButton');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      handlers.onRefreshMarket();
    });
  }
}

// Render the end screen
export function renderEndScreen(container, gameState, onRematch) {
  const winner = getWinner(gameState);

  const scoreboardHTML = gameState.players
    .map((player, idx) => {
      const score = getPlayerScore(gameState, idx);
      const isWinner = winner.players.some(w => w.id === player.id);
      const className = isWinner ? 'winner' : '';
      return `
        <div class="bl-scoreboard-entry ${className}">
          <div class="bl-scoreboard-name">${player.name}${isWinner ? ' 🏆' : ''}</div>
          <div class="bl-scoreboard-score">${score.total}</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="bl-screen bl-end-screen">
      <h1>${winner.isTie ? "It's a Tie!" : winner.players[0].name + ' Wins!'}</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 2rem;">
        Final scores:
      </p>

      <div class="bl-scoreboard">
        ${scoreboardHTML}
      </div>

      <button class="btn btn-primary" id="rematchButton">Play Again</button>
    </div>
  `;

  const rematchButton = container.querySelector('#rematchButton');
  rematchButton.addEventListener('click', onRematch);
}

// Update only the market display
export function updateMarketDisplay(container, gameState) {
  const marketContainer = container.querySelector('#marketContainer');
  if (!marketContainer) return;

  marketContainer.innerHTML = '';
  gameState.market.forEach((card, index) => {
    const isTicked = gameState.fieldNotes.tickedCardIds.has(card.id);
    const cardHtml = renderMarketCard(card, index, isTicked);
    const cardElement = document.createElement('div');
    cardElement.innerHTML = cardHtml;
    marketContainer.appendChild(cardElement.firstElementChild);
  });
}

// Update only the grid display
export function updateGridDisplay(container, gameState, handlers) {
  const gridContainer = container.querySelector('#gridContainer');
  if (!gridContainer) return;

  const highlighted = getHighlightedCells(gameState.players[gameState.currentPlayerIndex].grid);

  gridContainer.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const cell = document.createElement('div');
    const card = gameState.players[gameState.currentPlayerIndex].grid[i];

    if (card) {
      const isTicked = gameState.fieldNotes.tickedCardIds.has(card.id);
      const cardHtml = renderGridCard(card, isTicked);
      cell.innerHTML = cardHtml;
      cell.classList.add('bl-grid-cell', 'has-card');

      const highlightedEntry = highlighted.find(h => h.cellIndex === i);
      if (highlightedEntry) {
        if (highlightedEntry.types.includes('habitat') && highlightedEntry.types.includes('diet')) {
          cell.classList.add('highlighted-both');
        } else if (highlightedEntry.types.includes('diet')) {
          cell.classList.add('highlighted-diet');
        } else if (highlightedEntry.types.includes('habitat')) {
          cell.classList.add('highlighted-habitat');
        }
      }
    } else {
      cell.classList.add('bl-grid-cell');
      if (gameState.gamePhase === 'place') {
        const validCells = handlers.getValidPlacementCells();
        if (validCells.includes(i)) {
          cell.classList.add('valid-placement');
          cell.addEventListener('click', () => handlers.onPlaceCard(i));
        }
      }
    }

    gridContainer.appendChild(cell);
  }
}

// Update only the score display
export function updateScoreDisplay(container, gameState) {
  const scoreDisplay = container.querySelector('.bl-score-display');
  if (!scoreDisplay) return;

  const score = getPlayerScore(gameState, gameState.currentPlayerIndex);
  scoreDisplay.textContent = `Score: ${score.total}`;

  // Update info panel
  const infoPanel = container.querySelector('.bl-info-panel');
  if (infoPanel) {
    const scoreBreakdown = infoPanel.querySelector('.bl-score-breakdown');
    if (scoreBreakdown) {
      const lines = scoreBreakdown.querySelectorAll('.bl-score-line');
      if (lines[0]) lines[0].innerHTML = `<span class="bl-score-label">Habitat Runs:</span><span>${score.habitatScore}</span>`;
      if (lines[1]) lines[1].innerHTML = `<span class="bl-score-label">Diet Runs:</span><span>${score.dietScore}</span>`;
      if (gameState.fieldNotes.enabled && lines[2]) {
        lines[2].innerHTML = `<span class="bl-score-label">Field Notes:</span><span>${score.fieldNotesScore}</span>`;
        if (lines[3]) {
          lines[3].innerHTML = `<span>Total:</span><span>${score.total}</span>`;
        }
      } else if (lines[2]) {
        lines[2].innerHTML = `<span>Total:</span><span>${score.total}</span>`;
      }
    }
  }
}

// Update deck info
export function updateDeckInfo(container, gameState) {
  const deckInfo = container.querySelector('.bl-deck-info');
  if (deckInfo) {
    deckInfo.innerHTML = `
      Deck: ${gameState.deck.length}<br>
      Market: ${gameState.market.length}
    `;
  }

  const progressValue = container.querySelector('.bl-info-value');
  if (progressValue) {
    const infoDivs = container.querySelectorAll('.bl-info-section');
    if (infoDivs[1]) {
      infoDivs[1].querySelector('.bl-info-value').textContent = `${gameState.turnsCompleted} / 20`;
    }
  }
}
