from fastapi import APIRouter, HTTPException
from typing import List
from models.data_model import SchoolContent
from services import school_service

router = APIRouter()

@router.post("/", response_model=SchoolContent)
def create_content(content: SchoolContent):
    return school_service.create_content(content)

@router.get("/", response_model=List[SchoolContent])
def get_all_contents():
    return school_service.get_all_contents()

@router.get("/{content_id}", response_model=SchoolContent)
def get_content(content_id: int):
    content = school_service.get_content_by_id(content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@router.put("/{content_id}", response_model=SchoolContent)
def update_content(content_id: int, update_data: dict):
    updated = school_service.update_content(content_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Content not found")
    return updated

@router.delete("/{content_id}")
def delete_content(content_id: int):
    deleted = school_service.delete_content(content_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Content not found")
    return {"message": "Content deleted successfully"}
