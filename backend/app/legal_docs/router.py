from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os
import uuid
from app.database.connection import get_db
from app.models.user import User
from app.models.document import Document, DocumentChunk
from app.middleware.auth_middleware import get_current_user
from app.services.document_service import extract_text_from_file, chunk_text
from app.services.ai_service import generate_embedding, generate_summary, extract_clauses_and_risks, answer_question_with_context
from pydantic import BaseModel

router = APIRouter(prefix="/api/legal-docs", tags=["legal-docs"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_legal_document(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ext = os.path.splitext(file.filename)[1].lower()
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    text = extract_text_from_file(file_path, ext)
    summary = generate_summary(text)
    analysis = extract_clauses_and_risks(text)
    
    doc = Document(user_id=current_user.id, filename=file.filename, content=text, summary=summary, clauses=analysis.get("clauses"), risks=analysis.get("risks"))
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    chunks = chunk_text(text)
    for c in chunks:
        emb = generate_embedding(c)
        chunk_record = DocumentChunk(document_id=doc.id, text=c, embedding=emb)
        db.add(chunk_record)
    db.commit()
    
    return {"message": "Document processed", "document_id": doc.id, "summary": doc.summary, "clauses": doc.clauses, "risks": doc.risks}

class QuestionRequest(BaseModel):
    document_id: int
    question: str

@router.post("/ask")
def ask_question(req: QuestionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == req.document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    question_emb = generate_embedding(req.question)
    
    # pgvector semantic search
    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).order_by(DocumentChunk.embedding.cosine_distance(question_emb)).limit(5).all()
    
    context = [c.text for c in chunks]
    answer = answer_question_with_context(req.question, context)
    return {"answer": answer, "citations": context}

@router.get("/{document_id}/export/pdf")
def export_pdf(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"message": "PDF exported"}

@router.get("/{document_id}/export/docx")
def export_docx(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"message": "DOCX exported"}
