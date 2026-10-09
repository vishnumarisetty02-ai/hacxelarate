import React, { useState, useEffect } from 'react';
import { Globe, ShieldAlert, AlertTriangle, ShieldCheck, RefreshCw, Sparkles, AlertCircle, Server } from 'lucide-react';
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
  }, []);

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
          <div className="clay-card-inset p-4 text-xs space-y-1.5 border-blue-200 bg-blue-50/40 animate-slide-up">
            <div className="flex items-center justify-between font-mono">
              <span className="font-bold text-blue-800">{scanResult.name}</span>
              <span className="text-rose-700 font-bold px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-200">
                Risk Score: {scanResult.risk_score || scanResult.riskScore}/100
              </span>
            </div>
            <p className="text-slate-600">
              Reasons: {(scanResult.reasons || scanResult.detectionReasons || []).join(', ')}
            </p>
          </div>
        )}
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
