// Bucket List: Card Rendering
// Converts card objects to styled HTML

export function habitatToClass(habitat) {
  const map = {
    'Rainforest': 'rainforest',
    'Bushland & Scrub': 'scrub',
    'Wetlands & Waterways': 'wetlands',
    'Coastal & Ocean': 'ocean',
    'Outback & Grassland': 'outback',
    'WILD': 'wild',
  };
  return map[habitat] || 'wild';
}

export function getHabitatIcon(habitat) {
  const map = {
    'Rainforest': '🌿',
    'Bushland & Scrub': '🌳',
    'Wetlands & Waterways': '💧',
    'Coastal & Ocean': '🌊',
    'Outback & Grassland': '🏜️',
    'WILD': '✨',
  };
  return map[habitat] || '?';
}

export function getDietIcon(diet) {
  const map = {
    'Seeds & Grain': '🌾',
    'Nectar & Fruit': '🌸',
    'Insects & Invertebrates': '🦗',
    'Fish & Aquatic Prey': '🐟',
    'Meat & Carrion': '🦅',
    'WILD': '✨',
  };
  return map[diet] || '?';
}

export function renderCard(card, isTicked = false) {
  const habitatClass = habitatToClass(card.habitat);
  const tickClass = isTicked ? ' bl-card__tick--ticked' : '';

  return `
    <div class="bl-card ${habitatClass}" data-card-id="${card.id}">
      <div class="bl-card__header">
        <div class="bl-card__name">${card.name}</div>
        <div class="bl-card__icons">
          <span class="bl-card__icon">${getHabitatIcon(card.habitat)}</span>
          <span class="bl-card__icon">${getDietIcon(card.diet)}</span>
        </div>
      </div>
      <div class="bl-card__symbols">
        <div class="bl-card__label">${card.habitat}</div>
        <div class="bl-card__label">${card.diet}</div>
      </div>
      <div class="bl-card__fact">${card.fact}</div>
      <div class="bl-card__tick${tickClass}">✓</div>
    </div>
  `;
}

// Render a card for grid display (smaller, with click handler)
export function renderGridCard(card, isTicked = false) {
  return renderCard(card, isTicked);
}

// Render a card for market display
export function renderMarketCard(card, cardIndex, isTicked = false) {
  const html = renderCard(card, isTicked);
  // Add data-market-index attribute
  return html.replace('class="bl-card', `class="bl-market-card bl-card" data-market-index="${cardIndex}"`);
}
