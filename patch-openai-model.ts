import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// Replace gpt-4o-mini with gpt-4o
content = content.replace(/"gpt-4o-mini"/g, '"gpt-4o"');

fs.writeFileSync('server.ts', content);
