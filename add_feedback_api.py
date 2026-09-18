import re

with open("server.ts", "r") as f:
    content = f.read()

api_code = """
app.post("/api/feedback", async (req, res) => {
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
});
"""

# Insert before the first 'app.get("/api/chat"'
if "app.post(\"/api/chat\"" in content:
    content = content.replace("app.post(\"/api/chat\"", api_code + "\napp.post(\"/api/chat\"")
    with open("server.ts", "w") as f:
        f.write(content)
    print("API route added successfully.")
else:
    print("Could not find insertion point.")
