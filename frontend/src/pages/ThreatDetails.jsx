import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Users,
  Smartphone,
  Globe,
  AlertTriangle,
  Clock,
  Send,
  CheckCircle,
  FileText,
  Check,
  Sparkles
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import RiskScore from '../components/RiskScore';
import EvidencePanel from '../components/EvidencePanel';
import ThreatCard from '../components/ThreatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { threatService } from '../services/threatService';
import { FadeIn, StaggerContainer } from '../components/animations';

export default function ThreatDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [threat, setThreat] = useState(null);
  const [relatedThreats, setRelatedThreats] = useState([]);
  const [isTakedownModalOpen, setIsTakedownModalOpen] = useState(false);
  const [takedownNotes, setTakedownNotes] = useState('');
  const [actionResult, setActionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // False-Positive Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState('Authorized internal staging or verified subsidiary handle');
  const [feedbackResult, setFeedbackResult] = useState(null);

  useEffect(() => {
    async function fetchDetails() {
      const targetId = id || localStorage.getItem('aegis_last_selected_threat_id') || 'THR-8901';
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await threatService.getThreatById(targetId);
        setThreat(res.data);
        if (targetId) {
          localStorage.setItem('aegis_last_selected_threat_id', targetId);
        }

        // Fetch related threats if IDs exist
        const relatedIds = res.data?.relatedThreatIds || res.data?.related_threats || [];
        if (relatedIds.length > 0) {
          const allRes = await threatService.getThreats();
          const related = (allRes.data || []).filter((t) =>
            relatedIds.includes(t.id)
          );
          setRelatedThreats(related);
        } else {
          setRelatedThreats([]);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage(err.message || 'Failed to load threat details.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  const handleExecuteTakedown = async () => {
    if (!threat) return;
    try {
      const res = await threatService.triggerTakedown(threat.id, takedownNotes);
      setActionResult(res.result);
      setThreat({ ...threat, status: 'Mitigated' });
      setIsTakedownModalOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Takedown execution failed.');
    }
  };

  const handleExecuteFeedback = async () => {
    if (!threat) return;
    try {
      const res = await threatService.submitFeedback(threat.id, 'false_positive', feedbackReason);
      setFeedbackResult(res.result);
      setThreat({ ...threat, status: 'Whitelisted / False Positive' });
      setIsFeedbackModalOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Feedback submission failed.');
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Deconstructing Threat Dossier & Forensic Evidence..." />
      </div>
    );
  }

  if (!threat) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono clay-card">
        Threat Incident not found.
      </div>
    );
  }

  const getTypeIcon = () => {
    const t = threat.type || threat.threat_type;
    switch (t) {
      case 'social':
        return <Users className="w-6 h-6 text-sky-600" />;
      case 'app':
        return <Smartphone className="w-6 h-6 text-amber-600" />;
      case 'url':
        return <Globe className="w-6 h-6 text-rose-600" />;
      default:
        return <ShieldAlert className="w-6 h-6 text-blue-600" />;
    }
  };

  const threatSeverity = threat.severity || (threat.risk_level ? threat.risk_level.charAt(0).toUpperCase() + threat.risk_level.slice(1).toLowerCase() : 'Medium');
  const threatScore = threat.riskScore !== undefined ? threat.riskScore : (threat.risk_score !== undefined ? threat.risk_score : 75);

  return (
    <div className="space-y-6 pb-12 animate-slide-up">
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-white border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2.5 shadow-[6px_6px_16px_rgba(244,63,94,0.15)] animate-slide-down">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Takedown Success Banner */}
      {actionResult && (
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 text-emerald-900 text-xs font-mono space-y-1.5 shadow-[6px_8px_20px_rgba(16,185,129,0.2)] animate-slide-down">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Takedown Enforcement Triggered Successfully</span>
          </div>
          <p className="text-slate-600">{actionResult.message}</p>
          <div className="text-[11px] text-emerald-700 font-bold">
            Ref ID: {actionResult.takedownId} &bull; Timestamp: {actionResult.timestamp}
          </div>
        </div>
      )}

      {/* False Positive Feedback Banner */}
      {feedbackResult && (
        <div className="p-5 rounded-2xl bg-white border border-indigo-200 text-indigo-900 text-xs font-mono space-y-1.5 shadow-[6px_8px_20px_rgba(99,102,241,0.2)] animate-slide-down">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-indigo-600" />
            <span>Analyst Feedback Recorded & Asset Whitelisted</span>
          </div>
          <p className="text-slate-600">{feedbackResult.message}</p>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incidents Queue</span>
        </button>

        <span className="text-xs font-mono text-slate-500">
          Incident Case: <strong className="text-blue-600">{threat.id}</strong>
        </span>
      </div>

      {/* Hero Threat Card (Claymorphic) */}
      <div className="clay-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner mt-1">
            {getTypeIcon()}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <RiskBadge severity={threatSeverity} size="sm" />
              <span className="text-xs font-mono text-slate-600 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-bold">
                {threat.platform || 'Multi-Vector'}
              </span>
              <span className="text-xs font-mono text-blue-700 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 font-bold">
                {threat.confidence || 94.5}% AI Confidence
              </span>
              {threat.campaign_id && (
                <Link
                  to="/campaigns"
                  className="text-xs font-mono text-purple-700 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 font-bold hover:underline"
                >
                  {threat.campaign_id}
                </Link>
              )}
            </div>

            <h1 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight break-all anim-heading">
              {threat.name}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed font-medium anim-subtitle">
              Category: <strong className="text-slate-700">{threat.category}</strong> &bull; First Detected: <strong className="text-slate-700">{threat.detectedAt || threat.created_at || 'Recent telemetry'}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls & Score Gauge */}
        <div className="flex items-center gap-6 self-start lg:self-center anim-actions">
          <RiskScore score={threatScore} variant="circle" />

          <div className="flex flex-col gap-2">
            {threat.status !== 'Mitigated' && (
              <button
                onClick={() => setIsTakedownModalOpen(true)}
                className="clay-button-primary px-5 py-2 text-xs font-bold"
              >
                Trigger Takedown
              </button>
            )}

            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:text-blue-600"
            >
              Mark False-Positive
            </button>
          </div>
        </div>
      </div>

      {/* Forensic Evidence & XAI Tabbed Panel */}
      <FadeIn delay="0.15s">
        <EvidencePanel threat={threat} />
      </FadeIn>

      {/* Related Threats in Attack Campaign */}
      {relatedThreats.length > 0 && (
        <FadeIn delay="0.25s">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 font-mono">
                Correlated Attack Campaign Vectors ({relatedThreats.length})
              </h3>
              <Link to="/campaigns" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                <span>View Full Kill-Chain Topology</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedThreats.map((rt) => (
                <ThreatCard key={rt.id} threat={rt} />
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Takedown Modal */}
      {isTakedownModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-overlay">
          <div className="clay-card w-full max-w-md p-6 space-y-4 animate-modal-up shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Dispatch Automated Takedown Notice
              </h3>
              <button
                onClick={() => setIsTakedownModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will generate RFC 2142 abuse letters and submit cryptographic IOCs to registrar and hosting security teams for <strong>{threat.name}</strong>.
            </p>

            <textarea
              rows={3}
              placeholder="Add optional analyst forensic notes..."
              value={takedownNotes}
              onChange={(e) => setTakedownNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsTakedownModalOpen(false)}
                className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteTakedown}
                className="clay-button-primary px-5 py-2 text-xs font-bold"
              >
                Confirm Takedown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* False-Positive Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-overlay">
          <div className="clay-card w-full max-w-md p-6 space-y-4 animate-modal-up shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Analyst False-Positive Feedback
              </h3>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Marking this incident as a false positive will whitelist the entity in the local risk engine and retrain the ML confidence weights.
            </p>

            <select
              value={feedbackReason}
              onChange={(e) => setFeedbackReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Authorized internal staging or verified subsidiary handle">
                Authorized internal staging / verified subsidiary
              </option>
              <option value="Benign fan / parody account with no phishing intent">
                Benign fan / parody account (no phishing intent)
              </option>
              <option value="Official third-party integration partner">
                Official third-party integration partner
              </option>
              <option value="Security researcher proof of concept">
                Security researcher proof-of-concept
              </option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteFeedback}
                className="clay-button-primary px-5 py-2 text-xs font-bold"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
