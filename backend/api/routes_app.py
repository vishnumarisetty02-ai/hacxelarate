import os
import json
import time
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db
from models.entities import BrandModel, ThreatModel
from models.schemas import ThreatResponse
from services.risk_engine import RiskEngine

router = APIRouter(prefix="/app", tags=["Mobile App & APK Monitoring"])

MAX_UPLOAD_SIZE = 25 * 1024 * 1024 # 25 MB limit

@router.post("/analyze", response_model=ThreatResponse)
async def analyze_mobile_app(
    file: UploadFile = File(..., description="Android APK binary file for static inspection"),
    app_name: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Safely inspect uploaded APK package for Trojanized spyware,
    dangerous SMS permissions, unauthorized brand packaging, and C2 indicators.
    NOTE: APK files are inspected strictly statically and NEVER executed.
    """
    filename = file.filename or "unknown.apk"

    if not filename.lower().endswith(".apk") and not filename.lower().endswith(".zip"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Upload must be an Android application package (.apk)."
        )

    # Read binary safely with size limit
    file_bytes = await file.read()
    if len(file_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size exceeds maximum permitted limit of 25 MB."
        )

    primary_brand = db.query(BrandModel).first()
    brand_dict = primary_brand.to_dict() if primary_brand else None

    # Static inspection (non-execution)
    analysis = RiskEngine.analyze_apk(
        file_bytes=file_bytes,
        filename=filename,
        brand_data=brand_dict
    )

    threat_id = f"THR-{int(time.time() * 1000) % 9000 + 1000}"
    resolved_name = app_name or filename.replace(".apk", "").replace("-", " ").title()

    evidence = analysis.get("evidence", {})
    evidence["originalFilename"] = filename
    evidence["analyzedAt"] = time.strftime("%Y-%m-%d %H:%M:%S UTC")

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
        threat_type="app",
        entity=filename,
        name=resolved_name,
        category="Trojanized / Fake Mobile APK",
        platform="Third-party APK Mirror / Android",
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
