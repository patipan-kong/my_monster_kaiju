/* Card generation, stats, rarity, flip */
const CardModule = (() => {
  const ELEMENTS = [
    { name: 'Fire',    emoji: '🔥', nameJa: '炎' },
    { name: 'Water',   emoji: '💧', nameJa: '水' },
    { name: 'Earth',   emoji: '🌿', nameJa: '大地' },
    { name: 'Wind',    emoji: '🌪️', nameJa: '風' },
    { name: 'Thunder', emoji: '⚡', nameJa: '雷' },
    { name: 'Light',   emoji: '✨', nameJa: '光' },
    { name: 'Dark',    emoji: '🌑', nameJa: '闇' },
  ];

  const TYPES = [
    { name: 'Dragon',  nameJa: 'ドラゴン', emoji: '🐉' },
    { name: 'Beast',   nameJa: 'ビースト', emoji: '🦁' },
    { name: 'Kaiju',   nameJa: 'カイジュウ', emoji: '👾' },
    { name: 'Spirit',  nameJa: 'スピリット', emoji: '👻' },
    { name: 'Machine', nameJa: 'マシーン', emoji: '🤖' },
    { name: 'Demon',   nameJa: 'デーモン', emoji: '😈' },
  ];

  const RARITIES = [
    { name: 'COMMON',    weight: 50, cls: 'rarity-common' },
    { name: 'RARE',      weight: 30, cls: 'rarity-rare' },
    { name: 'EPIC',      weight: 15, cls: 'rarity-epic' },
    { name: 'LEGENDARY', weight: 5,  cls: 'rarity-legendary' },
  ];

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function weightedRandom(items) {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let r = Math.random() * total;
    for (const item of items) {
      r -= item.weight;
      if (r <= 0) return item;
    }
    return items[items.length - 1];
  }

  function generateStats() {
    return {
      hp:  rand(20, 100),
      atk: rand(20, 100),
      def: rand(20, 100),
      spd: rand(20, 100),
      int: rand(20, 100),
    };
  }

  function applyStats(prefix, stats) {
    const keys = ['hp', 'atk', 'def', 'spd', 'int'];
    keys.forEach(k => {
      const bar = document.getElementById(`${prefix}stat-${k}`);
      const val = document.getElementById(`${prefix}val-${k}`);
      if (bar) bar.style.width = stats[k] + '%';
      if (val) val.textContent = stats[k];
    });
  }

  function populateCard(prefix, data, lang) {
    const { name, imageDataUrl, stats, element, type, rarity } = data;
    const isJa = lang === 'ja';

    // Rarity banner
    const banner = document.getElementById(`${prefix}rarity-banner`);
    if (banner) {
      banner.textContent = rarity.name;
      banner.className = 'card-rarity-banner ' + rarity.cls;
    }

    // Element & type
    const elBadge = document.getElementById(`${prefix}element`);
    const tyBadge = document.getElementById(`${prefix}type`);
    if (elBadge) elBadge.textContent = element.emoji + ' ' + (isJa ? element.nameJa : element.name);
    if (tyBadge) tyBadge.textContent = isJa ? type.nameJa : type.name;

    // Image
    const img = document.getElementById(`${prefix}image`);
    if (img && imageDataUrl) {
      img.src = imageDataUrl;
      img.style.display = 'block';
    }

    // Name
    const nameEl = document.getElementById(`${prefix}name-display`);
    if (nameEl) nameEl.textContent = name;

    // Stats
    applyStats(prefix, stats);

    // Silhouette on back
    const sil = document.getElementById(`${prefix}silhouette`);
    if (sil) sil.textContent = type.emoji;
  }

  function buildCardData(name, imageDataUrl) {
    return {
      name,
      imageDataUrl,
      stats:   generateStats(),
      element: ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)],
      type:    TYPES[Math.floor(Math.random() * TYPES.length)],
      rarity:  weightedRandom(RARITIES),
      createdAt: new Date().toISOString(),
    };
  }

  function initFlip(wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const scene = wrapper.closest('.card-scene');
    scene && scene.addEventListener('click', () => {
      wrapper.classList.toggle('flipped');
    });
  }

  return { buildCardData, populateCard, initFlip };
})();
