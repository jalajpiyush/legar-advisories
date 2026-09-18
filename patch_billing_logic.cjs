const fs = require('fs');
let content = fs.readFileSync('src/pages/Billing.tsx', 'utf8');

content = content.replace(/plan\.heading === 'Pro'/g, "plan.heading === 'For Individuals'");
content = content.replace(/plan\.heading === 'Max'/g, "plan.heading === 'For Lawyers & Professionals'");

fs.writeFileSync('src/pages/Billing.tsx', content);
