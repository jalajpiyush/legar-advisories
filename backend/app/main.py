from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.base import Base
from app.database.connection import engine
from app.auth import router as auth_router
from app.users import router as users_router
from app.chat import router as chat_router
from app.upload import router as upload_router
from app.legal_docs.router import router as legal_docs_router
from app.models.document import Document, DocumentChunk

# Create tables
from sqlalchemy import text
with engine.connect() as conn:
    try:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    except Exception:
        pass

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Legal Advisories API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(chat_router.router)
app.include_router(upload_router.router)
app.include_router(legal_docs_router)

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/settings")
def get_settings():
    return {"theme": "light", "notifications": True}
