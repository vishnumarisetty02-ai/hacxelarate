import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, ShieldAlert, Cpu, Globe2, Target, Search, Zap, Eye,
  AlertOctagon, ChevronRight, Clock, Database, Layers, BarChart3,
  TrendingUp, Filter, RefreshCw, ExternalLink, Lock, Radio
} from 'lucide-react';
import { threatService } from '../services/threatService';
import { FadeIn, StaggerContainer } from '../components/animations';
import LoadingSpinner from '../components/LoadingSpinner';
import RiskBadge from '../components/RiskBadge';

const VECTOR_ICONS = {
  social: { icon: '👤', color: '#8b5cf6', bg: '#ede9fe' },
  url: { icon: '🌐', color: '#3b82f6', bg: '#dbeafe' },
  app: { icon: '📱', color: '#f59e0b', bg: '#fef3c7' },
  ioc: { icon: '🔍', color: '#ef4444', bg: '#fee2e2' },
};

const ACTOR_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6'];
const MITRE_TACTIC_COLORS = {
  'Initial Access': '#ef4444',
  'Resource Development': '#f59e0b',
  'Reconnaissance': '#3b82f6',
  'Credential Access': '#8b5cf6',
  'Collection': '#06b6d4',
  'Defense Evasion': '#10b981',
  'Persistence': '#f97316',
  'Impact': '#ec4899',
  'Unknown': '#94a3b8',
};

function PulseDot({ color = '#ef4444' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 10, height: 10, position: 'relative' }}>
      <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: color, opacity: 0.4, animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', position: 'relative' }} />
    </span>
  );
}

