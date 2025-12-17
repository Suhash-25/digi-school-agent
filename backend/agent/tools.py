import json
import ast
from datetime import date, datetime, timedelta
from services import school_service
from models.data_model import SchoolContent
from typing import List, Optional
from agent.utils import parse_natural_date, find_content_by_keyword

def get_contents() -> dict:
    """Get all school contents"""
    return school_service.get_all_contents()

def get_homework_by_date(target_date: str) -> List[dict]:
    """Get homework for a specific date (YYYY-MM-DD format)"""
    all_contents = school_service.get_all_contents()
    homework_list = []
    
    for content in all_contents:
        if content.get('content_type', '').lower() == 'homework':
            content_date = content.get('date_uploaded')
            if content_date == target_date:
                homework_list.append(content)
    
    return homework_list

def get_announcements_by_week() -> List[dict]:
    """Get announcements from this week"""
    all_contents = school_service.get_all_contents()
    announcements = []
    
    # Calculate start of current week (Monday)
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())
    
    for content in all_contents:
        if content.get('content_type', '').lower() == 'announcement':
            content_date_str = content.get('date_uploaded')
            if content_date_str:
                content_date = date.fromisoformat(content_date_str)
                if content_date >= start_of_week:
                    announcements.append(content)
    
    return announcements

def update_homework_title(homework_id: int, new_title: str) -> dict:
    """Update the title of a homework assignment"""
    update_data = {'title': new_title}
    updated_content = school_service.update_content(homework_id, update_data)
    
    if updated_content:
        return {'success': True, 'message': f'Homework title updated to: {new_title}', 'content': updated_content}
    else:
        return {'success': False, 'message': 'Homework not found or update failed'}

def remove_announcement(announcement_id: int) -> dict:
    """Remove an announcement"""
    success = school_service.delete_content(announcement_id)
    
    if success:
        return {'success': True, 'message': 'Announcement removed successfully'}
    else:
        return {'success': False, 'message': 'Announcement not found or deletion failed'}

def upload_notes(teacher_id: str, class_name: str, subject: str, title: str, description: str = None, attachment_urls: List[str] = None) -> dict:
    """Upload new notes for a class"""
    new_content = SchoolContent(
        teacher_id=teacher_id,
        class_name=class_name,
        subject=subject,
        content_type='notes',
        title=title,
        description=description,
        attachment_urls=attachment_urls or []
    )
    
    created_content = school_service.create_content(new_content)
    
    if created_content:
        return {'success': True, 'message': f'Notes uploaded successfully for {class_name} {subject}', 'content': created_content}
    else:
        return {'success': False, 'message': 'Failed to upload notes'}

def search_content_by_type(content_type: str) -> List[dict]:
    """Search content by type (homework, announcement, notes)"""
    all_contents = school_service.get_all_contents()
    filtered_contents = []
    
    for content in all_contents:
        if content.get('content_type', '').lower() == content_type.lower():
            filtered_contents.append(content)
    
    return filtered_contents

def get_todays_homework() -> List[dict]:
    """Get today's homework"""
    today_str = date.today().isoformat()
    return get_homework_by_date(today_str)

def get_homework_by_natural_date(date_input: str) -> List[dict]:
    """Get homework by natural language date (e.g., 'November 5th', 'today')"""
    parsed_date = parse_natural_date(date_input)
    return get_homework_by_date(parsed_date)

def find_announcement_by_keyword(keyword: str) -> List[dict]:
    """Find announcements containing a specific keyword"""
    all_contents = school_service.get_all_contents()
    return find_content_by_keyword(all_contents, keyword, 'announcement')

def update_todays_homework_by_subject(subject: str, new_title: str) -> dict:
    """Update today's homework title for a specific subject"""
    todays_homework = get_todays_homework()
    
    for homework in todays_homework:
        if homework.get('subject', '').lower() == subject.lower():
            return update_homework_title(homework['content_id'], new_title)
    
    return {'success': False, 'message': f'No homework found for {subject} today'}

def get_content_summary() -> dict:
    """Get a summary of all content types"""
    all_contents = school_service.get_all_contents()
    
    summary = {
        'total_content': len(all_contents),
        'homework_count': len([c for c in all_contents if c.get('content_type') == 'homework']),
        'announcement_count': len([c for c in all_contents if c.get('content_type') == 'announcement']),
        'notes_count': len([c for c in all_contents if c.get('content_type') == 'notes'])
    }
    
    return summary