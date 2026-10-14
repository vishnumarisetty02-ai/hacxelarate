import os
import sys
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Ensure backend directory is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

load_dotenv()

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Database & Seed
from models.database import engine, Base, SessionLocal
from services.seed_data import seed_database_if_empty

# Routers
from api.routes_brand import router as brand_router
from api.routes_social import router as social_router
from api.routes_url import router as url_router
from api.routes_app import router as app_router
from api.routes_threats import router as threats_router
from api.routes_campaigns import router as campaigns_router
from api.routes_dashboard import router as dashboard_router
from api.routes_reports import router as reports_router
from api.routes_intelligence import router as intelligence_router
from api.routes_phishing import router as phishing_router
from api.routes_voice import router as voice_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: Create tables if not exist
    Base.metadata.create_all(bind=engine)
    # 2. Seed initial demo data for immediate hackathon functionality
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()
    print("[AegisGuard] Backend ready. API docs available at /docs")
    yield
    print("[AegisGuard] Backend shutting down.")

app = FastAPI(
    title="AegisGuard - Digital Risk Protection Platform API",
    description="AI-powered Social & App Monitoring platform detecting fake profiles, impersonation, scam accounts, and suspicious mobile APKs.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Dynamic CORS configuration
raw_cors = os.getenv("CORS_ORIGINS", "")
env_origins = [o.strip() for o in raw_cors.split(",") if o.strip()]
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
resolved_origins = list(dict.fromkeys(default_origins + env_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=resolved_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "path": request.url.path
        }
    )

# Root Health Check
@app.get("/", tags=["System"])
def root_health():
    return {
        "status": "ONLINE",
        "system": "AegisGuard Digital Risk Protection Platform API",
        "version": "1.0.0",
        "documentation": "/docs",
        "endpoints": {
            "dashboard": "/api/dashboard",
            "threats": "/api/threats",
            "brand_register": "/api/brand/register",
            "social_analysis": "/api/social/analyze-profile",
            "scam_content_analysis": "/api/social/analyze-content",
            "url_analysis": "/api/url/analyze",
            "app_analysis": "/api/app/analyze",
            "campaigns": "/api/campaigns",
            "reports": "/api/reports"
        }
    }

# Register API Routers under /api prefix
app.include_router(brand_router, prefix="/api")
app.include_router(social_router, prefix="/api")
app.include_router(url_router, prefix="/api")
app.include_router(app_router, prefix="/api")
app.include_router(threats_router, prefix="/api")
app.include_router(campaigns_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(intelligence_router, prefix="/api")
app.include_router(phishing_router, prefix="/api")
app.include_router(voice_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
