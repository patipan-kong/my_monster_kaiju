/* Speech recognition wrapper */
const SpeechModule = (() => {
  let recognition = null;
  let isRecording = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function isSupported() {
    return !!SpeechRecognition;
  }

  function init(lang, onResult, onError, onStart, onEnd) {
    if (!isSupported()) {
      onError('このブラウザは音声認識をサポートしていません。 / Speech recognition not supported.');
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isRecording = true;
      onStart && onStart();
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult && onResult(transcript);
    };

    recognition.onerror = (event) => {
      isRecording = false;
      if (event.error === 'no-speech') return;
      const errorMessages = {
        'not-allowed':     'マイクへのアクセスが拒否されました。ブラウザのアドレスバー横の🔒アイコンからマイクを許可してください。\n/ Microphone access denied. Allow microphone in your browser settings.',
        'audio-capture':   'マイクが見つかりません。マイクが接続されているか確認してください。 / No microphone found.',
        'network':         'ネットワークエラーが発生しました。 / Network error during speech recognition.',
        'aborted':         null,
      };
      const msg = errorMessages[event.error];
      if (msg) onError && onError(msg);
    };

    recognition.onend = () => {
      isRecording = false;
      onEnd && onEnd();
    };
  }

  async function start(lang, onResult, onError, onStart, onEnd) {
    if (isRecording) return;

    // Request mic permission explicitly so the browser shows its native popup.
    // SpeechRecognition alone often skips the popup and just fires not-allowed.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // release immediately; we only needed the grant
    } catch (e) {
      const denied = e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError';
      onError && onError(
        denied
          ? 'マイクへのアクセスが拒否されました。\nブラウザのアドレスバー横の🔒アイコンをクリックし、マイクを「許可」に変更してからページを再読み込みしてください。\n\nMicrophone access denied.\nClick the 🔒 icon in the address bar, set Microphone to "Allow", then reload the page.'
          : 'マイクが使用できません: ' + e.message
      );
      return;
    }

    init(lang, onResult, onError, onStart, onEnd);
    try {
      recognition.start();
    } catch (e) {
      onError && onError('録音を開始できませんでした。 / Could not start recording.');
    }
  }

  function stop() {
    if (recognition && isRecording) {
      recognition.stop();
    }
  }

  return { start, stop, isSupported };
})();
