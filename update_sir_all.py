import re

with open("server.ts", "r") as f:
    content = f.read()

rule = " CRITICAL INSTRUCTION: You must always address the user respectfully as 'Sir' in all your responses and interactions."

# Fix Document Analysis (line 230ish)
old_doc_inst = "and 'improvements' (array of strings).\";"
new_doc_inst = "and 'improvements' (array of strings)." + rule + "\";"
content = content.replace(old_doc_inst, new_doc_inst)

# Fix Voice API (line 1635ish)
old_voice_inst = "Only dictate the final document once you have collected the facts.`,"
new_voice_inst = "Only dictate the final document once you have collected the facts.\n\n" + rule.strip() + "`,"
content = content.replace(old_voice_inst, new_voice_inst)

with open("server.ts", "w") as f:
    f.write(content)

print("Updated other system instructions")
