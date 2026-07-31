const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("const isPro = userData.plan === 'Professional' || userData.plan === 'Enterprise' || userData.plan === 'Starter';", "const isPro = userData.plan && userData.plan !== 'Free' && userData.plan !== 'None';");
fs.writeFileSync('server.ts', code);
