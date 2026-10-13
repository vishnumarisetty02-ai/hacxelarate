import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BrandSetup from './pages/BrandSetup';
import SocialMonitoring from './pages/SocialMonitoring';
import AppMonitoring from './pages/AppMonitoring';
import UrlMonitoring from './pages/UrlMonitoring';
import ThreatDetails from './pages/ThreatDetails';
import Campaigns from './pages/Campaigns';
import Reports from './pages/Reports';
import Intelligence from './pages/Intelligence';

import { PageTransition } from './components/animations';

export default function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <Login />;
  }

  return (
    <div className="min-h-screen cyber-soc-bg text-slate-800 flex flex-col font-sans relative overflow-x-hidden">
      {/* Subtle Ambient Network Glow Nodes (Slow 25-30s Loop, 0.03-0.05 Opacity) */}
      <div className="cyber-ambient-node-1" aria-hidden="true" />
      <div className="cyber-ambient-node-2" aria-hidden="true" />
      <div className="cyber-ambient-node-3" aria-hidden="true" />

      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-300 relative z-10">
        <Navbar
          isMobileOpen={isMobileSidebarOpen}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <PageTransition key={location.pathname}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/brand-setup" element={<BrandSetup />} />
                <Route path="/social-monitoring" element={<SocialMonitoring />} />
                <Route path="/app-monitoring" element={<AppMonitoring />} />
                <Route path="/url-monitoring" element={<UrlMonitoring />} />
                <Route path="/threats/:id" element={<ThreatDetails />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/intelligence" element={<Intelligence />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
