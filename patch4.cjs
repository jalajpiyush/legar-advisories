const fs = require('fs');
let content = fs.readFileSync('src/pages/Billing.tsx', 'utf8');

const target = `      const amount = discountPercent > 0 
        ? Math.floor(parseInt(baseAmount) * (1 - discountPercent / 100)).toString()
        : baseAmount;`;

const replacement = `      const amount = getDiscountedPriceRaw(parseInt(baseAmount), planId).toString();`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Billing.tsx', content);
