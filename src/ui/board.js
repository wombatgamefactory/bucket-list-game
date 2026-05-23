// Bucket List: Board Rendering
// All DOM manipulation (only file that touches DOM)

import { renderMarketCard, renderGridCard } from './cardRenderer.js';
import { getPlayerScore, getWinner } from '../engine/game.js';
import { getHighlightedCells } from '../engine/scoring.js';

// Helper function to get deck title based on deck type
function getDeckTitle(deckType) {
  const titles = {
    'australian': '🐦 Bucket List: Australian Birds',
    'british': '🐦 Bucket List: British Birds',
    'london': '🏛️ Bucket List: London Travel'
  };
  return titles[deckType] || '🐦 Bucket List';
}

// Render the setup screen
export function renderSetupScreen(container, onStart) {
  const DIFFICULTY_LABELS = {
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard',
    'expert': 'Expert',
    'strategic': 'Strategic',
  };

  const DECKS = [
    { id: 'australian', name: 'Australian Birds', image: 'images/bucket_list_card_back_australian_birds.png' },
    { id: 'british', name: 'British Birds', image: 'images/bucket_list_card_back_british_birds.png' },
    { id: 'london', name: 'London Travel', image: 'images/bucket_list_card_back_london_travel.png' },
  ];

  container.innerHTML = `
    <div class="bl-screen bl-setup-screen">
      <div class="bl-setup-form">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h1>🐦 Bucket List</h1>
          <button class="btn btn-secondary btn-small" id="rulesButton">📖 Rules</button>
        </div>
        <p class="bl-setup__intro">Draft cards, build your grid, score runs of 4.</p>

        <!-- Deck Selection Grid -->
        <div class="bl-setup__section">
          <label class="bl-setup__label">Select Deck</label>
          <div class="bl-deck-grid" id="deckGrid"></div>
          <div class="bl-deck-indicator" id="selectedDeckIndicator"></div>
        </div>

        <!-- Number of Players -->
        <div class="bl-setup__section">
          <label class="bl-setup__label">Number of Players</label>
          <select id="playerCount" class="bl-setup__select">
            <option value="1">1 Player (Solo)</option>
            <option value="2" selected>2 Players</option>
            <option value="3">3 Players</option>
            <option value="4">4 Players</option>
            <option value="5">5 Players</option>
          </select>
        </div>

        <!-- Player Configuration -->
        <div id="playerSetup" class="bl-setup__section"></div>

        <!-- Field Notes Toggle -->
        <div class="bl-setup__section">
          <label class="bl-setup__label">Field Notes (Optional)</label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="checkbox" id="fieldNotesToggle" checked>
            <label for="fieldNotesToggle" style="margin: 0; font-weight: normal;">Track cards you've seen</label>
          </div>
        </div>

        <!-- Field Notes Count -->
        <div class="bl-setup__section" id="fieldNotesCountGroup">
          <label for="fieldNotesCount">How many cards have you seen? (0–100)</label>
          <input type="range" id="fieldNotesCount" min="0" max="100" value="25">
          <span class="bl-slider-value" id="countDisplay">25 cards ticked</span>
          <p class="bl-form-hint">We'll randomly mark that many cards as ticked.</p>
        </div>

        <button class="bl-btn bl-btn-primary" id="startButton">Start Game</button>
      </div>
    </div>
  `;

  // Setup deck grid
  const deckGrid = container.querySelector('#deckGrid');
  let selectedDeck = 'australian';

  DECKS.forEach((deck, index) => {
    const deckCard = document.createElement('div');
    deckCard.className = `bl-deck-card ${index === 0 ? 'active' : ''}`;
    deckCard.dataset.deck = deck.id;
    deckCard.innerHTML = `
      <img src="${deck.image}" alt="${deck.name}" class="bl-deck-card__image">
      <div class="bl-deck-card__name">${deck.name}</div>
    `;

    deckCard.addEventListener('click', () => {
      deckGrid.querySelectorAll('.bl-deck-card').forEach(card => card.classList.remove('active'));
      deckCard.classList.add('active');
      selectedDeck = deck.id;
      updateDeckIndicator();
    });

    deckGrid.appendChild(deckCard);
  });

  function updateDeckIndicator() {
    const selectedDeckName = DECKS.find(d => d.id === selectedDeck)?.name || 'Australian Birds';
    const indicator = container.querySelector('#selectedDeckIndicator');
    if (indicator) {
      indicator.textContent = `Selected: ${selectedDeckName}`;
    }
  }

  // Initialize deck indicator
  updateDeckIndicator();

  // Setup player count and configuration
  const playerCount = container.querySelector('#playerCount');
  const playerSetup = container.querySelector('#playerSetup');
  const startButton = container.querySelector('#startButton');
  const fieldNotesToggle = container.querySelector('#fieldNotesToggle');
  const fieldNotesCountGroup = container.querySelector('#fieldNotesCountGroup');
  const fieldNotesCount = container.querySelector('#fieldNotesCount');
  const countDisplay = container.querySelector('#countDisplay');

  function updatePlayerSetup() {
    const count = parseInt(playerCount.value);
    let html = '';
    for (let i = 0; i < count; i++) {
      const isPlayer1 = i === 0;
      html += `
        <div class="bl-setup__player-row">
          <span class="bl-setup__player-label">Player ${i + 1}</span>
          <div class="bl-setup__toggle-group">
            <button class="bl-setup__toggle-btn ${isPlayer1 ? 'active' : ''}" data-player="${i}" data-type="human">Human</button>
            <button class="bl-setup__toggle-btn ${isPlayer1 ? '' : 'active'}" data-player="${i}" data-type="ai">AI</button>
          </div>
          <div id="player${i}DifficultyWrap" class="bl-setup__difficulty-group" style="${isPlayer1 ? 'display: none;' : ''}">
            <button class="bl-setup__difficulty-btn" data-player="${i}" data-difficulty="easy">Easy</button>
            <button class="bl-setup__difficulty-btn ${isPlayer1 ? '' : 'active'}" data-player="${i}" data-difficulty="medium">Medium</button>
            <button class="bl-setup__difficulty-btn" data-player="${i}" data-difficulty="hard">Hard</button>
            <button class="bl-setup__difficulty-btn" data-player="${i}" data-difficulty="expert">Expert</button>
            <button class="bl-setup__difficulty-btn" data-player="${i}" data-difficulty="strategic">Strategic</button>
          </div>
        </div>
      `;
    }
    playerSetup.innerHTML = html;

    // Setup toggle buttons for Human/AI
    for (let i = 0; i < count; i++) {
      const toggleBtns = playerSetup.querySelectorAll(`[data-player="${i}"][data-type]`);
      const difficultyWrap = document.getElementById(`player${i}DifficultyWrap`);

      toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          toggleBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (difficultyWrap) {
            difficultyWrap.style.display = btn.dataset.type === 'ai' ? '' : 'none';
          }
        });
      });
    }

    // Setup difficulty buttons
    for (let i = 0; i < count; i++) {
      const diffBtns = playerSetup.querySelectorAll(`[data-player="${i}"][data-difficulty]`);
      diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          diffBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }
  }

  playerCount.addEventListener('change', updatePlayerSetup);
  updatePlayerSetup();

  fieldNotesToggle.addEventListener('change', () => {
    fieldNotesCountGroup.style.display = fieldNotesToggle.checked ? 'block' : 'none';
  });

  fieldNotesCount.addEventListener('input', () => {
    countDisplay.textContent = `${fieldNotesCount.value} cards ticked`;
  });

  const rulesButton = container.querySelector('#rulesButton');
  rulesButton.addEventListener('click', () => {
    showRulesModal(container);
  });

  startButton.addEventListener('click', () => {
    const count = parseInt(playerCount.value);
    const playerConfigs = [];

    for (let i = 0; i < count; i++) {
      const toggleBtns = playerSetup.querySelectorAll(`[data-player="${i}"][data-type]`);
      const diffBtns = playerSetup.querySelectorAll(`[data-player="${i}"][data-difficulty]`);

      const activeType = Array.from(toggleBtns).find(b => b.classList.contains('active'));
      const activeDiff = Array.from(diffBtns).find(b => b.classList.contains('active'));

      const type = activeType?.dataset.type || 'human';
      const difficulty = activeDiff?.dataset.difficulty || 'medium';
      const isHuman = type === 'human';
      const typeSuffix = isHuman ? 'Human' : `AI ${DIFFICULTY_LABELS[difficulty]}`;

      playerConfigs.push({
        name: `Player ${i + 1} (${typeSuffix})`,
        isHuman,
        aiDifficulty: isHuman ? null : difficulty,
      });
    }

    const enableFieldNotes = fieldNotesToggle.checked;
    const fieldNotesCountValue = parseInt(fieldNotesCount.value);

    onStart({
      playerConfigs,
      fieldNotesCount: enableFieldNotes ? fieldNotesCountValue : 0,
      deck: selectedDeck,
    });
  });
}

