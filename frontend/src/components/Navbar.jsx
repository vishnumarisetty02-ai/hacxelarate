import React, { useState } from 'react';
import { Shield, Bell, Search, Sparkles, User, RefreshCw, ChevronDown, CheckCircle, Menu, X, Globe } from 'lucide-react';
import { MOCK_BRANDS } from '../services/mockData';

export default function Navbar({ onToggleSidebar, isMobileOpen }) {
  const [selectedBrand, setSelectedBrand] = useState(MOCK_BRANDS[0] || { id: 'brand-apex', name: 'ApexPay Global' });
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanMessage('AI Sentinel running multi-vector scan across surface channels...');
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('Scan complete: Telemetry synchronized.');
      setTimeout(() => setScanMessage(null), 3000);
    }, 1800);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between shadow-sm animate-slide-down">
      {/* Left: Mobile Toggle & Brand Indicator */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Selector Dropdown (Clean White Clay Pill) */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
            Target Entity:
          </span>
          <div className="relative">
            <select
              value={selectedBrand.id}
              onChange={(e) => {
                const found = MOCK_BRANDS.find((b) => b.id === e.target.value);
                if (found) setSelectedBrand(found);
              }}
              className="px-3.5 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-blue-400 transition-colors rounded-xl text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-[3px_3px_8px_rgba(180,195,220,0.3),-3px_-3px_8px_rgba(255,255,255,0.9)] pr-7 appearance-none"
            >
              {MOCK_BRANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.industry})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Live Sentinel status badge (with subtle pulsing green dot) */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-semibold shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
          <span>ACTIVE MONITORING</span>
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Scan Button */}
        <button
          onClick={handleTriggerScan}
          disabled={isScanning}
          className="clay-button px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isScanning ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">
            {isScanning ? 'Scanning...' : 'Trigger Scan'}
          </span>
        </button>

        {/* Notification Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-[3px_3px_8px_rgba(180,195,220,0.3)] flex items-center justify-center relative transition-transform hover:scale-105"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white notif-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-[6px_8px_24px_rgba(180,195,220,0.4)] p-4 z-50 animate-slide-down">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-700">Threat Alerts (2)</span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark read</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800">
                  <span className="font-bold block">New Rogue APK Intercepted</span>
                  <span className="text-[11px] text-rose-600">ApexPay Quick Loan APK flagged on Telegram mirror.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-800">
                  <span className="font-bold block">Suspicious Domain Resolving</span>
                  <span className="text-[11px] text-amber-600">apexpay-login-portal-auth.com active DNS.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-[2px_2px_6px_rgba(37,99,235,0.35)] hover:scale-[1.03] transition-transform duration-200 cursor-pointer">
            AG
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-bold text-slate-800 block leading-tight">SecOps Analyst</span>
            <span className="text-[10px] font-mono text-slate-400 block">Threat Hunter</span>
          </div>
        </div>
      </div>

      {/* Floating Scan Toast */}
      {scanMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-blue-200 shadow-[6px_8px_24px_rgba(180,195,220,0.45)] px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-mono text-slate-800 animate-slide-up">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{scanMessage}</span>
        </div>
      )}
    </header>
  );
}
