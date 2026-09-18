import re

with open("src/lib/documentService.ts", "r") as f:
    content = f.read()

# Change collection path
content = content.replace("collection(db, 'users', userId, 'documents')", "collection(db, 'generated_documents')")
content = content.replace("doc(db, 'users', userId, 'documents', docId)", "doc(db, 'generated_documents', docId)")

with open("src/lib/documentService.ts", "w") as f:
    f.write(content)
