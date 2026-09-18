import re

with open("server.ts", "r") as f:
    content = f.read()

old_prompt = """4. Do NOT include any introductory or concluding conversational text. No "Here is the document" or "Let me know if you need changes." Output ONLY the markdown content of the drafted document."""
new_prompt = """4. CRITICAL: Output ONLY the markdown content of the drafted document. Begin your response IMMEDIATELY with the # Document Title. Do NOT output any introductory text, pleasantries, conversational filler, or concluding remarks under ANY circumstances."""

content = content.replace(old_prompt, new_prompt)

# Also update the chat system prompt
old_chat = """Once you have collected the facts and are ready to generate the final document, you MUST ONLY output the raw document text. YOU MUST NOT add conversational filler like "Here is your draft" or "If you need anything else let me know." Your output must look exactly like a printed legal document, nothing more. Do not fabricate notary details."""
new_chat = """Once you have collected the facts and are ready to generate the final document, you MUST ONLY output the raw document text. YOU MUST NOT add conversational filler like "Here is your draft" or "If you need anything else let me know." Begin your response IMMEDIATELY with the Document Title (e.g., # Gap Year Affidavit). Your output must look exactly like a printed legal document, nothing more. Do not fabricate notary details."""

content = content.replace(old_chat, new_chat)

with open("server.ts", "w") as f:
    f.write(content)
print("Updated server.ts prompts")
