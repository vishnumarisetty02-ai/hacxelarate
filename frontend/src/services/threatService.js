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
  },

  // 15. Advanced Typosquat & Homoglyph Permutation Radar
  async generateTyposquats(domainOrBrand) {
    try {
      const res = await apiClient.post('/url/permutations', { domain: domainOrBrand });
      return { isDemo: false, data: res.data };
    } catch (err) {
      const fallbackBrand = domainOrBrand || 'apexpay.com';
      const clean = fallbackBrand.replace(/https?:\/\//, '').split('.')[0];
      return {
        isDemo: true,
        data: {
          target: fallbackBrand,
          total_scanned: 6,
          high_risk_count: 5,
          permutations: [
            { domain: `${clean}-login.com`, strategy: 'Combosquatting / Auth Lure', risk_score: 92, risk_level: 'CRITICAL', entropy: 3.42, punycode: `${clean}-login.com`, status: 'Active (Resolving)', registrar: 'Namecheap Inc.', recommended_action: 'Issue Immediate Registrar Abuse Complaint' },
            { domain: `\u0430pexpay.com`, strategy: 'IDN Homoglyph (Cyrillic Spoofing)', risk_score: 96, risk_level: 'CRITICAL', entropy: 3.12, punycode: 'xn--pexpay-11a.com', status: 'Active (Parked / SSL Issued)', registrar: 'Tucows Inc.', recommended_action: 'Emergency UDRP Dispute & SafeBrowsing Flag' },
            { domain: `${clean}-verify-portal.net`, strategy: 'Combosquatting / Credential Lure', risk_score: 88, risk_level: 'CRITICAL', entropy: 3.75, punycode: `${clean}-verify-portal.net`, status: 'Active (Resolving)', registrar: 'PrivacyGuardian', recommended_action: 'Issue Immediate Registrar Abuse Complaint' },
            { domain: `${clean}.xyz`, strategy: 'High-Abuse Suspicious TLD Swap', risk_score: 84, risk_level: 'CRITICAL', entropy: 2.81, punycode: `${clean}.xyz`, status: 'Registered / Redirecting', registrar: 'Hostinger', recommended_action: 'Defensive Registration / DNS Blacklist' },
            { domain: `secure-${clean}.online`, strategy: 'Prepend Lure / Banking Spoof', risk_score: 86, risk_level: 'CRITICAL', entropy: 3.25, punycode: `secure-${clean}.online`, status: 'Active A-Record', registrar: 'PublicDomainRegistry', recommended_action: 'Issue Registrar Abuse Complaint' },
            { domain: `a${clean}.com`, strategy: 'Typosquatting (Letter Insertion)', risk_score: 65, risk_level: 'HIGH', entropy: 2.91, punycode: `a${clean}.com`, status: 'Unregistered / High Hazard', registrar: 'GoDaddy LLC', recommended_action: 'Proactive Defensive Acquisition' }
          ]
        }
      };
    }
  },

  // 16. Advanced Executive & VIP Impersonation Radar
  async analyzeVipProfile(payload) {
    try {
      const res = await apiClient.post('/social/vip-radar', payload);
      notifyDashboardRefresh({ type: 'vip_social', threat: res.data });
      return { isDemo: false, data: res.data };
    } catch (err) {
      const mockThreat = {
        id: `THR-VIP-${Date.now().toString().slice(-4)}`,
        threat_type: 'social',
        type: 'social',
        entity: payload.username || '@ApexCEO_Official',
        name: `VIP Impersonation: ${payload.display_name || 'Sarah Jenkins - CEO'}`,
        category: 'Executive / VIP Whaling Impersonation',
        platform: 'Social Media (Executive Impersonation)',
        risk_score: 94,
        risk_level: 'CRITICAL',
        severity: 'Critical',
        confidence: 96.5,
        reasons: [
          `Direct name impersonation of VIP Executive '${payload.executive_name || 'Sarah Jenkins'}' (95% match)`,
          `Executive leadership title '${payload.executive_role || 'CEO'}' claimed in unauthorized profile`,
          'Unverified VIP handle lacking official platform identity attestation'
        ],
        recommendations: [
          'Escalate immediate Executive Protection takedown for VIP impersonation',
          'File priority VIP impersonation abuse ticket with platform Trust & Safety'
        ],
        evidence: {
          username: payload.username,
          targetedExecutive: payload.executive_name,
          executiveRole: payload.executive_role,
          mitreAttack: ['T1585.001 - Social Media Accounts', 'T1566.002 - Spearphishing Link']
        },
        status: 'Active',
        created_at: new Date().toISOString()
      };
      notifyDashboardRefresh({ type: 'vip_social', threat: mockThreat, isDemo: true });
      return { isDemo: true, data: mockThreat };
    }
  },

  // 17. Multi-Vector Autonomous Threat Sweep
  async runAutonomousSweep(brandName) {
    try {
      const res = await apiClient.post('/brand/autonomous-sweep', { brand_name: brandName });
      notifyDashboardRefresh({ type: 'sweep', result: res.data });
      return { isDemo: false, data: res.data };
    } catch (err) {
      const mockSweep = {
        status: 'SWEEP_COMPLETE',
        brand_name: brandName || 'ApexPay Global',
        timestamp: new Date().toISOString(),
        vectors_scanned: ['Social Media Platforms', 'DNS & Domain Registrars', 'Rogue APK Repositories'],
        permutations_evaluated: 16,
        threats_discovered_or_verified: 5,
        executive_risk_index: 88,
        recommended_priority_action: 'Execute 1-Click RFC 2142 Takedown Packets for Critical Nodes'
      };
      notifyDashboardRefresh({ type: 'sweep', result: mockSweep, isDemo: true });
      return { isDemo: true, data: mockSweep };
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 19. AI Threat Intelligence Feed
  async getIntelFeed(params = {}) {
    try {
      const q = new URLSearchParams();
      if (params.vector) q.set('vector', params.vector);
      if (params.severity) q.set('severity', params.severity);
      if (params.limit) q.set('limit', params.limit);
      const res = await apiClient.get(`/intelligence/feed${q.toString() ? '?' + q.toString() : ''}`);
      return { isDemo: false, data: res.data };
    } catch (err) {
      const ts = new Date().toISOString();
      const mockFeed = [
        { id: 'IOC-A001', feed_type: 'LIVE_OSINT', threat_type: 'url', entity: 'apexpay-login-portal.xyz', name: 'Phishing Kit Domain — Active Credential Harvesting', risk_score: 96, risk_level: 'CRITICAL', confidence: 97.2, reasons: ['Newly registered domain (< 48hrs)', 'Clone of official login portal'], ioc_correlation: { type: 'domain', value: 'apexpay-login-portal.xyz', source: 'PhishTank Feed' }, mitre_techniques: [{ id: 'T1566.002', name: 'Spearphishing Link', tactic: 'Initial Access', severity: 'CRITICAL' }], attributed_actor: { id: 'TA-003', name: 'ScamSyndicate-IN', confidence: 94.0 }, enrichment_score: 99, feed_timestamp: ts, status: 'Active' },
        { id: 'IOC-A002', feed_type: 'LIVE_OSINT', threat_type: 'social', entity: '@ApexPay_CustomerCare_Official', name: 'Fake Corporate Support — OTP Harvest Campaign', risk_score: 91, risk_level: 'CRITICAL', confidence: 93.5, reasons: ['Handle impersonates brand', 'Bio references OTP recovery', 'Automated follower pattern'], ioc_correlation: { type: 'social_handle', value: '@ApexPay_CustomerCare_Official', source: 'Brand Monitoring' }, mitre_techniques: [{ id: 'T1585.001', name: 'Social Media Accounts', tactic: 'Resource Development', severity: 'HIGH' }], attributed_actor: { id: 'TA-001', name: 'FIN7-Clone / FinCrime-Asia', confidence: 87.5 }, enrichment_score: 94, feed_timestamp: ts, status: 'Active' },
        { id: 'IOC-A003', feed_type: 'LIVE_OSINT', threat_type: 'app', entity: 'com.apexpay.wallet.unofficial', name: 'Rogue APK — Banking Trojan with Accessibility Hijack', risk_score: 98, risk_level: 'CRITICAL', confidence: 99.1, reasons: ['SHA256 matches known dropper', 'C2 beacon to 185.220.101.45:8443'], ioc_correlation: { type: 'hash', value: 'a3f4b2c8...', source: 'VirusTotal (68/72)' }, mitre_techniques: [{ id: 'T1444', name: 'Masquerade as Legitimate App', tactic: 'Defense Evasion', severity: 'HIGH' }, { id: 'T1417', name: 'Input Capture', tactic: 'Collection', severity: 'CRITICAL' }], attributed_actor: { id: 'TA-002', name: 'Lazarus Group / HIDDEN COBRA', confidence: 72.0 }, enrichment_score: 99, feed_timestamp: ts, status: 'Active' },
        { id: 'IOC-A004', feed_type: 'LIVE_OSINT', threat_type: 'url', entity: 'apexpay-auth-portal.com', name: 'IDN Homoglyph Domain — Cyrillic Spoofing Attack', risk_score: 99, risk_level: 'CRITICAL', confidence: 99.9, reasons: ['Cyrillic character spoofing', 'Valid SSL deployed'], ioc_correlation: { type: 'idn_homoglyph', value: 'xn--pexpay-11a.com', source: 'IDN Homoglyph Radar' }, mitre_techniques: [{ id: 'T1583.001', name: 'Domains', tactic: 'Resource Development', severity: 'HIGH' }], attributed_actor: { id: 'TA-003', name: 'ScamSyndicate-IN', confidence: 94.0 }, enrichment_score: 99, feed_timestamp: ts, status: 'Active' },
        { id: 'IOC-A005', feed_type: 'THREAT_ACTOR_INTEL', threat_type: 'social', entity: 'Telegram: @ApexPay_Recovery_Admin', name: 'Telegram Scam Channel — Wallet Recovery Lure', risk_score: 88, risk_level: 'CRITICAL', confidence: 91.0, reasons: ['Linked in 14 active phishing DMs', 'Seed phrase harvesting confirmed'], ioc_correlation: { type: 'telegram', value: '@ApexPay_Recovery_Admin', source: 'Telegram IOC Feed' }, mitre_techniques: [{ id: 'T1598', name: 'Phishing for Information', tactic: 'Reconnaissance', severity: 'HIGH' }], attributed_actor: null, enrichment_score: 90, feed_timestamp: ts, status: 'Active' },
      ];
      return { isDemo: true, data: { total: mockFeed.length, feed: mockFeed } };
    }
  },

  // 20. Threat Actor Profiles
  async getThreatActors() {
    try {
      const res = await apiClient.get('/intelligence/threat-actors');
      return { isDemo: false, data: res.data };
    } catch (err) {
      const mockActors = [
        { id: 'TA-001', name: 'FIN7-Clone / FinCrime-Asia', aliases: ['GoldDragon', 'TEMP.Periscope'], motivation: 'Financial', origin_region: 'Southeast Asia', ttps: ['T1566.002', 'T1583.001', 'T1585.001', 'T1078'], campaigns: 3, last_seen: '2026-10-08', confidence: 87.5, active: true, linked_threats: 8, mitre_ttp_details: [] },
        { id: 'TA-002', name: 'Lazarus Group / HIDDEN COBRA', aliases: ['Guardians of Peace', 'ZINC'], motivation: 'Financial / State-Sponsored', origin_region: 'East Asia', ttps: ['T1407', 'T1417', 'T1444', 'T1636'], campaigns: 1, last_seen: '2026-10-05', confidence: 72.0, active: true, linked_threats: 3, mitre_ttp_details: [] },
        { id: 'TA-003', name: 'ScamSyndicate-IN / PhishKit-Operator', aliases: ['GOLD SKYLINE', 'IndoPhisher'], motivation: 'Financial', origin_region: 'South Asia', ttps: ['T1566.001', 'T1585.001', 'T1598', 'T1593'], campaigns: 5, last_seen: '2026-10-11', confidence: 94.0, active: true, linked_threats: 12, mitre_ttp_details: [] },
      ];
      return { isDemo: true, data: { threat_actors: mockActors, total_actors: 3, active_actors: 3 } };
    }
  },

  // 21. Geo Attribution
  async getGeoAttribution() {
    try {
      const res = await apiClient.get('/intelligence/geo-attribution');
      return { isDemo: false, data: res.data };
    } catch (err) {
      return {
        isDemo: true,
        data: {
          total_threats_attributed: 138,
          attribution_confidence: 82.3,
          top_origin: 'India',
          methodology: 'IP geolocation, language fingerprinting, timing analysis',
          geo_data: [
            { country: 'India', country_code: 'IN', threat_count: 47, percentage: 34.1, primary_vector: 'Social Impersonation' },
            { country: 'Nigeria', country_code: 'NG', threat_count: 28, percentage: 20.3, primary_vector: 'Scam Content' },
            { country: 'Romania', country_code: 'RO', threat_count: 19, percentage: 13.8, primary_vector: 'Phishing Domains' },
            { country: 'Russia', country_code: 'RU', threat_count: 14, percentage: 10.1, primary_vector: 'Rogue APK' },
            { country: 'Vietnam', country_code: 'VN', threat_count: 11, percentage: 8.0, primary_vector: 'Credential Phishing' },
            { country: 'Pakistan', country_code: 'PK', threat_count: 9, percentage: 6.5, primary_vector: 'Social Impersonation' },
            { country: 'Other', country_code: 'XX', threat_count: 10, percentage: 7.2, primary_vector: 'Mixed Vectors' },
          ]
        }
      };
    }
  },

  // 22. MITRE ATT&CK Coverage
  async getMitreCoverage() {
    try {
      const res = await apiClient.get('/intelligence/mitre-coverage');
      return { isDemo: false, data: res.data };
    } catch (err) {
      const matrix = [
        { id: 'T1566.002', name: 'Spearphishing Link', tactic: 'Initial Access', severity: 'CRITICAL', detection_count: 8, detection_status: 'DETECTED', heat: 96 },
        { id: 'T1585.001', name: 'Social Media Accounts', tactic: 'Resource Development', severity: 'HIGH', detection_count: 12, detection_status: 'DETECTED', heat: 100 },
        { id: 'T1583.001', name: 'Domains', tactic: 'Resource Development', severity: 'HIGH', detection_count: 6, detection_status: 'DETECTED', heat: 72 },
        { id: 'T1598', name: 'Phishing for Information', tactic: 'Reconnaissance', severity: 'HIGH', detection_count: 4, detection_status: 'DETECTED', heat: 48 },
        { id: 'T1444', name: 'Masquerade as Legitimate App', tactic: 'Defense Evasion', severity: 'HIGH', detection_count: 3, detection_status: 'DETECTED', heat: 36 },
        { id: 'T1417', name: 'Input Capture', tactic: 'Collection', severity: 'CRITICAL', detection_count: 3, detection_status: 'DETECTED', heat: 36 },
        { id: 'T1407', name: 'Download New Code', tactic: 'Defense Evasion', severity: 'HIGH', detection_count: 2, detection_status: 'DETECTED', heat: 24 },
        { id: 'T1636', name: 'Protected User Data (SMS)', tactic: 'Collection', severity: 'CRITICAL', detection_count: 2, detection_status: 'DETECTED', heat: 24 },
        { id: 'T1078', name: 'Valid Accounts', tactic: 'Credential Access', severity: 'CRITICAL', detection_count: 0, detection_status: 'MONITORING', heat: 15 },
        { id: 'T1539', name: 'Steal Web Session Cookie', tactic: 'Credential Access', severity: 'HIGH', detection_count: 0, detection_status: 'MONITORING', heat: 15 },
        { id: 'T1566', name: 'Phishing', tactic: 'Initial Access', severity: 'HIGH', detection_count: 5, detection_status: 'DETECTED', heat: 60 },
        { id: 'T1593', name: 'Search Open Websites', tactic: 'Reconnaissance', severity: 'MEDIUM', detection_count: 1, detection_status: 'DETECTED', heat: 15 },
        { id: 'T1583.003', name: 'Virtual Private Server', tactic: 'Resource Development', severity: 'MEDIUM', detection_count: 0, detection_status: 'MONITORING', heat: 15 },
        { id: 'T1110', name: 'Brute Force', tactic: 'Credential Access', severity: 'HIGH', detection_count: 0, detection_status: 'MONITORING', heat: 15 },
        { id: 'T1516', name: 'Input Injection (SMS)', tactic: 'Impact', severity: 'HIGH', detection_count: 1, detection_status: 'DETECTED', heat: 15 },
        { id: 'T1624', name: 'Event Triggered Execution', tactic: 'Persistence', severity: 'MEDIUM', detection_count: 0, detection_status: 'MONITORING', heat: 15 },
        { id: 'T1566.001', name: 'Spearphishing Attachment', tactic: 'Initial Access', severity: 'HIGH', detection_count: 2, detection_status: 'DETECTED', heat: 24 },
      ];
      return { isDemo: true, data: { total_techniques_monitored: matrix.length, detected_techniques: matrix.filter(m => m.detection_count > 0).length, coverage_percentage: 70.6, matrix } };
    }
  },

  // 23. IOC Lookup
  async iocLookup(indicator) {
    try {
      const res = await apiClient.post('/intelligence/ioc-lookup', { indicator });
      return { isDemo: false, data: res.data };
    } catch (err) {
      const isMalicious = indicator.toLowerCase().includes('apexpay') && indicator.toLowerCase() !== 'apexpay.com';
      return {
        isDemo: true,
        data: {
          indicator,
          is_malicious: isMalicious,
          match_count: isMalicious ? 2 : 0,
          matches: isMalicious ? [
            { source: 'Brand Similarity Engine', type: 'brand_spoof', similarity: '88%', severity: 'CRITICAL' },
            { source: 'Internal Threat DB', type: 'db_threat', severity: 'HIGH' }
          ] : [],
          risk_score: isMalicious ? 80 : 0,
          risk_level: isMalicious ? 'CRITICAL' : 'CLEAN',
          checked_at: new Date().toISOString()
        }
      };
    }
  },

  // 24. Executive Scorecard
  async getExecutiveScorecard() {
    try {
      const res = await apiClient.get('/intelligence/executive-scorecard');
      return { isDemo: false, data: res.data };
    } catch (err) {
      return {
        isDemo: true,
        data: {
          scorecard: {
            overall_risk_index: 72,
            risk_trend: 'ESCALATING',
            threat_volume_24h: 11,
            critical_threats_active: 8,
            high_threats_active: 14,
            takedown_success_rate: '64.3%',
            mean_time_to_detect_hrs: 2.4,
            mean_time_to_takedown_hrs: 18.7,
            false_positive_rate: '3.2%',
            ml_model_accuracy: '97.8%',
            detection_coverage: '96.0%',
          },
          financial_exposure: {
            estimated_exposure_usd: '$1,630,000',
            avg_brand_damage_per_incident: '$47,500',
            incidents_prevented_this_month: 12,
            cost_avoidance_usd: '$570,000'
          },
          compliance: {
            soc2_type2: 'COMPLIANT',
            iso_27001: 'COMPLIANT',
            gdpr: 'COMPLIANT',
            pci_dss: 'PARTIAL',
            brand_protection_sla: '99.1% SLA Met'
          },
          generated_at: new Date().toISOString()
        }
      };
    }
  },

  // 18. RFC 2142 & DMCA Legal Dossier Generator
  async getTakedownDossier(threatId, notes = '') {
    try {
      const res = await apiClient.get(`/threats/${threatId}/dossier${notes ? `?notes=${encodeURIComponent(notes)}` : ''}`);
      return { isDemo: false, data: res.data };
    } catch (err) {
      return {
        isDemo: true,
        data: {
          case_reference: `AEGIS-LEGAL-${threatId}-${Date.now()}`,
          threat_id: threatId,
          target_entity: 'Hostile Asset',
          abuse_email: 'abuse@registrar-servers.com',
          generated_at: new Date().toUTCString(),
          dossier_text: `================================================================================\nRFC 2142 & DMCA FORMAL ABUSE NOTIFICATION / TAKEDOWN DOSSIER\nCase Reference: AEGIS-LEGAL-${threatId}\nGenerated: ${new Date().toUTCString()}\nPlatform: AegisGuard Digital Risk Protection Autonomous Defense\n================================================================================\n\nATTENTION: ABUSE RESPONSE TEAM & LEGAL COMPLIANCE\nPrimary Abuse Contact: abuse@registrar-servers.com\n\n1. COMPLAINANT IDENTIFICATION:\n   Organization: ApexPay Global Digital Risk Protection & Legal Office\n   Authorized Agent: AegisGuard Automated Threat Response System\n\n2. INFRINGING & MALICIOUS ASSET:\n   Threat ID: ${threatId}\n   Status: Active Infringement\n   Analyst Notes: ${notes || 'Immediate suspension requested.'}\n\n3. STATUTORY PERJURY DECLARATION:\n   I hereby state under penalty of perjury that this communication is accurate.\n================================================================================`
        }
      };
    }
  }
};
