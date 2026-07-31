const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldFunc = `const checkAndIncrementUsage = async (userId: string | undefined, type: 'chat' | 'doc') => {
  if (!userId) {
    // If not logged in, maybe give a small anonymous limit or enforce login
    return { allowed: false, error: "Please log in to use AI features." };
  }

 const userRef = adminDb.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? userDoc.data() : { plan: 'Free' };
  
  const plan = userData?.plan || 'Free';
  const isPro = plan === 'Professional' || plan === 'Enterprise' || plan === 'Starter';

  if (isPro) {
    return { allowed: true };
  }

  // Free Tier Limits
  const MAX_CHATS = 20;
  const MAX_DOCS = 3;

  const today = new Date().toISOString().split('T')[0];
  const usageRef = userRef.collection('usage').doc(today);
  

    await adminDb.runTransaction(async (t) => {
      const doc = await t.get(usageRef);
      if (!doc.exists) {
        t.set(usageRef, { chat: 0, doc: 0 });
        t.update(usageRef, { [type]: 1 });
      } else {
        const data = doc.data();
        const currentCount = data?.[type] || 0;
        
        const limit = type === 'chat' ? MAX_CHATS : MAX_DOCS;
        if (currentCount >= limit) {
          throw new Error(\`LIMIT_REACHED_\${type}\`);
        }
        
        t.update(usageRef, { [type]: currentCount + 1 });
      }
    });
    return { allowed: true };
  } catch (err: any) {
    if (err.message.includes('LIMIT_REACHED')) {
      const feature = type === 'chat' ? 'AI chats' : 'document analyses';
      return { allowed: false, error: \`You have reached your daily limit for \${feature} on the Free plan. Please upgrade to Pro for unlimited usage.\` };
    }
    console.error("Usage Tracking Error:", err);
    // On DB error, allow them so we don't break the app
    return { allowed: true };
  }
};`

const newFunc = `const checkAndIncrementUsage = async (userId: string | undefined, type: 'chat' | 'doc') => {
  if (!userId) {
    return { allowed: false, error: "Please log in to use AI features." };
  }
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : { plan: 'Free' };
    const plan = userData?.plan || 'Free';
    const isPro = plan === 'Professional' || plan === 'Enterprise' || plan === 'Starter';
    if (isPro) {
      return { allowed: true };
    }
    const MAX_CHATS = 20;
    const MAX_DOCS = 3;
    const today = new Date().toISOString().split('T')[0];
    const usageRef = userRef.collection('usage').doc(today);
    await adminDb.runTransaction(async (t) => {
      const doc = await t.get(usageRef);
      if (!doc.exists) {
        t.set(usageRef, { chat: 0, doc: 0 });
        t.update(usageRef, { [type]: 1 });
      } else {
        const data = doc.data();
        const currentCount = data?.[type] || 0;
        const limit = type === 'chat' ? MAX_CHATS : MAX_DOCS;
        if (currentCount >= limit) {
          throw new Error(\`LIMIT_REACHED_\${type}\`);
        }
        t.update(usageRef, { [type]: currentCount + 1 });
      }
    });
    return { allowed: true };
  } catch (err: any) {
    if (err.message && err.message.includes('LIMIT_REACHED')) {
      const feature = type === 'chat' ? 'AI chats' : 'document analyses';
      return { allowed: false, error: \`You have reached your daily limit for \${feature} on the Free plan. Please upgrade to Pro for unlimited usage.\` };
    }
    console.error("Usage Tracking Error:", err);
    return { allowed: true };
  }
};`

// since spacing might be different, let's use regex to replace between `const checkAndIncrementUsage =` and the next `};`
content = content.replace(/const checkAndIncrementUsage = async [\s\S]*?^};/m, newFunc);
fs.writeFileSync('server.ts', content);
