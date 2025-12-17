from agent.agent import root_agent

# Test the agent methods
print("Agent methods:", dir(root_agent))

# Try different method names
try:
    response = root_agent.send_message("hello")
    print("send_message works:", response)
except Exception as e:
    print("send_message error:", e)

try:
    response = root_agent.run("hello")
    print("run works:", response)
except Exception as e:
    print("run error:", e)