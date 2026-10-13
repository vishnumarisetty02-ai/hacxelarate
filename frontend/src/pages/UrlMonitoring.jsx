import React, { useState, useEffect } from 'react';
import { Globe, ShieldAlert, AlertTriangle, ShieldCheck, RefreshCw, Sparkles, AlertCircle, Server, Zap, Search, ExternalLink } from 'lucide-react';
import StatCard from '../components/StatCard';
import ThreatCard from '../components/ThreatCard';
import ThreatTable from '../components/ThreatTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { threatService } from '../services/threatService';
import { FadeIn, StaggerContainer } from '../components/animations';

export default function UrlMonitoring() {
  const [loading, setLoading] = useState(true);
  const [threats, setThreats] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [urlInput, setUrlInput] = useState('https://apexpay-login-portal-auth.com/secure-signin');
  const [scanResult, setScanResult] = useState(null);
  const [takedownMsg, setTakedownMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Advanced Typosquat & Homoglyph Permutation Radar State
  const [radarDomain, setRadarDomain] = useState('apexpay.com');
  const [typosquats, setTyposquats] = useState([]);
  const [scanningRadar, setScanningRadar] = useState(false);
  const [radarLoaded, setRadarLoaded] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await threatService.getThreats({ type: 'url' });
      setThreats(res.data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch URL threats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-load typosquat radar baseline
    handleRunTyposquatRadar('apexpay.com');
  }, []);

  const handleRunTyposquatRadar = async (target) => {
    const query = target || radarDomain || 'apexpay.com';
    setScanningRadar(true);
    try {
      const res = await threatService.generateTyposquats(query);
      setTyposquats(res.data?.permutations || []);
      setRadarLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setScanningRadar(false);
    }
  };

  const handleTakedown = async (threat) => {
    try {
      const res = await threatService.triggerTakedown(threat.id, 'Phishing domain registrar abuse complaint');
      setTakedownMsg(`Takedown notice sent for ${threat.name}.`);
      setThreats((prev) =>
        prev.map((t) => (t.id === threat.id ? { ...t, status: 'Mitigated' } : t))
      );
      setTimeout(() => setTakedownMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Takedown failed.');
    }
  };

  const handleAnalyzeUrl = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setAnalyzing(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await threatService.analyzeUrl(urlInput);
      const data = res.data;
      setScanResult(data);
      setThreats((prev) => [data, ...prev]);
      setTakedownMsg(`URL Inspection Complete: ${data.name} assigned Risk Score ${data.risk_score || data.riskScore}/100.`);
      setTimeout(() => setTakedownMsg(null), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'URL Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading && threats.length === 0) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Scanning Global DNS & Certificate Transparency Logs..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-slide-up">
      {/* Toast Notification */}
      {takedownMsg && (
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2.5 shadow-[6px_6px_16px_rgba(16,185,129,0.15)] animate-slide-down">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>{takedownMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-white border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2.5 shadow-[6px_6px_16px_rgba(244,63,94,0.15)] animate-slide-down">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-inner">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight anim-heading">
                Phishing Domain & Typosquatting Radar
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 anim-subtitle">
                Lexical analysis, certificate transparency monitoring, homoglyph detection & phishing kits.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          className="clay-button px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 self-start sm:self-center anim-actions"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          Rescan DNS
        </button>
      </div>

      {/* URL Scanner Form Box */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              On-Demand Phishing Heuristics & Typosquatting Scanner
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setUrlInput('https://apexpay-login-portal-auth.com/secure-signin')}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            Use Sample Phishing URL
          </button>
        </div>

        <form onSubmit={handleAnalyzeUrl} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. https://apexpay-login-verify-account.com"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner font-medium"
            required
          />
          <button
            type="submit"
            disabled={analyzing}
            className="clay-button-primary px-6 py-2.5 font-bold text-xs flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            <span>Analyze URL</span>
          </button>
        </form>

        {scanResult && (
          <div className="clay-card-inset p-4 text-xs space-y-2 border-blue-200 bg-blue-50/50 animate-slide-up">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
              <span className="font-bold text-blue-900 break-all">{scanResult.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                  Entropy: {scanResult.evidence?.shannonEntropy || '3.42'}
                </span>
                <span className="text-rose-700 font-bold px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-200 shadow-sm">
                  Risk Score: {scanResult.risk_score || scanResult.riskScore}/100
                </span>
              </div>
            </div>
            <p className="text-slate-700 font-medium">
              Detection Drivers: {(scanResult.reasons || scanResult.detectionReasons || []).join(' • ')}
            </p>
            {scanResult.evidence?.mitreAttack && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-500 font-semibold">MITRE ATT&CK:</span>
                {scanResult.evidence.mitreAttack.map((m, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono font-semibold">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADVANCED FEATURE: Autonomous Typosquat & Lookalike Permutation Radar */}
      <div className="clay-card p-6 space-y-5 border-l-4 border-l-blue-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Autonomous Typosquat & Homoglyph Permutation Radar
              </h3>
              <p className="text-xs text-slate-500">
                Proactive discovery of Cyrillic lookalikes, combosquat lures, and suspicious TLD swaps before weaponization.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={radarDomain}
              onChange={(e) => setRadarDomain(e.target.value)}
              placeholder="e.g. apexpay.com"
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 sm:w-44"
            />
            <button
              type="button"
              onClick={() => handleRunTyposquatRadar(radarDomain)}
              disabled={scanningRadar}
              className="clay-button-primary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
            >
              {scanningRadar ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Scan Radar</span>
            </button>
          </div>
        </div>

        {/* Permutations Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3.5">Candidate Permutation</th>
                <th className="py-2.5 px-3.5">Attack Strategy</th>
                <th className="py-2.5 px-3.5">Entropy</th>
                <th className="py-2.5 px-3.5">Risk Level</th>
                <th className="py-2.5 px-3.5">Registrar Telemetry</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {typosquats.map((p, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-2.5 px-3.5 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">{p.domain}</span>
                      {p.punycode && p.punycode !== p.domain && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                          Punycode: {p.punycode}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-600">{p.strategy}</td>
                  <td className="py-2.5 px-3.5 font-mono text-slate-500">{p.entropy}</td>
                  <td className="py-2.5 px-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      p.risk_score >= 80
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {p.risk_level} ({p.risk_score}/100)
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-500 text-[11px]">
                    <div>{p.registrar}</div>
                    <div className="text-[10px] text-slate-400">{p.status}</div>
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setUrlInput(`https://${p.domain}/auth`);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
                    >
                      Scan URL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Metrics */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" baseDelay={0.05} stagger={0.08}>
        <StatCard
          title="Suspicious URLs"
          value={threats.length}
          subtitle="Lookalike domains"
          icon={Globe}
          color="purple"
        />
        <StatCard
          title="Active Phishing Kits"
          value={threats.filter(t => (t.category || t.name || '').toLowerCase().includes('phishing') || (t.category || '').toLowerCase().includes('credential')).length}
          subtitle="Harvesting user credentials"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Typosquatting Domains"
          value={threats.filter(t => (t.detectionReasons || t.reasons || []).some(r => r.toLowerCase().includes('typosquat') || r.toLowerCase().includes('entropy') || r.toLowerCase().includes('similarity'))).length}
          subtitle="Combosquatting & Homoglyphs"
          icon={Server}
          color="orange"
        />
        <StatCard
          title="Domains Suspended"
          value={threats.filter(t => t.status === 'Mitigated').length}
          subtitle="Registrar takedowns executed"
          icon={ShieldCheck}
          color="emerald"
        />
      </StaggerContainer>

      {/* Threat Cards Grid */}
      <FadeIn delay="0.15s">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {threats.slice(0, 6).map((threat) => (
            <ThreatCard key={threat.id} threat={threat} onTakedown={handleTakedown} />
          ))}
        </div>
      </FadeIn>

      {/* Threat Table */}
      <FadeIn delay="0.25s">
        <ThreatTable
          threats={threats}
          title="Detected Malicious Domains"
          subtitle="WHOIS registration age, SSL issuers, and phishing kit signatures"
          onTakedown={handleTakedown}
          initialType="url"
        />
      </FadeIn>
    </div>
  );
}
