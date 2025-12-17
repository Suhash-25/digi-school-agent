from datetime import date, datetime
import re

def parse_natural_date(date_string: str) -> str:
    """Convert natural language dates to YYYY-MM-DD format"""
    
    # Handle "today"
    if "today" in date_string.lower():
        return date.today().isoformat()
    
    # Handle month names with day (e.g., "November 5th", "Nov 5")
    month_map = {
        'january': 1, 'jan': 1, 'february': 2, 'feb': 2, 'march': 3, 'mar': 3,
        'april': 4, 'apr': 4, 'may': 5, 'june': 6, 'jun': 6,
        'july': 7, 'jul': 7, 'august': 8, 'aug': 8, 'september': 9, 'sep': 9,
        'october': 10, 'oct': 10, 'november': 11, 'nov': 11, 'december': 12, 'dec': 12
    }
    
    # Pattern for "Month Day" format
    pattern = r'(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?'
    match = re.search(pattern, date_string.lower())
    
    if match:
        month_name = match.group(1)
        day = int(match.group(2))
        
        if month_name in month_map:
            month = month_map[month_name]
            year = date.today().year
            
            # If the date has passed this year, assume next year
            target_date = date(year, month, day)
            if target_date < date.today():
                target_date = date(year + 1, month, day)
            
            return target_date.isoformat()
    
    # If already in YYYY-MM-DD format, return as is
    if re.match(r'\d{4}-\d{2}-\d{2}', date_string):
        return date_string
    
    # Default to today if can't parse
    return date.today().isoformat()

def find_content_by_keyword(contents: list, keyword: str, content_type: str = None) -> list:
    """Find content by keyword in title or description"""
    results = []
    
    for content in contents:
        if content_type and content.get('content_type', '').lower() != content_type.lower():
            continue
            
        title = content.get('title', '').lower()
        description = content.get('description', '').lower() if content.get('description') else ''
        
        if keyword.lower() in title or keyword.lower() in description:
            results.append(content)
    
    return results