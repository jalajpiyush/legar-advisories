from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatMessageResponse(ChatMessageBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ChatSessionBase(BaseModel):
    title: str

class ChatSessionResponse(ChatSessionBase):
    id: int
    user_id: int
    created_at: datetime
    messages: List[ChatMessageResponse] = []
    class Config:
        from_attributes = True
