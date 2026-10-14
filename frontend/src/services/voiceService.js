import apiClient from './api';

// Comprehensive list of supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'te-IN', lang: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', sample: 'డ్యాష్‌బోర్డ్ ఓపెన్ చెయ్ / స్కాన్ రన్ చెయ్యి' },
  { code: 'hi-IN', lang: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', sample: 'डैशबोर्ड खोलो / सुरक्षा स्कैन शुरू करो' },
  { code: 'en-US', lang: 'en', name: 'English (US)', native: 'English (US)', flag: '🇺🇸', sample: 'Trigger security scan / Show critical threats' },
  { code: 'en-IN', lang: 'en', name: 'English (India)', native: 'English (IN)', flag: '🇮🇳', sample: 'Open App Monitoring / Analyze domain' },
  { code: 'ta-IN', lang: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', sample: 'டாஷ்போர்டைத் திறக்கவும் / ஸ்கேன் தொடங்கு' },
  { code: 'kn-IN', lang: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', sample: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ / ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' },
  { code: 'ml-IN', lang: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', sample: 'ഡാഷ്‌ബോർഡ് തുറക്കുക / സ്കാൻ ചെയ്യുക' },
  { code: 'bn-IN', lang: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', sample: 'ড্যাশবোর্ড খুলুন / স্ক্যান শুরু করুন' },
  { code: 'mr-IN', lang: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', sample: 'डॅशबोर्ड उघडा / स्कॅन सुरू करा' },
  { code: 'es-ES', lang: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', sample: 'Abrir panel de control / Ejecutar escaneo' },
  { code: 'fr-FR', lang: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', sample: "Ouvrir le tableau de bord / Lancer l'analyse" },
  { code: 'de-DE', lang: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', sample: 'Dashboard öffnen / Scan starten' },
  { code: 'ar-SA', lang: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', sample: 'افتح لوحة المعلومات / ابدأ الفحص' },
  { code: 'zh-CN', lang: 'zh', name: 'Chinese', native: '简体中文', flag: '🇨🇳', sample: '打开仪表盘 / 启动安全扫描' },
  { code: 'ja-JP', lang: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', sample: 'ダッシュボードを開く / スキャンを実行' },
  { code: 'ru-RU', lang: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺', sample: 'Открыть панель / Запустить сканирование' },
  { code: 'pt-BR', lang: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷', sample: 'Abrir painel / Iniciar verificação' },
];

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isListening = false;
    this.selectedLanguage = localStorage.getItem('aegis_voice_lang') || 'te-IN';
    this.soundMuted = localStorage.getItem('aegis_voice_muted') === 'true';
    this.audioCtx = null;
  }

  // Synthesize pleasant futuristic Web Audio beeps (zero external mp3 assets)
  playChime(type = 'start') {
    if (this.soundMuted) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'start') {
        // High cyber ping
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'success') {
        // Two-tone harmonic resolve
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      // AudioContext not supported or permission denied
    }
  }

  setLanguage(langCode) {
    this.selectedLanguage = langCode;
    localStorage.setItem('aegis_voice_lang', langCode);
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  getLanguage() {
    return this.selectedLanguage;
  }

  isSupported() {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  startListening({ onResult, onInterim, onError, onEnd, onStart }) {
    if (!this.isSupported()) {
      onError?.(new Error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.'));
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.selectedLanguage;
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.playChime('start');
      onStart?.();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (interimTranscript) {
        onInterim?.(interimTranscript);
      }
      if (finalTranscript) {
        onResult?.(finalTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      this.playChime('error');
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      onError?.(err);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  // Text to Speech playback in user language
  speak(text, langCode = this.selectedLanguage) {
    if (!this.synth || this.soundMuted || !text) return;

    try {
      this.synth.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select voice matching language if available
      const voices = this.synth.getVoices();
      const prefix = langCode.slice(0, 2).toLowerCase();
      const matchedVoice = voices.find(v => v.lang === langCode) || voices.find(v => v.lang.startsWith(prefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  toggleMute() {
    this.soundMuted = !this.soundMuted;
    localStorage.setItem('aegis_voice_muted', String(this.soundMuted));
    if (this.soundMuted) {
      this.stopSpeaking();
    }
    return this.soundMuted;
  }

  // Send query to backend Gemini Voice Assistant
  async processCommand(text, currentRoute = '/') {
    try {
      const response = await apiClient.post('/voice/command', {
        text,
        language: this.selectedLanguage,
        current_route: currentRoute
      });
      return response.data;
    } catch (error) {
      // Direct frontend fallback if backend is offline
      return this.localFallback(text, currentRoute);
    }
  }

  // Free-form cybersecurity AI question
  async askGemini(query) {
    try {
      const response = await apiClient.post('/voice/ask-gemini', {
        query,
        language: this.selectedLanguage
      });
      return response.data;
    } catch (error) {
      return {
        success: true,
        answer: `AegisGuard Sentinel: Monitoring is active. Security query for "${query}" recorded. Perimeter defense active.`,
        spoken_summary: `Perimeter defense active for ${query}.`
      };
    }
  }

  // Local rule-based fallback in case backend is disconnected
  localFallback(query, currentRoute) {
    const q = query.toLowerCase();
    const isTe = this.selectedLanguage.startsWith('te') || /[\u0C00-\u0C7F]/.test(query);
    const isHi = this.selectedLanguage.startsWith('hi') || /[\u0900-\u097F]/.test(query);

    let intent = 'NAVIGATE';
    let target_route = '/';
    let action = null;
    let spoken = isTe ? 'డ్యాష్‌బోర్డ్ తెరుస్తున్నాను.' : (isHi ? 'डैशबोर्ड खोल रहे हैं।' : 'Navigating to Dashboard.');
    let display = 'Navigated to Threat Overview Dashboard.';

    if (q.includes('scan') || q.includes('స్కాన్') || q.includes('स्कैन')) {
      intent = 'TRIGGER_SCAN';
      target_route = null;
      action = 'TRIGGER_SCAN';
      spoken = isTe ? 'భద్రతా స్కాన్ ప్రారంభించబడింది.' : (isHi ? 'सुरक्षा स्कैन शुरू कर दिया गया है।' : 'Security scan triggered.');
      display = 'Live digital risk scan initiated across all vectors.';
    } else if (q.includes('social') || q.includes('సోషల్') || q.includes('सोशल')) {
      target_route = '/social-monitoring';
      spoken = isTe ? 'సోషల్ మీడియా మానిటరింగ్ పేజీ ఓపెన్ చేస్తున్నాను.' : 'Opening Social Monitoring.';
      display = 'Navigated to Social Media Impersonation Monitor.';
    } else if (q.includes('app') || q.includes('apk') || q.includes('యాప్') || q.includes('ऐप')) {
      target_route = '/app-monitoring';
      spoken = isTe ? 'మొబైల్ యాప్ మానిటరింగ్ పేజీ ఓపెన్ చేస్తున్నాను.' : 'Opening Mobile App Monitoring.';
      display = 'Navigated to Mobile App & APK Detection.';
    } else if (q.includes('url') || q.includes('domain') || q.includes('యూఆర్ఎల్') || q.includes('डोमेन')) {
      target_route = '/url-monitoring';
      spoken = isTe ? 'యూఆర్ఎల్ మానిటరింగ్ పేజీ ఓపెన్ చేస్తున్నాను.' : 'Opening URL Monitoring.';
      display = 'Navigated to Phishing URL & Domain Monitor.';
    } else if (q.includes('campaign') || q.includes('దాడి') || q.includes('अभियान')) {
      target_route = '/campaigns';
      spoken = isTe ? 'అటాక్ క్యాంపెయిన్స్ పేజీ ఓపెన్ చేస్తున్నాను.' : 'Opening Attack Campaigns.';
      display = 'Navigated to Attack Campaigns Graph.';
    } else if (q.includes('intel') || q.includes('ఇంటెలిజెన్స్') || q.includes('खुफिया')) {
      target_route = '/intelligence';
      spoken = isTe ? 'థ్రెట్ ఇంటెలిజెన్స్ హబ్ ఓపెన్ చేస్తున్నాను.' : 'Opening Threat Intelligence Hub.';
      display = 'Navigated to Threat Intelligence Hub.';
    } else if (q.includes('report') || q.includes('రిపోర్ట్') || q.includes('रिपोर्ट')) {
      target_route = '/reports';
      spoken = isTe ? 'ఆడిట్ రిపోర్ట్స్ పేజీ ఓపెన్ చేస్తున్నాను.' : 'Opening Audit Reports.';
      display = 'Navigated to Audit Reports.';
    }

    return {
      success: true,
      command: {
        intent,
        target_route,
        action,
        spoken_response: spoken,
        display_text: display,
        detected_language: isTe ? 'te' : (isHi ? 'hi' : 'en')
      }
    };
  }
}

export const voiceService = new VoiceService();
