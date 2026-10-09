import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldAlert, Cpu, ShieldCheck, RefreshCw, UploadCloud, AlertCircle, Sparkles } from 'lucide-react';
import StatCard from '../components/StatCard';
import ThreatCard from '../components/ThreatCard';
import ThreatTable from '../components/ThreatTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { threatService } from '../services/threatService';
import { FadeIn, StaggerContainer } from '../components/animations';

export default function AppMonitoring() {
  const [loading, setLoading] = useState(true);
  const [threats, setThreats] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [appName, setAppName] = useState('');
  const [takedownMsg, setTakedownMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [apkScanResult, setApkScanResult] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await threatService.getThreats({ type: 'app' });
      setThreats(res.data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch mobile app threats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTakedown = async (threat) => {
    try {
      const res = await threatService.triggerTakedown(threat.id, 'Malicious APK signature takedown');
      setTakedownMsg(`Takedown notice dispatched for ${threat.name}.`);
      setThreats((prev) =>
        prev.map((t) => (t.id === threat.id ? { ...t, status: 'Mitigated' } : t))
      );
      setTimeout(() => setTakedownMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Takedown failed.');
    }
  };

  const handleUploadScan = async (e) => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg(null);
    setApkScanResult(null);

    try {
      const res = await threatService.scanApk(selectedFile, appName || 'ApexPay Quick Loan APK');
      const data = res.data;
      setApkScanResult(data);
      setThreats((prev) => [data, ...prev]);
      setTakedownMsg(`APK Analysis Complete: ${data.name} assigned Risk Score ${data.risk_score || data.riskScore}/100.`);
      setTimeout(() => setTakedownMsg(null), 5000);
      setSelectedFile(null);
      setAppName('');
    } catch (err) {
      setErrorMsg(err.message || 'APK Upload & Inspection failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading && threats.length === 0) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Decompiling APK Manifests & Permission Graphs..." />
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
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight anim-heading">
                Rogue Mobile App & APK Radar
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 anim-subtitle">
                Static reverse-engineering of Android APK packages, trojans, overlay malware & SMS sniffers.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          className="clay-button px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 self-start sm:self-center anim-actions"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          Rescan Stores
        </button>
      </div>

      {/* Upload / Demo Scan Box */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">
            On-Demand APK Reverse-Engineering Scanner
          </h3>
        </div>

        <form onSubmit={handleUploadScan} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">APK Package / Binary</label>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile({ name: 'ApexPay_QuickLoan_v2.4_mod.apk', size: 14820000 });
                  setAppName('ApexPay QuickLoan Trojan App');
                }}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                Use Sample APK
              </button>
            </div>
            <input
              type="file"
              accept=".apk,.zip"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-600 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-inner"
            />
            {selectedFile && (
              <span className="block text-[11px] font-mono text-emerald-700 font-bold mt-1.5 truncate">
                Selected: {selectedFile.name}
              </span>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">App / Payload Label (Optional)</label>
            <input
              type="text"
              placeholder="e.g. ApexPay Quick Loan APK"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-inner"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={uploading}
              className="clay-button-primary w-full py-2.5 px-4 font-bold text-xs flex items-center justify-center gap-2"
            >
              {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Inspect APK Binary</span>
            </button>
          </div>
        </form>

        {apkScanResult && (
          <div className="clay-card-inset p-4 text-xs space-y-1.5 border-blue-200 bg-blue-50/40 animate-slide-up">
            <div className="flex items-center justify-between font-mono">
              <span className="font-bold text-blue-800">{apkScanResult.name}</span>
              <span className="text-rose-700 font-bold px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-200">
                Risk Score: {apkScanResult.risk_score || apkScanResult.riskScore}/100
              </span>
            </div>
            <p className="text-slate-600">
              Reasons: {(apkScanResult.reasons || apkScanResult.detectionReasons || []).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Metrics */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" baseDelay={0.05} stagger={0.08}>
        <StatCard
          title="Suspicious Apps"
          value={threats.length}
          subtitle="Clones & rogue listings"
          icon={Smartphone}
          color="amber"
        />
        <StatCard
          title="Trojan Payloads"
          value={threats.filter(t => (t.category || t.name || '').toLowerCase().includes('trojan') || (t.category || '').toLowerCase().includes('dropper') || (t.category || '').toLowerCase().includes('spyware')).length}
          subtitle="Contains SpyNote / SMS sniffers"
          icon={Cpu}
          color="rose"
        />
        <StatCard
          title="SMS & Overlay Risks"
          value={threats.filter(t => (t.detectionReasons || t.reasons || []).some(r => r.toLowerCase().includes('sms') || r.toLowerCase().includes('permission') || r.toLowerCase().includes('accessibility'))).length}
          subtitle="Banking 2FA intercept risks"
          icon={ShieldAlert}
          color="orange"
        />
        <StatCard
          title="Apps Neutralized"
          value={threats.filter(t => t.status === 'Mitigated').length}
          subtitle="Removed from mirrors"
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
          title="Detected Mobile App Anomalies"
          subtitle="Reverse-engineered APK checksums and malicious permission vectors"
          onTakedown={handleTakedown}
          initialType="app"
        />
      </FadeIn>
    </div>
  );
}
