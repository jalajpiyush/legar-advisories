import re

with open('backend/app/main.py', 'r') as f:
    content = f.read()

if 'from app.legal_docs.router import router as legal_docs_router' not in content:
    content = content.replace('from app.upload import router as upload_router', 'from app.upload import router as upload_router\nfrom app.legal_docs.router import router as legal_docs_router\nfrom app.models.document import Document, DocumentChunk')
    
    content = content.replace('app.include_router(upload_router.router)', 'app.include_router(upload_router.router)\napp.include_router(legal_docs_router)')

    content = content.replace('Base.metadata.create_all(bind=engine)', 'from sqlalchemy import text\nwith engine.connect() as conn:\n    try:\n        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))\n        conn.commit()\n    except Exception:\n        pass\n\nBase.metadata.create_all(bind=engine)')

with open('backend/app/main.py', 'w') as f:
    f.write(content)
