/* Gallery: localStorage persistence + rendering */
const GalleryModule = (() => {
  const STORAGE_KEY = 'mykaiju_gallery';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function addCard(cardData) {
    const items = load();
    items.unshift({ ...cardData, id: Date.now() });
    save(items);
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function render(lang, onOpenCard) {
    const grid = document.getElementById('gallery-grid');
    const empty = document.getElementById('gallery-empty');
    if (!grid) return;

    const items = load();
    grid.innerHTML = '';

    if (items.length === 0) {
      const msg = lang === 'ja'
        ? 'まだカイジュウがいません。最初のカイジュウを作ろう！'
        : 'No Kaiju yet. Create your first monster!';
      grid.innerHTML = `<p class="gallery-empty">${msg}</p>`;
      return;
    }

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.innerHTML = `
        <img class="gallery-thumb" src="${item.imageDataUrl || ''}" alt="${item.name}" loading="lazy" />
        <div class="gallery-info">
          <div class="gallery-name">${item.name}</div>
          <div class="gallery-date">${formatDate(item.createdAt)}</div>
        </div>
      `;
      div.addEventListener('click', () => onOpenCard(item));
      grid.appendChild(div);
    });
  }

  return { addCard, render };
})();
