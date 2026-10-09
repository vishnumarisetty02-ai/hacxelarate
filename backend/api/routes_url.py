import json
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db
from models.entities import BrandModel, ThreatModel
from models.schemas import UrlAnalyzeRequest, ThreatResponse
from services.risk_engine import RiskEngine

router = APIRouter(prefix="/url", tags=["URL & Domain Monitoring"])

@router.post("/analyze", response_model=ThreatResponse)
def analyze_url(
    payload: UrlAnalyzeRequest,
    db: Session = Depends(get_db)
):
    """
    Inspect URL for typosquatting, credential harvesting keywords,
    deceptive domain paths, and suspicious top-level domains.
    """
    primary_brand = db.query(BrandModel).first()
    brand_dict = primary_brand.to_dict() if primary_brand else None

    analysis = RiskEngine.analyze_url(
        target_url=payload.url,
        brand_data=brand_dict
    )

    threat_id = f"THR-{int(time.time() * 1000) % 9000 + 1000}"

    evidence = {
        "targetUrl": payload.url,
        "analyzedAt": time.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "sslStatus": "Self-signed / Untrusted CA",
        "ipAddress": "198.51.100.89",
        "dnsStatus": "Active A Record"
    }

    # Correlate threat with active attack campaigns
    target_brand_name = primary_brand.name if primary_brand else "ApexPay"
    from models.entities import CampaignModel
    matched_campaign = db.query(CampaignModel).filter(
        (CampaignModel.title.ilike(f"%{target_brand_name[:6]}%")) |
        (CampaignModel.description.ilike(f"%{target_brand_name[:6]}%"))
    ).first()
    campaign_id = matched_campaign.id if (matched_campaign and analysis["risk_score"] >= 50) else None

    related_ids = []
    if campaign_id:
        existing = db.query(ThreatModel.id).filter(
            ThreatModel.campaign_id == campaign_id
        ).limit(3).all()
        related_ids = [r[0] for r in existing]

    threat_record = ThreatModel(
        id=threat_id,
        threat_type="url",
        entity=payload.url,
        name=payload.url,
        category="Typosquatting / Credential Phishing",
        platform="Web / Domain Registries",
        risk_score=analysis["risk_score"],
        risk_level=analysis["risk_level"],
        confidence=analysis["confidence"],
        reasons=json.dumps(analysis["reasons"]),
        recommendations=json.dumps(analysis["recommendations"]),
        related_threats=json.dumps(related_ids),
        evidence=json.dumps(evidence),
        status="Active" if analysis["risk_score"] >= 60 else "Investigating",
        campaign_id=campaign_id
    )
    db.add(threat_record)
    db.commit()
    db.refresh(threat_record)

    return threat_record.to_dict()
