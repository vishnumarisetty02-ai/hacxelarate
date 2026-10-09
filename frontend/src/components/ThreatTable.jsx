import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, ArrowRight, ShieldCheck, Globe, Smartphone, Users } from 'lucide-react';
import RiskBadge from './RiskBadge';
import RiskScore from './RiskScore';

export default function ThreatTable({
  threats = [],
  title = 'Active Threat Incidents',
  subtitle = 'Prioritized triage queue for brand protection and automated enforcement',
  onTakedown,
  initialType = 'all'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [sortField, setSortField] = useState('riskScore');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredThreats = useMemo(() => {
    return threats
      .filter((item) => {
        if (!item) return false;
        const name = (item.name || item.entity || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        const id = (item.id || '').toLowerCase();
        const platform = (item.platform || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        const matchesSearch =
          !searchTerm ||
          name.includes(search) ||
          category.includes(search) ||
          id.includes(search) ||
          platform.includes(search);

        const sev = (item.severity || item.risk_level || '').toLowerCase();
        const matchesSeverity =
          severityFilter === 'all' || sev === severityFilter.toLowerCase();

        const typ = (item.type || item.threat_type || '').toLowerCase();
        const matchesType =
          typeFilter === 'all' || typ === typeFilter.toLowerCase();

        return matchesSearch && matchesSeverity && matchesType;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
      });
  }, [threats, searchTerm, severityFilter, typeFilter, sortField, sortOrder]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getPlatformIcon = (type) => {
    switch (type) {
      case 'social':
        return <Users className="w-4 h-4 text-sky-600" />;
      case 'app':
        return <Smartphone className="w-4 h-4 text-amber-600" />;
      case 'url':
        return <Globe className="w-4 h-4 text-rose-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="clay-card overflow-hidden shadow-lg animate-slide-up">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search threat, handle, URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner font-medium"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
          >
            <option value="all">All Vectors</option>
            <option value="social">Social Media</option>
            <option value="app">Mobile Apps</option>
            <option value="url">Phishing URLs</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[11px] font-mono uppercase tracking-wider border-b border-slate-100">
              <th className="py-3 px-4">Threat ID</th>
              <th className="py-3 px-4">Suspect Entity</th>
              <th className="py-3 px-4">Vector & Platform</th>
              <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => toggleSort('severity')}>
                <div className="flex items-center gap-1">
                  Severity <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => toggleSort('riskScore')}>
                <div className="flex items-center gap-1">
                  Risk Score <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredThreats.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 font-mono">
                  No matching threats found in current queue.
                </td>
              </tr>
            ) : (
              filteredThreats.map((threat) => (
                <tr
                  key={threat.id}
                  className="hover:bg-blue-50/40 transition-colors group"
                >
                  {/* Threat ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    <Link to={`/threats/${threat.id}`} className="hover:underline flex items-center gap-1.5">
                      <span>{threat.id}</span>
                      {threat.campaign_id && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                          {threat.campaign_id}
                        </span>
                      )}
                    </Link>
                  </td>

                  {/* Name & Category */}
                  <td className="py-3.5 px-4 max-w-[240px]">
                    <div className="font-bold text-slate-800 truncate group-hover:text-blue-600">
                      {threat.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {threat.category}
                    </div>
                  </td>

                  {/* Vector & Platform */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      {getPlatformIcon(threat.type)}
                      <span>{threat.platform}</span>
                    </div>
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4">
                    <RiskBadge severity={threat.severity} size="xs" />
                  </td>

                  {/* Risk Score */}
                  <td className="py-3.5 px-4">
                    <div className="w-24">
                      <RiskScore score={threat.riskScore} variant="bar" />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        threat.status === 'Mitigated'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : threat.status === 'Active'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {threat.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onTakedown && threat.status !== 'Mitigated' && (
                        <button
                          onClick={() => onTakedown(threat)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                        >
                          Takedown
                        </button>
                      )}
                      <Link
                        to={`/threats/${threat.id}`}
                        className="clay-button px-3 py-1 text-[11px] font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1"
                      >
                        Details
                        <ArrowRight className="w-3 h-3 text-blue-600" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-mono">
        <span>Showing {filteredThreats.length} of {threats.length} incidents</span>
        <span>Telemetry: Active Ingestion</span>
      </div>
    </div>
  );
}
