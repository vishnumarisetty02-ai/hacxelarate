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

@router.post("/vip-radar")
def analyze_vip_profile(
    payload: dict,
    db: Session = Depends(get_db)
):
    """
    Evaluates executive & C-Suite VIP impersonation profiles
    (e.g. CEO, CFO, Founder, Head of Security) with targeted lure scoring.
    """
    primary_brand = db.query(BrandModel).first()
    brand_dict = primary_brand.to_dict() if primary_brand else None

    username = payload.get("username", "@ApexCEO_Official")
    display_name = payload.get("display_name", "Sarah Jenkins - CEO ApexPay")
    executive_name = payload.get("executive_name", "Sarah Jenkins")
    executive_role = payload.get("executive_role", "Chief Executive Officer (CEO)")
    bio = payload.get("bio", "Official executive account for ApexPay. Urgent crypto allocation inquiry: DM for wallet recovery assistance.")
    followers = int(payload.get("followers", 42))
    following = int(payload.get("following", 512))
    verified = bool(payload.get("verified", False))
    external_url = payload.get("external_url")

    eval_result = RiskEngine.analyze_executive_profile(
        username=username,
        display_name=display_name,
        executive_name=executive_name,
        executive_role=executive_role,
        bio=bio,
        followers=followers,
        following=following,
        verified=verified,
        external_url=external_url,
        brand_data=brand_dict
    )

    threat_id = f"THR-VIP-{int(time.time() * 1000) % 9000 + 1000}"
    evidence = {
        "username": username,
        "displayName": display_name,
        "targetedExecutive": executive_name,
        "executiveRole": executive_role,
        "followers": followers,
        "following": following,
        "verified": verified,
        "externalUrl": external_url,
        "mitreAttack": eval_result["mitre_attack"],
        "riskVector": "Executive Identity Theft / C-Suite Whaling Lure"
    }

    threat_record = ThreatModel(
        id=threat_id,
        threat_type="social",
        entity=username,
        name=f"VIP Impersonation: {display_name}",
        category="Executive / VIP Whaling Impersonation",
        platform="Social Media (Executive Impersonation)",
        risk_score=eval_result["risk_score"],
        risk_level=eval_result["risk_level"],
        confidence=eval_result["confidence"],
        reasons=json.dumps(eval_result["reasons"]),
        recommendations=json.dumps(eval_result["recommendations"]),
        related_threats=json.dumps([]),
        evidence=json.dumps(evidence),
        status="Active" if eval_result["risk_score"] >= 60 else "Investigating",
        campaign_id=None
    )
    db.add(threat_record)
    db.commit()
    db.refresh(threat_record)

    out = threat_record.to_dict()
    out["executive_evaluation"] = eval_result
    return out

