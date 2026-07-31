const fs = require('fs');
let content = fs.readFileSync('src/pages/Billing.tsx', 'utf8');

content = content.replace(
  '{renderPrice(isYearly ? 4790 : 499)}',
  '{renderPrice(isYearly ? 4790 : 499, isYearly ? "plan_starter_yearly" : "plan_starter_monthly")}'
);

content = content.replace(
  '{renderPrice(isYearly ? 19190 : 1999)}',
  '{renderPrice(isYearly ? 19190 : 1999, isYearly ? "plan_pro_yearly" : "plan_pro_monthly")}'
);

fs.writeFileSync('src/pages/Billing.tsx', content);