// Render the main game screen
export function renderGameScreen(container, gameState, handlers) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const playerCount = gameState.players.length;

  container.innerHTML = `
    <div class="bl-screen bl-game-screen">
      <div class="bl-header">
        <h2>${getDeckTitle(gameState.deckType)}</h2>
        <div class="bl-game-info">
          <span>Phase: ${gameState.gamePhase === 'draft' ? '📋 Draft' : '📍 Place'}</span>
          <span>Turn: ${gameState.turnsCompleted} / 20</span>
        </div>
      </div>

      <div class="bl-game-layout">
        <!-- Top row: 3 cells -->
        <!-- Top-left: Player 1 -->
        <div class="bl-player-cell bl-player-1" id="playerCell0"></div>

        <!-- Top-middle: Market -->
        <div class="bl-market-cell">
          <div class="bl-market">
            <div class="bl-market-header">
              <div class="bl-market-title">Market</div>
              <button class="btn btn-secondary btn-small" id="gameRulesButton">📖 Rules</button>
            </div>
            ${gameState.gamePhase === 'place' && gameState.pendingCard ? `
              <div class="bl-selected-card-section">
                <div class="bl-selected-card-label">Selected Card:</div>
                <div class="bl-selected-card-display" id="selectedCardDisplay"></div>
                <p class="bl-selected-card-hint">Click a valid green cell to place it</p>
                ${currentPlayer.isHuman ? `
                  <button class="btn btn-secondary" id="cancelButton">Cancel</button>
                ` : ''}
              </div>
            ` : `
              <div class="bl-market-cards" id="marketContainer"></div>
            `}
            <div class="bl-processing-indicator" id="processingIndicator" style="display: none;">
              <div class="bl-processing-label">🤖 Processing</div>
              <div class="bl-progress-bar">
                <div class="bl-progress-fill" id="progressFill"></div>
              </div>
              <div class="bl-progress-text"><span id="progressPercent">0</span>%</div>
            </div>
            <div class="bl-deck-info">
              Deck: ${gameState.deck.length}<br>
              Market: ${gameState.market.length}
            </div>
            ${gameState.gamePhase === 'draft' && gameState.canRefreshMarket && !gameState.marketRefreshOffered ? `
              <button class="btn btn-secondary btn-small" id="refreshButton">Refresh Market</button>
            ` : ''}
          </div>
        </div>

        <!-- Top-right: Player 5 (if exists) or hidden -->
        <div class="bl-player-cell bl-player-5" id="playerCell4" style="${playerCount < 5 ? 'display: none;' : ''}"></div>

        <!-- Bottom row: 3 cells for players 2, 3, 4 -->
        <div class="bl-player-cell bl-player-2" id="playerCell1" style="${playerCount < 2 ? 'display: none;' : ''}"></div>
        <div class="bl-player-cell bl-player-3" id="playerCell2" style="${playerCount < 3 ? 'display: none;' : ''}"></div>
        <div class="bl-player-cell bl-player-4" id="playerCell3" style="${playerCount < 4 ? 'display: none;' : ''}"></div>
      </div>
    </div>
  `;

  // Render selected card (if in place phase)
  if (gameState.gamePhase === 'place' && gameState.pendingCard) {
    const selectedCardDisplay = container.querySelector('#selectedCardDisplay');
    if (selectedCardDisplay) {
      const isTicked = gameState.fieldNotes.tickedCardIds.has(gameState.pendingCard.id);
      const cardHtml = renderMarketCard(gameState.pendingCard, -1, isTicked, gameState.deckType);
      selectedCardDisplay.innerHTML = cardHtml;
      selectedCardDisplay.classList.add('bl-selected-card');
    }
  }

  // Render market cards
  const marketContainer = container.querySelector('#marketContainer');
  const isHumanTurn = gameState.gamePhase === 'draft' && currentPlayer && currentPlayer.isHuman;

  if (marketContainer) {
    gameState.market.forEach((card, index) => {
    const isTicked = gameState.fieldNotes.tickedCardIds.has(card.id);
    const cardHtml = renderMarketCard(card, index, isTicked, gameState.deckType);
    const cardElement = document.createElement('div');
    cardElement.innerHTML = cardHtml;
    const cardEl = cardElement.firstElementChild;

    // Only allow interaction if it's a human player's turn during draft
    if (isHumanTurn) {
      cardEl.style.cursor = 'pointer';

      // Click to draft
      cardEl.addEventListener('click', () => handlers.onDraftCard(index));

      // Drag and drop support
      cardEl.draggable = true;
      cardEl.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('cardIndex', index);
        cardEl.style.opacity = '0.6';
      });
      cardEl.addEventListener('dragend', () => {
        cardEl.style.opacity = '1';
      });
    } else {
      cardEl.style.cursor = 'not-allowed';
      cardEl.style.opacity = '0.6';
    }

    marketContainer.appendChild(cardEl);
    });
  }

  // Render each player's board
  gameState.players.forEach((player, playerIdx) => {
    const playerCell = container.querySelector(`#playerCell${playerIdx}`);
    if (!playerCell) return;

    const scoreLiveData = getPlayerScore(gameState, playerIdx);
    const isActive = gameState.currentPlayerIndex === playerIdx;

    // Add active highlight
    if (isActive) {
      playerCell.classList.add('active-player');
    }

    // Create player board HTML
    const playerBoardHtml = `
      <div class="bl-player-board">
        <div class="bl-player-header">
          <h3 class="bl-player-name">${player.name}</h3>
          <div class="bl-player-score">${scoreLiveData.total}</div>
        </div>
        <div class="bl-grid" data-player="${playerIdx}"></div>
        ${isActive && gameState.gamePhase === 'place' ? `
          <div class="bl-placement-hint">Click a cell to place</div>
        ` : ''}
        ${isActive && !player.isHuman ? `
          <div class="bl-ai-thinking">🤖 AI is thinking...</div>
        ` : ''}
      </div>
    `;

    playerCell.innerHTML = playerBoardHtml;

    // Render grid for this player
    const gridContainer = playerCell.querySelector('.bl-grid');
    const highlighted = getHighlightedCells(player.grid);

    for (let i = 0; i < 30; i++) {
      const cell = document.createElement('div');
      const card = player.grid[i];

      if (card) {
        const isTicked = gameState.fieldNotes.tickedCardIds.has(card.id);
        const cardHtml = renderGridCard(card, isTicked, gameState.deckType);
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

        // Allow placement on current player's board
        if (isActive) {
          // Get valid placement cells for highlighting
          const validCells = handlers.getValidPlacementCells();
          const isValid = validCells.includes(i);

          // During place phase: enable click placement
          if (gameState.gamePhase === 'place') {
            if (isValid) {
              cell.classList.add('valid-placement');
              cell.addEventListener('click', () => handlers.onPlaceCard(i));
            }
          }

          // During draft phase: enable drag and drop
          if (gameState.gamePhase === 'draft') {
            // Highlight valid cells for placement
            if (isValid) {
              cell.classList.add('valid-placement');
            }

            cell.classList.add('droppable');

            cell.addEventListener('dragover', (e) => {
              e.preventDefault();
              const validCells = handlers.getValidPlacementCells();
              if (validCells.includes(i)) {
                e.dataTransfer.dropEffect = 'move';
                cell.classList.remove('drag-over-invalid');
                cell.classList.add('drag-over');
              } else {
                e.dataTransfer.dropEffect = 'not-allowed';
                cell.classList.remove('drag-over');
                cell.classList.add('drag-over-invalid');
              }
            });

            cell.addEventListener('dragleave', () => {
              cell.classList.remove('drag-over');
              cell.classList.remove('drag-over-invalid');
            });

            cell.addEventListener('drop', (e) => {
              e.preventDefault();
              e.stopPropagation();
              cell.classList.remove('drag-over');
              cell.classList.remove('drag-over-invalid');

              // Clear all drag-over highlighting from all cells
              document.querySelectorAll('.bl-grid-cell').forEach(c => {
                c.classList.remove('drag-over');
                c.classList.remove('drag-over-invalid');
              });

              const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'));

              console.log('Drop detected - cardIndex:', cardIndex, 'cellIndex:', i);

              // Validate placement BEFORE drafting
              const validCells = handlers.getValidPlacementCells();
              if (!validCells.includes(i)) {
                console.error('Invalid placement cell:', i);
                showMessageModal('Invalid Placement', 'Card must be placed adjacent to an existing card.');
                return;
              }

              // Draft and place in one action (only if valid)
              try {
                handlers.onDraftCard(cardIndex);
                // Immediately place after draft
                handlers.onPlaceCard(i);
              } catch (err) {
                console.error('Drag and drop placement error:', err);
                showMessageModal('Placement Error', err.message);
              }
            });
          }
        }
      }

      gridContainer.appendChild(cell);
    }
  });

  // Refresh button
  const refreshButton = container.querySelector('#refreshButton');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      handlers.onRefreshMarket();
    });
  }

  // Rules button
  const gameRulesButton = container.querySelector('#gameRulesButton');
  if (gameRulesButton) {
    gameRulesButton.addEventListener('click', () => {
      showRulesModal(container);
    });
  }

  // Cancel button (deselect card during place phase)
  const cancelButton = container.querySelector('#cancelButton');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      handlers.onCancel?.();
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

