# AEGIS GUARD — Digital Risk Sentinel

> **AI-Powered Digital Risk Protection (DRP) & Brand Defense Platform**  
> Autonomous multi-vector threat intelligence platform detecting fake profiles, executive impersonation, lookalike phishing domains, and malicious Android APK clones.

---

## Key Capabilities

1. **Social Media Impersonation Radar**
   - Brand name and trademark cosine similarity scoring.
   - Heuristic bot ratio analysis (followers-to-following ratios, creation age, unverified VIP badges).
   - Scam text NLP classifier detecting urgency lures, OTP harvesting, and fake recovery vaults.

2. **Rogue Mobile App & APK Reverse-Engineering Radar**
   - Static non-execution inspection of Android APK binaries (`AndroidManifest.xml` parsing).
   - Detection of Trojanized overlays, SpyNote signatures, accessibility abuse, and SMS interception permissions (`RECEIVE_SMS`, `READ_SMS`, `SEND_SMS`).

3. **Phishing Domain & Typosquatting Radar**
   - Combosquatting, typosquatting, homoglyph detection, and Shannon entropy analysis.
   - WHOIS registration age indicators and SSL certificate mismatch heuristics.

4. **Autonomous Attack Syndicate Correlation Engine**
   - Correlates isolated fake social handles, phishing URLs, and rogue APK mirrors into unified **Kill-Chain Attack Campaigns** (e.g. *ApexHarvest Syndicate*).
   - Interactive topology graph visualization with node inspection.

5. **Automated Takedown & Compliance Dossiers**
   - Automated generation of RFC 2142 abuse complaints and legal DMCA notification packets.
   - SOC2 & ISO 27001 aligned cryptographic audit logs and executive board risk summaries.

---

## Architecture & Tech Stack

- **Frontend**:
  - React 18, Vite, Tailwind CSS (Enterprise SOC Claymorphism aesthetic).
  - Lucide Icons, Recharts, React Flow.
  - Hardware-accelerated CSS animations, sequential text staggering, and number count-up transitions.
- **Backend**:
  - FastAPI (Python 3.10+ / 3.14).
  - SQLAlchemy & SQLite relational data store with automated baseline data seeding.
  - Multi-vector static inspection & heuristic risk scoring engine.
- **Testing**:
  - Automated 10-stage end-to-end full-stack integration test suite (`test_integration_flow.py`).

---

## Quick Start Guide

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive Swagger API Documentation will be available at:  
👉 **http://127.0.0.1:8000/docs**

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The web application will be accessible at:  
👉 **http://localhost:5173/**

---

### 3. Run Integration Test Suite

With the backend running:

```bash
python test_integration_flow.py
```

All 10 full-stack integration endpoints will validate automatically:
- Root Health Check
- Brand Registration
- Social Profile Analysis
- Scam Content NLP
- Lookalike URL Analysis
- Rogue APK Inspection
- Dashboard Aggregation Metrics
- Incident Triage Queues
- Attack Campaign Topology Graph
- Compliance Report Generation
