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
   get_contents]
)