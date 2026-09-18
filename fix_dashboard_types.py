import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

old_state = "const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string}[]>([]);"
new_state = "const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string, citations?: {source: string, act: string, section: string, doc: string}[]}[]>([]);"
content = content.replace(old_state, new_state)

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)

