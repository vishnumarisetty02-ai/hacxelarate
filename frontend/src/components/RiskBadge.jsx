import React from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RiskBadge({ severity = 'Medium', size = 'sm' }) {
  const sev = (severity || 'Medium').toLowerCase();

  const configs = {
    critical: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertOctagon,
      label: 'Critical'
    },
    high: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: AlertTriangle,
      label: 'High'
    },
    medium: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertCircle,
      label: 'Medium'
    },
    low: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Low'
    }
  };

  const current = configs[sev] || configs.medium;
  const Icon = current.icon;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold border clay-badge shadow-sm ${
        current.bg
      } ${sizeClasses[size] || sizeClasses.sm}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </span>
  );
}
