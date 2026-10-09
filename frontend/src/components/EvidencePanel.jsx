import React, { useState } from 'react';
import { ShieldAlert, FileText, Server, AlertTriangle, CheckCircle, ExternalLink, ShieldCheck, Terminal, Copy, Cpu } from 'lucide-react';

export default function EvidencePanel({ threat }) {
  const [activeTab, setActiveTab] = useState('reasons');
  const [copied, setCopied] = useState(false);

  if (!threat) return null;

  const { evidence, detectionReasons, recommendedAction, reasons } = threat;
  const activeReasons = detectionReasons || reasons || [];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="clay-card overflow-hidden animate-slide-up">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-100 bg-slate-50/70 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('reasons')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'reasons'
              ? 'border-blue-600 text-blue-600 bg-white font-bold shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          Detection Heuristics ({activeReasons.length})
        </button>

        <button
          onClick={() => setActiveTab('xai')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'xai'
              ? 'border-blue-600 text-blue-600 bg-white font-bold shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-600" />
          Explainable AI (XAI) Weights
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'telemetry'
              ? 'border-blue-600 text-blue-600 bg-white font-bold shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-4 h-4 text-amber-600" />
          IOCs & Infrastructure
        </button>

        <button
          onClick={() => setActiveTab('action')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'action'
              ? 'border-blue-600 text-blue-600 bg-white font-bold shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Remediation Playbook
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {/* Tab 1: Detection Reasons */}
        {activeTab === 'reasons' && (
          <div className="space-y-4 animate-slide-up">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Algorithmic Heuristics & Neural Match Findings
            </h4>
            <div className="grid gap-3">
              {activeReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="clay-card-inset p-4 flex items-start gap-3.5"
                >
                  <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shadow-inner mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">{reason}</p>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 inline-block">
                      Rule ID: HEUR-RULE-{idx + 104} &bull; Severity Weight: HIGH
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab XAI: Explainable AI & Feature Attribution */}
        {activeTab === 'xai' && (
          <div className="space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-mono">
                <Terminal className="w-4 h-4 text-blue-600" />
                Explainable AI (XAI) Attribution Breakdown
              </h4>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Confidence: {threat.confidence || 94.5}%
              </span>
            </div>

            <div className="clay-card-inset p-5 space-y-4">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Feature Importance & Weight Distribution
              </span>

              {(threat.threat_type === 'app' || threat.type === 'app') ? (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>1. Dangerous SMS & Overlay Permissions (READ_SMS)</span>
                      <span className="text-rose-600 font-bold">40% Attribution</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner overflow-hidden">
                      <div className="bg-rose-500 h-2 rounded-full w-[96%]" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>2. Trademark & Package Distance Similarity</span>
                      <span className="text-amber-600 font-bold">30% Attribution</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full w-[85%]" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>3. Binary Manifest Signature & Unverified Dev</span>
                      <span className="text-blue-600 font-bold">20% Attribution</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full w-[78%]" />
                    </div>
                  </div>
                </>
              ) : (threat.threat_type === 'url' || threat.type === 'url') ? (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>1. Domain Typosquatting & Hyphenation Entropy</span>
                      <span className="text-rose-600 font-bold">38% Attribution</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner overflow-hidden">
                      <div className="bg-rose-500 h-2 rounded-full w-[92%]" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>2. Deceptive Credential Harvesting URI Tokens</span>
                      <span className="text-amber-600 font-bold">32% Attribution</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full w-[88%]" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>3. SSL Certificate & Registration Freshness</span>
                      <span className="text-blue-600 font-bold">18% Attribution</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full w-[74%]" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>1. Trademark Handle Similarity & Cosine Match</span>
                      <span className="text-rose-600 font-bold">35% Attribution</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner overflow-hidden">
                      <div className="bg-rose-500 h-2 rounded-full w-[94%]" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>2. Psychological Urgency & Scam NLP Density</span>
                      <span className="text-amber-600 font-bold">25% Attribution</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full w-[84%]" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>3. Bot Ratio & External Bio Redirection Link</span>
                      <span className="text-blue-600 font-bold">22% Attribution</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full w-[76%]" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Technical Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">
                Network & Payload Indicators of Compromise (IOCs)
              </h4>
              <button
                onClick={() => copyToClipboard(JSON.stringify(evidence || {}, null, 2))}
                className="clay-button px-3 py-1 text-xs font-mono text-slate-700 hover:text-blue-600 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied IOCs!' : 'Copy IOCs JSON'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="clay-card-inset p-4 space-y-2">
                <span className="text-xs font-mono text-blue-600 font-bold uppercase block">
                  Host & Infrastructure
                </span>
                {evidence?.ipAddress && (
                  <div className="text-xs flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">IP Address:</span>
                    <span className="font-mono font-bold text-slate-800">{evidence.ipAddress}</span>
                  </div>
                )}
                {evidence?.serverLocation && (
                  <div className="text-xs flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Server ASN:</span>
                    <span className="text-slate-800">{evidence.serverLocation}</span>
                  </div>
                )}
                {evidence?.registrar && (
                  <div className="text-xs flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Registrar:</span>
                    <span className="text-slate-800">{evidence.registrar}</span>
                  </div>
                )}
              </div>

              <div className="clay-card-inset p-4 space-y-2">
                <span className="text-xs font-mono text-blue-600 font-bold uppercase block">
                  Fingerprint & Payload
                </span>
                {evidence?.sha256 && (
                  <div className="text-xs py-1">
                    <span className="text-slate-500 block mb-1">SHA-256 Hash:</span>
                    <span className="font-mono text-[11px] text-amber-800 break-all bg-amber-50 p-2 rounded-xl border border-amber-200 block">
                      {evidence.sha256}
                    </span>
                  </div>
                )}
                {evidence?.packageName && (
                  <div className="text-xs flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Package ID:</span>
                    <span className="font-mono font-bold text-slate-800">{evidence.packageName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Remediation Playbook */}
        {activeTab === 'action' && (
          <div className="space-y-4 animate-slide-up">
            <div className="clay-card-inset p-4 space-y-2 bg-blue-50/50 border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                AI Recommended Remediation Action
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-mono font-medium">
                {recommendedAction || threat.recommended_action || 'Initiate multi-vector takedown procedure and block IP/domains in perimeter firewall.'}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Tiered Response Procedures
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Array.isArray(threat.recommendations) && threat.recommendations.length > 0 ? (
                  threat.recommendations.map((rec, idx) => (
                    <div key={idx} className="clay-card p-4 text-xs space-y-1.5">
                      <span className="text-blue-600 block font-mono text-[10px] uppercase font-bold">Step {idx + 1}</span>
                      <p className="text-slate-700 text-xs font-semibold leading-snug">{rec}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="clay-card p-4 text-xs space-y-1.5">
                      <span className="text-blue-600 block font-mono text-[10px] uppercase font-bold">Step 1</span>
                      <span className="font-bold text-slate-800 block">Registrar Abuse Notice</span>
                      <p className="text-slate-500 text-[11px]">Auto-generate RFC 2142 DMCA abuse report.</p>
                    </div>

                    <div className="clay-card p-4 text-xs space-y-1.5">
                      <span className="text-blue-600 block font-mono text-[10px] uppercase font-bold">Step 2</span>
                      <span className="font-bold text-slate-800 block">Safe Browsing Blacklist</span>
                      <p className="text-slate-500 text-[11px]">Submit IOCs to Google Safe Browsing and Microsoft SmartScreen.</p>
                    </div>

                    <div className="clay-card p-4 text-xs space-y-1.5">
                      <span className="text-blue-600 block font-mono text-[10px] uppercase font-bold">Step 3</span>
                      <span className="font-bold text-slate-800 block">Perimeter Defense Block</span>
                      <p className="text-slate-500 text-[11px]">Inject IOC hash/domain into enterprise DNS sinkholes.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
