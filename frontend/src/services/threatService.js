import apiClient from './api';
import {
  MOCK_STATS,
  MOCK_RISK_TREND,
  MOCK_THREAT_DISTRIBUTION,
  MOCK_THREATS,
  MOCK_BRANDS,
  MOCK_CAMPAIGN_GRAPH_DATA,
  MOCK_REPORTS
} from './mockData';

const FALLBACK_ENABLED = import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== 'false';

// Helper to notify all UI pages (especially Dashboard) when a new analysis completes
export function notifyDashboardRefresh(details = {}) {
  try {
    localStorage.setItem('aegis_last_analysis_time', Date.now().toString());
    window.dispatchEvent(new CustomEvent('aegis:threat_analysis_created', { detail: details }));
  } catch (e) {
    // ignore in non-browser envs
  }
}

export const threatService = {
  // 1. Brand Registration (POST /api/brand/register)
  async registerBrand(brandData) {
    try {
      const payload = {
        brand_name: brandData.name || brandData.brand_name || 'ApexPay Global',
        official_website: brandData.official_website || brandData.officialWebsite || (brandData.officialDomains?.[0] ? `https://${brandData.officialDomains[0]}` : 'https://apexpay.com'),
        official_social_handles: brandData.official_social_handles || brandData.officialHandles || {},
        official_logo: brandData.official_logo || brandData.logo_url || null,
        industry: brandData.industry || 'Technology / FinTech',
        app_identifiers: brandData.app_identifiers || brandData.appIdentifiers || {},
        monitoring_keywords: brandData.monitoring_keywords || brandData.monitoringKeywords || []
      };
      const res = await apiClient.post('/brand/register', payload);
      notifyDashboardRefresh({ type: 'brand', brand: res.data });
      return { isDemo: false, data: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        notifyDashboardRefresh({ type: 'brand', brand: brandData, isDemo: true });
        return { isDemo: true, data: { ...brandData, id: `brand-${Date.now()}` } };
      }
      throw err;
    }
  },

  // 2. Social Profile Analysis (POST /api/social/analyze-profile)
  async analyzeSocialProfile(profileData) {
    try {
      const res = await apiClient.post('/social/analyze-profile', profileData);
      notifyDashboardRefresh({ type: 'social', threat: res.data });
      return { isDemo: false, data: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        const sim = profileData.username.toLowerCase().includes('apex') ? 0.92 : 0.45;
        const fakeScore = sim >= 0.7 ? 88 : 35;
        const mockThreat = {
          id: `THR-${Date.now().toString().slice(-4)}`,
          threat_type: 'social',
          type: 'social',
          entity: profileData.username,
          name: profileData.display_name || profileData.username,
          category: 'Social Impersonation / Scam Profile',
          platform: 'Social Media',
          risk_score: fakeScore,
          riskScore: fakeScore,
          risk_level: fakeScore >= 80 ? 'CRITICAL' : (fakeScore >= 60 ? 'HIGH' : 'LOW'),
          severity: fakeScore >= 80 ? 'Critical' : (fakeScore >= 60 ? 'High' : 'Low'),
          confidence: 94.5,
          reasons: [
            `Visual similarity to brand: ${Math.round(sim * 100)}%`,
            'Fresh account age indicator',
            'Suspect bio redirection'
          ],
          detectionReasons: [
            `Visual similarity to brand: ${Math.round(sim * 100)}%`,
            'Fresh account age indicator'
          ],
          recommendations: ['Submit DMCA takedown notice'],
          status: 'Active',
          evidence: profileData,
          created_at: new Date().toISOString()
        };
        notifyDashboardRefresh({ type: 'social', threat: mockThreat, isDemo: true });
        return { isDemo: true, data: mockThreat };
      }
      throw err;
    }
  },

  // 3. Scam Content Analysis (POST /api/social/analyze-content)
  async analyzeScamContent(contentData) {
    try {
      const payload = typeof contentData === 'string' ? { text: contentData } : contentData;
      const res = await apiClient.post('/social/analyze-content', payload);
      notifyDashboardRefresh({ type: 'content', result: res.data });
      return { isDemo: false, data: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        const text = typeof contentData === 'string' ? contentData : contentData.text;
        const isUrgent = /urgent|otp|locked|transfer|immediately/i.test(text || '');
        const mockResult = {
          risk_score: isUrgent ? 85 : 25,
          risk_level: isUrgent ? 'CRITICAL' : 'LOW',
          confidence: 91.0,
          reasons: isUrgent ? ['High-risk psychological urgency detected', 'Credential disclosure trigger'] : ['Normal text pattern'],
          recommendations: ['Monitor source communications']
        };
        notifyDashboardRefresh({ type: 'content', result: mockResult, isDemo: true });
        return {
          isDemo: true,
          data: mockResult
        };
      }
      throw err;
    }
  },

  // 4. URL Analysis (POST /api/url/analyze)
  async analyzeUrl(urlData) {
    try {
      const payload = typeof urlData === 'string' ? { url: urlData } : urlData;
      const res = await apiClient.post('/url/analyze', payload);
      notifyDashboardRefresh({ type: 'url', threat: res.data });
      return { isDemo: false, data: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        const u = typeof urlData === 'string' ? urlData : urlData.url;
        const isSus = /login|verify|secure|top|xyz|cc|-/i.test(u);
        const score = isSus ? 88 : 30;
        const mockThreat = {
          id: `THR-${Date.now().toString().slice(-4)}`,
          threat_type: 'url',
          type: 'url',
          entity: u,
          name: u,
          category: 'Typosquatting / Credential Phishing',
          platform: 'Web / Domain Registries',
          risk_score: score,
          riskScore: score,
          risk_level: score >= 80 ? 'CRITICAL' : 'LOW',
          severity: score >= 80 ? 'Critical' : 'Low',
          confidence: 93.0,
          reasons: ['Excessive hyphenation', 'Suspicious credential harvest path'],
          detectionReasons: ['Excessive hyphenation', 'Suspicious credential harvest path'],
          recommendations: ['Issue registrar abuse suspension notice'],
          status: 'Active',
          evidence: { targetUrl: u, dnsStatus: 'Active' },
          created_at: new Date().toISOString()
        };
        notifyDashboardRefresh({ type: 'url', threat: mockThreat, isDemo: true });
        return { isDemo: true, data: mockThreat };
      }
      throw err;
    }
  },

  // 5. APK Analysis (POST /api/app/analyze)
  async analyzeApp(formData) {
    try {
      const res = await apiClient.post('/app/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      notifyDashboardRefresh({ type: 'app', threat: res.data });
      return { isDemo: false, data: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        const filename = formData.get('file')?.name || 'ApexPay_QuickLoan_mod.apk';
        const mockThreat = {
          id: `THR-${Date.now().toString().slice(-4)}`,
          threat_type: 'app',
          type: 'app',
          entity: filename,
          name: filename.replace('.apk', ''),
          category: 'Trojanized Fake App',
          platform: 'Third-party APK Mirror',
          risk_score: 95,
          riskScore: 95,
          risk_level: 'CRITICAL',
          severity: 'Critical',
          confidence: 98.0,
          reasons: ['SMS intercept permission detected', 'Repackaged mod signature'],
          detectionReasons: ['SMS intercept permission detected', 'Repackaged mod signature'],
          recommendations: ['Google Play Protect threat notification'],
          status: 'Active',
          evidence: {
            sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            permissions_found: ['READ_SMS', 'RECEIVE_SMS']
          },
          created_at: new Date().toISOString()
        };
        notifyDashboardRefresh({ type: 'app', threat: mockThreat, isDemo: true });
        return { isDemo: true, data: mockThreat };
      }
      throw err;
    }
  },

  // 6. Dashboard (GET /api/dashboard)
  async getDashboardData() {
    try {
      const res = await apiClient.get('/dashboard');
      const data = res.data;
      return {
        isDemo: false,
        stats: data.stats,
        riskTrend: data.risk_trend || data.riskTrend,
        distribution: data.threat_distribution || data.distribution,
        recentIncidents: data.recent_incidents || []
      };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        return {
          isDemo: true,
          stats: MOCK_STATS,
          riskTrend: MOCK_RISK_TREND,
          distribution: MOCK_THREAT_DISTRIBUTION,
          recentIncidents: MOCK_THREATS.slice(0, 5)
        };
      }
      throw err;
    }
  },

  // 7. Threat List (GET /api/threats)
  async getThreats(params = {}) {
    try {
      const res = await apiClient.get('/threats', { params });
      const threatsList = res.data.threats || res.data.data || res.data;
      return {
        isDemo: false,
        data: Array.isArray(threatsList) ? threatsList : []
      };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        let filtered = [...MOCK_THREATS];
        if (params.type && params.type !== 'all') {
          filtered = filtered.filter((t) => t.type === params.type || t.threat_type === params.type);
        }
        if (params.severity && params.severity !== 'all') {
          filtered = filtered.filter((t) => t.severity?.toLowerCase() === params.severity.toLowerCase());
        }
        if (params.search) {
          const s = params.search.toLowerCase();
          filtered = filtered.filter(
            (t) =>
              (t.name || '').toLowerCase().includes(s) ||
              (t.category || '').toLowerCase().includes(s) ||
              (t.id || '').toLowerCase().includes(s)
          );
        }
        return { isDemo: true, data: filtered };
      }
      throw err;
    }
  },

  // 8. Threat Details (GET /api/threats/{id})
  async getThreatById(threatId) {
    // Preserve selected threat state
    if (threatId) {
      try {
        localStorage.setItem('aegis_selected_threat_id', threatId);
      } catch (e) {}
    } else {
      threatId = localStorage.getItem('aegis_selected_threat_id') || 'THR-8901';
    }

    try {
      const res = await apiClient.get(`/threats/${threatId}`);
      if (res.data) {
        try {
          localStorage.setItem('aegis_selected_threat_cache', JSON.stringify(res.data));
        } catch (e) {}
      }
      return { isDemo: false, data: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        // Try cached threat if available
        try {
          const cached = localStorage.getItem('aegis_selected_threat_cache');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.id === threatId) {
              return { isDemo: true, data: parsed };
            }
          }
        } catch (e) {}

        const found = MOCK_THREATS.find((t) => t.id === threatId) || MOCK_THREATS[0];
        return { isDemo: true, data: found };
      }
      throw err;
    }
  },

  // 9. Campaigns (GET /api/campaigns)
  async getCampaigns() {
    try {
      const res = await apiClient.get('/campaigns');
      return { isDemo: false, data: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        return { isDemo: true, data: [MOCK_CAMPAIGN_GRAPH_DATA] };
      }
      throw err;
    }
  },

  async getCampaignGraph(campaignId = 'CAMP-401') {
    try {
      const res = await apiClient.get(`/campaigns/${campaignId}/graph`);
      return { isDemo: false, data: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        return { isDemo: true, data: MOCK_CAMPAIGN_GRAPH_DATA };
      }
      throw err;
    }
  },

  // 10. Reports (POST /api/reports/generate & GET /api/reports)
  async generateReport(options = {}) {
    try {
      const res = await apiClient.post('/reports/generate', options);
      return { isDemo: false, report: res.data, data: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        const newReport = {
          id: `REP-${Date.now().toString().slice(-6)}`,
          title: `${options.reportType || 'On-Demand'} Risk Protection Audit`,
          period: options.timeRange || 'Last 30 Days',
          generatedAt: new Date().toISOString(),
          fileSize: '3.1 MB',
          threatsAnalyzed: 142,
          takedownsCompleted: 89,
          complianceStatus: 'SOC2 & ISO 27001 Aligned',
          summary: `Generated digital risk report for ${options.brandName || 'ApexPay Global'}.`
        };
        return { isDemo: true, report: newReport, data: newReport };
      }
      throw err;
    }
  },

  async getReports() {
    try {
      const res = await apiClient.get('/reports');
      return { isDemo: false, data: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        return { isDemo: true, data: MOCK_REPORTS };
      }
      throw err;
    }
  },

  // 11. Takedown Action (POST /api/threats/{id}/takedown)
  async triggerTakedown(threatId, notes = '') {
    try {
      const res = await apiClient.post(`/threats/${threatId}/takedown`, { notes });
      notifyDashboardRefresh({ type: 'takedown', threatId });
      return { isDemo: false, result: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        const result = {
          success: true,
          takedownId: `TKD-${Date.now().toString().slice(-6)}`,
          status: 'TAKEDOWN_SUBMITTED',
          timestamp: new Date().toISOString(),
          message: 'Takedown notice packaged and transmitted to abuse registrar API.'
        };
        notifyDashboardRefresh({ type: 'takedown', threatId, isDemo: true });
        return {
          isDemo: true,
          result
        };
      }
      throw err;
    }
  },

  // 12. Brands list & update (GET /api/brands & PUT /api/brands/{id})
  async getBrands() {
    try {
      const res = await apiClient.get('/brands');
      return { isDemo: false, data: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        return { isDemo: true, data: MOCK_BRANDS };
      }
      throw err;
    }
  },

  async updateBrand(brandData) {
    try {
      const res = await apiClient.put(`/brands/${brandData.id}`, brandData);
      notifyDashboardRefresh({ type: 'brand_update', brand: res.data });
      return { isDemo: false, data: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        return { isDemo: true, data: brandData };
      }
      throw err;
    }
  },

  // 13. False-Positive Analyst Feedback (POST /api/threats/{id}/feedback)
  async submitFeedback(threatId, feedback = 'false_positive', reason = 'Confirmed legitimate asset') {
    try {
      const res = await apiClient.post(`/threats/${threatId}/feedback`, { feedback, reason });
      notifyDashboardRefresh({ type: 'feedback', threatId, status: res.data?.status });
      return { isDemo: false, result: res.data };
    } catch (err) {
      if (FALLBACK_ENABLED && (err.isNetworkError || !err.status)) {
        const result = {
          success: true,
          threatId,
          status: 'Whitelisted / False Positive',
          message: `Threat ${threatId} flagged as False Positive and whitelisted in demo state.`
        };
        notifyDashboardRefresh({ type: 'feedback', threatId, isDemo: true });
        return { isDemo: true, result };
      }
      throw err;
    }
  },

  // 14. Demo Controls
  async seedDemoData() {
    try {
      const res = await apiClient.post('/demo/seed');
      notifyDashboardRefresh({ type: 'demo_seed' });
      return { isDemo: false, result: res.data };
    } catch (err) {
      notifyDashboardRefresh({ type: 'demo_seed', isDemo: true });
      return { isDemo: true, result: { success: true } };
    }
  },

  async resetDemoData() {
    try {
      const res = await apiClient.post('/demo/reset');
      notifyDashboardRefresh({ type: 'demo_reset' });
      return { isDemo: false, result: res.data };
    } catch (err) {
      notifyDashboardRefresh({ type: 'demo_reset', isDemo: true });
      return { isDemo: true, result: { success: true } };
    }
  }
};
