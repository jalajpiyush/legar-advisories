import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const regexUsageTracker = /const usageCache = new Map<string,[\s\S]*?console\.error\("Usage Tracking Error:", err\);\n    return { allowed: true };\n  }\n};/m;

const newTracker = `const usageCache = new Map<string, { plan: string, history: Record<string, { chat: number, doc: number }> }>();
const checkAndIncrementUsage = async (userId: string | undefined, type: 'chat' | 'doc') => {
  if (!userId) return { allowed: true };
  
  try {
    let userData = usageCache.get(userId);
    let plan = userData?.plan || 'Free';
    
    // Always try to get the real plan from db if possible
    try {
      const userDoc = await adminDb.collection("users").doc(userId).get();
      if (userDoc.exists) {
         plan = userDoc.data()?.plan || 'Free';
         if (userData) userData.plan = plan;
         else userData = { plan, history: {} };
         usageCache.set(userId, userData);
      }
    } catch(e) {
      // ignore
    }

    if (!userData) {
      userData = { plan, history: {} };
      usageCache.set(userId, userData);
    }
    
    const isLawyer = plan === 'Lawyer' || plan === 'Pro' || plan === 'Premium'; 
    if (isLawyer) return { allowed: true };
    
    const isIndividual = plan === 'Individual';
    
    const period = isIndividual ? new Date().toISOString().substring(0, 7) : new Date().toISOString().split('T')[0]; 
    
    if (!userData.history[period]) {
      try {
         const usageDoc = await adminDb.collection("users").doc(userId).collection("usage").doc(period).get();
         userData.history[period] = usageDoc.exists ? (usageDoc.data() as any) : { chat: 0, doc: 0 };
      } catch(e) {
         userData.history[period] = { chat: 0, doc: 0 };
      }
    }
    
    const MAX_CHATS = isIndividual ? 500 : 20;
    const MAX_DOCS = isIndividual ? 100 : 3;
    
    const currentCount = userData.history[period][type] || 0;
    const limit = type === 'chat' ? MAX_CHATS : MAX_DOCS;
    
    if (currentCount >= limit) {
      const feature = type === 'chat' ? 'AI chats' : 'document analyses';
      const periodName = isIndividual ? 'monthly' : 'daily';
      return { allowed: false, error: \`You have reached your \${periodName} limit for \${feature} on the \${plan} plan. Please upgrade for more usage.\` };
    }
    
    userData.history[period][type] = currentCount + 1;
    try {
      const userRef = adminDb.collection("users").doc(userId);
      await userRef.collection("usage").doc(period).set({ [type]: userData.history[period][type] }, { merge: true });
    } catch (e) { console.error(e); }
    return { allowed: true };
  } catch (err: any) {
    console.error("Usage Tracking Error:", err);
    return { allowed: true };
  }
};`;

content = content.replace(regexUsageTracker, newTracker);
fs.writeFileSync('server.ts', content);
