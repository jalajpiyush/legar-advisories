import re

with open("server.ts", "r") as f:
    content = f.read()

pattern = re.compile(r'  // Get User Profile & History.*?  \}\);', re.DOTALL)
new_api = """  // Get User Profile & History
  app.get("/api/user/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { plan, subscriptionStatus, userData } = await getUserPlanAndStatus(userId);
      const isLawyer = plan === 'lawyer';
      const isIndividual = plan === 'individual';
      
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const monthStr = todayStr.substring(0, 7);
      
      let chatUsedToday = Number(userData.chatUsedToday) || 0;
      let chatUsedMonth = Number(userData.chatUsedMonth) || 0;
      let documentUsedToday = Number(userData.documentUsedToday) || 0;
      let documentUsedMonth = Number(userData.documentUsedMonth) || 0;
      
      if (userData.lastChatDate !== todayStr) chatUsedToday = 0;
      if (userData.lastChatMonth !== monthStr) chatUsedMonth = 0;
      if (userData.lastDocDate !== todayStr) documentUsedToday = 0;
      if (userData.lastDocMonth !== monthStr) documentUsedMonth = 0;

      let history: any[] = [];
      try {
        const historySnapshot = await adminDb.collection('users').doc(userId).collection('billing_history').orderBy('created_at', 'desc').get();
        history = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        history = [];
      }
      
      res.json({
        profile: userData,
        plan: plan === 'lawyer' ? 'Lawyer' : (plan === 'individual' ? 'Individual' : 'Free'),
        usage: {
          chat: isIndividual ? chatUsedMonth : chatUsedToday,
          doc: isIndividual ? documentUsedMonth : documentUsedToday
        },
        limits: {
          chat: isLawyer ? -1 : (isIndividual ? 500 : 20),
          doc: isLawyer ? -1 : (isIndividual ? 100 : 3)
        },
        history
      });
    } catch (error) {
      console.error("Profile API Error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });"""

content = pattern.sub(new_api, content)

with open("server.ts", "w") as f:
    f.write(content)
print("Regex replace complete for server.ts")
