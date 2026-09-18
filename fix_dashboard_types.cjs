const fs = require('fs');
let c = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
c = c.replace('const isDocumentMessage = (content) => {', 'const isDocumentMessage = (content: string) => {');
fs.writeFileSync('src/pages/Dashboard.tsx', c);
