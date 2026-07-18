const { GoogleGenAI } = require("@google/genai");
async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-omni-flash-preview"
  ];
  for (const model of modelsToTest) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: "hi",
      });
      console.log(`Model ${model} SUCCESS:`, response.text);
      break;
    } catch (err) {
      console.error(`Model ${model} FAILED:`, err.status);
    }
  }
}
test();
