/* Gallery: localStorage persistence + rendering */
const GalleryModule = (() => {
  const STORAGE_KEY = 'mykaiju_gallery';
  const THUMB_MAX = 400; // max px dimension stored in localStorage

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

  function compressImage(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(THUMB_MAX / img.width, THUMB_MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  async function addCard(cardData) {
    const compressed = await compressImage(cardData.imageDataUrl);
    const item = { ...cardData, imageDataUrl: compressed, id: Date.now() };
    const items = load();
    items.unshift(item);

    // Drop oldest cards until it fits within quota
    while (items.length > 0) {
      try {
        save(items);
        break;
      } catch (e) {
        if (items.length === 1) break; // can't shrink further
        items.pop();
      }
    }
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function render(lang, onOpenCard) {
    const grid = document.getElementById('gallery-grid');
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
