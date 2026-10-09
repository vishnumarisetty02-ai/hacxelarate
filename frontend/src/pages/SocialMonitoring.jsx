import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertOctagon,
  Bot,
  ShieldCheck,
  Filter,
  Search,
  RefreshCw,
  Plus,
  Send,
  AlertCircle,
  Sparkles,
  FileText,
  MessageSquare
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ThreatCard from '../components/ThreatCard';
import ThreatTable from '../components/ThreatTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { threatService } from '../services/threatService';
import { FadeIn, StaggerContainer } from '../components/animations';

export default function SocialMonitoring() {
  const [loading, setLoading] = useState(true);
  const [threats, setThreats] = useState([]);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [takedownMsg, setTakedownMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Analysis Modal state: 'profile' or 'content'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Profile Analysis Form
  const [profileForm, setProfileForm] = useState({
    username: '@ApexPay_SupportDesk_VIP',
    display_name: 'ApexPay VIP Support Care',
    bio: 'Official 24/7 ApexPay customer recovery. Send your OTP immediately to unlock wallet.',
    followers: 18,
    following: 890,
    account_age: '2 days',
    verified: false,
    external_url: 'https://apexpay-login-portal-auth.com/secure-signin'
  });

  // Scam Content Analysis Form
  const [contentForm, setContentForm] = useState({
    text: 'URGENT: Your ApexPay wallet is locked due to suspicious activity. Share OTP or transfer funds to temporary recovery vault within 1 hour.',
    url: 'https://apexpay-support-recovery.top/verify'
  });

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await threatService.getThreats({ type: 'social' });
      setThreats(res.data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch social threats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTakedown = async (threat) => {
    try {
      const res = await threatService.triggerTakedown(threat.id, 'Social profile trademark impersonation');
      setTakedownMsg(`Takedown request initiated for ${threat.name}.`);
      setThreats((prev) =>
        prev.map((t) => (t.id === threat.id ? { ...t, status: 'Mitigated' } : t))
      );
      setTimeout(() => setTakedownMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Takedown failed.');
    }
  };

  // 1. Run Profile Analysis
  const handleRunProfileAnalysis = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setAnalysisResult(null);
    setErrorMsg(null);

    try {
      const res = await threatService.analyzeSocialProfile(profileForm);
      setAnalysisResult(res.data);
      setThreats((prev) => [res.data, ...prev]);
      setTakedownMsg(`Profile Analysis Complete: ${res.data.name} assessed with Risk Score ${res.data.risk_score || res.data.riskScore}/100.`);
      setTimeout(() => setTakedownMsg(null), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Profile analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  // 2. Run Scam Content Analysis
  const handleRunContentAnalysis = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setAnalysisResult(null);
    setErrorMsg(null);

    try {
      const res = await threatService.analyzeScamContent(contentForm);
      const data = res.data;
      setAnalysisResult({
        ...data,
        name: 'Scam Content / Phishing DM',
        category: 'Social Engineering & Urgent Scam',
        platform: 'Direct Message / Post'
      });
      setTakedownMsg(`Scam Content Analysis Complete: Risk Score ${data.risk_score || data.riskScore}/100.`);
      setTimeout(() => setTakedownMsg(null), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Content analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const platforms = ['all', 'Twitter / X', 'Instagram', 'LinkedIn', 'Facebook'];

  const filteredThreats = platformFilter === 'all'
    ? threats
    : threats.filter((t) => (t.platform || '').toLowerCase().includes(platformFilter.toLowerCase()));

  if (loading && threats.length === 0) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Scanning Social Media Graphs & Profile Clones..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-slide-up">
      {/* Toast Notifications */}
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
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight anim-heading">
                Social Media Impersonation Radar
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 anim-subtitle">
                Detect fake corporate accounts, fake support bots, executive clones & urgency scams.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 anim-actions">
          <button
            onClick={() => {
              setActiveTab('profile');
              setAnalysisResult(null);
              setIsModalOpen(true);
            }}
            className="clay-button-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analyze Profile
          </button>

          <button
            onClick={() => {
              setActiveTab('content');
              setAnalysisResult(null);
              setIsModalOpen(true);
            }}
            className="clay-button px-4 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            Analyze Scam Text
          </button>

          <button
            onClick={loadData}
            className="clay-button px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            Rescan
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" baseDelay={0.05} stagger={0.08}>
        <StatCard
          title="Social Threats"
          value={threats.length}
          subtitle="Active suspect profiles"
          icon={Users}
          color="cyan"
        />
        <StatCard
          title="Fake Support Bots"
          value={threats.filter(t => (t.name || t.category || '').toLowerCase().includes('support') || (t.category || '').includes('Bot')).length}
          subtitle="Targeting customer grievances"
          icon={Bot}
          color="rose"
        />
        <StatCard
          title="Executive / VIP Clones"
          value={threats.filter(t => (t.name || t.category || '').toLowerCase().includes('executive') || (t.name || t.category || '').toLowerCase().includes('vip') || (t.category || '').toLowerCase().includes('impersonation')).length}
          subtitle="Brand impersonators"
          icon={AlertOctagon}
          color="orange"
        />
        <StatCard
          title="Takedowns Enforced"
          value={threats.filter(t => t.status === 'Mitigated').length}
          subtitle="Profiles suspended"
          icon={ShieldCheck}
          color="emerald"
        />
      </StaggerContainer>

      {/* Platform Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Filter Platform:
        </span>
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setPlatformFilter(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              platformFilter === p
                ? 'clay-button-primary'
                : 'clay-button text-slate-600 hover:text-slate-900'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Threat Cards Grid */}
      <FadeIn delay="0.15s">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredThreats.slice(0, 6).map((threat) => (
            <ThreatCard key={threat.id} threat={threat} onTakedown={handleTakedown} />
          ))}
        </div>
      </FadeIn>

      {/* Full Threat Table */}
      <FadeIn delay="0.25s">
        <ThreatTable
          threats={filteredThreats}
          title="Social Media Impersonation Queue"
          subtitle="Live feed of high-risk profiles detected by trademark cosine similarity and bot ratio analysis"
          onTakedown={handleTakedown}
          initialType="social"
        />
      </FadeIn>

      {/* Modal for Profile / Scam Text Analysis */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-overlay">
          <div className="clay-card w-full max-w-xl p-6 space-y-4 animate-modal-up shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">
                  {activeTab === 'profile' ? 'Inspect Social Profile' : 'Evaluate Scam / Phishing Text'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center text-sm font-bold"
              >
                &times;
              </button>
            </div>

            {/* Tab switch inside modal */}
            <div className="flex p-1 rounded-xl bg-slate-100 gap-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Social Profile Model
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeTab === 'content' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Scam NLP TF-IDF Model
              </button>
            </div>

            {/* Profile Form */}
            {activeTab === 'profile' && (
              <form onSubmit={handleRunProfileAnalysis} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Handle / Username</label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={profileForm.display_name}
                    onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bio / Profile Description</label>
                  <textarea
                    rows={2}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Followers Count</label>
                    <input
                      type="number"
                      value={profileForm.followers}
                      onChange={(e) => setProfileForm({ ...profileForm, followers: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">External Link in Bio</label>
                    <input
                      type="text"
                      value={profileForm.external_url}
                      onChange={(e) => setProfileForm({ ...profileForm, external_url: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="clay-button px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={analyzing}
                    className="clay-button-primary px-5 py-2 font-bold flex items-center gap-1.5"
                  >
                    {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Run AI Classification</span>
                  </button>
                </div>
              </form>
            )}

            {/* Content Form */}
            {activeTab === 'content' && (
              <form onSubmit={handleRunContentAnalysis} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Suspicious Text / DM / Social Post</label>
                  <textarea
                    rows={4}
                    value={contentForm.text}
                    onChange={(e) => setContentForm({ ...contentForm, text: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Linked Phishing URL (Optional)</label>
                  <input
                    type="text"
                    value={contentForm.url}
                    onChange={(e) => setContentForm({ ...contentForm, url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="clay-button px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={analyzing}
                    className="clay-button-primary px-5 py-2 font-bold flex items-center gap-1.5"
                  >
                    {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                    <span>Analyze Scam Heuristics</span>
                  </button>
                </div>
              </form>
            )}

            {/* Result Preview Box */}
            {analysisResult && (
              <div className="clay-card-inset p-4 space-y-2 border-blue-200 bg-blue-50/40">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-blue-700 text-xs">{analysisResult.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                    Risk Score: {analysisResult.risk_score || analysisResult.riskScore}/100
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Confidence: {analysisResult.confidence}% &bull; Category: {analysisResult.category}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
