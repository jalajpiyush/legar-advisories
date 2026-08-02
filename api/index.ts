import express from "express";
import OpenAI from "openai";

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, files } = req.body;
    
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing." });
    }
    const openai = new OpenAI({ apiKey: openaiKey });
    
    const formattedMessages = [
      { role: "system", content: "You are Legal Advisories, an advanced legal AI assistant designed to help lawyers, legal professionals, and the public. By default, you should provide advice, rules, and information based on Indian law and jurisdiction. However, if a user specifically asks about the laws of other countries, you should answer their queries to the best of your ability, but clarify that your primary expertise is Indian law. Provide precise, professional, and well-reasoned answers. You specialize in the following features:\n- Explaining laws in plain language.\n- Drafting legal notices, contracts, and petitions.\n- Analyzing contracts and identifying risky clauses.\n- Summarizing judgments.\n- Searching legal precedents.\n- Answering legal questions with citations to the underlying legal sources.\n- Supporting multiple Indian languages." },
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
