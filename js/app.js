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
  const btnSaveCard      = $('btn-save-card');
  const modalOverlay     = $('modal-overlay');
  const modalClose       = $('modal-close');

  // ── Language switch ────────────────────────────────────
  function applyLang() {
    const s = I18N[currentLang];
    $('step2-label').textContent       = s.step2;
    $('step3-label').textContent       = s.step3;
    $('gallery-title').textContent     = s.galleryTitle;
    $('voice-start-label').textContent = s.voiceStart;
    $('voice-stop-label').textContent  = s.voiceStop;
    $('recording-label').textContent   = s.recording;
    $('name-label').textContent        = s.nameLabel;
    monsterNameInput.placeholder       = s.namePlaceholder;
    $('generate-label').textContent    = s.generate;
    $('loader-label').textContent      = s.loaderLabel;
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
      (transcript) => {
        monsterNameInput.value = transcript;
        monsterNameInput.style.opacity = '';
        hideError();
      },
      (err) => {
        recordingIndicator.classList.remove('active');
        btnStartRecord.disabled = false;
        btnStopRecord.disabled = true;
        monsterNameInput.style.opacity = '';
        showError(err);
      },
      () => {
        recordingIndicator.classList.add('active');
        btnStartRecord.disabled = true;
        btnStopRecord.disabled = false;
        monsterNameInput.value = '';
        hideError();
      },
      () => {
        recordingIndicator.classList.remove('active');
        btnStartRecord.disabled = false;
        btnStopRecord.disabled = true;
        monsterNameInput.style.opacity = '';
      },
      (interim) => {
        monsterNameInput.value = interim;
        monsterNameInput.style.opacity = '0.5';
      },
      (attempt) => {
        const msg = currentLang === 'ja'
          ? `接続中... (${attempt}/3)`
          : `Reconnecting... (${attempt}/3)`;
        monsterNameInput.value = '';
        monsterNameInput.placeholder = msg;
        setTimeout(() => { monsterNameInput.placeholder = monsterNameInput.placeholder === msg ? (currentLang === 'ja' ? '例: ゴジラマル' : 'e.g. Thunderfang') : monsterNameInput.placeholder; }, 2000);
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

  async function finishCard(name, imageDataUrl) {
    cardLoader.classList.add('hidden');
    cardImage.src = imageDataUrl;
    cardImage.style.display = 'block';

    const cardData = CardModule.buildCardData(name, imageDataUrl);
    currentCardData = cardData;

    CardModule.populateCard('card-', cardData, currentLang);

    await GalleryModule.addCard(cardData);
    GalleryModule.render(currentLang, openModalCard);

    setGenerating(false);
  }

  // ── Save PNG ───────────────────────────────────────────
  btnSaveCard.addEventListener('click', async () => {
    const el = document.getElementById('card-front');
    if (!el) return;
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = `${currentCardData ? currentCardData.name : 'kaiju'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Save failed', e);
    }
  });

  // ── Modal (gallery viewer) ─────────────────────────────

  function openModalCard(cardData) {
    CardModule.populateCard('modal-', cardData, currentLang);
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
