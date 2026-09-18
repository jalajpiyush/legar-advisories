import re

with open("server.ts", "r") as f:
    content = f.read()

old_api = """  app.get("/api/user/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const userId = req.user?.uid;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      let profile = null;
      let history: any[] = [];
      
      try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        profile = userDoc.exists ? userDoc.data() : null;

        const historySnapshot = await adminDb.collection('users').doc(userId).collection('billing_history').orderBy('created_at', 'desc').get();
        history = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (dbError) {
        // silently use fallback
        profile = {
          plan: "Free",
          subscription_status: "active"
        };
        history = [
          {
            id: "mock_inv_1",
            amount: 0,
            status: "paid",
            created_at: Date.now()
          }
        ];
      }

      res.json({
        profile,
        history
      });
    } catch (error) {
      console.error("Profile API Error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });"""

new_api = """  app.get("/api/user/profile", requireAuth, async (req: AuthRequest, res) => {
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

if old_api in content:
    content = content.replace(old_api, new_api)
    with open("server.ts", "w") as f:
        f.write(content)
    print("Fixed Profile API in server.ts")
else:
    print("Could not find old API. Please manually replace.")
