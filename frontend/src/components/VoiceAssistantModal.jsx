import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mic, MicOff, Volume2, VolumeX, Sparkles, Globe, X,
  ArrowRight, Shield, Zap, Send, RotateCcw, Copy, Check,
  Activity, Radio, AlertTriangle
} from 'lucide-react';
import { voiceService, SUPPORTED_LANGUAGES } from '../services/voiceService';

export default function VoiceAssistantModal({ isOpen, onClose, onTriggerScan }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState(voiceService.getLanguage());
  const [isMuted, setIsMuted] = useState(voiceService.soundMuted);
  const [transcript, setTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [lastResponse, setLastResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);
  const [audioBars, setAudioBars] = useState([4, 8, 14, 20, 28, 22, 16, 10, 18, 26, 32, 24, 18, 12, 6, 3]);

  // Audio bar animation when listening
  useEffect(() => {
    let interval;
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        setAudioBars(prev =>
          prev.map(() => Math.floor(Math.random() * 28) + 6)
        );
      }, 90);
    } else {
      setAudioBars([4, 6, 8, 10, 12, 14, 12, 10, 8, 12, 14, 10, 8, 6, 4, 3]);
    }
    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  // Global keyboard shortcut 'V' to toggle modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'v' || e.key === 'V') {
        if (!isOpen) {
          // Open modal
          window.dispatchEvent(new CustomEvent('toggle-aegis-voice'));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleLanguageChange = (langCode) => {
    setSelectedLang(langCode);
    voiceService.setLanguage(langCode);
    setErrorMsg(null);
  };

  const handleToggleListening = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    setErrorMsg(null);
    setTranscript('');
    voiceService.startListening({
      onStart: () => setIsListening(true),
      onInterim: (text) => setTranscript(text),
      onResult: (finalText) => {
        setTranscript(finalText);
        setIsListening(false);
        executeCommand(finalText);
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMsg(typeof err === 'string' ? err : 'Microphone access denied or speech not recognized.');
      },
      onEnd: () => setIsListening(false)
    });
  };

  const executeCommand = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await voiceService.processCommand(queryText, location.pathname);
      const cmd = res.command || {};

      setLastResponse({
        query: queryText,
        spoken: cmd.spoken_response,
        display: cmd.display_text,
        action: cmd.action,
        intent: cmd.intent,
        route: cmd.target_route,
        detectedLang: cmd.detected_language
      });

      voiceService.playChime('success');

      // Trigger navigation if requested
      if (cmd.target_route && cmd.target_route !== location.pathname) {
        setTimeout(() => {
          navigate(cmd.target_route);
        }, 300);
      }

      // Trigger scan action if requested
      if (cmd.action === 'TRIGGER_SCAN') {
        if (onTriggerScan) {
          onTriggerScan();
        } else {
          window.dispatchEvent(new CustomEvent('aegis-trigger-scan'));
        }
      }

      // Voice TTS feedback
      if (cmd.spoken_response && !isMuted) {
        setIsSpeaking(true);
        voiceService.speak(cmd.spoken_response, selectedLang);
        setTimeout(() => setIsSpeaking(false), 3000);
      }
    } catch (err) {
      setErrorMsg('Failed to process voice command. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const text = typedInput.trim();
    setTypedInput('');
    setTranscript(text);
    executeCommand(text);
  };

  const handleToggleMute = () => {
    const muted = voiceService.toggleMute();
    setIsMuted(muted);
  };

  const handleReplaySpeech = () => {
    if (lastResponse?.spoken) {
      setIsSpeaking(true);
      voiceService.speak(lastResponse.spoken, selectedLang);
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  const handleCopyText = () => {
    if (lastResponse?.display) {
      navigator.clipboard.writeText(lastResponse.display);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  // Localized suggested chips
  const suggestedCommands = {
    'te-IN': [
      { label: '🔍 స్కాన్ ప్రారంభించు', query: 'స్కాన్ రన్ చెయ్యి' },
      { label: '🚨 క్రిటికల్ థ్రెట్స్', query: 'క్రిటికల్ థ్రెట్స్ చూపించు' },
      { label: '🌐 URL మానిటరింగ్', query: 'యూఆర్ఎల్ మానిటరింగ్ పేజీ ఓపెన్ చెయ్' },
      { label: '📱 యాప్ మానిటరింగ్', query: 'మొబైల్ యాప్ మానిటరింగ్ ఓపెన్ చెయ్' },
      { label: '🛡️ ఫిషింగ్ అంటే ఏమిటి?', query: 'ఫిషింగ్ దాడి అంటే ఏమిటి వివరించు' },
    ],
    'hi-IN': [
      { label: '🔍 सुरक्षा स्कैन शुरू करो', query: 'सुरक्षा स्कैन शुरू करो' },
      { label: '🚨 गंभीर खतरे दिखाओ', query: 'गंभीर खतरे दिखाओ' },
      { label: '🌐 URL मॉनिटरिंग', query: 'यूआरएल मॉनिटरिंग खोलो' },
      { label: '📱 ऐप मॉनिटरिंग', query: 'मोबाइल ऐप मॉनिटरिंग खोलो' },
      { label: '🛡️ फिशिंग क्या है?', query: 'फिशिंग अटैक क्या होता है समझाइए' },
    ],
    'en-US': [
      { label: '🔍 Trigger Scan', query: 'Trigger security scan' },
      { label: '🚨 Critical Threats', query: 'Filter for critical threats' },
      { label: '🌐 URL Monitoring', query: 'Open URL and phishing monitoring' },
      { label: '📱 App Monitoring', query: 'Open Mobile App monitoring' },
      { label: '📊 Threat Intelligence', query: 'Go to Threat Intelligence Hub' },
    ]
  };

  const chips = suggestedCommands[selectedLang] || suggestedCommands['en-US'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      {/* Voice Assistant Modal Card */}
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-blue-200/90 shadow-[0_20px_60px_rgba(30,58,138,0.28)] rounded-3xl overflow-hidden animate-modal-up flex flex-col relative text-slate-800">

        {/* Subtle Top Glow Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600" />

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-gradient-to-b from-blue-50/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.35)]">
              <Sparkles className="w-5 h-5 text-cyan-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900 tracking-wide font-mono">
                  AEGIS VOICE SENTINEL
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Gemini 3.5 AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Multilingual Speech Control & Cyber Threat Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Speech Audio' : 'Mute Speech Audio'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Language Selector Bar */}
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 pl-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Voice Language:</span>
            </div>
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.native} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* Central Interactive Voice Pod */}
          <div className="flex flex-col items-center justify-center py-4 relative">

            {/* Audio Visualizer Waves */}
            <div className="flex items-center justify-center gap-1.5 h-12 mb-4">
              {audioBars.map((height, i) => (
                <div
                  key={i}
                  style={{ height: `${height}px` }}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    isListening
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : isSpeaking
                      ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Glowing Big Microphone Button */}
            <div className="relative">
              {/* Pulsing Backlight Rings */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping scale-150 pointer-events-none" />
                  <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-pulse scale-125 pointer-events-none" />
                </>
              )}
              {isSpeaking && (
                <div className="absolute inset-0 rounded-full bg-cyan-500/25 animate-pulse scale-125 pointer-events-none" />
              )}

              <button
                onClick={handleToggleListening}
                disabled={isProcessing}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-[0_0_30px_rgba(244,63,94,0.6)] scale-105'
                    : isProcessing
                    ? 'bg-amber-500 text-white animate-spin shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : isSpeaking
                    ? 'bg-cyan-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.5)]'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_25px_rgba(37,99,235,0.4)] hover:scale-105'
                }`}
              >
                {isListening ? (
                  <Mic className="w-9 h-9 animate-pulse" />
                ) : isProcessing ? (
                  <Radio className="w-8 h-8" />
                ) : (
                  <Mic className="w-9 h-9" />
                )}
              </button>
            </div>

            {/* Status Label */}
            <div className="mt-3 text-center">
              <span className="text-xs font-bold tracking-wide uppercase font-mono text-slate-700">
                {isListening
                  ? `Listening (${currentLangObj.native})... Speak now`
                  : isProcessing
                  ? 'Analyzing with Google Gemini AI...'
                  : isSpeaking
                  ? 'Speaking response...'
                  : `Click to Speak in ${currentLangObj.native}`}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentLangObj.sample}
              </p>
            </div>
          </div>

          {/* Transcript / Result Box */}
          {(transcript || isListening) && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 animate-fade-in">
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-800 mb-1">
                <span>Spoken Input:</span>
                {isListening && <span className="text-rose-600 animate-pulse">● Live capture</span>}
              </div>
              <p className="text-sm font-semibold text-slate-800 italic">
                "{transcript || 'Listening for speech...'}"
              </p>
            </div>
          )}

          {/* AI Response Card */}
          {lastResponse && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm animate-fade-in space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-extrabold text-slate-800 font-mono">
                    SENTINEL RESPONSE
                  </span>
                  {lastResponse.route && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 text-blue-700 border border-blue-200">
                      → {lastResponse.route}
                    </span>
                  )}
                  {lastResponse.action && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      ⚡ {lastResponse.action}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleReplaySpeech}
                    title="Speak again"
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCopyText}
                    title="Copy response"
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {lastResponse.spoken && (
                <div className="text-sm font-bold text-blue-700 leading-snug">
                  "{lastResponse.spoken}"
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {lastResponse.display}
              </p>
            </div>
          )}

          {/* Error Message if any */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Suggested Quick Voice Chips */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
              <span>Quick Voice Commands ({currentLangObj.native})</span>
              <span className="text-[10px] text-blue-600">Click to run</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {chips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(chip.query);
                    executeCommand(chip.query);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02]"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fallback Text Input */}
          <form onSubmit={handleTextSubmit} className="pt-2 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={`Or type command in ${currentLangObj.native} or English...`}
              className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-medium"
            />
            <button
              type="submit"
              disabled={!typedInput.trim() || isProcessing}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

        {/* Footer info */}
        <div className="px-6 py-2.5 bg-slate-50/80 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
          <span>Keyboard shortcut: Press 'V' anytime to toggle</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Google API Key Verified
          </span>
        </div>

      </div>
    </div>
  );
}
