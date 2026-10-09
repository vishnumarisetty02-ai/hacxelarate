from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db
from models.entities import CampaignModel

router = APIRouter(prefix="/campaigns", tags=["Attack Campaigns"])

@router.get("")
def list_campaigns(db: Session = Depends(get_db)):
    """Retrieve all coordinated multi-stage brand attack campaigns."""
    campaigns = db.query(CampaignModel).all()
    return [c.to_dict() for c in campaigns]

@router.get("/{campaign_id}")
@router.get("/{campaign_id}/graph")
def get_campaign_graph(campaign_id: str, db: Session = Depends(get_db)):
    """
    Retrieve interactive attack graph topology for a campaign:
    Brand -> Fake Social -> Phishing URL -> Fake APK.
    """
    campaign = db.query(CampaignModel).filter(CampaignModel.id == campaign_id).first()
    if not campaign:
        # Fallback to first available campaign
        campaign = db.query(CampaignModel).first()
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")

    return campaign.to_dict()
