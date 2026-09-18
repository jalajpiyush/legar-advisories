const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// For Gemini
content = content.replace(
  'return res.json({ message: { content: response.text } });',
  `const assistantResponse = response.text || "";
          const userPrompt = messages.length > 0 ? messages[messages.length - 1].content : "";
          if (userPrompt && assistantResponse && req.user?.uid) {
             adminDb.collection('training_data').add({
                userId: req.user.uid,
                prompt: userPrompt,
                response: assistantResponse,
                timestamp: Date.now()
             }).catch(err => console.error("Error saving training data:", err));
          }
          return res.json({ message: { content: assistantResponse } });`
);

// For OpenAI
content = content.replace(
  'return res.json({ message: { content: response.choices[0].message.content } });',
  `const assistantResponse = response.choices[0].message.content || "";
        const userPrompt = messages.length > 0 ? messages[messages.length - 1].content : "";
        if (userPrompt && assistantResponse && req.user?.uid) {
             adminDb.collection('training_data').add({
                userId: req.user.uid,
                prompt: userPrompt,
                response: assistantResponse,
                timestamp: Date.now()
             }).catch(err => console.error("Error saving training data:", err));
        }
        return res.json({ message: { content: assistantResponse } });`
);

fs.writeFileSync('server.ts', content);
