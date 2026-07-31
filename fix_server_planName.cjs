const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `      let planName = 'Professional';
      if (planId.includes('starter')) planName = 'Starter';
      if (planId.includes('enterprise')) planName = 'Enterprise';`;

const newCode = `      let planName = 'Professional';
      const basePlanId = planId.replace('_monthly', '').replace('_yearly', '');
      try {
        const planDoc = await adminDb.collection('plans').doc(basePlanId).get();
        if (planDoc.exists && planDoc.data().heading) {
          planName = planDoc.data().heading;
        }
      } catch (e) {
        console.error("Could not fetch plan name from DB", e);
      }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
