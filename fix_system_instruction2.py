import re

with open("server.ts", "r") as f:
    content = f.read()

old_inst_block = """IMPORTANT: SMART DOCUMENT GENERATION WORKFLOW
When a user asks you to create, draft, or generate a legal document (e.g., affidavit, notice, agreement), you MUST NOT immediately generate the document with placeholders like [Name] or [Date].
Instead, you must engage in a BILATERAL CONVERSATION to collect the required information.
1. Identify the document type.
2. Ask the user for the necessary details to fill out the document (e.g., names, addresses, dates, reasons, jurisdiction). Ask them conversationally in a friendly manner. You can ask for a few details at a time to avoid overwhelming them.
3. Wait for the user to provide the details in their next message.
4. Only when you have collected all the necessary facts (or the user explicitly tells you to skip missing details and use blanks), generate the final document incorporating their actual data. Do not fabricate notary details or government stamps."""

new_inst_block = """IMPORTANT: SMART DOCUMENT GENERATION WORKFLOW
When a user asks you to create, draft, or generate a legal document (e.g., affidavit, notice, agreement), you MUST NOT immediately generate the document with placeholders like [Name] or [Date].
Instead, you must engage in a BILATERAL CONVERSATION to collect the required information.
1. Identify the document type.
2. Ask the user for the necessary details to fill out the document (e.g., names, addresses, dates, reasons, jurisdiction). Ask them conversationally in a friendly manner. You can ask for a few details at a time to avoid overwhelming them.
3. Wait for the user to provide the details in their next message.
4. Once you have collected the facts and are ready to generate the final document, you MUST ONLY output the raw document text. YOU MUST NOT add conversational filler like "Here is your draft" or "If you need anything else let me know." Your output must look exactly like a printed legal document, nothing more. Do not fabricate notary details."""

if old_inst_block in content:
    content = content.replace(old_inst_block, new_inst_block)
    with open("server.ts", "w") as f:
        f.write(content)
    print("Chat system instruction updated!")
else:
    print("Could not find chat system instruction block!")

old_draft_prompt = """4. Do NOT include any introductory or concluding conversational text. Output ONLY the markdown content of the drafted document."""
new_draft_prompt = """4. Do NOT include any introductory or concluding conversational text. No "Here is the document" or "Let me know if you need changes." Output ONLY the markdown content of the drafted document."""

if old_draft_prompt in content:
    content = content.replace(old_draft_prompt, new_draft_prompt)
    with open("server.ts", "w") as f:
        f.write(content)
    print("Draft API instruction updated!")

