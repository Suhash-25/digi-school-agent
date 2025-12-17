from agent.agent import root_agent

try:
    response = root_agent.run_live("Show all homework")
    print("Response:", response)
    print("Type:", type(response))
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()