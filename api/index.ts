import express from "express";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, files } = req.body;
    
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!geminiKey && !openaiKey) {
      return res.status(500).json({ error: "Both GEMINI_API_KEY and OPENAI_API_KEY are missing." });
    }
    
    // Try Gemini first
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const formattedMessages = messages.map((m: any) => ({
          role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: formattedMessages
        });
        return res.json({ reply: response.text });
      } catch (e) {
        console.error("Gemini failed in API, trying OpenAI...", e);
        if (!openaiKey) throw e;
      }
    }
    
    // Fallback to OpenAI
    const openai = new OpenAI({ apiKey: openaiKey! });
    const formattedMessages = [
      { role: "system", content: "You are Legal Advisories, an advanced legal AI assistant..." },
      ...messages.map((m: any) => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content
      }))
    ];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: formattedMessages
    });
    
    res.json({ reply: response.choices[0].message.content });
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "Failed to communicate with AI model" });
  }
});

export default app;
