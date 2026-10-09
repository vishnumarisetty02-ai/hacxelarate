import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db
from models.entities import BrandModel
from models.schemas import BrandRegisterRequest, BrandResponse

router = APIRouter(tags=["Brand Management"])

@router.post("/brand/register", response_model=BrandResponse)
def register_brand(payload: BrandRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a protected enterprise brand profile with official website,
    verified social handles, app identifiers, and trademark keywords.
    """
    name = payload.resolved_name()
    website = payload.resolved_website()
    handles = payload.resolved_handles()
    apps = payload.resolved_apps()
    keywords = payload.resolved_keywords()
    logo = payload.official_logo or payload.logo_url
    industry = payload.industry or "FinTech / Technology"

    brand_id = f"brand-{name.lower().replace(' ', '-')}"

    # Check existing
    existing = db.query(BrandModel).filter(BrandModel.id == brand_id).first()
    if existing:
        existing.name = name
        existing.industry = industry
        existing.official_website = website
        existing.official_social_handles = json.dumps(handles)
        existing.app_identifiers = json.dumps(apps)
        existing.monitoring_keywords = json.dumps(keywords)
        if logo:
            existing.logo_url = logo
        db.commit()
        db.refresh(existing)
        return existing.to_dict()

    new_brand = BrandModel(
        id=brand_id,
        name=name,
        industry=industry,
        official_website=website,
        official_social_handles=json.dumps(handles),
        app_identifiers=json.dumps(apps),
        monitoring_keywords=json.dumps(keywords),
        logo_url=logo
    )
    db.add(new_brand)
    db.commit()
    db.refresh(new_brand)
    return new_brand.to_dict()

@router.get("/brands")
def get_brands(db: Session = Depends(get_db)):
    """Retrieve all protected brand profiles."""
    brands = db.query(BrandModel).all()
    return [b.to_dict() for b in brands]

@router.put("/brands/{brand_id}")
def update_brand(brand_id: str, payload: dict, db: Session = Depends(get_db)):
    """Update existing brand configuration."""
    brand = db.query(BrandModel).filter(BrandModel.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    if "name" in payload:
        brand.name = payload["name"]
    if "industry" in payload:
        brand.industry = payload["industry"]
    if "official_website" in payload or "officialWebsite" in payload:
        brand.official_website = payload.get("official_website") or payload.get("officialWebsite")
    if "official_social_handles" in payload or "officialHandles" in payload:
        handles = payload.get("official_social_handles") or payload.get("officialHandles")
        brand.official_social_handles = json.dumps(handles)
    if "app_identifiers" in payload or "appIdentifiers" in payload:
        apps = payload.get("app_identifiers") or payload.get("appIdentifiers")
        brand.app_identifiers = json.dumps(apps)
    if "monitoring_keywords" in payload or "monitoringKeywords" in payload:
        kw = payload.get("monitoring_keywords") or payload.get("monitoringKeywords")
        brand.monitoring_keywords = json.dumps(kw)

    db.commit()
    db.refresh(brand)
    return brand.to_dict()