// Show error/message modal
function showMessageModal(title, message) {
  const modal = document.createElement('div');
  modal.className = 'bl-modal';
  modal.innerHTML = `
    <div class="bl-modal-overlay"></div>
    <div class="bl-modal-content bl-message-modal">
      <div class="bl-modal-header">
        <h2>${title}</h2>
        <button class="bl-modal-close">&times;</button>
      </div>
      <div class="bl-modal-body">
        <p>${message}</p>
      </div>
      <div class="bl-modal-footer">
        <button class="btn btn-primary bl-modal-ok">OK</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.bl-modal-close');
  const okBtn = modal.querySelector('.bl-modal-ok');
  const overlay = modal.querySelector('.bl-modal-overlay');

  function closeModal() {
    modal.remove();
  }

  closeBtn.addEventListener('click', closeModal);
  okBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
}

// Show rules modal
function showRulesModal(container) {
  const modal = document.createElement('div');
  modal.className = 'bl-modal';
  modal.innerHTML = `
    <div class="bl-modal-overlay"></div>
    <div class="bl-modal-content">
      <div class="bl-modal-header">
        <h2>Rules</h2>
        <button class="bl-modal-close">&times;</button>
      </div>
      <div class="bl-modal-body">
        <h3>Objective</h3>
        <p>Draft cards and place them in your 6×5 grid to create runs of matching symbols and score points.</p>

        <h3>Setup</h3>
        <p>Each player gets a 6×5 grid (30 cells). Cards are drafted from a shared market of 5 cards. Every player will draft and place exactly 20 cards, leaving 10 empty cells.</p>

        <h3>Turn Structure</h3>
        <ol>
          <li><strong>Draft:</strong> Take 1 card from the market</li>
          <li><strong>Place:</strong> Place the card in your grid adjacent to an existing card (first card can go anywhere)</li>
          <li><strong>Refill:</strong> Market refills to 5 cards from the deck</li>
        </ol>

        <h3>Market Refresh</h3>
        <p>If 3+ cards in the market share the same symbol, you may clear the entire market and refill it before drafting (optional).</p>

        <h3>Scoring</h3>
        <p><strong>Runs of 4+:</strong> Score 1 point for every group of 4+ adjacent cards in a row or column that share the same habitat or diet symbol. Overlapping runs count separately (a row of 5 matching = 2 points).</p>
        <p><strong>Wild Cards:</strong> Wild habitat cards match any habitat symbol. Wild diet cards match any diet symbol. Wilds cannot form runs by themselves.</p>
        <p><strong>Field Notes Bonus:</strong> If enabled, score 1 bonus point for each complete row or column where all cards have been ticked (marked as cards you've seen).</p>

        <h3>Game End</h3>
        <p>Game ends when the deck is empty and all market cards are taken. Highest score wins!</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.bl-modal-close');
  const overlay = modal.querySelector('.bl-modal-overlay');

  function closeModal() {
    modal.remove();
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
}
