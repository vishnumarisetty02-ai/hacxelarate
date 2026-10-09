// Realistic demo dataset for Digital Risk Protection Platform (AegisGuard)
// Clear separation from live backend data

export const MOCK_BRANDS = [
  {
    id: 'brand-apex',
    name: 'ApexPay Global',
    industry: 'FinTech & Banking',
    officialDomains: ['apexpay.com', 'apexpay.io'],
    officialHandles: {
      twitter: '@ApexPayOfficial',
      instagram: '@apexpay_global',
      linkedin: 'company/apexpay',
      facebook: 'apexpay.official'
    },
    appIdentifiers: {
      android: 'com.apexpay.mobile.wallet',
      ios: 'id1548291039'
    },
    monitoringKeywords: ['ApexPay', 'Apex Wallet', 'Apex Cash', 'ApexPay Rewards', 'Apex Crypto'],
    lastScanAt: '2026-10-07T14:45:00Z',
    status: 'ACTIVE'
  },
  {
    id: 'brand-nexus',
    name: 'Nexus Health Systems',
    industry: 'Healthcare & MedTech',
    officialDomains: ['nexushealth.org'],
    officialHandles: {
      twitter: '@NexusHealthOrg',
      instagram: '@nexus_health'
    },
    appIdentifiers: {
      android: 'org.nexushealth.portal',
      ios: 'id1492048123'
    },
    monitoringKeywords: ['Nexus Health', 'Nexus Portal', 'Nexus Care'],
    lastScanAt: '2026-10-07T13:20:00Z',
    status: 'ACTIVE'
  }
];

export const MOCK_STATS = {
  totalThreats: 142,
  criticalThreats: 18,
  highThreats: 37,
  mediumThreats: 56,
  lowThreats: 31,
  socialThreats: 64,
  suspiciousApps: 29,
  suspiciousUrls: 49,
  activeCampaigns: 4,
  mitigatedThisMonth: 89,
  overallRiskScore: 78,
  riskScoreDelta: '+4.2%'
};

export const MOCK_RISK_TREND = [
  { date: 'Oct 01', riskScore: 54, threatsDetected: 12, resolved: 8 },
  { date: 'Oct 02', riskScore: 58, threatsDetected: 15, resolved: 11 },
  { date: 'Oct 03', riskScore: 65, threatsDetected: 24, resolved: 14 },
  { date: 'Oct 04', riskScore: 61, threatsDetected: 19, resolved: 16 },
  { date: 'Oct 05', riskScore: 72, threatsDetected: 31, resolved: 18 },
  { date: 'Oct 06', riskScore: 76, threatsDetected: 38, resolved: 22 },
  { date: 'Oct 07', riskScore: 78, threatsDetected: 42, resolved: 29 }
];

export const MOCK_THREAT_DISTRIBUTION = [
  { name: 'Social Impersonation', count: 64, color: '#06b6d4' },
  { name: 'Phishing URLs', count: 49, color: '#f43f5e' },
  { name: 'Trojanized Apps', count: 29, color: '#f59e0b' },
  { name: 'Executive Fraud', count: 14, color: '#8b5cf6' }
];

