const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

code = code.replace(
  "export function Landing({ onEnter }: { onEnter: () => void }) {",
  "export function Landing({ onEnter, onContactSales }: { onEnter: () => void; onContactSales?: () => void }) {"
);

fs.writeFileSync('src/pages/Landing.tsx', code);
