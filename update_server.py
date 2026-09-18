import re

with open("server.ts", "r") as f:
    content = f.read()

# Update the instruction regarding Smart Document Generation
old_inst = """IMPORTANT: SMART DOCUMENT GENERATION WORKFLOW
When a user asks you to create, draft, or generate a legal document (e.g., affidavit, notice, agreement), you MUST NOT immediately generate the document with placeholders like [Name] or [Date].
Instead, you must engage in a BILATERAL CONVERSATION to collect the required information.
1. Identify the document type.
2. Ask the user for the necessary details to fill out the document (e.g., names, addresses, dates, reasons, jurisdiction). Ask them conversationally in a friendly manner. You can ask for a few details at a time to avoid overwhelming them.
3. Wait for the user to provide the details in their next message.
4. Once you have collected the facts and are ready to generate the final document, you MUST ONLY output the raw document text. YOU MUST NOT add conversational filler like "Here is your draft" or "If you need anything else let me know." Begin your response IMMEDIATELY with the Document Title (e.g., # Gap Year Affidavit). Your output must look exactly like a printed legal document, nothing more. Do not fabricate notary details."""

new_inst = """IMPORTANT: SMART DOCUMENT GENERATION WORKFLOW
When a user asks you to create, draft, or generate a legal document (e.g., affidavit, notice, agreement), you MUST NOT immediately generate the document with placeholders like [Name] or [Date].
Instead, you must engage in a BILATERAL CONVERSATION to collect the required information.
1. Identify the document type.
2. Ask the user for the necessary details to fill out the document (e.g., names, addresses, dates, reasons, jurisdiction).
3. INSTEAD of asking for details conversationally, you MUST output a structured JSON form to collect the data. Use the exact following JSON block format at the very end of your message. Do not use Markdown formatting outside this block for the questions, just provide a polite short message followed by this block:
```json
{
  "type": "dynamic_form",
  "title": "Required Details for [Document Name]",
  "fields": [
    {"id": "fullName", "label": "Full Name", "type": "text"},
    {"id": "reason", "label": "Reason", "type": "textarea"}
  ]
}
```
Supported field types are "text", "textarea", and "date".
4. Wait for the user to provide the details via the form submission in their next message.
5. Once you have collected the facts and are ready to generate the final document, you MUST ONLY output the raw document text. YOU MUST NOT add conversational filler like "Here is your draft". Begin your response IMMEDIATELY with the Document Title (e.g., # Gap Year Affidavit). Your output must look exactly like a printed legal document."""

if old_inst in content:
    content = content.replace(old_inst, new_inst)
    with open("server.ts", "w") as f:
        f.write(content)
    print("Updated server.ts successfully")
else:
    print("Could not find the exact old instruction. Using fallback search.")
    if "IMPORTANT: SMART DOCUMENT GENERATION WORKFLOW" in content:
        # manual replace
        print("Manual intervention needed for server.ts")

