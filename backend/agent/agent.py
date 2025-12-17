from google.adk.agents import LlmAgent
from agent.tools import *
from agent.prompt import *

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