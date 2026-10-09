import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

# Database path in backend directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "digital_risk.db")
raw_db_url = os.getenv("DATABASE_URL")
if not raw_db_url or "sqlite:///." in raw_db_url or raw_db_url == "sqlite:///digital_risk.db":
    DATABASE_URL = f"sqlite:///{DB_PATH.replace(os.sep, '/')}"
else:
    DATABASE_URL = raw_db_url

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
