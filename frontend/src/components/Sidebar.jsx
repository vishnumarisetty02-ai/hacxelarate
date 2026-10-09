import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Users,
  Smartphone,
  Globe,
  GitBranch,
  FileBarChart,
  LogOut,
  ShieldAlert,
  Sliders,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const navigate = useNavigate();

  const navLinks = [
    {
      to: '/',
      label: 'Threat Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/brand-setup',
      label: 'Brand Setup',
      icon: Sliders,
      badge: null
    },
    {
      to: '/social-monitoring',
      label: 'Social Monitoring',
      icon: Users,
      badge: null
    },
    {
      to: '/app-monitoring',
      label: 'App Monitoring',
      icon: Smartphone,
      badge: null
    },
    {
      to: '/url-monitoring',
      label: 'URL Monitoring',
      icon: Globe,
      badge: null
    },
    {
      to: '/campaigns',
      label: 'Attack Campaigns',
      icon: GitBranch,
      badge: 'Active'
    },
    {
      to: '/reports',
      label: 'Audit Reports',
      icon: FileBarChart,
      badge: null
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('aegis_auth_token');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container (White Claymorphic) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 shadow-[6px_0_20px_rgba(180,195,220,0.25)] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
            <div className="p-2 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-wider text-slate-800 font-mono flex items-center gap-1">
                AEGIS<span className="text-blue-600">GUARD</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block font-semibold">
                Digital Risk Sentinel
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            <p className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Protection Modules
            </p>

            {navLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={onCloseMobile}
                  style={{ animationDelay: `${0.08 * (idx + 1)}s` }}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 sidebar-item-anim ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)]'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 hover:translate-x-1'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>{link.label}</span>
                  </div>

                  {link.badge && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Status Indicator */}
          <div className="clay-card-inset p-3 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-500 font-medium">Defense Status</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                Active Shield
              </span>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
