import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "import { ExportMenu }\nimport { FeedbackButtons } from '../components/FeedbackButtons'; from '../components/ExportMenu';", 
    "import { ExportMenu } from '../components/ExportMenu';\nimport { FeedbackButtons } from '../components/FeedbackButtons';"
)

with open("src/pages/Dashboard.tsx", "w") as f:
    f.write(content)