export const MOCK_THREATS = [
  {
    id: 'THR-8901',
    name: '@ApexPay_SupportDesk_VIP',
    type: 'social',
    category: 'Fake Support Scam',
    platform: 'Twitter / X',
    riskScore: 94,
    severity: 'Critical',
    confidence: 98.4,
    detectedAt: '2026-10-07T12:15:32Z',
    status: 'Active',
    impersonating: 'ApexPay Global Official Support',
    targetAudience: 'Customers asking for transaction help',
    detectionReasons: [
      'Visual avatar matches official brand logo with 97.2% cosine similarity',
      'Bio redirects users to credential harvesting phishing link: apexpay-recovery.net',
      'Automated bot replies detected under legitimate customer complaint threads',
      'Account created 48 hours ago using disposable email service'
    ],
    evidence: {
      profileUrl: 'https://twitter.com/ApexPay_SupportDesk_VIP',
      handle: '@ApexPay_SupportDesk_VIP',
      followers: 142,
      following: 1820,
      creationDate: 'Oct 05, 2026',
      ipAddress: '198.51.100.44',
      serverLocation: 'Amsterdam, Netherlands (Hostinger ASN)',
      matchedLogoSimilarity: '97.2%',
      brandKeywordsUsed: ['ApexPay', 'Account Recovery', 'Official Support', 'Direct Assist'],
      screenshotUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      harvesterUrl: 'https://apexpay-security-verify.net/login.php',
      dnsRecords: {
        a: '198.51.100.44',
        ns: ['ns1.parkingcrew.net', 'ns2.parkingcrew.net'],
        registrar: 'NameCheap Inc.',
        registrationDate: '2026-10-04'
      }
    },
    recommendedAction: 'Immediate DMCA Takedown & X Trust/Safety Escalation API notice',
    relatedThreatIds: ['THR-8903', 'THR-8910'],
    campaignId: 'CAMP-401'
  },
  {
    id: 'THR-8902',
    name: 'ApexPay Quick Loan & Wallet APK',
    type: 'app',
    category: 'Trojanized Fake App',
    platform: 'Third-party APK Mirror / Telegram',
    riskScore: 91,
    severity: 'Critical',
    confidence: 96.1,
    detectedAt: '2026-10-07T10:40:12Z',
    status: 'Active',
    impersonating: 'ApexPay Mobile Android Wallet',
    targetAudience: 'Android users searching for ApexPay APK outside Play Store',
    detectionReasons: [
      'Package name "com.apexpay.quickloan.secure" clones genuine brand metadata',
      'Injected Spyware payload (SpyNote/Cerberus variant) requesting SMS read permissions',
      'Self-signed certificate with bogus CN=ApexPay Security Team',
      'C2 Command Server linked to known financial malware infrastructure'
    ],
    evidence: {
      packageName: 'com.apexpay.quickloan.secure',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      version: '4.8.1-mod',
      permissionsRequested: [
        'READ_SMS (Critical)',
        'RECEIVE_SMS (Critical)',
        'SYSTEM_ALERT_WINDOW (Overlay)',
        'READ_CONTACTS',
        'ACCESS_FINE_LOCATION'
      ],
      c2Server: '185.220.101.5:8443',
      hostDomain: 'cdn-apexpay-download.online',
      virustotalScore: '48/70 Security Vendors Flagged Malicious'
    },
    recommendedAction: 'Issue Google Play Protect App Ban & Telegram Channel DMCA Notice',
    relatedThreatIds: ['THR-8901', 'THR-8903'],
    campaignId: 'CAMP-401'
  },
  {
    id: 'THR-8903',
    name: 'https://apexpay-login-portal-auth.com',
    type: 'url',
    category: 'Typosquatting Phishing',
    platform: 'Web / Domain Registries',
    riskScore: 88,
    severity: 'High',
    confidence: 94.7,
    detectedAt: '2026-10-07T08:22:15Z',
    status: 'Active',
    impersonating: 'ApexPay Customer Sign-In Portal',
    targetAudience: 'Desktop and Mobile web users via SMS lure links',
    detectionReasons: [
      'Exact clone of official ApexPay authorization portal HTML and CSS templates',
      'Free Let\'s Encrypt SSL certificate registered 6 hours ago',
      'Live credential harvesting endpoint sending form data via WebSocket to off-shore IP',
      'Typosquatting registered through privacy proxy service'
    ],
    evidence: {
      targetUrl: 'https://apexpay-login-portal-auth.com/secure-signin',
      ipAddress: '45.154.255.89',
      registrar: 'Njalla Anonymity Registrar',
      createdAt: '2026-10-06 22:10 UTC',
      sslIssuer: 'Let\'s Encrypt Authority X3',
      mxRecords: 'Active (configured for outbound credential lures)',
      serverHeaders: 'nginx/1.18.0 (Ubuntu)',
      phishingKitDetected: 'Ex-Carder v3.4'
    },
    recommendedAction: 'Automated registrar takedown request + Google Safe Browsing report',
    relatedThreatIds: ['THR-8901', 'THR-8902'],
    campaignId: 'CAMP-401'
  },
  {
    id: 'THR-8904',
    name: '@apexpay_giveaway_rewards',
    type: 'social',
    category: 'Crypto Scam Impersonation',
    platform: 'Instagram',
    riskScore: 76,
    severity: 'High',
    confidence: 89.2,
    detectedAt: '2026-10-06T20:11:00Z',
    status: 'Investigating',
    impersonating: 'ApexPay Marketing & Rewards Division',
    targetAudience: 'Instagram followers seeking giveaways',
    detectionReasons: [
      'Promotes fake "Deposit 500 USDT get 1000 ApexBonus" scam scheme',
      'Cloned official marketing promotional banners and typography',
      'Artificial engagement bot network used to inflate likes and comments'
    ],
    evidence: {
      profileUrl: 'https://instagram.com/apexpay_giveaway_rewards',
      handle: '@apexpay_giveaway_rewards',
      followers: 4890,
      following: 120,
      creationDate: 'Oct 02, 2026',
      postCount: 14,
      externalLink: 'https://t.me/ApexPayOfficialBonuses'
    },
    recommendedAction: 'Submit Meta Rights Manager counterfeit claim & freeze Telegram bot',
    relatedThreatIds: [],
    campaignId: null
  },
  {
    id: 'THR-8905',
    name: 'https://apex-pay-refunds.top',
    type: 'url',
    category: 'Brand Abuse / Advance-Fee',
    platform: 'Web / Domain Registries',
    riskScore: 72,
    severity: 'High',
    confidence: 87.5,
    detectedAt: '2026-10-06T15:30:45Z',
    status: 'Mitigated',
    impersonating: 'ApexPay Dispute & Refund Center',
    targetAudience: 'Users receiving fake chargeback notification emails',
    detectionReasons: [
      '.top TLD with newly created domain age (< 3 days)',
      'Phishing form demanding credit card CVV and OTP validation',
      'Zero legitimate business registration records'
    ],
    evidence: {
      targetUrl: 'https://apex-pay-refunds.top/claim-voucher',
      ipAddress: '193.106.191.24',
      registrar: 'PublicDomainRegistry',
      createdAt: '2026-10-04 11:05 UTC'
    },
    recommendedAction: 'Domain suspension confirmed via Cloudflare Trust & Safety',
    relatedThreatIds: [],
    campaignId: null
  },
  {
    id: 'THR-8906',
    name: 'Apex Crypto Pro Trader (Clone)',
    type: 'app',
    category: 'Unauthorized Logo Usage',
    platform: 'Google Play Store (Unverified publisher)',
    riskScore: 62,
    severity: 'Medium',
    confidence: 82.0,
    detectedAt: '2026-10-05T18:04:10Z',
    status: 'Active',
    impersonating: 'ApexPay Crypto Exchange Module',
    targetAudience: 'Cryptocurrency traders',
    detectionReasons: [
      'Uses ApexPay copyrighted brand logo in app icon without authorization',
      'Developer name: "Apex Fin Development Global LLC" (unregistered shell entity)',
      'Aggressive adware SDK embedded (IronSource / Unity Ads spam)'
    ],
    evidence: {
      packageName: 'org.apexcrypto.protrader.wallet',
      downloads: '1,000+',
      rating: '1.8 / 5.0 (Review bombing with fraud warnings)'
    },
    recommendedAction: 'File Google Play Trademark Infringement Notice',
    relatedThreatIds: [],
    campaignId: null
  },
  {
    id: 'THR-8907',
    name: '@apexpay_ceo_announcements',
    type: 'social',
    category: 'Executive Impersonation (VIP)',
    platform: 'LinkedIn',
    riskScore: 84,
    severity: 'High',
    confidence: 92.4,
    detectedAt: '2026-10-05T12:00:00Z',
    status: 'Active',
    impersonating: 'ApexPay CEO & Founders',
    targetAudience: 'Job seekers & enterprise partners',
    detectionReasons: [
      'Cloned LinkedIn profile of CEO Marcus Vance',
      'Soliciting recruitment "processing fees" via Western Union and crypto',
      'Sent over 200 unsolicited InMail messages to software developers'
    ],
    evidence: {
      profileUrl: 'https://linkedin.com/in/marcus-vance-apexpay-official-789a',
      claimedRole: 'Founder & Chief Executive Officer at ApexPay Global',
      connections: '500+'
    },
    recommendedAction: 'Priority LinkedIn Trust & Safety Executive Protection Escalation',
    relatedThreatIds: [],
    campaignId: null
  },
  {
    id: 'THR-8908',
    name: 'https://apexpay.support-desk.cc',
    type: 'url',
    category: 'Subdomain Hijack / Impersonation',
    platform: 'Web / Domain Registries',
    riskScore: 55,
    severity: 'Medium',
    confidence: 78.1,
    detectedAt: '2026-10-04T09:12:00Z',
    status: 'Investigating',
    impersonating: 'ApexPay Customer Portal',
    targetAudience: 'International users',
    detectionReasons: [
      'Deceptive subdomain syntax spoofing real brand',
      'Currently parked with suspicious ad redirections'
    ],
    evidence: {
      targetUrl: 'https://apexpay.support-desk.cc',
      ipAddress: '104.21.78.199'
    },
    recommendedAction: 'Add to DNS blocklist and monitor for active phishing kits',
    relatedThreatIds: [],
    campaignId: null
  },
  {
    id: 'THR-8909',
    name: 'Apex Token Fan Page',
    type: 'social',
    category: 'Unofficial Community Page',
    platform: 'Facebook',
    riskScore: 32,
    severity: 'Low',
    confidence: 65.0,
    detectedAt: '2026-10-03T14:20:00Z',
    status: 'Safe',
    impersonating: 'ApexPay Community',
    targetAudience: 'General public',
    detectionReasons: [
      'Unverified fan page with disclaimer "Not affiliated with ApexPay Global"',
      'No phishing or scam links detected in the past 30 days'
    ],
    evidence: {
      profileUrl: 'https://facebook.com/apextokenfans',
      likes: '340'
    },
    recommendedAction: 'Keep under passive monitoring; no active enforcement needed',
    relatedThreatIds: [],
    campaignId: null
  }
];

