const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const memoryFunc = `
async function getUserMemory(userId: string) {
    if (!userId) return "";
    try {
        const snapshot = await adminDb.collection('training_data')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();
        if (snapshot.empty) return "";
        let memoryText = "\\n\\n--- CONTINUOUS LEARNING MEMORY (FINE-TUNING DATASET) ---\\n";
        memoryText += "The following are past interactions logged in the training dataset for this user's custom LLM. Use this historical context to maintain memory and continuity across sessions:\\n\\n";
        
        const docs = snapshot.docs.reverse();
        docs.forEach(doc => {
            const data = doc.data();
            memoryText += \`User: \${data.prompt}\\nModel: \${data.response}\\n\\n\`;
        });
        memoryText += "--- END CONTINUOUS LEARNING MEMORY ---\\n\\n";
        return memoryText;
    } catch (e) {
        console.error("Failed to fetch user memory", e);
        return "";
    }
}

app.post("/api/chat"`;

content = content.replace('app.post("/api/chat"', memoryFunc);

fs.writeFileSync('server.ts', content);
