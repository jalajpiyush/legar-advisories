import re

with open("server.ts", "r") as f:
    content = f.read()

old_api = """app.post("/api/feedback", async (req, res) => {
  try {
    const { message, isPositive, reason, customReason, sessionId } = req.body;
    await adminDb.collection("training_feedback").add({
      message,
      isPositive,
      reason: reason || null,
      customReason: customReason || null,
      sessionId: sessionId || "anonymous",
      timestamp: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});"""

new_api = """import fs from 'fs';
import path from 'path';

app.post("/api/feedback", async (req, res) => {
  try {
    const { message, isPositive, reason, customReason, sessionId } = req.body;
    
    const feedbackEntry = {
      message,
      isPositive,
      reason: reason || null,
      customReason: customReason || null,
      sessionId: sessionId || "anonymous",
      timestamp: new Date().toISOString()
    };
    
    // Write to a local JSONL file for easy export and fine-tuning
    const filePath = path.join(process.cwd(), 'training_feedback.jsonl');
    fs.appendFileSync(filePath, JSON.stringify(feedbackEntry) + '\\n');
    
    // Also try to write to Firestore, but don't fail if it doesn't work
    try {
      if (adminDb) {
        await adminDb.collection("training_feedback").add(feedbackEntry);
      }
    } catch (dbError) {
      console.log("Could not write to Firestore (likely missing permissions), but saved to local file:", dbError.message);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});"""

if old_api in content:
    content = content.replace(old_api, new_api)
    with open("server.ts", "w") as f:
        f.write(content)
    print("Fixed feedback API successfully.")
else:
    # Just replace the implementation inside app.post("/api/feedback"
    match = re.search(r'app\.post\("/api/feedback".*?\}\);', content, re.DOTALL)
    if match:
        content = content.replace(match.group(0), new_api.replace("import fs from 'fs';\nimport path from 'path';\n\n", ""))
        
        # Add imports if they don't exist
        if "import fs" not in content:
            content = "import fs from 'fs';\nimport path from 'path';\n" + content
            
        with open("server.ts", "w") as f:
            f.write(content)
        print("Fixed feedback API via regex successfully.")
    else:
        print("Could not find the feedback API block.")
