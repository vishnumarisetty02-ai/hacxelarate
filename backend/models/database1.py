# Create tables if they don't exist
def init_db():
    Base.metadata.create_all(bind=engine)

# Run once to initialize
if __name__ == "__main__":
    init_db()
    print("Database file created at:", DB_PATH)
from sqlalchemy import Column, Integer, String

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("Database file created at:", DB_PATH)
