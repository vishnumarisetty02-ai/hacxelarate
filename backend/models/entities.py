import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime
from .database import Base

class BrandModel(Base):
    __tablename__ = "brands"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    industry = Column(String, default="Technology / FinTech")
    official_website = Column(String, nullable=False)
    official_social_handles = Column(Text, default="{}") # JSON string
    app_identifiers = Column(Text, default="{}") # JSON string
    monitoring_keywords = Column(Text, default="[]") # JSON string
    logo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "industry": self.industry,
            "official_website": self.official_website,
            "official_social_handles": json.loads(self.official_social_handles or "{}"),
            "app_identifiers": json.loads(self.app_identifiers or "{}"),
            "monitoring_keywords": json.loads(self.monitoring_keywords or "[]"),
            "logo_url": self.logo_url,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class ThreatModel(Base):
    __tablename__ = "threats"

    id = Column(String, primary_key=True, index=True)
    threat_type = Column(String, nullable=False, index=True) # social, app, url
    entity = Column(String, nullable=False, index=True) # handle, url, or app package
    name = Column(String, nullable=True)
    category = Column(String, default="Impersonation")
    platform = Column(String, default="Web")
    risk_score = Column(Integer, nullable=False) # 0-100
    risk_level = Column(String, nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, default=90.0)
    reasons = Column(Text, default="[]") # JSON array of strings
    recommendations = Column(Text, default="[]") # JSON array of strings
    related_threats = Column(Text, default="[]") # JSON array of threat IDs
    evidence = Column(Text, default="{}") # JSON object
    status = Column(String, default="Active") # Active, Investigating, Mitigated
    campaign_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "threat_type": self.threat_type,
            "type": self.threat_type, # for frontend compatibility
            "entity": self.entity,
            "name": self.name or self.entity,
            "category": self.category,
            "platform": self.platform,
            "risk_score": self.risk_score,
            "riskScore": self.risk_score, # frontend camelCase
            "risk_level": self.risk_level,
            "severity": self.risk_level.capitalize() if self.risk_level else "Medium",
            "confidence": self.confidence,
            "reasons": json.loads(self.reasons or "[]"),
            "detectionReasons": json.loads(self.reasons or "[]"), # frontend
            "recommendations": json.loads(self.recommendations or "[]"),
            "recommendedAction": (json.loads(self.recommendations or "[]") or ["Investigate"])[0],
            "related_threats": json.loads(self.related_threats or "[]"),
            "relatedThreatIds": json.loads(self.related_threats or "[]"), # frontend
            "evidence": json.loads(self.evidence or "{}"),
            "status": self.status,
            "campaign_id": self.campaign_id,
            "campaignId": self.campaign_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "detectedAt": self.created_at.isoformat() if self.created_at else None
        }

class CampaignModel(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    threat_level = Column(String, default="Critical")
    active_nodes_count = Column(Integer, default=4)
    estimated_victims = Column(String, default="1,000+")
    graph_data = Column(Text, default="{}") # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "campaignId": self.id,
            "title": self.title,
            "description": self.description,
            "threatLevel": self.threat_level,
            "threat_level": self.threat_level,
            "activeNodesCount": self.active_nodes_count,
            "estimatedVictimsImpacted": self.estimated_victims,
            "graph_data": json.loads(self.graph_data or "{}"),
            "nodes": (json.loads(self.graph_data or "{}")).get("nodes", []),
            "edges": (json.loads(self.graph_data or "{}")).get("edges", []),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class ReportModel(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    period = Column(String, default="Last 30 Days")
    file_size = Column(String, default="3.2 MB")
    threats_analyzed = Column(Integer, default=0)
    takedowns_completed = Column(Integer, default=0)
    compliance_status = Column(String, default="SOC2 & ISO 27001 Aligned")
    summary = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "period": self.period,
            "fileSize": self.file_size,
            "file_size": self.file_size,
            "threatsAnalyzed": self.threats_analyzed,
            "takedownsCompleted": self.takedowns_completed,
            "complianceStatus": self.compliance_status,
            "summary": self.summary,
            "generatedAt": self.created_at.isoformat() if self.created_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
