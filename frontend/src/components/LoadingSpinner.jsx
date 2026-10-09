import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Analyzing Telemetry...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <div className="p-4 rounded-3xl bg-white shadow-[6px_6px_16px_rgba(180,195,220,0.35),-6px_-6px_16px_rgba(255,255,255,0.95)] border border-blue-100 flex items-center justify-center animate-pulse">
        <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
      </div>
      {text && (
        <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}
