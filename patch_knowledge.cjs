const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const knowledgeUpdater = `
async function updateKnowledgeGraph(userId: string, prompt: string, responseText: string, geminiKey: string | null | undefined) {
    if (!geminiKey) return;
    try {
        const { GoogleGenAI } = require("@google/genai");
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const extractPrompt = \`Extract legal concepts, cited precedents (e.g. specific case laws, acts), and document templates (e.g. Rent Agreement, NDA, Notice) from this interaction. Return JSON strictly with keys: "concepts", "precedents", "templates". Arrays of strings.\\n\\nUser: \${prompt}\\nAI: \${responseText.substring(0, 1500)}\`;
        const aiResponse = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: extractPrompt,
            config: { responseMimeType: "application/json" }
        });
        const data = JSON.parse(aiResponse.text || "{}");
        
        const docRef = adminDb.collection('knowledge_graphs').doc(userId);
        const doc = await docRef.get();
        let existing = doc.exists ? doc.data() : { concepts: [], precedents: [], templates: [] };
        
        const merge = (arr1: any, arr2: any) => Array.from(new Set([...(arr1||[]), ...(arr2||[])])).slice(0, 15);
        
        await docRef.set({
            concepts: merge(existing?.concepts, data.concepts),
            precedents: merge(existing?.precedents, data.precedents),
            templates: merge(existing?.templates, data.templates),
            updatedAt: Date.now()
        });
    } catch (e) {
        console.error("Failed to update knowledge graph", e);
    }
}

app.get("/api/suggestions", optionalAuth, async (req: AuthRequest, res) => {
    if (!req.user?.uid) return res.json({ templates: [], precedents: [] });
    try {
        const doc = await adminDb.collection('knowledge_graphs').doc(req.user.uid).get();
        if (!doc.exists) return res.json({ templates: [], precedents: [] });
        return res.json(doc.data());
    } catch (e) {
        return res.json({ templates: [], precedents: [] });
    }
});

app.post("/api/chat"`;

content = content.replace('app.post("/api/chat"', knowledgeUpdater);

// Inject call into Gemini flow
content = content.replace(
  '.catch(err => console.error("Error saving training data:", err));\\n          }',
  `.catch(err => console.error("Error saving training data:", err));
             updateKnowledgeGraph(req.user.uid, userPrompt, assistantResponse, geminiKey).catch(console.error);
          }`
);

// Inject call into OpenAI flow
content = content.replace(
  '.catch(err => console.error("Error saving training data:", err));\\n        }',
  `.catch(err => console.error("Error saving training data:", err));
             updateKnowledgeGraph(req.user.uid, userPrompt, assistantResponse, geminiKey || process.env.GEMINI_API_KEY).catch(console.error);
        }`
);

fs.writeFileSync('server.ts', content);
