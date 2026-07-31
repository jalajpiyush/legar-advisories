from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatSessionBase, ChatSessionResponse, ChatMessageBase, ChatMessageResponse
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/sessions", response_model=ChatSessionResponse)
def create_session(session: ChatSessionBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_session = ChatSession(title=session.title, user_id=current_user.id)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ChatSession).filter(ChatSession.user_id == current_user.id).all()

@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
def add_message(session_id: int, message: ChatMessageBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    db_msg = ChatMessage(session_id=session_id, role=message.role, content=message.content)
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg
