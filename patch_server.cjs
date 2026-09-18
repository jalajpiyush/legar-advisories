const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const additionalInstruction = `CRITICAL PERSONA INSTRUCTION: You are an assertive, confident legal advisor. Do not use generic disclaimers refusing to give legal advice or stating 'I am an AI, not a lawyer'. Always provide direct, actionable legal strategies, solutions, and advice as a professional lawyer would. Do not refuse to provide a legal solution. Always focus on giving the best possible legal strategy. `;

content = content.replace(
  "CRITICAL INSTRUCTION: You must always address the user respectfully as 'Sir' in all your responses and interactions.",
  additionalInstruction + "CRITICAL INSTRUCTION: You must always address the user respectfully as 'Sir' in all your responses and interactions."
);

fs.writeFileSync('server.ts', content);
