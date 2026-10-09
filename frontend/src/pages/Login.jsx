import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('analyst@aegisguard.security');
  const [password, setPassword] = useState('CyberSentinel2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide valid access credentials.');
      return;
    }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      localStorage.setItem('aegis_auth_token', 'demo_jwt_token_analyst_2026');
      setIsLoading(false);
      navigate('/');
    }, 500);
  };

  const handleQuickDemo = () => {
    setEmail('analyst@aegisguard.security');
    setPassword('CyberSentinel2026!');
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md z-10 animate-slide-up">
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-3xl bg-white border border-blue-100 text-blue-600 mb-3 shadow-[6px_6px_16px_rgba(180,195,220,0.35),-6px_-6px_16px_rgba(255,255,255,0.95)]">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 font-mono tracking-tight">
            AEGIS<span className="text-blue-600">GUARD</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-mono font-bold mt-0.5">
            Digital Risk Protection Platform
          </p>
        </div>

        {/* Login Clay Card */}
        <div className="clay-card p-8 shadow-xl">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-800">Analyst Authentication</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sign in to monitor brand impersonations, phishing domains & rogue APKs.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Enterprise Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@enterprise.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Security Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner font-mono font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="clay-button-primary w-full py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Clearances...</span>
                </>
              ) : (
                <>
                  <span>Sign In To Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="clay-button w-full py-2.5 px-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Use Demo Credentials</span>
            </button>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="mt-6 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Autonomous Multi-Vector Cyber Correlation</span>
        </div>
      </div>
    </div>
  );
}
