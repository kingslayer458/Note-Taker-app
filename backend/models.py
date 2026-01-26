from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(default="No content")
    color: str = Field(default="#6366f1")


class NoteCreate(NoteBase):
    id: str = Field(..., description="Client-generated note ID")
    created_at: str = Field(..., alias="createdAt")
    
    class Config:
        populate_by_name = True


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    color: Optional[str] = None


class NoteInDB(NoteBase):
    id: str = Field(..., alias="_id")
    created_at: str = Field(..., alias="createdAt")
    user_id: Optional[str] = None
    synced_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        from_attributes = True


class NoteResponse(BaseModel):
    id: str
    title: str
    content: str
    color: str
    createdAt: str
    
    class Config:
        from_attributes = True


class SyncRequest(BaseModel):
    notes: list[NoteCreate]
    

class SyncResponse(BaseModel):
    success: bool
    synced_count: int
    notes: list[NoteResponse]
    message: str
