import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Users,
  Smartphone,
  Globe,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Zap,
  Mic,
  Globe2
} from 'lucide-react';
import { voiceService, SUPPORTED_LANGUAGES } from '../services/voiceService';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import StatCard from '../components/StatCard';
import ThreatTable from '../components/ThreatTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { threatService } from '../services/threatService';
import { FadeIn, StaggerContainer } from '../components/animations';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [threats, setThreats] = useState([]);
  const [takedownSuccessMsg, setTakedownSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sweeping, setSweeping] = useState(false);

  const handleAutonomousSweep = async () => {
    setSweeping(true);
    try {
      const res = await threatService.runAutonomousSweep('ApexPay Global');
      setTakedownSuccessMsg(`Autonomous Multi-Vector Sweep Complete: ${res.data?.vectors_scanned?.length || 3} vectors audited, Executive Risk Index: ${res.data?.executive_risk_index || 88}/100.`);
      await loadDashboardData();
      setTimeout(() => setTakedownSuccessMsg(null), 6000);
    } catch (err) {
      setErrorMsg(err.message || 'Autonomous sweep failed.');
    } finally {
      setSweeping(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [dashRes, threatsRes] = await Promise.all([
        threatService.getDashboardData(),
        threatService.getThreats()
      ]);
      setData(dashRes);
      setThreats(threatsRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setErrorMsg(err.message || 'Error communicating with threat backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleAnalysisUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener('aegis:threat_analysis_created', handleAnalysisUpdate);
    return () => {
      window.removeEventListener('aegis:threat_analysis_created', handleAnalysisUpdate);
    };
  }, []);

  const handleTakedown = async (threat) => {
    try {
      const res = await threatService.triggerTakedown(threat.id, 'Automated Analyst Escalation');
      setTakedownSuccessMsg(`Takedown request initiated for ${threat.name}.`);
      setThreats((prev) =>
        prev.map((t) => (t.id === threat.id ? { ...t, status: 'Mitigated' } : t))
      );
      setTimeout(() => setTakedownSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Takedown error:', err);
    }
  };

  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      await threatService.seedDemoData();
      await loadDashboardData();
      setTakedownSuccessMsg('Demo attack campaigns (ApexHarvest & NexusPhish) seeded successfully!');
      setTimeout(() => setTakedownSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg('Failed to seed demo data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      await threatService.resetDemoData();
      await loadDashboardData();
      setTakedownSuccessMsg('Database reset to clean baseline state.');
      setTimeout(() => setTakedownSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg('Failed to reset data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Ingesting Multi-Source Threat Feeds..." size="lg" />
      </div>
    );
  }

  const { stats, riskTrend, distribution } = data || {};
  const totalCount = stats?.totalThreats ?? threats.length ?? 0;

  return (
    <div className="space-y-6 pb-12 animate-slide-up">
      {/* Toast Notification */}
      {takedownSuccessMsg && (
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2.5 shadow-[6px_6px_16px_rgba(16,185,129,0.15)] animate-slide-down">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>{takedownSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-white border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2.5 shadow-[6px_6px_16px_rgba(244,63,94,0.15)] animate-slide-down">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="clay-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight anim-heading">
              Threat Intelligence Command Center
            </h1>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold anim-subtitle">
              Live Sentinel Online
            </span>
          </div>
          <p className="text-xs text-slate-500 anim-subtitle">
            Autonomous multi-vector defense: Brand Impersonation, Mobile Malware APKs & Typosquatted URLs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap anim-actions">
          <button
            onClick={handleAutonomousSweep}
            disabled={sweeping}
            className="clay-button-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            {sweeping ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
            <span>Autonomous Brand Sweep</span>
          </button>
          <button
            onClick={handleSeedDemo}
            className="clay-button px-3.5 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Seed Demo Attack
          </button>
          <button
            onClick={handleResetDemo}
            className="clay-button px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 flex items-center gap-1.5"
          >
            Reset
          </button>
          <button
            onClick={loadDashboardData}
            className="clay-button px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            Refresh
          </button>
        </div>
      </div>

      {/* Multilingual Voice Command Hub Banner (Google Gemini Powered) */}
      <div className="clay-card p-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-cyan-50/90 border border-blue-200/80 anim-content flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_4px_20px_rgba(37,99,235,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.3)] flex-shrink-0">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-slate-800 font-mono">
                VOICE SENTINEL
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Google Gemini AI Active
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              Control the platform in any language: Telugu (తెలుగు), Hindi (हिंदी), English, Tamil (தமிழ்), & 15+ more.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-aegis-voice'))}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Speak Voice Command</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/80 text-blue-100 font-mono">
              'V'
            </span>
          </button>
        </div>
      </div>

      {/* 5-Stage Core Pipeline Narrative (Clean Minimalist White Design) */}
      <div className="clay-card p-5 anim-content">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 font-bold">
              Autonomous Defense Architecture
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              End-to-End Threat Intelligence & Correlation Engine
            </h3>
            <p className="text-xs text-slate-500 max-w-xl">
              Correlating isolated fake handles, lookalike domains, and rogue APKs into unified attack campaigns.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-sm">
              1. DETECT
            </span>
            <span className="text-slate-300">&rarr;</span>
            <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold shadow-sm">
              2. EXPLAIN
            </span>
            <span className="text-slate-300">&rarr;</span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold shadow-sm">
              3. PRIORITIZE
            </span>
            <span className="text-slate-300">&rarr;</span>
            <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold shadow-sm">
              4. CONNECT
            </span>
            <span className="text-slate-300">&rarr;</span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold shadow-sm">
              5. RECOMMEND
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid (4 Core + 4 Vectors) */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" baseDelay={0.05} stagger={0.08}>
        {/* 1. Total Threats */}
        <StatCard
          title="Total Threats"
          value={stats?.totalThreats ?? threats.length ?? 0}
          subtitle="All vectors analyzed"
          icon={ShieldAlert}
          delta="+14%"
          trend="up"
          color="blue"
        />

        {/* 2. Critical Threats */}
        <StatCard
          title="Critical Threats"
          value={stats?.criticalThreats ?? threats.filter(t => (t.severity || '').toLowerCase() === 'critical').length ?? 0}
          subtitle="Malware & high-impact scams"
          icon={AlertOctagon}
          delta="+2"
          trend="up"
          color="rose"
        />

        {/* 3. Social Threats */}
        <StatCard
          title="Social Threats"
          value={stats?.socialThreats ?? threats.filter(t => (t.type || t.threat_type) === 'social').length ?? 0}
          subtitle="Impersonations & bots"
          icon={Users}
          delta="+8"
          trend="up"
          color="cyan"
        />

        {/* 4. Suspicious Apps */}
        <StatCard
          title="Rogue Mobile Apps"
          value={stats?.suspiciousApps ?? threats.filter(t => (t.type || t.threat_type) === 'app').length ?? 0}
          subtitle="Trojanized APK clones"
          icon={Smartphone}
          delta="+3"
          trend="up"
          color="amber"
        />
      </StaggerContainer>

      {/* Visual Analytics & Charts */}
      <FadeIn delay="0.15s">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trend Chart */}
        <div className="lg:col-span-2 clay-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Risk Trend & Trajectory</h3>
              <p className="text-xs text-slate-500">7-day aggregated enterprise exposure score</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Risk Index: {stats?.overallRiskScore || 78}/100
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    color: '#1e293b'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="riskScore"
                  name="Risk Index"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="#dbeafe"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="threatsDetected"
                  name="Threats Detected"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  fill="#ffe4e6"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Distribution Chart */}
        <div className="clay-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Attack Vector Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Breakdown by threat channel</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                >
                  {(distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
            {(distribution || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="text-slate-800 ml-auto font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </FadeIn>

      {/* Recent Incidents Table */}
      <FadeIn delay="0.25s">
        <ThreatTable
          threats={threats}
          title="Recent Detected Incidents"
          subtitle="Priority triage queue for immediate brand protection enforcement"
          onTakedown={handleTakedown}
        />
      </FadeIn>
    </div>
  );
}
