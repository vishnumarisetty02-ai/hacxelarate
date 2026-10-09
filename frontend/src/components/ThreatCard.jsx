import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ShieldAlert, ArrowRight, Smartphone, Globe, Users, ShieldCheck } from 'lucide-react';
import RiskBadge from './RiskBadge';
import RiskScore from './RiskScore';

export default function ThreatCard({ threat, onTakedown }) {
  if (!threat) return null;

  const {
    id,
    name,
    category,
    platform,
    type,
    severity,
    riskScore,
    risk_score,
    confidence,
    status,
    url,
    reasons,
    detectionReasons
  } = threat;

  const finalScore = riskScore !== undefined ? riskScore : (risk_score !== undefined ? risk_score : 75);
  const displayReasons = detectionReasons || reasons || [];

  const getTypeIcon = () => {
    switch (type) {
      case 'social':
        return <Users className="w-4 h-4 text-sky-600" />;
      case 'app':
        return <Smartphone className="w-4 h-4 text-amber-600" />;
      case 'url':
        return <Globe className="w-4 h-4 text-rose-600" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-blue-600" />;
    }
  };

  const sevLower = (severity || '').toLowerCase();
  const hoverClass =
    sevLower === 'critical'
      ? 'threat-card-glow-danger'
      : sevLower === 'high'
      ? 'threat-card-glow-warning'
      : 'threat-card-glow-blue';

  return (
    <div className={`clay-card p-5 ${hoverClass} animate-slide-up flex flex-col justify-between space-y-4`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
            {getTypeIcon()}
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">{id}</span>
            <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{name}</h4>
          </div>
        </div>

        <RiskBadge severity={severity} size="xs" />
      </div>

      {/* Details & Platform */}
      <div className="space-y-2">
        <div className="text-xs text-slate-600 flex items-center justify-between font-mono bg-slate-50 p-2 rounded-xl border border-slate-100">
          <span className="text-slate-400">Platform:</span>
          <span className="font-semibold text-slate-700">{platform}</span>
        </div>

        {displayReasons.length > 0 && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {displayReasons[0]}
          </p>
        )}
      </div>

      {/* Score and Takedown footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Risk:</span>
          <RiskScore score={finalScore} variant="badge" />
        </div>

        <div className="flex items-center gap-2">
          {onTakedown && status !== 'Mitigated' && (
            <button
              onClick={() => onTakedown(threat)}
              className="px-3 py-1 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              Takedown
            </button>
          )}

          <Link
            to={`/threats/${id}`}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            title="View Threat Details"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
