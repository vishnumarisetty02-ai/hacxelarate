import json
import time
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db
from models.entities import BrandModel, ThreatModel
from models.schemas import SocialProfileAnalyzeRequest, ScamContentAnalyzeRequest, ThreatResponse
from services.risk_engine import RiskEngine

router = APIRouter(prefix="/social", tags=["Social Media Monitoring"])

@router.post("/analyze-profile", response_model=ThreatResponse)
def analyze_social_profile(
    payload: SocialProfileAnalyzeRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze suspect social profile for brand impersonation, deceptive handles,
    follower fraud, bio scam links, and bot characteristics.
    """
    # Fetch primary protected brand for benchmarking
    primary_brand = db.query(BrandModel).first()
    brand_dict = primary_brand.to_dict() if primary_brand else None

    analysis = RiskEngine.analyze_social_profile(
        username=payload.username,
        display_name=payload.display_name,
        bio=payload.bio or "",
        followers=payload.followers or 0,
        following=payload.following or 0,
        account_age=payload.account_age or "3 days",
        verified=payload.verified or False,
        external_url=payload.external_url,
        brand_data=brand_dict
    )

    threat_id = f"THR-{int(time.time() * 1000) % 9000 + 1000}"

    evidence = {
        "handle": payload.username,
        "displayName": payload.display_name,
        "bio": payload.bio,
        "followers": payload.followers,
        "following": payload.following,
        "accountAge": payload.account_age,
        "verified": payload.verified,
        "externalUrl": payload.external_url,
        "maxSimilarity": f"{int(analysis.get('max_similarity', 0.8) * 100)}%"
    }

    # Correlate threat with active attack campaigns
    target_brand_name = primary_brand.name if primary_brand else "ApexPay"
    from models.entities import CampaignModel
    matched_campaign = db.query(CampaignModel).filter(
        (CampaignModel.title.ilike(f"%{target_brand_name[:6]}%")) |
        (CampaignModel.description.ilike(f"%{target_brand_name[:6]}%"))
    ).first()
    campaign_id = matched_campaign.id if (matched_campaign and analysis["risk_score"] >= 50) else None

    # Link related threats in same campaign or vector
    related_ids = []
    if campaign_id:
        existing = db.query(ThreatModel.id).filter(
            ThreatModel.campaign_id == campaign_id
        ).limit(3).all()
        related_ids = [r[0] for r in existing]

    threat_record = ThreatModel(
        id=threat_id,
        threat_type="social",
        entity=payload.username,
        name=payload.display_name or payload.username,
        category="Social Impersonation / Scam Profile",
        platform="Social Media",
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

@router.post("/analyze-content")
def analyze_scam_content(
    payload: ScamContentAnalyzeRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze text content or social message for urgent phishing triggers,
    scam language, unauthorized giveaways, or payment redirection.
    """
    primary_brand = db.query(BrandModel).first()
    brand_dict = primary_brand.to_dict() if primary_brand else None

    result = RiskEngine.analyze_scam_content(
        text=payload.text,
        url=payload.url,
        brand_data=brand_dict
    )

    return {
        "text_snippet": payload.text[:100] + "..." if len(payload.text) > 100 else payload.text,
        "url": payload.url,
        "risk_score": result["risk_score"],
        "risk_level": result["risk_level"],
        "confidence": result["confidence"],
        "reasons": result["reasons"],
        "recommendations": result["recommendations"]
    }
