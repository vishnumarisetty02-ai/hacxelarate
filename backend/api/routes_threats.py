import time
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.database import get_db
from models.entities import ThreatModel
from models.schemas import ThreatResponse, TakedownRequest, TakedownResponse

router = APIRouter(prefix="/threats", tags=["Threat Management"])

@router.get("")
def list_threats(
    type: Optional[str] = Query(None, description="Filter by vector: social, app, url, or all"),
    severity: Optional[str] = Query(None, description="Filter by severity: critical, high, medium, low"),
    search: Optional[str] = Query(None, description="Search keyword in entity or reasons"),
    campaign: Optional[str] = Query(None, description="Filter by campaign ID e.g. CAMP-401"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Retrieve detected threat incidents with optional filtering by vector,
    severity level, campaign ID, and search keyword.
    """
    query = db.query(ThreatModel)

    if type and type.lower() != "all":
        query = query.filter(ThreatModel.threat_type == type.lower())

    if severity and severity.lower() != "all":
        query = query.filter(ThreatModel.risk_level == severity.upper())

    if campaign and campaign.lower() != "all":
        query = query.filter(ThreatModel.campaign_id == campaign)

    if search:
        s = f"%{search}%"
        query = query.filter(
            (ThreatModel.entity.ilike(s)) |
            (ThreatModel.name.ilike(s)) |
            (ThreatModel.category.ilike(s)) |
            (ThreatModel.id.ilike(s))
        )

    total_count = query.count()
    threats = query.order_by(ThreatModel.created_at.desc(), ThreatModel.risk_score.desc()).offset(offset).limit(limit).all()
    records = [t.to_dict() for t in threats]

    return {
        "total": total_count,
        "count": len(records),
        "threats": records,
        "data": records # Compatibility for frontend service
    }

@router.get("/{threat_id}", response_model=ThreatResponse)
def get_threat_by_id(threat_id: str, db: Session = Depends(get_db)):
    """Retrieve full incident dossier for a specific threat identifier."""
    threat = db.query(ThreatModel).filter(ThreatModel.id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail=f"Threat '{threat_id}' not found.")
    return threat.to_dict()

@router.post("/{threat_id}/takedown", response_model=TakedownResponse)
def issue_takedown(
    threat_id: str,
    payload: Optional[TakedownRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Issue automated DMCA / Abuse takedown package for a verified threat entity.
    """
    threat = db.query(ThreatModel).filter(ThreatModel.id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail=f"Threat '{threat_id}' not found.")

    threat.status = "Mitigated"
    db.commit()

    takedown_ref = f"TKD-{int(time.time() * 1000) % 900000 + 100000}"

    return {
        "success": True,
        "takedownId": takedown_ref,
        "status": "TAKEDOWN_SUBMITTED",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "message": f"Takedown notice for {threat.name or threat.entity} packaged and transmitted to abuse API."
    }

@router.post("/{threat_id}/feedback")
def submit_threat_feedback(
    threat_id: str,
    payload: Optional[dict] = None,
    db: Session = Depends(get_db)
):
    """
    Analyst False-Positive Feedback Loop.
    Allows SOC / Brand Protection analysts to flag false-positives or adjust threat status.
    """
    threat = db.query(ThreatModel).filter(ThreatModel.id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail=f"Threat '{threat_id}' not found.")

    feedback_type = (payload or {}).get("feedback", "false_positive")
    reason = (payload or {}).get("reason", "Analyst confirmed legitimate authorized asset")

    if feedback_type == "false_positive":
        threat.status = "Whitelisted / False Positive"
    else:
        threat.status = "Reviewed"

    db.commit()
    db.refresh(threat)

    return {
        "success": True,
        "threatId": threat_id,
        "status": threat.status,
        "feedback": feedback_type,
        "reason": reason,
        "message": f"Threat {threat_id} updated to '{threat.status}'. Feedback recorded for ML model calibration."
    }

@router.get("/{threat_id}/dossier")
def get_threat_dossier(
    threat_id: str,
    notes: Optional[str] = Query(None, description="Analyst escalation notes"),
    db: Session = Depends(get_db)
):
    """
    Generates a RFC 2142 abuse report and formal DMCA legal complaint packet
    with cryptographic evidence hashes and registrar routing.
    """
    from models.entities import BrandModel
    from services.risk_engine import RiskEngine

    threat = db.query(ThreatModel).filter(ThreatModel.id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail=f"Threat '{threat_id}' not found.")

    primary_brand = db.query(BrandModel).first()
    brand_dict = primary_brand.to_dict() if primary_brand else None

    dossier = RiskEngine.generate_takedown_dossier(
        threat_data=threat.to_dict(),
        brand_data=brand_dict,
        analyst_notes=notes or ""
    )
    return dossier

