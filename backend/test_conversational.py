#!/usr/bin/env python3
"""
Test script for conversational Digi School operations
"""

from agent.tools import *
from models.data_model import SchoolContent
from services import school_service
from datetime import date

def setup_test_data():
    """Setup some test data for demonstration"""
    
    # Create test homework
    homework1 = SchoolContent(
        teacher_id="teacher1",
        class_name="Class 10",
        subject="Maths",
        content_type="homework",
        title="Algebra Practice Problems",
        description="Complete exercises 1-10 from chapter 5",
        date_uploaded=date(2024, 11, 5)
    )
    
    homework2 = SchoolContent(
        teacher_id="teacher2", 
        class_name="Class 9",
        subject="English",
        content_type="homework",
        title="Essay Writing Assignment",
        description="Write a 500-word essay on environmental conservation",
        date_uploaded=date.today()
    )
    
    # Create test announcements
    announcement1 = SchoolContent(
        teacher_id="admin",
        class_name="All Classes",
        subject="General",
        content_type="announcement",
        title="Annual Day Celebration",
        description="Annual day will be celebrated on December 15th",
        date_uploaded=date.today()
    )
    
    announcement2 = SchoolContent(
        teacher_id="admin",
        class_name="All Classes", 
        subject="General",
        content_type="announcement",
        title="Parent-Teacher Meeting",
        description="PTM scheduled for next week",
        date_uploaded=date.today()
    )
    
    # Save test data
    school_service.create_content(homework1)
    school_service.create_content(homework2)
    school_service.create_content(announcement1)
    school_service.create_content(announcement2)
    
    print("✅ Test data created successfully!")

def test_conversational_queries():
    """Test the conversational capabilities"""
    
    print("\n🔍 Testing Conversational Queries:")
    print("=" * 50)
    
    # Test 1: Show homework for November 5th
    print("\n1. Query: 'Show all homework given on November 5th'")
    homework_nov5 = get_homework_by_natural_date("November 5th")
    print(f"   Found {len(homework_nov5)} homework assignments:")
    for hw in homework_nov5:
        print(f"   - {hw['subject']}: {hw['title']}")
    
    # Test 2: Show this week's announcements
    print("\n2. Query: 'What announcements were made this week?'")
    announcements = get_announcements_by_week()
    print(f"   Found {len(announcements)} announcements:")
    for ann in announcements:
        print(f"   - {ann['title']}: {ann['description']}")
    
    # Test 3: Update today's Maths homework title
    print("\n3. Query: 'Update the title of today's Maths homework'")
    result = update_todays_homework_by_subject("Maths", "Updated Algebra Problems")
    print(f"   Result: {result['message']}")
    
    # Test 4: Find announcement about annual day
    print("\n4. Query: 'Remove the old announcement about the annual day'")
    annual_announcements = find_announcement_by_keyword("annual day")
    if annual_announcements:
        ann_id = annual_announcements[0]['content_id']
        result = remove_announcement(ann_id)
        print(f"   Result: {result['message']}")
    else:
        print("   No announcement found with 'annual day' keyword")
    
    # Test 5: Upload new notes
    print("\n5. Query: 'Upload new notes for Class 10 English'")
    result = upload_notes(
        teacher_id="teacher3",
        class_name="Class 10", 
        subject="English",
        title="Shakespeare's Hamlet - Character Analysis",
        description="Detailed notes on main characters in Hamlet"
    )
    print(f"   Result: {result['message']}")
    
    # Test 6: Content summary
    print("\n6. Content Summary:")
    summary = get_content_summary()
    print(f"   Total Content: {summary['total_content']}")
    print(f"   Homework: {summary['homework_count']}")
    print(f"   Announcements: {summary['announcement_count']}")
    print(f"   Notes: {summary['notes_count']}")

if __name__ == "__main__":
    print("🚀 Starting Conversational Digi School Test")
    
    # Setup test data
    setup_test_data()
    
    # Test conversational queries
    test_conversational_queries()
    
    print("\n✅ All tests completed successfully!")
    print("\nThe Digi School Agent now supports conversational operations for:")
    print("- Homework queries by date")
    print("- Weekly announcements")
    print("- Content updates and deletions")
    print("- Note uploads")
    print("- Content search and management")