from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from models import FolderCreate, FolderUpdate, FolderResponse
from database import get_folders_collection
from config import settings
from auth import verify_api_key

router = APIRouter(prefix="/api/folders", tags=["folders"], dependencies=[Depends(verify_api_key)])

def get_collection():
    return get_folders_collection(settings.database_name)

@router.get("/", response_model=List[FolderResponse])
async def get_all_folders():
    collection = get_collection()
    folders = []
    async for folder in collection.find().sort("createdAt", -1):
        folders.append(FolderResponse(
            id=folder["_id"],
            name=folder["name"],
            color=folder.get("color", "#6366f1"),
            createdAt=folder["createdAt"]
        ))
    return folders

@router.post("/", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(folder: FolderCreate):
    collection = get_collection()
    existing = await collection.find_one({"_id": folder.id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Folder with id {folder.id} already exists"
        )
    folder_doc = {
        "_id": folder.id,
        "name": folder.name,
        "color": folder.color,
        "createdAt": folder.created_at,
        "syncedAt": datetime.utcnow()
    }
    await collection.insert_one(folder_doc)
    return FolderResponse(
        id=folder_doc["_id"],
        name=folder_doc["name"],
        color=folder_doc["color"],
        createdAt=folder_doc["createdAt"]
    )

@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(folder_id: str, folder_update: FolderUpdate):
    collection = get_collection()
    existing = await collection.find_one({"_id": folder_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    update_data = {"syncedAt": datetime.utcnow()}
    if folder_update.name is not None:
        update_data["name"] = folder_update.name
    if folder_update.color is not None:
        update_data["color"] = folder_update.color
        
    await collection.update_one({"_id": folder_id}, {"$set": update_data})
    updated_folder = await collection.find_one({"_id": folder_id})
    return FolderResponse(
        id=updated_folder["_id"],
        name=updated_folder["name"],
        color=updated_folder.get("color", "#6366f1"),
        createdAt=updated_folder["createdAt"]
    )

@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(folder_id: str):
    collection = get_collection()
    result = await collection.delete_one({"_id": folder_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Folder not found")
    return None
