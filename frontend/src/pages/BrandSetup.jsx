import React, { useState, useEffect } from 'react';
import {
  Shield,
  Save,
  Plus,
  Trash2,
  Globe,
  Twitter,
  Instagram,
  Linkedin,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Tag,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { threatService } from '../services/threatService';
import LoadingSpinner from '../components/LoadingSpinner';
import { FadeIn } from '../components/animations';

const DEFAULT_BRAND = {
  name: 'ApexPay Global',
  industry: 'FinTech / Payment Services',
  official_website: 'https://apexpay.com',
  official_social_handles: {
    twitter: '@ApexPayOfficial',
    instagram: '@apexpay_global',
    linkedin: 'company/apexpay'
  },
  official_domains: ['apexpay.com', 'apexpay.io'],
  app_identifiers: {
    android_package: 'com.apexpay.mobile.wallet',
    ios_bundle_id: 'com.apexpay.wallet'
  },
  monitoring_keywords: ['ApexPay', 'Apex Wallet', 'Apex Cash', 'ApexPay Rewards']
};

export default function BrandSetup() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState([]);
  const [currentBrand, setCurrentBrand] = useState(DEFAULT_BRAND);
  const [newKeyword, setNewKeyword] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await threatService.getBrands();
        const list = res.data || [];
        setBrands(list);
        if (list.length > 0) {
          setCurrentBrand(list[0]);
        } else {
          setCurrentBrand(DEFAULT_BRAND);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load brand configuration.');
        setCurrentBrand(DEFAULT_BRAND);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentBrand) return;

    setSaving(true);
    setErrorMessage(null);
    setSavedSuccess(null);

    try {
      const res = await threatService.registerBrand(currentBrand);
      const saved = res.data || currentBrand;
      setCurrentBrand(saved);
      setBrands((prev) => {
        const idx = prev.findIndex(b => b.id === saved.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });
      setSavedSuccess(`Brand "${saved.name || 'Enterprise'}" updated and monitoring baseline refreshed!`);
      setTimeout(() => setSavedSuccess(null), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update brand profile.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    const current = currentBrand.monitoring_keywords || [];
    if (!current.includes(newKeyword.trim())) {
      setCurrentBrand({
        ...currentBrand,
        monitoring_keywords: [...current, newKeyword.trim()]
      });
    }
    setNewKeyword('');
  };

  const removeKeyword = (kw) => {
    setCurrentBrand({
      ...currentBrand,
      monitoring_keywords: (currentBrand.monitoring_keywords || []).filter(k => k !== kw)
    });
  };

  const addDomain = () => {
    if (!newDomain.trim()) return;
    const current = currentBrand.official_domains || [];
    if (!current.includes(newDomain.trim())) {
      setCurrentBrand({
        ...currentBrand,
        official_domains: [...current, newDomain.trim()]
      });
    }
    setNewDomain('');
  };

  const removeDomain = (dom) => {
    setCurrentBrand({
      ...currentBrand,
      official_domains: (currentBrand.official_domains || []).filter(d => d !== dom)
    });
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Retrieving Monitored Brand Baseline Profile..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-slide-up">
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2.5 shadow-[6px_6px_16px_rgba(16,185,129,0.15)] animate-slide-down">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-white border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2.5 shadow-[6px_6px_16px_rgba(244,63,94,0.15)] animate-slide-down">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight anim-heading">
                Protected Brand Profile & Digital Assets
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 anim-subtitle">
                Configure official handles, domains, mobile bundle IDs, and trademark trigger keywords.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="clay-button-primary px-5 py-2 text-xs font-bold flex items-center gap-2 self-start sm:self-center anim-actions"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      <FadeIn delay="0.15s">
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Identity Info */}
        <div className="lg:col-span-2 clay-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            1. Core Enterprise Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={currentBrand.name || ''}
                onChange={(e) => setCurrentBrand({ ...currentBrand, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Industry Vertical</label>
              <input
                type="text"
                value={currentBrand.industry || ''}
                onChange={(e) => setCurrentBrand({ ...currentBrand, industry: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Official Website</label>
              <input
                type="url"
                value={currentBrand.official_website || ''}
                onChange={(e) => setCurrentBrand({ ...currentBrand, official_website: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 pt-4">
            2. Official Social Handles (Allowlisted)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Twitter className="w-3.5 h-3.5 text-sky-500" />
                X / Twitter
              </label>
              <input
                type="text"
                value={currentBrand.official_social_handles?.twitter || ''}
                onChange={(e) =>
                  setCurrentBrand({
                    ...currentBrand,
                    official_social_handles: {
                      ...currentBrand.official_social_handles,
                      twitter: e.target.value
                    }
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-rose-500" />
                Instagram
              </label>
              <input
                type="text"
                value={currentBrand.official_social_handles?.instagram || ''}
                onChange={(e) =>
                  setCurrentBrand({
                    ...currentBrand,
                    official_social_handles: {
                      ...currentBrand.official_social_handles,
                      instagram: e.target.value
                    }
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                LinkedIn
              </label>
              <input
                type="text"
                value={currentBrand.official_social_handles?.linkedin || ''}
                onChange={(e) =>
                  setCurrentBrand({
                    ...currentBrand,
                    official_social_handles: {
                      ...currentBrand.official_social_handles,
                      linkedin: e.target.value
                    }
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner font-mono"
              />
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 pt-4">
            3. Mobile Application Identifiers
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Android Package Name</label>
              <input
                type="text"
                value={currentBrand.app_identifiers?.android_package || ''}
                onChange={(e) =>
                  setCurrentBrand({
                    ...currentBrand,
                    app_identifiers: {
                      ...currentBrand.app_identifiers,
                      android_package: e.target.value
                    }
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">iOS App Bundle ID</label>
              <input
                type="text"
                value={currentBrand.app_identifiers?.ios_bundle_id || ''}
                onChange={(e) =>
                  setCurrentBrand({
                    ...currentBrand,
                    app_identifiers: {
                      ...currentBrand.app_identifiers,
                      ios_bundle_id: e.target.value
                    }
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner font-mono"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Click submit to update the AI Sentinel detection baseline:
            </span>
            <button
              type="submit"
              disabled={saving}
              className="clay-button-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save & Deploy Brand Profile</span>
            </button>
          </div>
        </div>

        {/* Keywords & Domains Sidebar Panel */}
        <div className="space-y-6">
          {/* Trademark Keywords */}
          <div className="clay-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              Monitoring Keywords
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="clay-button-primary px-3 py-1.5 text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {(currentBrand.monitoring_keywords || []).map((kw, idx) => (
                <span
                  key={idx}
                  style={{ animationDelay: `${0.04 * (idx + 1)}s` }}
                  className="tag-pill px-2.5 py-1 text-xs rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-400 font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-200 cursor-default animate-scale-in"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="text-blue-400 hover:text-rose-600 transition-colors p-0.5 rounded-full hover:bg-rose-50"
                    title="Remove keyword"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Official Domains */}
          <div className="clay-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              Official Domains
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. apexpay.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDomain();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-inner font-mono"
              />
              <button
                type="button"
                onClick={addDomain}
                className="clay-button-primary px-3 py-1.5 text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 pt-2">
              {(currentBrand.official_domains || []).map((dom, idx) => (
                <div
                  key={idx}
                  style={{ animationDelay: `${0.05 * (idx + 1)}s` }}
                  className="tag-pill px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 text-xs font-mono text-slate-700 flex items-center justify-between font-semibold transition-all duration-200 animate-slide-up"
                >
                  <span>{dom}</span>
                  <button
                    type="button"
                    onClick={() => removeDomain(dom)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded-full hover:bg-rose-50 text-sm font-bold"
                    title="Remove domain"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Quick Submit Action */}
          <div className="clay-card p-5 space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="clay-button-primary w-full py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save & Update All Settings</span>
            </button>
          </div>
        </div>
      </form>
      </FadeIn>
    </div>
  );
}
