import re

with open("server.ts", "r") as f:
    content = f.read()

new_api = """
  app.post("/api/draft-document", optionalAuth, requirePlan('free', { usageType: 'doc' }), async (req: AuthRequest, res) => {
    try {
      const { schema, formData } = req.body;
      const openaiKeyTemp = process.env.OPENAI_API_KEY;
      const geminiKey = openaiKeyTemp ? null : process.env.GEMINI_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;

      if (!geminiKey && !openaiKey) {
        return res.status(500).json({ error: "Both GEMINI_API_KEY and OPENAI_API_KEY are missing." });
      }

      const prompt = `You are an expert AI Legal Draftsman. Draft a professional legal document based on the following schema and user-provided data.
Schema: ${schema.title} - ${schema.description}
User Data: ${JSON.stringify(formData, null, 2)}

Instructions:
1. Write the document in professional legal language.
2. Incorporate the provided data naturally. DO NOT use placeholders like [Name] if the data is provided. If data is missing but required for execution, you may leave standard blanks (e.g., "_______") or notary blocks.
3. Format the document nicely using Markdown. Use clear headings, paragraphs, and numbered lists where appropriate.
4. Do NOT include any introductory or concluding conversational text. Output ONLY the markdown content of the drafted document.`;

      let answer = null;
      if (geminiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt
          });
          answer = response.text;
        } catch (e: any) {
          console.error("Gemini failed for drafting:", e);
          if (!openaiKey) throw e;
        }
      }

      if (!answer && openaiKey) {
        const openai = new OpenAI({ apiKey: openaiKey });
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }]
        });
        answer = response.choices[0].message.content;
      }

      res.json({ document: answer });
    } catch (e: any) {
      console.error("Draft endpoint error:", e);
      res.status(500).json({ error: e.message || "Failed to draft document" });
    }
  });

  app.post("/api/extract-fields", optionalAuth, requirePlan('free', { usageType: 'chat' }), async (req: AuthRequest, res) => {
    try {
      const { prompt, schema } = req.body;
      const openaiKeyTemp = process.env.OPENAI_API_KEY;
      const geminiKey = openaiKeyTemp ? null : process.env.GEMINI_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;

      if (!geminiKey && !openaiKey) {
        return res.status(500).json({ error: "API Keys are missing." });
      }

      const aiPrompt = `You are an AI assistant helping to pre-fill a form for a legal document.
The user provided this request: "${prompt}"

The document schema is: ${schema.title}
Fields available:
${schema.fields.map((f: any) => `- ${f.id} (${f.type}): ${f.label}`).join('\\n')}

Extract the relevant information from the user's request and map it to the field IDs.
Return a JSON object where keys are field IDs and values are the extracted text. If a field's information is not present in the prompt, DO NOT include that key in the JSON. Output ONLY valid JSON.`;

      let answer = null;
      if (geminiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: aiPrompt,
            config: { responseMimeType: "application/json" }
          });
          answer = JSON.parse(response.text || "{}");
        } catch (e: any) {
          console.error("Gemini failed for extraction:", e);
          if (!openaiKey) throw e;
        }
      }

      if (!answer && openaiKey) {
        const openai = new OpenAI({ apiKey: openaiKey });
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: aiPrompt }],
          response_format: { type: "json_object" }
        });
        answer = JSON.parse(response.choices[0].message.content || "{}");
      }

      res.json({ extractedData: answer || {} });
    } catch (e: any) {
      console.error("Extraction endpoint error:", e);
      res.status(500).json({ error: e.message || "Failed to extract fields" });
    }
  });

  app.post("/api/chat", optionalAuth,"""

content = content.replace('  app.post("/api/chat", optionalAuth,', new_api)

with open("server.ts", "w") as f:
    f.write(content)
