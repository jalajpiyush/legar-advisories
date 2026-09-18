with open("server.ts", "r") as f:
    content = f.read()

# Replace the unescaped backticks
content = content.replace("```json", "\\`\\`\\`json")
content = content.replace("  ]\n}\n```\nSupported", "  ]\n}\n\\`\\`\\`\nSupported")

with open("server.ts", "w") as f:
    f.write(content)
print("Fixed backticks in server.ts")
