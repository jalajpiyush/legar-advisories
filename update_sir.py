import re

with open("server.ts", "r") as f:
    content = f.read()

# The system instruction is a template literal. 
# We can find `const systemInstruction = `You are Legal Advisories,` and inject into it, 
# or find the end of it before the closing backtick.

new_rule = "\n\nCRITICAL INSTRUCTION: You must always address the user respectfully as 'Sir' in all your responses and interactions."

# Let's do a targeted replace on the last part of the prompt
if "DO NOT output any other text when responding to a PDF generation request.`;" in content:
    content = content.replace("DO NOT output any other text when responding to a PDF generation request.`;", "DO NOT output any other text when responding to a PDF generation request." + new_rule + "`;")
    with open("server.ts", "w") as f:
        f.write(content)
    print("Updated system instruction to include 'Sir'.")
else:
    print("Could not find the exact anchor to replace.")
