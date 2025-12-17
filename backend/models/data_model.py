from datetime import date
from pydantic import BaseModel, Field
from typing import List, Optional

class SchoolContent(BaseModel):
    content_id: Optional[int] = None  # Auto-increment integer, let SQLite handle it
    teacher_id: str 
    class_name: str  
    subject: Optional[str] = None 
    date_uploaded: date = Field(default_factory=date.today)
    content_type: str 
    title: str  
    description: Optional[str] = None  
    attachment_urls: Optional[List[str]] = []

class TeacherProfile(BaseModel):
    teacher_id: str
    name: str
    subject_specialization: str
    department: str
