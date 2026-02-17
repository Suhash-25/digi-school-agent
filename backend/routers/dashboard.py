from fastapi import APIRouter, Depends
import random
from datetime import datetime, timedelta

# Initialize Router
router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

# Mock Database / Service Logic
# In a real app, you would import your 'school_service' or DB models here.
def get_student_stats():
    """
    Generates dynamic data for the dashboard.
    """
    # 1. Calculate Time-Based Greeting
    current_hour = datetime.now().hour
    if current_hour < 12:
        greeting = "Good Morning"
    elif 12 <= current_hour < 18:
        greeting = "Good Afternoon"
    else:
        greeting = "Good Evening"

    # 2. Simulate "Study Progress" (Randomized for demo purposes to show movement)
    # Replace these with: db.query(CompletedLessons).count()
    completed = random.randint(50, 80)
    in_progress = random.randint(10, 30)
    todo = 100 - (completed + in_progress)

    return {
        "greeting": greeting,
        "user_name": "Student",  # You can pull this from Auth later
        "stats": {
            "completed": completed,
            "in_progress": in_progress,
            "todo": todo
        },
        "next_class": {
            "subject": "Advanced Python AI",
            "time": (datetime.now() + timedelta(hours=1)).strftime("%I:%M %p"),
            "room": "Virtual Lab A"
        },
        "assignments": [
            {"title": "Neural Networks Intro", "due": "Today", "status": "urgent"},
            {"title": "Database Schema Design", "due": "Tomorrow", "status": "normal"},
            {"title": "FastAPI Documentation", "due": "In 2 days", "status": "normal"}
        ]
    }

@router.get("/stats")
async def read_dashboard_stats():
    """
    API Endpoint called by the frontend to get fresh dashboard data.
    """
    return get_student_stats()