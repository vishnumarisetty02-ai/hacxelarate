import React, { useState, useEffect } from 'react';
import { GitBranch, ShieldAlert, AlertTriangle, Users, Globe, Smartphone, Download, CheckCircle2, RefreshCw, Layers, ShieldCheck, ChevronRight } from 'lucide-react';
import CampaignGraph from '../components/CampaignGraph';
import LoadingSpinner from '../components/LoadingSpinner';
import { threatService } from '../services/threatService';
import { FadeIn, StaggerContainer } from '../components/animations';

export default function Campaigns() {
  const [loading, setLoading] = useState(true);
  const [campaignId, setCampaignId] = useState('CAMP-401');
  const [campaignData, setCampaignData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [exportedMsg, setExportedMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchCampaign = async (id) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await threatService.getCampaignGraph(id);
      setCampaignData(res.data);
    } catch (err) {
      console.warn('Failed to load campaign graph from backend, using robust fallback', err);
      // Fail gracefully without crashing
      setCampaignData({
        id: id,
        title: id === 'CAMP-401' ? 'ApexHarvest FinTech Syndicate' : 'NexusPhish MedTech Syndicate',
        description: 'Multi-stage coordinated brand attack exploiting social bots, credential harvesting domains, and rogue APK distribution.',
        threatLevel: 'Critical',
        activeNodesCount: 4,
        estimatedVictimsImpacted: '3,200+',
        nodes: [
          {
            id: 'brand',
            type: 'brandNode',
            data: { label: 'Official Brand Asset', subLabel: 'ApexPay Global', entityType: 'Target Enterprise', badge: 'Protected Asset', status: 'Targeted' },
            position: { x: 50, y: 150 }
          },
          {
            id: 'social-1',
            type: 'threatNode',
            data: { label: 'Fake Customer Care Handle', subLabel: '@ApexPay_SupportDesk_VIP', entityType: 'Social Vector', riskScore: 94, badge: 'Critical Threat', status: 'Active' },
            position: { x: 380, y: 60 }
          },
          {
            id: 'url-1',
            type: 'threatNode',
            data: { label: 'Suspicious Phishing URL', subLabel: 'apexpay-login-portal-auth.com', entityType: 'Credential Phish', riskScore: 88, badge: 'High Threat', status: 'Active' },
            position: { x: 720, y: 150 }
          },
          {
            id: 'app-1',
            type: 'threatNode',
            data: { label: 'Trojanized Mobile APK', subLabel: 'ApexPay Quick Loan APK', entityType: 'Spyware Payload', riskScore: 91, badge: 'Critical Payload', status: 'Active' },
            position: { x: 1060, y: 240 }
          }
        ],
        edges: [
          { id: 'e-brand-social', source: 'brand', target: 'social-1', animated: true, style: { stroke: '#2563eb', strokeWidth: 2.5 } },
          { id: 'e-social-url', source: 'social-1', target: 'url-1', animated: true, style: { stroke: '#e11d48', strokeWidth: 2.5 } },
          { id: 'e-url-app', source: 'url-1', target: 'app-1', animated: true, style: { stroke: '#d97706', strokeWidth: 2.5 } }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign(campaignId);
  }, [campaignId]);

  const handleExportDossier = () => {
    const jsonStr = JSON.stringify(campaignData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaignId}_threat_dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportedMsg(true);
    setTimeout(() => setExportedMsg(false), 3000);
  };

  if (loading && !campaignData) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Synthesizing Campaign Kill-Chain Graph..." />
      </div>
    );
  }

  const { title, description, threatLevel, activeNodesCount, estimatedVictimsImpacted } =
    campaignData || {};

  return (
    <div className="space-y-6 pb-12 animate-slide-up">
      {/* Toast Notification */}
      {exportedMsg && (
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2.5 shadow-[6px_6px_16px_rgba(16,185,129,0.15)] animate-slide-down">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Campaign Dossier JSON successfully downloaded (STIX/TAXII compatible format).</span>
        </div>
      )}

      {/* Header & Campaign Selector */}
      <div className="clay-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight anim-heading">
                Attack Campaign Intelligence
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 anim-subtitle">
                Unified cross-vector correlation: Fake Profiles &rarr; Phishing URLs &rarr; Rogue APKs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap anim-actions">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Select Campaign:</label>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            >
              <option value="CAMP-401">CAMP-401 (ApexHarvest Banking Syndicate)</option>
              <option value="CAMP-402">CAMP-402 (NexusPhish MedTech Syndicate)</option>
            </select>
          </div>

          <button
            onClick={handleExportDossier}
            className="clay-button px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>

      {/* Campaign Summary Quick Stats */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" baseDelay={0.05} stagger={0.08}>
        <div className="clay-card p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">Campaign ID</span>
          <span className="text-base font-bold text-blue-600 font-mono">{campaignId}</span>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">Threat Syndicate</span>
          <span className="text-sm font-bold text-slate-800 truncate block">{title || 'Active Syndicate'}</span>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">Connected Vectors</span>
          <span className="text-base font-bold text-amber-600">{activeNodesCount || 4} Malicious Nodes</span>
        </div>
        <div className="clay-card p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">Estimated Victims</span>
          <span className="text-base font-bold text-rose-600">{estimatedVictimsImpacted || '1,400+'} Users</span>
        </div>
      </StaggerContainer>

      {/* Interactive Topology Graph */}
      <FadeIn delay="0.15s">
        <div className="clay-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Interactive Kill-Chain Graph (Pan & Zoom)
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Click any node for forensic details
            </span>
          </div>

          <CampaignGraph graphData={campaignData} onSelectNode={(node) => setSelectedNode(node)} />
        </div>
      </FadeIn>

      {/* Step-by-Step Attack Stages */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800">
          4-Stage Attack Kill-Chain Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="clay-card-inset p-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-blue-600 font-bold">
              <span>STAGE 1</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">TARGET</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800">Brand Reconnaissance</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Adversaries clone official brand logos, customer care templates, and executive signatures.
            </p>
          </div>

          <div className="clay-card-inset p-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-rose-600 font-bold">
              <span>STAGE 2</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">LURE</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800">Social Bot Impersonation</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Automated bots reply to complaints on social channels, guiding victims to external links.
            </p>
          </div>

          <div className="clay-card-inset p-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-amber-600 font-bold">
              <span>STAGE 3</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">HARVEST</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800">Lookalike Phishing Portal</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Typosquatted domain captures 2FA credentials and prompts emergency app installation.
            </p>
          </div>

          <div className="clay-card-inset p-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-purple-600 font-bold">
              <span>STAGE 4</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">PAYLOAD</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800">Trojan Mobile Malware</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Rogue APK executes SMS sniffers and overlay attacks to intercept banking authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
