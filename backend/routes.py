from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from models import NoteCreate, NoteUpdate, NoteResponse, SyncRequest, SyncResponse
from database import get_notes_collection
from config import settings
from auth import verify_api_key

router = APIRouter(prefix="/api/notes", tags=["notes"], dependencies=[Depends(verify_api_key)])


def get_collection():
    return get_notes_collection(settings.database_name)


@router.get("/", response_model=List[NoteResponse])
async def get_all_notes():
    """Get all notes from the database"""
    collection = get_collection()
    notes = []
    
    async for note in collection.find().sort("createdAt", -1):
        notes.append(NoteResponse(
            id=note["_id"],
            title=note["title"],
            content=note["content"],
            color=note.get("color", "#6366f1"),
            createdAt=note["createdAt"]
        ))
    
    return notes


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(note_id: str):
    """Get a single note by ID"""
    collection = get_collection()
    note = await collection.find_one({"_id": note_id})
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {note_id} not found"
        )
    
    return NoteResponse(
        id=note["_id"],
        title=note["title"],
        content=note["content"],
        color=note.get("color", "#6366f1"),
        createdAt=note["createdAt"]
    )


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(note: NoteCreate):
    """Create a new note"""
    collection = get_collection()
    
    # Check if note already exists
    existing = await collection.find_one({"_id": note.id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Note with id {note.id} already exists"
        )
    
    note_doc = {
        "_id": note.id,
        "title": note.title,
        "content": note.content,
        "color": note.color,
        "createdAt": note.created_at,
        "syncedAt": datetime.utcnow()
    }
    
    await collection.insert_one(note_doc)
    
    return NoteResponse(
        id=note_doc["_id"],
        title=note_doc["title"],
        content=note_doc["content"],
        color=note_doc["color"],
        createdAt=note_doc["createdAt"]
    )


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, note_update: NoteUpdate):
    """Update an existing note"""
    collection = get_collection()
    
    # Check if note exists
    existing = await collection.find_one({"_id": note_id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {note_id} not found"
        )
    
    # Build update document
    update_data = {"syncedAt": datetime.utcnow()}
    if note_update.title is not None:
        update_data["title"] = note_update.title
    if note_update.content is not None:
        update_data["content"] = note_update.content
    if note_update.color is not None:
        update_data["color"] = note_update.color
    
    await collection.update_one(
        {"_id": note_id},
        {"$set": update_data}
    )
    
    # Get updated note
    updated_note = await collection.find_one({"_id": note_id})
    
    return NoteResponse(
        id=updated_note["_id"],
        title=updated_note["title"],
        content=updated_note["content"],
        color=updated_note.get("color", "#6366f1"),
        createdAt=updated_note["createdAt"]
    )


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str):
    """Delete a note"""
    collection = get_collection()
    
    result = await collection.delete_one({"_id": note_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {note_id} not found"
        )
    
    return None


@router.post("/sync", response_model=SyncResponse)
async def sync_notes(sync_request: SyncRequest):
    """
    Sync notes from client localStorage to MongoDB.
    This will upsert all notes (insert if new, update if exists).
    """
    collection = get_collection()
    synced_count = 0
    synced_notes = []
    
    for note in sync_request.notes:
        note_doc = {
            "_id": note.id,
            "title": note.title,
            "content": note.content,
            "color": note.color,
            "createdAt": note.created_at,
            "syncedAt": datetime.utcnow()
        }
        
        # Upsert: update if exists, insert if not
        await collection.update_one(
            {"_id": note.id},
            {"$set": note_doc},
            upsert=True
        )
        
        synced_count += 1
        synced_notes.append(NoteResponse(
            id=note_doc["_id"],
            title=note_doc["title"],
            content=note_doc["content"],
            color=note_doc["color"],
            createdAt=note_doc["createdAt"]
        ))
    
    return SyncResponse(
        success=True,
        synced_count=synced_count,
        notes=synced_notes,
        message=f"Successfully synced {synced_count} notes"
    )


@router.delete("/", status_code=status.HTTP_200_OK)
async def delete_all_notes():
    """Delete all notes (use with caution!)"""
    collection = get_collection()
    result = await collection.delete_many({})
    
    return {"deleted_count": result.deleted_count, "message": "All notes deleted"}