export const MOCK_CAMPAIGN_GRAPH_DATA = {
  campaignId: 'CAMP-401',
  title: 'ApexHarvest FinTech Syndicate',
  description: 'Coordinated brand impersonation attack campaign directing victims from social bots to typosquatting domains and trojanized Android payloads.',
  threatLevel: 'Critical',
  activeNodesCount: 4,
  estimatedVictimsImpacted: '3,200+',
  nodes: [
    {
      id: 'brand',
      type: 'brandNode',
      data: {
        label: 'Official Brand Target',
        subLabel: 'ApexPay Global',
        entityType: 'Legitimate Enterprise',
        badge: 'Protected Asset',
        status: 'Targeted'
      },
      position: { x: 50, y: 180 }
    },
    {
      id: 'social-1',
      type: 'threatNode',
      data: {
        label: 'Fake Social Profile',
        subLabel: '@ApexPay_SupportDesk_VIP',
        entityType: 'Social Bot Vector (X)',
        riskScore: 94,
        badge: 'Critical Threat',
        status: 'Active'
      },
      position: { x: 380, y: 80 }
    },
    {
      id: 'url-1',
      type: 'threatNode',
      data: {
        label: 'Suspicious Phishing URL',
        subLabel: 'apexpay-login-portal-auth.com',
        entityType: 'Harvesting Portal',
        riskScore: 88,
        badge: 'High Threat',
        status: 'Active'
      },
      position: { x: 720, y: 180 }
    },
    {
      id: 'app-1',
      type: 'threatNode',
      data: {
        label: 'Trojanized Fake App',
        subLabel: 'ApexPay Quick Loan APK',
        entityType: 'Spyware (C2 Linked)',
        riskScore: 91,
        badge: 'Critical Payload',
        status: 'Active'
      },
      position: { x: 1060, y: 280 }
    }
  ],
  edges: [
    {
      id: 'e-brand-social',
      source: 'brand',
      target: 'social-1',
      animated: true,
      label: 'Impersonates Brand Assets',
      style: { stroke: '#06b6d4', strokeWidth: 2 }
    },
    {
      id: 'e-social-url',
      source: 'social-1',
      target: 'url-1',
      animated: true,
      label: 'Lures Victims via Bio & DMs',
      style: { stroke: '#f43f5e', strokeWidth: 2 }
    },
    {
      id: 'e-url-app',
      source: 'url-1',
      target: 'app-1',
      animated: true,
      label: 'Promotes Malicious APK Download',
      style: { stroke: '#f59e0b', strokeWidth: 2 }
    }
  ]
};

export const MOCK_REPORTS = [
  {
    id: 'REP-2026-10-A',
    title: 'Monthly Digital Risk & Brand Impersonation Audit',
    period: 'September 2026 - October 2026',
    generatedAt: '2026-10-07T09:00:00Z',
    fileSize: '4.8 MB',
    threatsAnalyzed: 142,
    takedownsCompleted: 89,
    complianceStatus: 'SOC2 & ISO 27001 Aligned',
    summary: 'Detected 4 coordinated scam campaigns targeting ApexPay customer credentials. 89 infringing assets were successfully taken down within an average MTTR of 3.2 hours.'
  },
  {
    id: 'REP-2026-09-B',
    title: 'Executive Phishing & Executive Impersonation Briefing',
    period: 'August 2026 - September 2026',
    generatedAt: '2026-09-30T17:30:00Z',
    fileSize: '2.4 MB',
    threatsAnalyzed: 98,
    takedownsCompleted: 71,
    summary: 'Neutralized 14 fake executive profiles across LinkedIn and WhatsApp targeting C-suite credentials and corporate vendors.'
  }
];

export const MOCK_CAMPAIGN_GRAPH = MOCK_CAMPAIGN_GRAPH_DATA;
