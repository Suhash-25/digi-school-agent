from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models.data_model import SchoolContent, TeacherProfile
from services import school_service
from agent.agent import root_agent
from pydantic import BaseModel
from core.sqlite_db import db

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    data: Optional[dict] = None

router = APIRouter()

@router.post("/", response_model=SchoolContent)
def create_content(content: SchoolContent):
    return school_service.create_content(content)

@router.get("/", response_model=List[SchoolContent])
def get_all_contents():
    return school_service.get_all_contents()

@router.get("/teachers", response_model=List[TeacherProfile])
def get_all_teachers():
    return db.get_all_teachers()

@router.get("/teachers/{teacher_id}", response_model=TeacherProfile)
def get_teacher(teacher_id: str):
    teacher = db.get_teacher_by_id(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.get("/analytics/departments")
def get_department_analytics():
    return db.get_department_analytics()

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

@router.post("/teachers", response_model=TeacherProfile)
def create_teacher(teacher: TeacherProfile):
    db.execute(
        "INSERT INTO teacher_profile (teacher_id, name, subject_specialization, department) VALUES (?, ?, ?, ?)",
        (teacher.teacher_id, teacher.name, teacher.subject_specialization, teacher.department)
    )
    return teacher

@router.get("/dashboard/stats")
async def get_dashboard_stats():
    """
    Returns aggregated data for the dashboard widgets:
    - Upcoming exams
    - Attendance percentage
    - Recent AI chat topics
    """
    # Mock data for now, replace with DB queries later
    return {
        "attendance": 85,
        "upcoming_exams": [
            {"subject": "Mathematics", "date": "2026-02-20"},
            {"subject": "Physics", "date": "2026-02-24"}
        ],
        "learning_streak": 5
    }

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """Conversational endpoint for Digi School operations"""
    try:
        response_text = ""
        async for chunk in root_agent.run_live(request.message):
            if hasattr(chunk, 'text'):
                response_text += chunk.text
            else:
                response_text += str(chunk)
        
        return ChatResponse(
            response=response_text if response_text else "I'm here to help with school operations!",
            data=None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
