import re

with open("firestore.rules", "r") as f:
    content = f.read()

rule_to_add = """      match /documents/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
"""

# Insert inside match /users/{userId} {
content = content.replace("match /usage/{docId} {", rule_to_add + "      match /usage/{docId} {")

with open("firestore.rules", "w") as f:
    f.write(content)
