const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace activeSystemInstruction assignment
content = content.replace(
  'let activeSystemInstruction = systemInstruction;',
  `let activeSystemInstruction = systemInstruction;
          if (req.user?.uid) {
             const userMemory = await getUserMemory(req.user.uid);
             activeSystemInstruction += userMemory;
          }`
);

// Do the same for OpenAI
content = content.replace(
  '{ role: "system", content: systemInstruction },',
  `{ role: "system", content: systemInstruction + (req.user?.uid ? await getUserMemory(req.user.uid) : "") },`
);

fs.writeFileSync('server.ts', content);
