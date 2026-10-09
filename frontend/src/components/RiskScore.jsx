import React from 'react';

export default function RiskScore({ score = 0, variant = 'circle', size = 'md' }) {
  const numScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));

  const getScoreColor = (s) => {
    if (s >= 85) return 'text-rose-600 stroke-rose-600 bg-rose-500';
    if (s >= 65) return 'text-orange-500 stroke-orange-500 bg-orange-500';
    if (s >= 40) return 'text-amber-500 stroke-amber-500 bg-amber-500';
    return 'text-emerald-600 stroke-emerald-600 bg-emerald-500';
  };

  const getScoreBg = (s) => {
    if (s >= 85) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (s >= 65) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (s >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  if (variant === 'bar') {
    return (
      <div className="w-full space-y-1">
        <div className="flex justify-between items-center text-xs font-mono font-bold">
          <span className="text-slate-500">Score</span>
          <span className={getScoreColor(numScore).split(' ')[0]}>{numScore}/100</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner border border-slate-200/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getScoreColor(numScore).split(' ')[2]}`}
            style={{ width: `${numScore}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border clay-badge ${getScoreBg(numScore)}`}>
        {numScore} / 100
      </span>
    );
  }

  // Circular gauge variant
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (numScore / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-20 h-20 transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ${getScoreColor(numScore).split(' ')[1]}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-base font-black font-mono leading-none ${getScoreColor(numScore).split(' ')[0]}`}>
          {numScore}
        </span>
        <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Risk</span>
      </div>
    </div>
  );
}
