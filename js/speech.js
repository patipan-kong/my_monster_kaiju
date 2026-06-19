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
      onError && onError('音声認識エラー: ' + event.error);
    };

    recognition.onend = () => {
      isRecording = false;
      onEnd && onEnd();
    };
  }

  function start(lang, onResult, onError, onStart, onEnd) {
    if (isRecording) return;
    init(lang, onResult, onError, onStart, onEnd);
    try {
      recognition.start();
    } catch (e) {
      onError && onError('録音を開始できませんでした。');
    }
  }

  function stop() {
    if (recognition && isRecording) {
      recognition.stop();
    }
  }

  return { start, stop, isSupported };
})();
