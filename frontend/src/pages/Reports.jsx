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
  Sparkles
} from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { threatService } from '../services/threatService';
import { FadeIn, StaggerContainer } from '../components/animations';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('Executive Board Summary');
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [successToast, setSuccessToast] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await threatService.getReports();
      setReports(res.data || []);
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
