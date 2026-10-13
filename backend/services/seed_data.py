import json
from datetime import datetime
from sqlalchemy.orm import Session
from models.entities import BrandModel, ThreatModel, CampaignModel, ReportModel

def clear_database(db: Session):
    """Purge all dynamic incidents, campaigns, and reports to demonstrate clean empty states."""
    db.query(ThreatModel).delete()
    db.query(CampaignModel).delete()
    db.query(ReportModel).delete()
    db.commit()
    print("[AegisGuard] Dynamic tables cleared for empty state demonstration.")

def seed_database_if_empty(db: Session):
    # Check if brands exist
    if db.query(BrandModel).first():
        return # Database already seeded
    force_seed_demo_data(db)

def force_seed_demo_data(db: Session):
    # Clear existing to guarantee consistent clean seed
    db.query(ThreatModel).delete()
    db.query(CampaignModel).delete()
    db.query(ReportModel).delete()
    db.query(BrandModel).delete()
    db.commit()

    print("[AegisGuard] Seeding initial database records...")

    # 1. Seed Brands
    brand_apex = BrandModel(
        id="brand-apex",
        name="ApexPay Global",
        industry="FinTech & Banking",
        official_website="https://apexpay.com",
        official_social_handles=json.dumps({
            "twitter": "@ApexPayOfficial",
            "instagram": "@apexpay_global",
            "linkedin": "company/apexpay",
            "facebook": "apexpay.official"
        }),
        app_identifiers=json.dumps({
            "android": "com.apexpay.mobile.wallet",
            "ios": "id1548291039"
        }),
        monitoring_keywords=json.dumps([
            "ApexPay", "Apex Wallet", "Apex Cash", "ApexPay Rewards", "Apex Crypto"
        ]),
        logo_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200"
    )

    brand_nexus = BrandModel(
        id="brand-nexus",
        name="Nexus Health Systems",
        industry="Healthcare & MedTech",
        official_website="https://nexushealth.org",
        official_social_handles=json.dumps({
            "twitter": "@NexusHealthOrg",
            "instagram": "@nexus_health"
        }),
        app_identifiers=json.dumps({
            "android": "org.nexushealth.portal",
            "ios": "id1492048123"
        }),
        monitoring_keywords=json.dumps(["Nexus Health", "Nexus Portal", "Nexus Care"]),
        logo_url="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200"
    )

    db.add(brand_apex)
    db.add(brand_nexus)

    # 2. Seed Threats
    threats_data = [
        ThreatModel(
            id="THR-8901",
            threat_type="social",
            entity="@ApexPay_SupportDesk_VIP",
            name="@ApexPay_SupportDesk_VIP",
            category="Fake Support Scam",
            platform="Twitter / X",
            risk_score=94,
            risk_level="CRITICAL",
            confidence=98.4,
            reasons=json.dumps([
                "Visual avatar matches official brand logo with 97.2% cosine similarity",
                "Bio redirects users to credential harvesting phishing link: apexpay-recovery.net",
                "Automated bot replies detected under legitimate customer complaint threads",
                "Account created 48 hours ago using disposable email service"
            ]),
            recommendations=json.dumps([
                "Immediate DMCA Takedown & X Trust/Safety Escalation API notice",
                "Domain registrar abuse report to suspend apexpay-recovery.net",
                "Issue official customer warning regarding impersonating support handles"
            ]),
            related_threats=json.dumps(["THR-8903", "THR-8902"]),
            evidence=json.dumps({
                "profileUrl": "https://twitter.com/ApexPay_SupportDesk_VIP",
                "handle": "@ApexPay_SupportDesk_VIP",
                "followers": 142,
                "following": 1820,
                "matchedLogoSimilarity": "97.2%",
                "ipAddress": "198.51.100.44",
                "serverLocation": "Amsterdam, Netherlands"
            }),
            status="Active",
            campaign_id="CAMP-401"
        ),
        ThreatModel(
            id="THR-8902",
            threat_type="app",
            entity="com.apexpay.quickloan.secure",
            name="ApexPay Quick Loan & Wallet APK",
            category="Trojanized Fake App",
            platform="Third-party APK Mirror / Telegram",
            risk_score=91,
            risk_level="CRITICAL",
            confidence=96.1,
            reasons=json.dumps([
                "Package name 'com.apexpay.quickloan.secure' clones genuine brand metadata",
                "Injected Spyware payload (SpyNote/Cerberus variant) requesting SMS read permissions",
                "Self-signed certificate with bogus CN=ApexPay Security Team",
                "C2 Command Server linked to known financial malware infrastructure"
            ]),
            recommendations=json.dumps([
                "Issue Google Play Protect App Ban & Telegram Channel DMCA Notice",
                "Takedown hosting CDN endpoint cdn-apexpay-download.online",
                "Release public security advisory on authorized installation vectors"
            ]),
            related_threats=json.dumps(["THR-8901", "THR-8903"]),
            evidence=json.dumps({
                "packageName": "com.apexpay.quickloan.secure",
                "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "permissionsRequested": ["READ_SMS", "RECEIVE_SMS", "SYSTEM_ALERT_WINDOW"],
                "c2Server": "185.220.101.5:8443",
                "virustotalScore": "48/70 Vendors Flagged Malicious"
            }),
            status="Active",
            campaign_id="CAMP-401"
        ),
        ThreatModel(
            id="THR-8903",
            threat_type="url",
            entity="https://apexpay-login-portal-auth.com",
            name="https://apexpay-login-portal-auth.com",
            category="Typosquatting Phishing",
            platform="Web / Domain Registries",
            risk_score=88,
            risk_level="HIGH",
            confidence=94.7,
            reasons=json.dumps([
                "Exact clone of official ApexPay authorization portal HTML and CSS templates",
                "Free Let's Encrypt SSL certificate registered 6 hours ago",
                "Live credential harvesting endpoint sending form data via WebSocket to off-shore IP",
                "Typosquatting registered through privacy proxy service"
            ]),
            recommendations=json.dumps([
                "Automated registrar takedown request + Google Safe Browsing report",
                "Inject into enterprise boundary DNS sinkholes",
                "Notify corporate fraud response unit for credential invalidation"
            ]),
            related_threats=json.dumps(["THR-8901", "THR-8902"]),
            evidence=json.dumps({
                "targetUrl": "https://apexpay-login-portal-auth.com/secure-signin",
                "ipAddress": "45.154.255.89",
                "registrar": "Njalla Anonymity Registrar",
                "sslIssuer": "Let's Encrypt Authority X3",
                "phishingKitDetected": "Ex-Carder v3.4"
            }),
            status="Active",
            campaign_id="CAMP-401"
        ),
        ThreatModel(
            id="THR-8904",
            threat_type="social",
            entity="@apexpay_giveaway_rewards",
            name="@apexpay_giveaway_rewards",
            category="Crypto Scam Impersonation",
            platform="Instagram",
            risk_score=76,
            risk_level="HIGH",
            confidence=89.2,
            reasons=json.dumps([
                "Promotes fake 'Deposit 500 USDT get 1000 ApexBonus' scam scheme",
                "Cloned official marketing promotional banners and typography",
                "Artificial engagement bot network used to inflate likes and comments"
            ]),
            recommendations=json.dumps([
                "Submit Meta Rights Manager counterfeit claim & freeze Telegram bot"
            ]),
            related_threats=json.dumps([]),
            evidence=json.dumps({
                "handle": "@apexpay_giveaway_rewards",
                "followers": 4890,
                "externalLink": "https://t.me/ApexPayOfficialBonuses"
            }),
            status="Investigating",
            campaign_id=None
        ),
        ThreatModel(
            id="THR-8905",
            threat_type="url",
            entity="https://apex-pay-refunds.top",
            name="https://apex-pay-refunds.top",
            category="Brand Abuse / Advance-Fee",
            platform="Web / Domain Registries",
            risk_score=72,
            risk_level="HIGH",
            confidence=87.5,
            reasons=json.dumps([
                ".top TLD with newly created domain age (< 3 days)",
                "Phishing form demanding credit card CVV and OTP validation",
                "Zero legitimate business registration records"
            ]),
            recommendations=json.dumps([
                "Domain suspension confirmed via Cloudflare Trust & Safety"
            ]),
            related_threats=json.dumps([]),
            evidence=json.dumps({
                "targetUrl": "https://apex-pay-refunds.top/claim-voucher",
                "ipAddress": "193.106.191.24"
            }),
            status="Mitigated",
            campaign_id=None
        ),
        ThreatModel(
            id="THR-8906",
            threat_type="app",
            entity="org.apexcrypto.protrader.wallet",
            name="Apex Crypto Pro Trader (Clone)",
            category="Unauthorized Logo Usage",
            platform="Google Play Store (Unverified publisher)",
            risk_score=62,
            risk_level="HIGH",
            confidence=82.0,
            reasons=json.dumps([
                "Uses ApexPay copyrighted brand logo in app icon without authorization",
                "Developer name: 'Apex Fin Development Global LLC' (unregistered shell entity)",
                "Aggressive adware SDK embedded (IronSource / Unity Ads spam)"
            ]),
            recommendations=json.dumps([
                "File Google Play Trademark Infringement Notice"
            ]),
            related_threats=json.dumps([]),
            evidence=json.dumps({
                "packageName": "org.apexcrypto.protrader.wallet",
                "downloads": "1,000+"
            }),
            status="Active",
            campaign_id=None
        ),
        ThreatModel(
            id="THR-8907",
            threat_type="social",
            entity="@apexpay_ceo_announcements",
            name="@apexpay_ceo_announcements",
            category="Executive Impersonation (VIP)",
            platform="LinkedIn",
            risk_score=84,
            risk_level="CRITICAL",
            confidence=92.4,
            reasons=json.dumps([
                "Cloned LinkedIn profile of CEO Marcus Vance",
                "Soliciting recruitment 'processing fees' via Western Union and crypto",
                "Sent over 200 unsolicited InMail messages to software developers"
            ]),
            recommendations=json.dumps([
                "Priority LinkedIn Trust & Safety Executive Protection Escalation"
            ]),
            related_threats=json.dumps([]),
            evidence=json.dumps({
                "claimedRole": "Founder & CEO at ApexPay Global"
            }),
            status="Active",
            campaign_id=None
        )
    ]

    for t in threats_data:
        db.add(t)

    # 3. Seed Campaign Graph
    campaign_graph = {
        "nodes": [
            {
                "id": "brand",
                "type": "brandNode",
                "data": {
                    "label": "Official Brand Target",
                    "subLabel": "ApexPay Global",
                    "entityType": "Legitimate Enterprise",
                    "badge": "Protected Asset",
                    "status": "Targeted"
                },
                "position": {"x": 50, "y": 180}
            },
            {
                "id": "social-1",
                "type": "threatNode",
                "data": {
                    "label": "Fake Social Profile",
                    "subLabel": "@ApexPay_SupportDesk_VIP",
                    "entityType": "Social Bot Vector (X)",
                    "riskScore": 94,
                    "badge": "Critical Threat",
                    "status": "Active"
                },
                "position": {"x": 380, "y": 80}
            },
            {
                "id": "url-1",
                "type": "threatNode",
                "data": {
                    "label": "Suspicious Phishing URL",
                    "subLabel": "apexpay-login-portal-auth.com",
                    "entityType": "Harvesting Portal",
                    "riskScore": 88,
                    "badge": "High Threat",
                    "status": "Active"
                },
                "position": {"x": 720, "y": 180}
            },
            {
                "id": "app-1",
                "type": "threatNode",
                "data": {
                    "label": "Trojanized Fake App",
                    "subLabel": "ApexPay Quick Loan APK",
                    "entityType": "Spyware (C2 Linked)",
                    "riskScore": 91,
                    "badge": "Critical Payload",
                    "status": "Active"
                },
                "position": {"x": 1060, "y": 280}
            }
        ],
        "edges": [
            {
                "id": "e-brand-social",
                "source": "brand",
                "target": "social-1",
                "animated": True,
                "label": "Impersonates Brand Assets",
                "style": {"stroke": "#06b6d4", "strokeWidth": 2}
            },
            {
                "id": "e-social-url",
                "source": "social-1",
                "target": "url-1",
                "animated": True,
                "label": "Lures Victims via Bio & DMs",
                "style": {"stroke": "#f43f5e", "strokeWidth": 2}
            },
            {
                "id": "e-url-app",
                "source": "url-1",
                "target": "app-1",
                "animated": True,
                "label": "Promotes Malicious APK Download",
                "style": {"stroke": "#f59e0b", "strokeWidth": 2}
            }
        ]
    }

    camp_401 = CampaignModel(
        id="CAMP-401",
        title="ApexHarvest FinTech Syndicate",
        description="Coordinated brand impersonation attack campaign directing victims from social bots to typosquatting domains and trojanized Android payloads.",
        threat_level="Critical",
        active_nodes_count=4,
        estimated_victims="3,200+",
        graph_data=json.dumps(campaign_graph)
    )
    db.add(camp_401)

    camp_402_graph = {
        "nodes": [
            {
                "id": "brand-nexus",
                "type": "brandNode",
                "data": {
                    "label": "Official Brand Target",
                    "subLabel": "Nexus Health Systems",
                    "entityType": "Healthcare Enterprise",
                    "badge": "Protected Asset",
                    "status": "Targeted"
                },
                "position": {"x": 50, "y": 180}
            },
            {
                "id": "nexus-soc-1",
                "type": "threatNode",
                "data": {
                    "label": "Fake Support Care",
                    "subLabel": "@NexusHealth_PatientSupport",
                    "entityType": "Social Impersonation",
                    "riskScore": 89,
                    "badge": "High Threat",
                    "status": "Active"
                },
                "position": {"x": 380, "y": 80}
            },
            {
                "id": "nexus-url-1",
                "type": "threatNode",
                "data": {
                    "label": "Patient Portal Clone",
                    "subLabel": "nexus-patient-portal-auth.com",
                    "entityType": "Credential Harvesting",
                    "riskScore": 92,
                    "badge": "Critical Threat",
                    "status": "Active"
                },
                "position": {"x": 720, "y": 180}
            },
            {
                "id": "nexus-app-1",
                "type": "threatNode",
                "data": {
                    "label": "Fake Telehealth APK",
                    "subLabel": "NexusCare Mobile Assist APK",
                    "entityType": "Rogue APK",
                    "riskScore": 86,
                    "badge": "High Payload",
                    "status": "Active"
                },
                "position": {"x": 1060, "y": 280}
            }
        ],
        "edges": [
            {
                "id": "e-nexus-brand-social",
                "source": "brand-nexus",
                "target": "nexus-soc-1",
                "animated": True,
                "label": "Impersonates Patient Support",
                "style": {"stroke": "#06b6d4", "strokeWidth": 2}
            },
            {
                "id": "e-nexus-social-url",
                "source": "nexus-soc-1",
                "target": "nexus-url-1",
                "animated": True,
                "label": "DMs Victims Fake Portal Link",
                "style": {"stroke": "#f43f5e", "strokeWidth": 2}
            },
            {
                "id": "e-nexus-url-app",
                "source": "nexus-url-1",
                "target": "nexus-app-1",
                "animated": True,
                "label": "Promotes Backdoored APK",
                "style": {"stroke": "#f59e0b", "strokeWidth": 2}
            }
        ]
    }

    camp_402 = CampaignModel(
        id="CAMP-402",
        title="NexusPhish MedTech Syndicate",
        description="Coordinated healthcare credential harvesting campaign targeting hospital staff and patient portal credentials via spoofed support handles and unauthorized mobile telemedicine APKs.",
        threat_level="High",
        active_nodes_count=4,
        estimated_victims="1,850+",
        graph_data=json.dumps(camp_402_graph)
    )
    db.add(camp_402)

    # 4. Seed Reports
    rep_1 = ReportModel(
        id="REP-2026-10-A",
        title="Monthly Digital Risk & Brand Impersonation Audit",
        period="September 2026 - October 2026",
        file_size="4.8 MB",
        threats_analyzed=142,
        takedowns_completed=89,
        compliance_status="SOC2 & ISO 27001 Aligned",
        summary="Detected 4 coordinated scam campaigns targeting ApexPay customer credentials. 89 infringing assets were successfully taken down within an average MTTR of 3.2 hours."
    )

    rep_2 = ReportModel(
        id="REP-2026-09-B",
        title="Executive Phishing & Executive Impersonation Briefing",
        period="August 2026 - September 2026",
        file_size="2.4 MB",
        threats_analyzed=98,
        takedowns_completed=71,
        compliance_status="SOC2 Compliant",
        summary="Neutralized 14 fake executive profiles across LinkedIn and WhatsApp targeting C-suite credentials and corporate vendors."
    )

    db.add(rep_1)
    db.add(rep_2)

    db.commit()
    print("[AegisGuard] Seed data successfully committed.")
