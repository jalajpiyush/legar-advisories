import re

with open("src/lib/documentService.ts", "r") as f:
    content = f.read()

content = content.replace("import { db } from './firebase';", "import { db } from './auth';")

with open("src/lib/documentService.ts", "w") as f:
    f.write(content)
