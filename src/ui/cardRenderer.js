// Bucket List: Card Rendering
// Converts card objects to styled HTML using sprite sheet

// Sprite sheet configuration (10 columns × 10 rows = 100 cards)
// Each card in sprite sheet is 88 × 64 pixels (aspect ratio 88:63.5)
const SPRITE_CONFIG = {
  cols: 10,
  rows: 10,
  cardWidth: 88,  // pixels in sprite sheet
  cardHeight: 64, // pixels in sprite sheet (63.5 rounded up)
};

export function getSpritePosition(cardId) {
  const col = (cardId - 1) % SPRITE_CONFIG.cols;
  const row = Math.floor((cardId - 1) / SPRITE_CONFIG.cols);
  const x = col * SPRITE_CONFIG.cardWidth;
  const y = row * SPRITE_CONFIG.cardHeight;
  return { x, y };
}

export function renderCard(card, isTicked = false, isMarket = false, deckType = 'australian') {
  const pos = getSpritePosition(card.id);
  let spriteUrl = 'images/bucket_list_australian_birds_cards.png';
  if (deckType === 'british') {
    spriteUrl = 'images/bucket_list_british_birds_cards.png';
  } else if (deckType === 'london') {
    spriteUrl = 'images/bucket_list_london_travel_cards.png';
  }

  const tickClass = isTicked ? ' bl-card__tick--ticked' : '';

  // For market cards, use larger display size; for grid cards, use smaller
  // Maintain 88:63.5 aspect ratio (landscape) - always show complete card
  const ratio = 63.5 / 88;
  const displayWidth = isMarket ? 280 : 180;
  const displayHeight = Math.round(displayWidth * ratio);

  // Scale factor to enlarge cards while keeping them isolated
  const scaleFactor = displayWidth / SPRITE_CONFIG.cardWidth;

  // Scaled sprite sheet dimensions
  const scaledSpriteWidth = SPRITE_CONFIG.cols * SPRITE_CONFIG.cardWidth * scaleFactor;
  const scaledSpriteHeight = SPRITE_CONFIG.rows * SPRITE_CONFIG.cardHeight * scaleFactor;

  // Scaled position (each card takes up displayWidth/displayHeight space)
  const scaledPosX = pos.x * scaleFactor;
  const scaledPosY = pos.y * scaleFactor;

  // Tick size proportional to card size (checkbox is roughly 8% of card width)
  const tickSize = Math.round(displayWidth * 0.08);

  return `
    <div class="bl-card ${isMarket ? 'bl-card--market' : 'bl-card--grid'}" data-card-id="${card.id}">
      <div class="bl-card__sprite" style="
        background-image: url('${spriteUrl}');
        background-position: ${-scaledPosX}px ${-scaledPosY}px;
        background-size: ${scaledSpriteWidth}px ${scaledSpriteHeight}px;
        width: ${displayWidth}px;
        height: ${displayHeight}px;
        background-repeat: no-repeat;
      "></div>
      ${isTicked ? `<div class="bl-card__tick${tickClass}" style="width: ${tickSize}px; height: ${tickSize}px; font-size: ${tickSize * 0.6}px;">✓</div>` : ''}
    </div>
  `;
}

// Render a card for grid display (smaller)
export function renderGridCard(card, isTicked = false, deckType = 'australian') {
  return renderCard(card, isTicked, false, deckType);
}

// Render a card for market display
export function renderMarketCard(card, cardIndex, isTicked = false, deckType = 'australian') {
  const html = renderCard(card, isTicked, true, deckType);
  return html.replace('class="bl-card', `class="bl-market-card bl-card" data-market-index="${cardIndex}"`);
}
