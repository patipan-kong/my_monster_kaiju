/* Main application controller */
(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────
  let currentLang = 'ja';
  let currentCardData = null;

  // ── Language strings ───────────────────────────────────
  const I18N = {
    ja: {
      step2:        'モンスターの名前',
      step3:        'カイジュウカード',
      galleryTitle: 'ギャラリー',
      voiceStart:   '録音開始',
      voiceStop:    '録音停止',
      recording:    '録音中...',
      nameLabel:    'モンスター名',
      namePlaceholder: '例: ゴジラマル',
      generate:     'カイジュウ生成',
      loaderLabel:  '生成中...',
      flipHint:     'カードをクリックして裏返す ↔ Click card to flip',
      saveFront:    '表を保存',
      saveBack:     '裏を保存',
      galleryEmpty: 'まだカイジュウがいません。最初のカイジュウを作ろう！',
      errNoName:    'モンスター名を入力してください。',
      errServer:    '生成に失敗しました。もう一度試してください。',
    },
    en: {
      step2:        'Monster Name',
      step3:        'Kaiju Card',
      galleryTitle: 'Gallery',
      voiceStart:   'Start Recording',
      voiceStop:    'Stop Recording',
      recording:    'Recording...',
      nameLabel:    'Monster Name',
      namePlaceholder: 'e.g. Thunderfang',
      generate:     'Generate Kaiju',
      loaderLabel:  'Generating...',
      flipHint:     'Click card to flip ↔ カードをクリックして裏返す',
      saveFront:    'Save Front',
      saveBack:     'Save Back',
      galleryEmpty: 'No Kaiju yet. Create your first monster!',
      errNoName:    'Please enter a monster name.',
      errServer:    'Generation failed. Please try again.',
    },
  };

  function t(key) { return I18N[currentLang][key] || key; }

  // ── DOM refs ───────────────────────────────────────────
  const $ = id => document.getElementById(id);

  const btnJa            = $('btn-ja');
  const btnEn            = $('btn-en');
  const btnStartRecord   = $('btn-start-record');
  const btnStopRecord    = $('btn-stop-record');
  const recordingIndicator = $('recording-indicator');
  const monsterNameInput = $('monster-name');
  const btnClearName     = $('btn-clear-name');
  const btnGenerate      = $('btn-generate');
  const errorMsg         = $('error-msg');
  const stepCard         = $('step-card');
  const cardLoader       = $('card-loader');
  const cardImage        = $('card-image');
  const btnSaveFront     = $('btn-save-front');
  const btnSaveBack      = $('btn-save-back');
  const modalOverlay     = $('modal-overlay');
  const modalClose       = $('modal-close');

  // ── Language switch ────────────────────────────────────
  function applyLang() {
    const s = I18N[currentLang];
    $('step2-label').textContent      = s.step2;
    $('step3-label').textContent      = s.step3;
    $('gallery-title').textContent    = s.galleryTitle;
    $('voice-start-label').textContent = s.voiceStart;
    $('voice-stop-label').textContent = s.voiceStop;
    $('recording-label').textContent  = s.recording;
    $('name-label').textContent       = s.nameLabel;
    monsterNameInput.placeholder      = s.namePlaceholder;
    $('generate-label').textContent   = s.generate;
    $('loader-label').textContent     = s.loaderLabel;
    $('flip-hint').textContent        = s.flipHint;
    $('save-front-label').textContent = s.saveFront;
    $('save-back-label').textContent  = s.saveBack;
    GalleryModule.render(currentLang, openModalCard);
  }

  btnJa.addEventListener('click', () => {
    currentLang = 'ja';
    btnJa.classList.add('active');
    btnEn.classList.remove('active');
    applyLang();
  });

  btnEn.addEventListener('click', () => {
    currentLang = 'en';
    btnEn.classList.add('active');
    btnJa.classList.remove('active');
    applyLang();
  });

  // ── Voice ──────────────────────────────────────────────
  btnStartRecord.addEventListener('click', () => {
    const speechLang = currentLang === 'ja' ? 'ja-JP' : 'en-US';
    SpeechModule.start(
      speechLang,
      (transcript) => { monsterNameInput.value = transcript; },
      (err) => showError(err),
      () => {
        recordingIndicator.classList.add('active');
        btnStartRecord.disabled = true;
        btnStopRecord.disabled = false;
      },
      () => {
        recordingIndicator.classList.remove('active');
        btnStartRecord.disabled = false;
        btnStopRecord.disabled = true;
      }
    );
  });

  btnStopRecord.addEventListener('click', () => {
    SpeechModule.stop();
  });

  // ── Name input ─────────────────────────────────────────
  btnClearName.addEventListener('click', () => {
    monsterNameInput.value = '';
    monsterNameInput.focus();
  });

  // ── Generate ───────────────────────────────────────────
  btnGenerate.addEventListener('click', async () => {
    const name = monsterNameInput.value.trim();
    if (!name) { showError(t('errNoName')); return; }

    hideError();
    setGenerating(true);
    showCardSection(name);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monsterName: name, language: currentLang }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || t('errServer'));
      }

      finishCard(name, data.image);

    } catch (err) {
      showError(err.message || t('errServer'));
      setGenerating(false);
      cardLoader.classList.add('hidden');
    }
  });

  function showCardSection(name) {
    stepCard.classList.remove('hidden');
    cardLoader.classList.remove('hidden');
    cardImage.style.display = 'none';
    $('card-name-display').textContent = name;
    stepCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function finishCard(name, imageDataUrl) {
    cardLoader.classList.add('hidden');
    cardImage.src = imageDataUrl;
    cardImage.style.display = 'block';

    const cardData = CardModule.buildCardData(name, imageDataUrl);
    currentCardData = cardData;

    CardModule.populateCard('card-', cardData, currentLang);

    GalleryModule.addCard(cardData);
    GalleryModule.render(currentLang, openModalCard);

    setGenerating(false);
  }

  // ── Card flip init ─────────────────────────────────────
  CardModule.initFlip('card-wrapper');

  // ── Save PNG ───────────────────────────────────────────
  async function saveFace(faceId, filename) {
    const el = document.getElementById(faceId);
    if (!el) return;
    // Temporarily un-flip to capture correct face
    const wrapper = $('card-wrapper');
    const wasFlipped = wrapper.classList.contains('flipped');

    if (faceId === 'card-front' && wasFlipped)  wrapper.classList.remove('flipped');
    if (faceId === 'card-back'  && !wasFlipped) wrapper.classList.add('flipped');

    await new Promise(r => setTimeout(r, 350)); // wait for flip animation

    try {
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Save failed', e);
    }

    // Restore state
    if (faceId === 'card-front' && wasFlipped)  wrapper.classList.add('flipped');
    if (faceId === 'card-back'  && !wasFlipped) wrapper.classList.remove('flipped');
  }

  btnSaveFront.addEventListener('click', () => {
    const name = currentCardData ? currentCardData.name : 'kaiju';
    saveFace('card-front', `${name}_front.png`);
  });

  btnSaveBack.addEventListener('click', () => {
    const name = currentCardData ? currentCardData.name : 'kaiju';
    saveFace('card-back', `${name}_back.png`);
  });

  // ── Modal (gallery viewer) ─────────────────────────────
  CardModule.initFlip('modal-card-wrapper');

  function openModalCard(cardData) {
    CardModule.populateCard('modal-', cardData, currentLang);
    // Reset flip state
    $('modal-card-wrapper').classList.remove('flipped');
    modalOverlay.classList.remove('hidden');
  }

  modalClose.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
  });

  // ── Helpers ────────────────────────────────────────────
  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
  }

  function hideError() {
    errorMsg.classList.add('hidden');
    errorMsg.textContent = '';
  }

  function setGenerating(active) {
    btnGenerate.disabled = active;
    if (active) {
      $('generate-label').textContent = currentLang === 'ja' ? '生成中...' : 'Generating...';
    } else {
      $('generate-label').textContent = t('generate');
    }
  }

  // ── Init ───────────────────────────────────────────────
  applyLang();
  GalleryModule.render(currentLang, openModalCard);

})();
