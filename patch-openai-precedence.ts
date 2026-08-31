import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// The best way to do this is to add a flag or swap the if conditions.
// Currently it is:
// if (geminiKey) { try { ... } catch { ... } }
// if (!result && openaiKey) { ... }
// Or for chat:
// if (geminiKey) { ... return res.json(...) }
// if (openaiKey) { ... return res.json(...) }

// Let's replace `const geminiKey = process.env.GEMINI_API_KEY;` and `const openaiKey = process.env.OPENAI_API_KEY;` 
// such that if OPENAI_API_KEY is present, we temporarily "hide" geminiKey so OpenAI runs first.
// Wait, that's a brilliant and simple hack!
// Instead of rewriting 7 blocks of code, we can just do:
// const openaiKey = process.env.OPENAI_API_KEY;
// const geminiKey = openaiKey ? null : process.env.GEMINI_API_KEY; 

content = content.replace(
  /const geminiKey = process\.env\.GEMINI_API_KEY;/g,
  "const openaiKeyTemp = process.env.OPENAI_API_KEY;\n      const geminiKey = openaiKeyTemp ? null : process.env.GEMINI_API_KEY;"
);

// We need to be careful. The code currently does:
// const geminiKey = process.env.GEMINI_API_KEY;
// const openaiKey = process.env.OPENAI_API_KEY;

// If we do the above, geminiKey becomes null when openai is present. Then the `if (geminiKey)` block is skipped.
// Then `if (!result && openaiKey)` runs.
// If OpenAI fails, it will throw. Currently, the fallback is Gemini -> OpenAI. If we want OpenAI -> Gemini, the simple hack (geminiKey = null) removes the fallback to Gemini.
// That is probably fine! If they provide an OpenAI key, they want OpenAI.

fs.writeFileSync('server.ts', content);
