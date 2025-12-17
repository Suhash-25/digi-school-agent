from services import school_service
from models.data_model import SchoolContent
from datetime import date, timedelta

def add_sample_data():
    # Sample homework for November 5th
    homework1 = SchoolContent(
        teacher_id="T001",
        class_name="Class 10",
        subject="Mathematics",
        content_type="homework",
        title="Algebra Practice Problems",
        description="Complete exercises 1-15 from chapter 3",
        date_uploaded="2024-11-05"
    )
    
    homework2 = SchoolContent(
        teacher_id="T002",
        class_name="Class 9",
        subject="English",
        content_type="homework", 
        title="Essay Writing Assignment",
        description="Write a 500-word essay on environmental conservation",
        date_uploaded="2024-11-05"
    )
    
    # Today's homework
    today = date.today().isoformat()
    todays_homework = SchoolContent(
        teacher_id="T003",
        class_name="Class 8",
        subject="Maths",
        content_type="homework",
        title="Geometry Problems",
        description="Solve triangle problems from textbook",
        date_uploaded=today
    )
    
    # This week's announcements
    this_week = (date.today() - timedelta(days=2)).isoformat()
    announcement1 = SchoolContent(
        teacher_id="T004",
        class_name="All Classes",
        subject="General",
        content_type="announcement",
        title="Parent-Teacher Meeting",
        description="Parent-teacher meeting scheduled for next Friday",
        date_uploaded=this_week
    )
    
    announcement2 = SchoolContent(
        teacher_id="T005",
        class_name="All Classes", 
        subject="General",
        content_type="announcement",
        title="Annual Day Celebration",
        description="Old announcement about annual day event",
        date_uploaded=this_week
    )
    
    # Sample notes
    notes1 = SchoolContent(
        teacher_id="T006",
        class_name="Class 10",
        subject="English",
        content_type="notes",
        title="Shakespeare Literature Notes",
        description="Comprehensive notes on Hamlet",
        date_uploaded=today
    )
    
    # Add all sample data
    contents = [homework1, homework2, todays_homework, announcement1, announcement2, notes1]
    
    for content in contents:
        try:
            school_service.create_content(content)
            print(f"Added: {content.title}")
        except Exception as e:
            print(f"Error adding {content.title}: {e}")

if __name__ == "__main__":
    add_sample_data()