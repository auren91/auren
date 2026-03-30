const curatedSelection = [1, 3, 5, 8, 12, 16, 20, 24, 28, 32, 36, 40];

function getWA(message) {
  if (typeof getWhatsappLink === 'function') {
    return getWhatsappLink(message);
  }
  const fallback = 'https://wa.me/5213142836428';
  return message ? `${fallback}?text=${encodeURIComponent(message)}` : fallback;
}

function createItem(index) {
  const padded = String(index).padStart(2, '0');
  return {
    id: `clothes-${padded}`,
    name: `Look ${padded}`,
    img: `img/ropa/clothes (${index}).jpeg`
  };
}

function buildTopButtons() {
  const catalogMessage = 'Hola Auren, quiero ver el catálogo completo de ropa por favor.';
  const pricingMessage = 'Hola Auren, quiero consultar precios de la colección de ropa.';

  const topCatalog = document.getElementById('wa-catalogo-top');
  const topPrice = document.getElementById('wa-precio-top');
  const floatButton = document.getElementById('wa-float');

  if (topCatalog) topCatalog.href = getWA(catalogMessage);
  if (topPrice) topPrice.href = getWA(pricingMessage);
  if (floatButton) floatButton.href = getWA(catalogMessage);
}

function renderGrid() {
  const grid = document.getElementById('grid');
  if (!grid) return;

  const items = curatedSelection.map(createItem);
  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';

    const msgCatalog = `Hola Auren, me interesa el ${item.name}. ¿Me compartes el catálogo completo?`;
    const msgPrice = `Hola Auren, me interesa el ${item.name}. ¿Cuál es su precio?`;

    card.innerHTML = `
      <div class="card__image-wrap">
        <img class="card__image" src="${item.img}" alt="${item.name}" loading="lazy" decoding="async">
      </div>
      <div class="card__body">
        <h3 class="card__title">${item.name}</h3>
        <div class="card__actions">
          <a class="card__btn" href="${getWA(msgCatalog)}" target="_blank" rel="noopener noreferrer">Ver catálogo</a>
          <a class="card__btn card__btn--secondary" href="${getWA(msgPrice)}" target="_blank" rel="noopener noreferrer">Consultar precio</a>
        </div>
      </div>
    `;

    fragment.appendChild(card);
  });

  grid.innerHTML = '';
  grid.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', () => {
  buildTopButtons();
  renderGrid();
});
