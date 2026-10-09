from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.database import get_db
from models.entities import ThreatModel, CampaignModel

router = APIRouter(tags=["Dashboard & Analytics"])

def compute_dashboard_metrics(db: Session):
    total = db.query(ThreatModel).count()
    critical = db.query(ThreatModel).filter(ThreatModel.risk_level == "CRITICAL").count()
    high = db.query(ThreatModel).filter(ThreatModel.risk_level == "HIGH").count()
    medium = db.query(ThreatModel).filter(ThreatModel.risk_level == "MEDIUM").count()
    low = db.query(ThreatModel).filter(ThreatModel.risk_level == "LOW").count()

    social = db.query(ThreatModel).filter(ThreatModel.threat_type == "social").count()
    app = db.query(ThreatModel).filter(ThreatModel.threat_type == "app").count()
    url = db.query(ThreatModel).filter(ThreatModel.threat_type == "url").count()

    active_campaigns = db.query(CampaignModel).count()
    mitigated = db.query(ThreatModel).filter(ThreatModel.status == "Mitigated").count()

    # Dynamic average risk score
    avg_score = db.query(func.avg(ThreatModel.risk_score)).scalar()
    overall_risk = int(round(avg_score)) if (avg_score is not None and total > 0) else 0

    executive_count = db.query(ThreatModel).filter(
        (ThreatModel.category.ilike("%Executive%")) |
        (ThreatModel.name.ilike("%CEO%"))
    ).count()

    stats = {
        "totalThreats": total,
        "criticalThreats": critical,
        "highThreats": high,
        "mediumThreats": medium,
        "lowThreats": low,
        "socialThreats": social,
        "suspiciousApps": app,
        "suspiciousUrls": url,
        "activeCampaigns": active_campaigns,
        "mitigatedThisMonth": mitigated,
        "overallRiskScore": overall_risk,
        "riskScoreDelta": "+4.2%" if total > 0 else "0.0%"
    }

    if total > 0:
        risk_trend = [
            {"date": "Oct 01", "riskScore": max(0, overall_risk - 22), "threatsDetected": max(0, total - 18), "resolved": max(0, mitigated - 1)},
            {"date": "Oct 02", "riskScore": max(0, overall_risk - 18), "threatsDetected": max(0, total - 14), "resolved": max(0, mitigated)},
            {"date": "Oct 03", "riskScore": max(0, overall_risk - 12), "threatsDetected": max(0, total - 9), "resolved": max(0, mitigated)},
            {"date": "Oct 04", "riskScore": max(0, overall_risk - 15), "threatsDetected": max(0, total - 10), "resolved": max(0, mitigated)},
            {"date": "Oct 05", "riskScore": max(0, overall_risk - 5), "threatsDetected": max(0, total - 4), "resolved": max(0, mitigated)},
            {"date": "Oct 06", "riskScore": max(0, overall_risk - 2), "threatsDetected": max(0, total - 1), "resolved": max(0, mitigated)},
            {"date": "Oct 07", "riskScore": overall_risk, "threatsDetected": total, "resolved": mitigated}
        ]
    else:
        risk_trend = [
            {"date": "Oct 01", "riskScore": 0, "threatsDetected": 0, "resolved": 0},
            {"date": "Oct 02", "riskScore": 0, "threatsDetected": 0, "resolved": 0},
            {"date": "Oct 03", "riskScore": 0, "threatsDetected": 0, "resolved": 0},
            {"date": "Oct 04", "riskScore": 0, "threatsDetected": 0, "resolved": 0},
            {"date": "Oct 05", "riskScore": 0, "threatsDetected": 0, "resolved": 0},
            {"date": "Oct 06", "riskScore": 0, "threatsDetected": 0, "resolved": 0},
            {"date": "Oct 07", "riskScore": 0, "threatsDetected": 0, "resolved": 0}
        ]

    distribution = [
        {"name": "Social Impersonation", "count": stats["socialThreats"], "color": "#06b6d4"},
        {"name": "Phishing URLs", "count": stats["suspiciousUrls"], "color": "#f43f5e"},
        {"name": "Trojanized Apps", "count": stats["suspiciousApps"], "color": "#f59e0b"},
        {"name": "Executive Fraud", "count": executive_count, "color": "#8b5cf6"}
    ]

    recent_threats = db.query(ThreatModel).order_by(ThreatModel.created_at.desc()).limit(15).all()
    recent = [t.to_dict() for t in recent_threats]

    return {
        "stats": stats,
        "risk_trend": risk_trend,
        "threat_distribution": distribution,
        "recent_incidents": recent
    }

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    """Retrieve unified dashboard metrics, risk trends, and incident distribution."""
    return compute_dashboard_metrics(db)

@router.get("/stats/summary")
def get_stats_summary(db: Session = Depends(get_db)):
    data = compute_dashboard_metrics(db)
    return data["stats"]

@router.get("/stats/risk-trend")
def get_stats_risk_trend(db: Session = Depends(get_db)):
    data = compute_dashboard_metrics(db)
    return data["risk_trend"]

@router.get("/stats/threat-distribution")
def get_stats_threat_distribution(db: Session = Depends(get_db)):
    data = compute_dashboard_metrics(db)
    return data["threat_distribution"]

@router.post("/demo/seed")
def seed_demo_data_endpoint(db: Session = Depends(get_db)):
    """Seed or reseed demo attack campaign data for hackathon presentation."""
    from services.seed_data import force_seed_demo_data
    force_seed_demo_data(db)
    return {
        "success": True,
        "status": "SEEDED",
        "message": "Demo multi-stage attack campaign and incidents seeded successfully."
    }

@router.post("/demo/reset")
def reset_demo_data_endpoint(db: Session = Depends(get_db)):
    """Clear threat incidents to demonstrate empty dashboard states."""
    from services.seed_data import clear_database
    clear_database(db)
    return {
        "success": True,
        "status": "RESET",
        "message": "All threat incidents purged to demonstrate empty state."
    }
