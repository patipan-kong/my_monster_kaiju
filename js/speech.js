/* Speech recognition wrapper */
const SpeechModule = (() => {
  let recognition = null;
  let isRecording = false;
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 800;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function isSupported() {
    return !!SpeechRecognition;
  }

  function init(lang, onResult, onError, onStart, onEnd, onInterim, onRetry) {
    if (!isSupported()) {
      onError('このブラウザは音声認識をサポートしていません。 / Speech recognition not supported.');
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      isRecording = true;
      onStart && onStart();
    };

    recognition.onresult = (event) => {
      retryCount = 0; // successful result resets retry counter
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      if (finalTranscript) {
        onResult && onResult(finalTranscript);
      } else if (interimTranscript) {
        onInterim && onInterim(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      isRecording = false;

      if (event.error === 'no-speech' || event.error === 'aborted') return;

      if (event.error === 'network' && retryCount < MAX_RETRIES) {
        retryCount++;
        onRetry && onRetry(retryCount);
        setTimeout(() => {
          if (!isRecording) {
            init(lang, onResult, onError, onStart, onEnd, onInterim, onRetry);
            try { recognition.start(); } catch (_) {}
          }
        }, RETRY_DELAY_MS);
        return;
      }

      retryCount = 0;
      const errorMessages = {
        'not-allowed':  'マイクへのアクセスが拒否されました。ブラウザのアドレスバー横の🔒アイコンからマイクを許可してください。\n/ Microphone access denied. Allow microphone in your browser settings.',
        'audio-capture':'マイクが見つかりません。マイクが接続されているか確認してください。 / No microphone found.',
        'network':      'ネットワークエラーが続いています。接続を確認してからもう一度お試しください。\n/ Persistent network error. Check your connection and try again.',
      };
      const msg = errorMessages[event.error];
      if (msg) onError && onError(msg);
    };

    recognition.onend = () => {
      isRecording = false;
      // Only fire onEnd when we're not about to retry
      if (retryCount === 0) onEnd && onEnd();
    };
  }

  async function start(lang, onResult, onError, onStart, onEnd, onInterim, onRetry) {
    if (isRecording) return;
    retryCount = 0;

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

    init(lang, onResult, onError, onStart, onEnd, onInterim, onRetry);
    try {
      recognition.start();
    } catch (e) {
      onError && onError('録音を開始できませんでした。 / Could not start recording.');
    }
  }

  function stop() {
    retryCount = MAX_RETRIES; // prevent any pending retry from firing after manual stop
    if (recognition && isRecording) {
      recognition.stop();
    }
  }

  return { start, stop, isSupported };
})();
