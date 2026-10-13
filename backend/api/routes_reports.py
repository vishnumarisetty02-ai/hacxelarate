import time
from typing import Optional
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from models.database import get_db
from models.entities import ReportModel, ThreatModel
from models.schemas import ReportGenerateRequest, ReportResponse

router = APIRouter(prefix="/reports", tags=["Audit Reports"])

@router.get("")
def list_reports(db: Session = Depends(get_db)):
    """Retrieve all generated compliance and risk audit reports."""
    reports = db.query(ReportModel).order_by(ReportModel.created_at.desc()).all()
    return [r.to_dict() for r in reports]

@router.post("/generate", response_model=ReportResponse)
def generate_report(
    payload: Optional[ReportGenerateRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Synthesize an on-demand executive risk audit or legal takedown report.
    """
    if payload is None:
        payload = ReportGenerateRequest()
    total_threats = db.query(ThreatModel).count()
    mitigated_threats = db.query(ThreatModel).filter(ThreatModel.status == "Mitigated").count()

    report_id = f"REP-{int(time.time() * 1000) % 900000 + 100000}"
    template_type = payload.reportType or "Executive Board Summary"
    time_frame = payload.timeRange or "Last 30 Days"
    brand = payload.brandName or "ApexPay Global"

    new_report = ReportModel(
        id=report_id,
        title=f"{template_type} - {brand}",
        period=time_frame,
        file_size="3.4 MB",
        threats_analyzed=total_threats,
        takedowns_completed=mitigated_threats,
        compliance_status="SOC2 & ISO 27001 Aligned",
        summary=f"Synthesized comprehensive digital risk audit for {brand}. Evaluated {total_threats} threat vectors across rogue mobile APKs, typosquatting domains, and social impersonation networks. Neutralized {mitigated_threats} infringing assets."
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report.to_dict()
