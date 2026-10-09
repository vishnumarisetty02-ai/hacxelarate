import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import CountUp from './CountUp';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  delta,
  trend = 'up',
  color = 'blue'
}) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    cyan: 'bg-sky-50 text-sky-600 border-sky-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100'
  };

  const badgeColor = colorStyles[color] || colorStyles.blue;

  return (
    <div className="clay-card p-5 clay-card-hover animate-slide-up flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-2xl lg:text-3xl font-black text-slate-800 font-mono tracking-tight">
            <CountUp value={value} duration={1000} />
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl border shadow-inner ${badgeColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="truncate max-w-[180px]">{subtitle}</span>
        {delta && (
          <div
            className={`flex items-center gap-1 font-mono font-bold text-[11px] ${
              trend === 'up' ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{delta}</span>
          </div>
        )}
      </div>
    </div>
  );
}
