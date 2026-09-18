import re

with open("src/lib/documentService.ts", "r") as f:
    content = f.read()

old_query = """  const q = query(
    collection(db, 'generated_documents'),
    orderBy('updatedAt', 'desc')
  );"""

new_query = """  const q = query(
    collection(db, 'generated_documents'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );"""

content = content.replace(old_query, new_query)

# I also need to ensure that saveGeneratedDocument includes userId in the payload.
old_payload = """  const payload = {
    ...data,
    id: docId,
    version,
    updatedAt: serverTimestamp(),
  };"""

new_payload = """  const payload = {
    ...data,
    userId,
    id: docId,
    version,
    updatedAt: serverTimestamp(),
  };"""

content = content.replace(old_payload, new_payload)

with open("src/lib/documentService.ts", "w") as f:
    f.write(content)
