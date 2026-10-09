from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, HttpUrl

# --- BRAND SCHEMAS ---
class BrandRegisterRequest(BaseModel):
    model_config = {"extra": "allow"}
    brand_name: Optional[str] = Field(None, description="Name of the enterprise brand")
    name: Optional[str] = Field(None, description="Name fallback")
    official_website: Optional[str] = Field(None, description="Primary official website URL")
    officialWebsite: Optional[str] = Field(None, description="Primary official website URL camelCase")
    official_social_handles: Optional[Dict[str, Any]] = Field(default_factory=dict, description="e.g. {'twitter': '@ApexPayOfficial'}")
    officialHandles: Optional[Dict[str, Any]] = Field(default_factory=dict)
    official_logo: Optional[str] = Field(None, description="Logo URL or base64 preview")
    logo_url: Optional[str] = Field(None)
    industry: Optional[str] = "FinTech / Technology"
    app_identifiers: Optional[Dict[str, Any]] = Field(default_factory=dict)
    appIdentifiers: Optional[Dict[str, Any]] = Field(default_factory=dict)
    monitoring_keywords: Optional[List[str]] = Field(default_factory=list)
    monitoringKeywords: Optional[List[str]] = Field(default_factory=list)

    def resolved_name(self) -> str:
        return self.brand_name or self.name or "ApexPay Global"

    def resolved_website(self) -> str:
        return self.official_website or self.officialWebsite or "https://apexpay.com"

    def resolved_handles(self) -> Dict[str, Any]:
        return self.official_social_handles or self.officialHandles or {}

    def resolved_apps(self) -> Dict[str, Any]:
        return self.app_identifiers or self.appIdentifiers or {}

    def resolved_keywords(self) -> List[str]:
        return self.monitoring_keywords or self.monitoringKeywords or []

class BrandResponse(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    name: str
    industry: str
    official_website: str
    officialWebsite: Optional[str] = None
    official_social_handles: Dict[str, Any] = {}
    officialHandles: Optional[Dict[str, Any]] = None
    app_identifiers: Dict[str, Any] = {}
    appIdentifiers: Optional[Dict[str, Any]] = None
    monitoring_keywords: List[str] = []
    monitoringKeywords: Optional[List[str]] = None
    logo_url: Optional[str] = None
    official_logo: Optional[str] = None
    created_at: Optional[str] = None

# --- SOCIAL SCHEMAS ---
class SocialProfileAnalyzeRequest(BaseModel):
    model_config = {"extra": "allow"}
    username: str
    display_name: str
    bio: Optional[str] = ""
    followers: Optional[int] = 0
    following: Optional[int] = 0
    post_count: Optional[int] = 0
    account_age: Optional[str] = "3 days"
    verified: Optional[bool] = False
    external_url: Optional[str] = None
    profile_image_url: Optional[str] = None

class ScamContentAnalyzeRequest(BaseModel):
    model_config = {"extra": "allow"}
    text: str = Field(..., description="Text content from post, DM, or message")
    url: Optional[str] = Field(None, description="Optional embedded link")

# --- URL SCHEMAS ---
class UrlAnalyzeRequest(BaseModel):
    model_config = {"extra": "allow"}
    url: str = Field(..., description="Target URL or domain to inspect")

# --- THREAT RESPONSE SCHEMA ---
class ThreatResponse(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    threat_type: str
    type: Optional[str] = None
    entity: str
    name: Optional[str] = None
    category: Optional[str] = None
    platform: Optional[str] = None
    risk_score: int
    riskScore: Optional[int] = None
    risk_level: str
    severity: Optional[str] = None
    confidence: float
    reasons: List[str] = []
    detectionReasons: Optional[List[str]] = []
    recommendations: List[str] = []
    recommendedAction: Optional[str] = None
    related_threats: List[str] = []
    relatedThreatIds: Optional[List[str]] = []
    evidence: Optional[Dict[str, Any]] = {}
    status: Optional[str] = "Active"
    campaign_id: Optional[str] = None
    campaignId: Optional[str] = None
    created_at: Optional[str] = None
    detectedAt: Optional[str] = None

# --- TAKEDOWN SCHEMAS ---
class TakedownRequest(BaseModel):
    model_config = {"extra": "allow"}
    notes: Optional[str] = "Analyst Takedown Escalation"

class TakedownResponse(BaseModel):
    model_config = {"extra": "allow"}
    success: bool
    takedownId: str
    status: str
    timestamp: str
    message: str

# --- REPORT SCHEMAS ---
class ReportGenerateRequest(BaseModel):
    model_config = {"extra": "allow"}
    reportType: Optional[str] = "Executive Board Summary"
    timeRange: Optional[str] = "Last 30 Days"
    brandName: Optional[str] = "ApexPay Global"

class ReportResponse(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    title: str
    period: str
    fileSize: str
    file_size: Optional[str] = None
    threatsAnalyzed: int
    threats_analyzed: Optional[int] = None
    takedownsCompleted: int
    takedowns_completed: Optional[int] = None
    complianceStatus: str
    compliance_status: Optional[str] = None
    summary: str
    generatedAt: Optional[str] = None
    created_at: Optional[str] = None

# --- DASHBOARD SCHEMAS ---
class DashboardResponse(BaseModel):
    model_config = {"extra": "allow"}
    stats: Dict[str, Any]
    risk_trend: List[Dict[str, Any]]
    threat_distribution: List[Dict[str, Any]]
    recent_incidents: List[Dict[str, Any]]
