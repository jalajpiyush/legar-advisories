import re

with open("server.ts", "r") as f:
    content = f.read()

# Remove the inline imports
content = content.replace("import fs from 'fs';\nimport path from 'path';\n\napp.post(\"/api/feedback\"", "app.post(\"/api/feedback\"")

# Add them to the top if not there
if "import fs from" not in content:
    content = "import fs from 'fs';\nimport path from 'path';\n" + content

with open("server.ts", "w") as f:
    f.write(content)
print("Fixed imports")
