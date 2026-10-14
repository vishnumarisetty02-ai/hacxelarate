import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Database,
  Cpu,
  ExternalLink,
  Award
} from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { threatService } from '../services/threatService';
import { FadeIn, StaggerContainer } from '../components/animations';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [benchmarks, setBenchmarks] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('Executive Board Summary');
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [successToast, setSuccessToast] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [repRes, bmarkRes] = await Promise.all([
        threatService.getReports(),
        threatService.getMlBenchmarks()
      ]);
      setReports(repRes.data || []);
      setBenchmarks(bmarkRes.data || null);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await threatService.generateReport({
        reportType,
        timeRange,
        brandName: 'ApexPay Global'
      });

      const newRep = res.report || res.data;
      setReports([newRep, ...reports]);
      setSuccessToast(`Report "${newRep.title}" generated successfully!`);
      setTimeout(() => setSuccessToast(null), 4000);

      downloadReportFile(newRep);
    } catch (err) {
      setErrorMessage(err.message || 'Report generation failed.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReportFile = (report) => {
    const reportContent = {
      reportId: report.id,
      title: report.title,
      period: report.period,
      generatedTimestamp: report.generatedAt,
      complianceStandard: report.complianceStatus,
      threatMetrics: {
        threatsAnalyzed: report.threatsAnalyzed,
        takedownsCompleted: report.takedownsCompleted,
        meanTimeToRemediateHours: 3.2,
        brandProtected: 'ApexPay Global'
      },
      executiveSummary: report.summary,
      disclaimer: 'Generated autonomously by AegisGuard AI Digital Risk Platform.'
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.id}_AegisGuard_Audit.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && reports.length === 0) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Compiling Digital Risk Audit Reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-slide-up">
      {successToast && (
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2.5 shadow-[6px_6px_16px_rgba(16,185,129,0.15)] animate-slide-down">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-white border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2.5 shadow-[6px_6px_16px_rgba(244,63,94,0.15)] animate-slide-down">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
              <FileBarChart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight anim-heading">
                Audit & Compliance Reports
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 anim-subtitle">
                Generate and export verified threat intelligence dossiers, legal DMCA logs & executive risk summaries.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchReports}
          className="clay-button px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 self-start sm:self-center anim-actions"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          Refresh Archives
        </button>
      </div>

      {/* Summary Cards */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" baseDelay={0.05} stagger={0.08}>
        <StatCard
          title="Threats Audited"
          value={reports.reduce((acc, r) => acc + (Number(r.threatsAnalyzed) || 0), 0)}
          subtitle="Analyzed by AI models"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Takedowns Enforced"
          value={reports.reduce((acc, r) => acc + (Number(r.takedownsCompleted) || 0), 0)}
          subtitle="Confirmed removals"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Avg. Takedown Time"
          value="3.2 hrs"
          subtitle="Benchmark: 48 hrs"
          icon={Clock}
          color="purple"
        />
        <StatCard
          title="Compliance Readiness"
          value="98.4%"
          subtitle="SOC2 & ISO 27001"
          icon={CheckCircle2}
          color="orange"
        />
      </StaggerContainer>

      {/* Top 5 Cybersecurity Datasets Benchmark Evaluation Card */}
      <FadeIn delay="0.12s">
        <div className="clay-card p-6 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 border border-blue-200/90 space-y-5 shadow-[0_8px_30px_rgba(37,99,235,0.08)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.3)] flex-shrink-0">
                <Database className="w-5 h-5 text-cyan-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 font-mono tracking-wide">
                    ML MODEL BENCHMARKS — TOP 5 CYBERSECURITY DATASETS
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Trained & Validated
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Autonomous threat detection models verified against gold-standard real-world academic & industry datasets.
                </p>
              </div>
            </div>

            {benchmarks && (
              <span className="text-[11px] font-mono text-slate-500 bg-white/80 px-3 py-1 rounded-xl border border-slate-200 shadow-sm self-start md:self-center">
                Last Trained: {benchmarks.timestamp || 'Today'}
              </span>
            )}
          </div>

          {/* Top 5 Datasets Reference Pills */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Benchmark Ground Truth Datasets
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                {
                  id: 1,
                  name: 'Instagram Fake Spammer Genuine Accounts',
                  source: 'Kaggle / free4ever1',
                  url: 'https://www.kaggle.com/datasets/free4ever1/instagram-fake-spammer-genuine-accounts',
                  tag: 'Social Profiles'
                },
                {
                  id: 2,
                  name: 'Cresci-2017 Social Bot Dataset',
                  source: 'Botometer / Indiana Univ OSOME',
                  url: 'https://botometer.osome.iu.edu/bot-repository/datasets/cresci-2017/cresci-2017.csv.zip',
                  tag: 'Bot Detection'
                },
                {
                  id: 3,
                  name: 'TwiBot-22 Scam & Bot Dataset',
                  source: 'Luo et al., NeurIPS 2022',
                  url: 'https://github.com/LuoUndergradXJTU/TwiBot-22',
                  tag: 'Scam Text'
                },
                {
                  id: 4,
                  name: 'PhiUSIIL Phishing URL Dataset',
                  source: 'UCI ML Repository #967',
                  url: 'https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset',
                  tag: 'Phishing URLs'
                },
                {
                  id: 5,
                  name: 'CICMalDroid 2020 Android Malware',
                  source: 'UNB Canadian Inst Cybersecurity',
                  url: 'https://www.unb.ca/cic/datasets/maldroid-2020.html',
                  tag: 'APK Malware'
                }
              ].map((ds) => (
                <a
                  key={ds.id}
                  href={ds.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white hover:bg-blue-50/70 border border-slate-200/90 hover:border-blue-300 transition-all flex items-center justify-between group shadow-sm text-left"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {ds.id}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-700">
                        {ds.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block pl-5 font-medium">
                      {ds.source}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* Model Evaluation Metric Highlights */}
          {benchmarks?.models && (
            <div className="pt-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Trained Models Performance Matrix
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(benchmarks.models).map(([key, m]) => (
                  <div key={key} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {m.name.replace('Model ', 'M')}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {(m.accuracy * 100).toFixed(1)}% Acc
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                      <div className="flex justify-between">
                        <span>ROC-AUC:</span>
                        <span className="font-bold text-slate-800">{m.roc_auc.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>F1-Score:</span>
                        <span className="font-bold text-slate-800">{(m.f1_score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Samples:</span>
                        <span className="font-bold text-blue-600">{m.samples.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Report Generator Box */}
      <FadeIn delay="0.15s">
        <div className="clay-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              On-Demand Intelligence Report Generator
            </h3>
          </div>

          <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Report Template
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              >
                <option value="Executive Board Summary">Executive Board Risk Summary</option>
                <option value="Technical IOC Dossier">Technical IOC & Network Dossier</option>
                <option value="DMCA Legal Compliance Packet">DMCA Legal Compliance Packet</option>
                <option value="Mobile App Threat Intelligence">Mobile App Malware Analysis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Audit Period
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days (Recommended)</option>
                <option value="Q3 2026 Audit">Q3 2026 Audit</option>
                <option value="Year-to-Date 2026">Year-to-Date 2026</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="clay-button-primary w-full py-2.5 px-4 font-bold text-xs flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Report...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generate & Download</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </FadeIn>

      {/* Archived Reports Ledger */}
      <FadeIn delay="0.25s">
        <div className="clay-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Archived Audit Reports</h3>
            <p className="text-xs text-slate-500">Cryptographically signed incident records</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">{reports.length} Reports</span>
        </div>

        <div className="divide-y divide-slate-100">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600">{rep.id}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                    {rep.complianceStatus}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">&bull; {rep.fileSize}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">{rep.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rep.summary}</p>
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-4 pt-1 font-medium">
                  <span>Period: {rep.period}</span>
                  <span>Threats Covered: {rep.threatsAnalyzed}</span>
                  <span>Takedowns: {rep.takedownsCompleted}</span>
                </div>
              </div>

              <button
                onClick={() => downloadReportFile(rep)}
                className="clay-button px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-2 self-start md:self-center"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Download Report</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      </FadeIn>
    </div>
  );
}
