from google_adk.agents import LlmAgent
from agent.tools import *
from agent.prompt import *

def generate_response(self, query: str, context: dict | None = None):
    # Add system prompt tuning for the new persona
    system_prompt = """
    You are the DigiSchool AI Tutor. 
    You are helpful, encouraging, and precise.
    The user is viewing their dashboard. 
    If they ask about their performance, refer to the available stats.
    """
    # ... integration with LLM logic

Model = "gemini-2.0-flash"
root_agent=LlmAgent(
    name="Digi_School_Agent",
    model = Model,
    description="Digi School Agent which helps school teachers to upload & share daily class notes, homework and important comms with parents.", 
    instruction=ROOT_AGENT_PROMPT,
    tools= [
        get_contents,
        get_homework_by_date,
        get_homework_by_natural_date,
        get_announcements_by_week,
        update_homework_title,
        update_todays_homework_by_subject,
        remove_announcement,
        find_announcement_by_keyword,
        upload_notes,
        search_content_by_type,
        get_todays_homework,
        get_content_summary
    ]
)