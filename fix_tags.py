with open("server.ts", "r") as f:
    content = f.read()

old_block = """          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: formattedMessages,
            config: {
              systemInstruction
            }
          });"""

new_block = """          let activeSystemInstruction = systemInstruction;
          let tools = undefined;
          
          if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1].content || "";
            if (lastMsg.includes("[Selected Sources:")) {
               if (lastMsg.includes("Web search")) {
                  tools = [{ googleSearch: {} }];
               }
               if (lastMsg.includes("EDGAR")) {
                  activeSystemInstruction += "\\n\\nIMPORTANT: The user has selected EDGAR as a source. Prioritize searching sec.gov for financial filings. Use the web search tool to search site:sec.gov if necessary.";
                  tools = [{ googleSearch: {} }];
               }
               if (lastMsg.includes("iManage")) {
                  activeSystemInstruction += "\\n\\nIMPORTANT: The user has selected iManage. Since you do not have direct access to their iManage instance yet, acknowledge that you are searching iManage and provide a comprehensive legal response.";
               }
            }
          }

          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: formattedMessages,
            config: {
              systemInstruction: activeSystemInstruction,
              tools
            }
          });"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open("server.ts", "w") as f:
        f.write(content)
    print("Fixed tools in server.ts")
else:
    print("Could not find the exact old_block.")
