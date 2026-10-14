import React, { useState, useEffect } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { voiceService, SUPPORTED_LANGUAGES } from '../services/voiceService';

export default function FloatingVoiceTrigger({ onOpen }) {
  const [currentLang, setCurrentLang] = useState(voiceService.getLanguage());

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentLang(voiceService.getLanguage());
    };
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
      {/* Tooltip / Label */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-mono backdrop-blur-md shadow-lg border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <span>Aegis Voice AI</span>
        <span className="text-cyan-400 font-bold">({langObj.flag} {langObj.native})</span>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Press 'V'</span>
      </div>

      {/* Floating Trigger Button */}
      <button
        onClick={onOpen}
        aria-label="Open Voice AI Assistant"
        className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(37,99,235,0.45)] hover:shadow-[0_10px_35px_rgba(6,182,212,0.6)] hover:scale-108 active:scale-95 transition-all duration-300 border-2 border-white/60 cursor-pointer"
      >
        {/* Subtle Ambient Pulse Ring */}
        <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping pointer-events-none" />

        {/* Mini Gemini Sparkle Badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-cyan-300 border border-cyan-400 flex items-center justify-center text-[10px] shadow-sm">
          <Sparkles className="w-2.5 h-2.5" />
        </span>

        {/* Mic Icon */}
        <Mic className="w-6 h-6 text-white drop-shadow" />

        {/* Language flag tag at bottom */}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.2 bg-white/90 text-slate-800 rounded-full font-bold shadow-sm border border-slate-200">
          {langObj.flag}
        </span>
      </button>
    </div>
  );
}
