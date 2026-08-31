import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const regexDashboard = /app\.get\("\/api\/user\/dashboard", requireAuth, async \(req: AuthRequest, res\) => \{[\s\S]*?res\.json\(\{\n      plan: userData\?\.plan \|\| 'Free',[\s\S]*?\}\);\n  \} catch \(error: any\)/m;

const newDashboard = `app.get("/api/user/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : { plan: 'Free' };
    
    const plan = userData?.plan || 'Free';
    const isLawyer = plan === 'Lawyer' || plan === 'Pro' || plan === 'Premium';
    const isIndividual = plan === 'Individual';
    const period = isIndividual ? new Date().toISOString().substring(0, 7) : new Date().toISOString().split('T')[0];

    const usageDoc = await userRef.collection('usage').doc(period).get();
    const memUsage = usageCache.get(userId)?.history[period];
    const usageData = memUsage || (usageDoc.exists ? usageDoc.data() : { chat: 0, doc: 0 });
    
    const billingSnapshot = await userRef.collection('billing_history').orderBy('created_at', 'desc').limit(5).get();
    const billingHistory = billingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const docsSnapshot = await adminDb.collection('documents').where('userId', '==', userId).orderBy('created_at', 'desc').limit(5).get();
    const savedDocs = docsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      plan: plan,
      usage: usageData,
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
