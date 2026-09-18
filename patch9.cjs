const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
content += '\n}';
fs.writeFileSync('src/pages/Dashboard.tsx', content);
