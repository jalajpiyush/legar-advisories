import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Gemini API chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, files } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let textPrompt = "";
      for (let i = 0; i < messages.length - 1; i++) {
        const m = messages[i];
        textPrompt += `${m.role === 'user' ? 'User' : 'Legal Advisories'}: ${m.content}\n`;
      }
      
      const lastMessage = messages[messages.length - 1];
      textPrompt += `User: ${lastMessage.content}\nLegal Advisories:`;

      const parts: any[] = [{ text: textPrompt }];
      
      if (files && files.length > 0) {
        for (const file of files) {
          parts.push({
            inlineData: {
              data: file.data,
              mimeType: file.mimeType
            }
          });
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: "You are Legal Advisories, an advanced legal AI assistant designed to help lawyers, legal professionals, and the public. By default, you should provide advice, rules, and information based on Indian law and jurisdiction. However, if a user specifically asks about the laws of other countries, you should answer their queries to the best of your ability, but clarify that your primary expertise is Indian law. Provide precise, professional, and well-reasoned answers. You specialize in the following features:\n- Explaining laws in plain language.\n- Drafting legal notices, contracts, and petitions.\n- Analyzing contracts and identifying risky clauses.\n- Summarizing judgments.\n- Searching legal precedents.\n- Answering legal questions with citations to the underlying legal sources.\n- Supporting multiple Indian languages.",
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      let errorMessage = "Failed to communicate with AI model";
      if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("Quota exceeded")) {
        errorMessage = "You have exceeded your free tier quota for the AI model. Please wait a moment and try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Legal Advisories AI Server running on port ${PORT}`);
  });
}

startServer();