function FeedItem({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const vecStyle = VECTOR_ICONS[item.threat_type] || VECTOR_ICONS.ioc;
  const isNew = index < 3;

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        background: 'white',
        border: `1px solid ${item.risk_level === 'CRITICAL' ? '#fecaca' : '#e2e8f0'}`,
        borderLeft: `4px solid ${item.risk_level === 'CRITICAL' ? '#ef4444' : item.risk_level === 'HIGH' ? '#f59e0b' : '#3b82f6'}`,
        borderRadius: 10,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: isNew ? '0 0 0 2px rgba(239,68,68,0.08)' : 'none',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = isNew ? '0 0 0 2px rgba(239,68,68,0.08)' : 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Vector icon */}
        <div style={{ width: 36, height: 36, borderRadius: 8, background: vecStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {vecStyle.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {isNew && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#fee2e2', borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <PulseDot /> LIVE
              </span>
            )}
            <RiskBadge level={item.risk_level} />
            <span style={{ fontSize: 11, color: '#64748b' }}>#{item.id?.slice(-6)}</span>
          </div>
          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13.5, marginTop: 4, lineHeight: 1.4 }}>{item.name || item.entity}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.entity}</div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {/* MITRE techniques */}
            {(item.mitre_techniques || []).slice(0, 2).map(t => (
              <span key={t.id} style={{ fontSize: 10, background: '#f1f5f9', color: '#475569', borderRadius: 4, padding: '2px 7px', fontFamily: 'monospace', border: '1px solid #e2e8f0' }}>
                {t.id} · {t.name?.split(' ')[0]}
              </span>
            ))}
            {/* IOC badge */}
            {item.ioc_correlation && (
              <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '2px 7px', border: '1px solid #fde68a', fontWeight: 600 }}>
                IOC: {item.ioc_correlation.source}
              </span>
            )}
            {/* Actor badge */}
            {item.attributed_actor && (
              <span style={{ fontSize: 10, background: '#fdf2f8', color: '#9d174d', borderRadius: 4, padding: '2px 7px', border: '1px solid #fbcfe8', fontWeight: 600 }}>
                🎭 {item.attributed_actor.name?.split('/')[0].trim()}
              </span>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: item.risk_score >= 90 ? '#dc2626' : item.risk_score >= 70 ? '#d97706' : '#2563eb', lineHeight: 1 }}>
            {item.risk_score}
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Risk Score</div>
          <ChevronRight size={14} color="#94a3b8" style={{ marginTop: 6, transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Detection Signals</div>
              {(item.reasons || []).map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: '#374151', marginBottom: 4, display: 'flex', gap: 6 }}>
                  <span style={{ color: '#ef4444', flexShrink: 0 }}>▸</span>{r}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>MITRE ATT&CK</div>
              {(item.mitre_techniques || []).map(t => (
                <div key={t.id} style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: MITRE_TACTIC_COLORS[t.tactic] || '#64748b' }}>{t.id}</span>
                  {' — '}{t.name}
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{t.tactic}</div>
                </div>
              ))}
            </div>
          </div>
          {item.attributed_actor && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#fdf2f8', borderRadius: 8, border: '1px solid #fbcfe8' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9d174d' }}>Attributed Actor: </span>
              <span style={{ fontSize: 12, color: '#9d174d' }}>{item.attributed_actor.name}</span>
              <span style={{ fontSize: 11, color: '#c084fc', marginLeft: 8 }}>({item.attributed_actor.confidence}% confidence)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ThreatActorCard({ actor, color }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px', transition: 'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{actor.name}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            🌍 {actor.origin_region} · {actor.motivation}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {actor.ttps?.slice(0, 4).map(t => (
              <span key={t} style={{ fontSize: 10, background: '#f1f5f9', color: '#475569', borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace', border: '1px solid #e2e8f0' }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color, background: `${color}18`, borderRadius: 8, padding: '3px 10px', display: 'inline-block' }}>
            {actor.confidence}%
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Confidence</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginTop: 4 }}>{actor.linked_threats}</div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>Linked Threats</div>
        </div>
      </div>
      <div style={{ marginTop: 10, padding: '6px 10px', background: actor.active ? '#f0fdf4' : '#f8fafc', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <PulseDot color={actor.active ? '#22c55e' : '#94a3b8'} />
        <span style={{ fontSize: 11, fontWeight: 600, color: actor.active ? '#15803d' : '#64748b' }}>
          {actor.active ? 'ACTIVE THREAT ACTOR' : 'INACTIVE'} · Last seen: {actor.last_seen}
        </span>
      </div>
    </div>
  );
}

function MitreHeatmap({ matrix }) {
  if (!matrix?.length) return null;
  const tactics = [...new Set(matrix.map(t => t.tactic))];

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 680, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tactics.map(tactic => {
          const techs = matrix.filter(t => t.tactic === tactic);
          const tacticColor = MITRE_TACTIC_COLORS[tactic] || '#64748b';
          return (
            <div key={tactic} style={{ flex: '1 0 160px', background: 'white', border: `1px solid #e2e8f0`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ background: tacticColor, color: 'white', fontSize: 10, fontWeight: 700, padding: '5px 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {tactic}
              </div>
              <div style={{ padding: 8 }}>
                {techs.map(t => {
                  const alpha = Math.min(0.9, 0.1 + (t.detection_count / 8));
                  return (
                    <div key={t.id} title={`${t.id}: ${t.name} (${t.detection_count} detections)`}
                      style={{
                        background: t.detection_count > 0 ? `${tacticColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` : '#f8fafc',
                        border: `1px solid ${t.detection_count > 0 ? tacticColor + '44' : '#e2e8f0'}`,
                        borderRadius: 6, padding: '5px 8px', marginBottom: 4, cursor: 'default',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <div style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: t.detection_count > 0 ? tacticColor : '#94a3b8' }}>{t.id}</div>
                      <div style={{ fontSize: 10, color: '#374151', lineHeight: 1.3 }}>{t.name}</div>
                      {t.detection_count > 0 && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: tacticColor, marginTop: 2 }}>
                          {t.detection_count} detected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GeoBar({ data }) {
  const max = Math.max(...data.map(d => d.threat_count));
  const colors = ['#ef4444', '#f59e0b', '#f97316', '#8b5cf6', '#3b82f6', '#06b6d4', '#94a3b8'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((item, i) => (
        <div key={item.country_code} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 13, width: 26, textAlign: 'center' }}>{item.country_code}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{item.country}</span>
              <span style={{ fontSize: 12, color: '#64748b' }}>{item.threat_count} · {item.percentage}%</span>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${(item.threat_count / max) * 100}%`,
                background: colors[i % colors.length],
                height: '100%',
                borderRadius: 4,
                transition: 'width 1s ease'
              }} />
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{item.primary_vector}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function IOCLookupPanel() {
  const [indicator, setIndicator] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!indicator.trim()) return;
    setLoading(true); setErr(null); setResult(null);
    try {
      const res = await threatService.iocLookup(indicator.trim());
      setResult(res.data);
    } catch (ex) {
      setErr(ex.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Database size={16} color="#3b82f6" /> IOC Rapid Lookup Engine
      </div>
      <form onSubmit={handleLookup} style={{ display: 'flex', gap: 8 }}>
        <input
          value={indicator}
          onChange={e => setIndicator(e.target.value)}
          placeholder="Enter domain, IP, hash, or social handle..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0',
            fontSize: 13, outline: 'none', fontFamily: 'monospace', transition: 'border 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#3b82f6'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        <button
          type="submit"
          disabled={loading || !indicator.trim()}
          style={{
            padding: '10px 18px', borderRadius: 8, border: 'none', background: '#3b82f6',
            color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            opacity: loading || !indicator.trim() ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
        >
          {loading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />}
          {loading ? 'Scanning...' : 'Check IOC'}
        </button>
      </form>

      {err && <div style={{ marginTop: 10, padding: 10, background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 12 }}>{err}</div>}

      {result && (
        <div style={{ marginTop: 14 }}>
          <div style={{
            padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${result.is_malicious ? '#fecaca' : '#bbf7d0'}`,
            background: result.is_malicious ? '#fff5f5' : '#f0fdf4'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>{result.is_malicious ? '🚨' : '✅'}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: result.is_malicious ? '#dc2626' : '#16a34a' }}>
                  {result.is_malicious ? `MALICIOUS — ${result.risk_level}` : 'CLEAN — No IOC Match'}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{result.indicator}</div>
              </div>
              {result.is_malicious && (
                <div style={{ marginLeft: 'auto', fontSize: 24, fontWeight: 800, color: '#dc2626' }}>
                  {result.risk_score}<span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>/100</span>
                </div>
              )}
            </div>
            {result.matches?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>IOC Match Details</div>
                {result.matches.map((m, i) => (
                  <div key={i} style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                    <strong>{m.source}</strong> — {m.type} {m.similarity ? `(${m.similarity} similarity)` : ''}
                    <RiskBadge level={m.severity} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Intelligence() {
  const [tab, setTab] = useState('feed');
  const [feed, setFeed] = useState([]);
  const [actors, setActors] = useState([]);
  const [geo, setGeo] = useState(null);
  const [mitre, setMitre] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vectorFilter, setVectorFilter] = useState('all');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [feedRes, actorRes, geoRes, mitreRes, scoreRes] = await Promise.allSettled([
        threatService.getIntelFeed(),
        threatService.getThreatActors(),
        threatService.getGeoAttribution(),
        threatService.getMitreCoverage(),
        threatService.getExecutiveScorecard(),
      ]);
      if (feedRes.status === 'fulfilled') setFeed(feedRes.value.data?.feed || []);
      if (actorRes.status === 'fulfilled') setActors(actorRes.value.data?.threat_actors || []);
      if (geoRes.status === 'fulfilled') setGeo(geoRes.value.data);
      if (mitreRes.status === 'fulfilled') setMitre(mitreRes.value.data);
      if (scoreRes.status === 'fulfilled') setScorecard(scoreRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const filteredFeed = vectorFilter === 'all' ? feed : feed.filter(f => f.threat_type === vectorFilter || f.feed_type?.includes(vectorFilter.toUpperCase()));

  const tabs = [
    { id: 'feed', label: 'Live Intel Feed', icon: Radio },
    { id: 'actors', label: 'Threat Actors', icon: Target },
    { id: 'mitre', label: 'MITRE ATT&CK', icon: Layers },
    { id: 'geo', label: 'Geo Attribution', icon: Globe2 },
    { id: 'ioc', label: 'IOC Lookup', icon: Database },
    { id: 'scorecard', label: 'Exec Scorecard', icon: BarChart3 },
  ];

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}><LoadingSpinner /></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        @keyframes ping { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.8); opacity: 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #1e40af, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={20} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>AI Threat Intelligence Hub</h1>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <PulseDot color="#22c55e" />
                  Real-time IOC Correlation · MITRE ATT&CK Mapping · Geo Attribution · Threat Actor Profiling
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ padding: '9px 18px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#374151', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Refresh Intel
          </button>
        </div>
      </FadeIn>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                background: tab === t.id ? 'linear-gradient(135deg, #1e40af, #6d28d9)' : 'white',
                color: tab === t.id ? 'white' : '#374151',
                fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: tab === t.id ? '0 4px 12px rgba(30,64,175,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
                border: tab !== t.id ? '1.5px solid #e2e8f0' : 'none',
              }}>
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* LIVE INTEL FEED */}
      {tab === 'feed' && (
        <StaggerContainer>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {['all', 'social', 'url', 'app'].map(v => (
              <button key={v} onClick={() => setVectorFilter(v)}
                style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  borderColor: vectorFilter === v ? '#3b82f6' : '#e2e8f0',
                  background: vectorFilter === v ? '#eff6ff' : 'white',
                  color: vectorFilter === v ? '#1d4ed8' : '#475569'
                }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <PulseDot /> {filteredFeed.length} signals active
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredFeed.map((item, i) => <FeedItem key={item.id || i} item={item} index={i} />)}
          </div>
        </StaggerContainer>
      )}

      {/* THREAT ACTORS */}
      {tab === 'actors' && (
        <StaggerContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
            {actors.map((actor, i) => (
              <ThreatActorCard key={actor.id} actor={actor} color={ACTOR_COLORS[i % ACTOR_COLORS.length]} />
            ))}
          </div>
        </StaggerContainer>
      )}

      {/* MITRE HEATMAP */}
      {tab === 'mitre' && mitre && (
        <FadeIn>
          <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Techniques Monitored', value: mitre.total_techniques_monitored, color: '#3b82f6' },
              { label: 'Actively Detected', value: mitre.detected_techniques, color: '#ef4444' },
              { label: 'Coverage', value: `${mitre.coverage_percentage}%`, color: '#10b981' },
            ].map(s => (
              <div key={s.label} style={{ flex: '1 0 140px', background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 14 }}>MITRE ATT&CK Technique Heatmap</div>
            <MitreHeatmap matrix={mitre.matrix} />
          </div>
        </FadeIn>
      )}

      {/* GEO ATTRIBUTION */}
      {tab === 'geo' && geo && (
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe2 size={16} color="#3b82f6" /> Origin Attribution by Country
              </div>
              <GeoBar data={geo.geo_data || []} />
            </div>
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 14 }}>Attribution Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '14px 16px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 700 }}>Top Threat Origin</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#991b1b', marginTop: 4 }}>{geo.top_origin}</div>
                </div>
                <div style={{ padding: '14px 16px', background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd' }}>
                  <div style={{ fontSize: 12, color: '#0369a1', fontWeight: 700 }}>Attribution Confidence</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0c4a6e', marginTop: 4 }}>{geo.attribution_confidence}%</div>
                </div>
                <div style={{ padding: '14px 16px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 12, color: '#15803d', fontWeight: 700 }}>Total Attributed Threats</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#14532d', marginTop: 4 }}>{geo.total_threats_attributed}</div>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                  <strong>Methodology:</strong> {geo.methodology}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* IOC LOOKUP */}
      {tab === 'ioc' && (
        <FadeIn>
          <IOCLookupPanel />
        </FadeIn>
      )}

      {/* EXECUTIVE SCORECARD */}
      {tab === 'scorecard' && scorecard && (
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Risk Index */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={16} color="#ef4444" /> Risk Index
              </div>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 56, fontWeight: 900, color: scorecard.scorecard.overall_risk_index >= 70 ? '#dc2626' : scorecard.scorecard.overall_risk_index >= 40 ? '#d97706' : '#16a34a', lineHeight: 1 }}>
                  {scorecard.scorecard.overall_risk_index}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Overall Risk Score / 100</div>
                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20,
                  background: scorecard.scorecard.risk_trend === 'ESCALATING' ? '#fef2f2' : '#f0fdf4',
                  color: scorecard.scorecard.risk_trend === 'ESCALATING' ? '#dc2626' : '#16a34a',
                  fontSize: 11, fontWeight: 700 }}>
                  <TrendingUp size={12} />
                  {scorecard.scorecard.risk_trend}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                {[
                  { label: 'MTTD', value: `${scorecard.scorecard.mean_time_to_detect_hrs}h`, ok: true },
                  { label: 'MTTK', value: `${scorecard.scorecard.mean_time_to_takedown_hrs}h`, ok: true },
                  { label: 'ML Accuracy', value: scorecard.scorecard.ml_model_accuracy, ok: true },
                  { label: 'False+', value: scorecard.scorecard.false_positive_rate, ok: true },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center', padding: 10, background: '#f8fafc', borderRadius: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Exposure */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={16} color="#f59e0b" /> Financial Exposure
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(scorecard.financial_exposure).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#fefce8', borderRadius: 8, border: '1px solid #fef08a' }}>
                    <span style={{ fontSize: 12, color: '#713f12', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={16} color="#10b981" /> Compliance Status
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(scorecard.compliance).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: v === 'COMPLIANT' ? '#f0fdf4' : v === 'PARTIAL' ? '#fefce8' : '#fef2f2', borderRadius: 8 }}>
                    <span style={{ fontSize: 12, color: '#1e293b', fontWeight: 600 }}>{k.replace(/_/g, ' ').toUpperCase()}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: v === 'COMPLIANT' ? '#dcfce7' : v === 'PARTIAL' ? '#fef9c3' : '#fee2e2',
                      color: v === 'COMPLIANT' ? '#166534' : v === 'PARTIAL' ? '#713f12' : '#991b1b' }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
