import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const regexDashboard = /app\.get\("\/api\/user\/dashboard", requireAuth, async \(req: AuthRequest, res\) => \{[\s\S]*?res\.json\(\{\n      plan: plan,[\s\S]*?\}\);\n  \} catch \(error: any\)/m;

const newDashboard = `app.get("/api/user/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : { plan: 'Free' };
    
    let rawPlan = userData?.plan || 'Free';
    let plan = 'Free';
    const str = String(rawPlan).toLowerCase().trim();
    if (str.includes('lawyer') || str.includes('pro') || str.includes('enterprise')) plan = 'Lawyer';
    else if (str.includes('individual')) plan = 'Individual';
    
    const isLawyer = plan === 'Lawyer';
    const isIndividual = plan === 'Individual';
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthStr = todayStr.substring(0, 7);

    let chatUsedToday = Number(userData?.chatUsedToday) || 0;
    let chatUsedMonth = Number(userData?.chatUsedMonth) || 0;
    let documentUsedToday = Number(userData?.documentUsedToday) || 0;
    let documentUsedMonth = Number(userData?.documentUsedMonth) || 0;

    if (userData?.lastChatDate !== todayStr) chatUsedToday = 0;
    if (userData?.lastDocDate !== todayStr) documentUsedToday = 0;
    if (userData?.lastChatMonth !== monthStr) chatUsedMonth = 0;
    if (userData?.lastDocMonth !== monthStr) documentUsedMonth = 0;

    const billingSnapshot = await userRef.collection('billing_history').orderBy('created_at', 'desc').limit(5).get();
    const billingHistory = billingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const docsSnapshot = await adminDb.collection('documents').where('userId', '==', userId).orderBy('created_at', 'desc').limit(5).get();
    const savedDocs = docsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      plan: plan,
      usage: {
        chat: isIndividual ? chatUsedMonth : chatUsedToday,
        doc: isIndividual ? documentUsedMonth : documentUsedToday
      },
      billingHistory,
      savedDocs,
      limits: {
        chat: isLawyer ? -1 : (isIndividual ? 500 : 20),
        doc: isLawyer ? -1 : (isIndividual ? 100 : 3)
      }
    });
  } catch (error: any)`;

content = content.replace(regexDashboard, newDashboard);
fs.writeFileSync('server.ts', content);
