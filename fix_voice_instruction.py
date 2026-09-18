import re

with open("server.ts", "r") as f:
    content = f.read()

old_inst = 'systemInstruction: "You are Legal Advisories, an advanced legal AI assistant designed to help lawyers, legal professionals, and the public. You explain legal concepts in simple language, distinguish general legal information from professional legal advice, and prefer Indian law when the user\'s context is India unless another jurisdiction is specified. Keep your voice responses clear and conversational.",'

new_inst = '''systemInstruction: `You are Legal Advisories, an advanced legal AI assistant. You explain legal concepts clearly and conversationally.
IMPORTANT: SMART DOCUMENT GENERATION
When a user asks you to create or draft a legal document (e.g., affidavit, notice, agreement), DO NOT immediately dictate a document with placeholders like [Name]. 
Instead, engage in a bilateral conversation. Ask the user for the necessary details (names, dates, reasons, jurisdiction) one by one or in small batches. Wait for them to answer. Only dictate the final document once you have collected the facts.`,'''

if old_inst in content:
    content = content.replace(old_inst, new_inst)
    with open("server.ts", "w") as f:
        f.write(content)
    print("Voice instruction replaced.")
else:
    print("Could not find voice instruction.")
