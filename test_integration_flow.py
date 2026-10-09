import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def request(method, path, data=None, headers=None):
    url = f"{BASE_URL}{path}"
    req_headers = {"Accept": "application/json"}
    if headers:
        req_headers.update(headers)
    
    encoded_data = None
    if data is not None:
        if isinstance(data, dict):
            encoded_data = json.dumps(data).encode("utf-8")
            req_headers["Content-Type"] = "application/json"
        elif isinstance(data, (bytes, bytearray)):
            encoded_data = data

    req = urllib.request.Request(url, data=encoded_data, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            body = json.loads(content)
        except Exception:
            body = content
        return e.code, body
    except Exception as e:
        return 0, str(e)

def main():
    print("==================================================")
    print("Testing AegisGuard DRP Full-Stack Integration Flow")
    print("==================================================")
    
    # 0. Health check
    status, body = request("GET", "/")
    assert status == 200, f"Root health failed: {status} {body}"
    print("[PASS] 0. Root Health Check OK:", body.get("status"))

    # 1. Brand Registration (React → POST /api/brand/register)
    brand_payload = {
        "brand_name": "ApexPay Global",
        "official_website": "https://apexpay.com",
        "official_social_handles": {
            "twitter": "@ApexPayOfficial",
            "instagram": "@apexpay_global"
        },
        "industry": "FinTech / Payment Services",
        "app_identifiers": {
            "android_package": "com.apexpay.wallet"
        },
        "monitoring_keywords": ["ApexPay", "Apex Wallet", "Apex Cash"]
    }
    status, brand_res = request("POST", "/api/brand/register", brand_payload)
    assert status == 200, f"Brand Registration failed: {status} {brand_res}"
    print(f"[PASS] 1. Brand Registration OK: {brand_res.get('id')} - {brand_res.get('name')}")

    # 2. Social Profile Analysis (React → POST /api/social/analyze-profile)
    profile_payload = {
        "username": "@ApexPay_SupportDesk_VIP",
        "display_name": "ApexPay VIP Support Care",
        "bio": "Official 24/7 ApexPay customer recovery. Send your OTP immediately to unlock wallet.",
        "followers": 18,
        "following": 890,
        "account_age": "2 days",
        "verified": False,
        "external_url": "https://apexpay-login-portal-auth.com/secure-signin"
    }
    status, profile_res = request("POST", "/api/social/analyze-profile", profile_payload)
    assert status == 200, f"Social Profile Analysis failed: {status} {profile_res}"
    created_threat_id = profile_res.get("id")
    print(f"[PASS] 2. Social Profile Analysis OK: Threat ID={created_threat_id}, Risk Score={profile_res.get('risk_score')}, Level={profile_res.get('risk_level')}")

    # 3. Scam Content Analysis (React → POST /api/social/analyze-content)
    content_payload = {
        "text": "URGENT: Your ApexPay wallet is locked due to suspicious activity. Share OTP immediately at https://apexpay-support.top",
        "url": "https://apexpay-support.top"
    }
    status, content_res = request("POST", "/api/social/analyze-content", content_payload)
    assert status == 200, f"Scam Content Analysis failed: {status} {content_res}"
    print(f"[PASS] 3. Scam Content Analysis OK: Risk Score={content_res.get('risk_score')}, Confidence={content_res.get('confidence')}%")

    # 4. URL Analysis (React → POST /api/url/analyze)
    url_payload = {
        "url": "https://apexpay-login-portal-auth.com/secure-signin"
    }
    status, url_res = request("POST", "/api/url/analyze", url_payload)
    assert status == 200, f"URL Analysis failed: {status} {url_res}"
    print(f"[PASS] 4. URL Analysis OK: Threat ID={url_res.get('id')}, Risk Score={url_res.get('risk_score')}, Category={url_res.get('category')}")

    # 5. APK Analysis (React → POST /api/app/analyze)
    # Construct multipart form-data
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    apk_content = b"PK\x03\x04\x14\x00\x00\x00\x08\x00AndroidManifest.xml...MockTrojanBinaryContentWithSMSPermissions"
    body_bytes = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="ApexPay_QuickLoan_trojan.apk"\r\n'
        f"Content-Type: application/vnd.android.package-archive\r\n\r\n"
    ).encode("utf-8") + apk_content + (
        f"\r\n--{boundary}\r\n"
        f'Content-Disposition: form-data; name="app_name"\r\n\r\n'
        f"ApexPay QuickLoan Trojan App\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")
    status, app_res = request("POST", "/api/app/analyze", data=body_bytes, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    assert status == 200, f"APK Analysis failed: {status} {app_res}"
    print(f"[PASS] 5. APK Analysis OK: Threat ID={app_res.get('id')}, Risk Score={app_res.get('risk_score')}, Name={app_res.get('name')}")

    # 6. Dashboard (React → GET /api/dashboard)
    status, dash_res = request("GET", "/api/dashboard")
    assert status == 200, f"Dashboard failed: {status} {dash_res}"
    stats = dash_res.get("stats", {})
    print(f"[PASS] 6. Dashboard Metrics OK: Total Threats={stats.get('totalThreats')}, Overall Risk={stats.get('overallRiskScore')}/100, Mitigated={stats.get('mitigatedThisMonth')}")

    # 7. Threat List (React → GET /api/threats)
    status, threats_res = request("GET", "/api/threats?limit=10")
    assert status == 200, f"Threat List failed: {status} {threats_res}"
    threat_list = threats_res.get("threats", [])
    assert len(threat_list) > 0, "Threat list should not be empty"
    print(f"[PASS] 7. Threat List OK: Retrieved {len(threat_list)} threats. Latest threat ID: {threat_list[0].get('id')}")

    # 8. Threat Details (React → GET /api/threats/{id})
    test_id = created_threat_id or threat_list[0].get("id")
    status, detail_res = request("GET", f"/api/threats/{test_id}")
    assert status == 200, f"Threat Details failed: {status} {detail_res}"
    print(f"[PASS] 8. Threat Details OK: Retrieved details for {detail_res.get('id')} ({detail_res.get('name')}), Score={detail_res.get('risk_score')}")

    # 9. Campaigns (React → GET /api/campaigns)
    status, campaigns_res = request("GET", "/api/campaigns")
    assert status == 200, f"Campaigns failed: {status} {campaigns_res}"
    assert len(campaigns_res) > 0, "Campaigns list should not be empty"
    camp_id = campaigns_res[0].get("id")
    status, graph_res = request("GET", f"/api/campaigns/{camp_id}/graph")
    assert status == 200, f"Campaign Graph failed: {status} {graph_res}"
    print(f"[PASS] 9. Campaigns & Attack Graph OK: Campaign ID={camp_id}, Title={graph_res.get('title')}, Active Nodes={graph_res.get('activeNodesCount')}")

    # 10. Reports (React → POST /api/reports/generate)
    report_payload = {
        "reportType": "Executive Board Summary",
        "timeRange": "Last 30 Days",
        "brandName": "ApexPay Global"
    }
    status, report_res = request("POST", "/api/reports/generate", report_payload)
    assert status == 200, f"Report Generation failed: {status} {report_res}"
    print(f"[PASS] 10. Report Generation OK: Report ID={report_res.get('id')}, Title={report_res.get('title')}, Compliance={report_res.get('complianceStatus')}")

    print("\n==================================================")
    print("ALL 10 FULL-STACK INTEGRATION ENDPOINTS PASSED 100%!")
    print("==================================================")

if __name__ == "__main__":
    main()
