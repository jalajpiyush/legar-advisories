const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// I am just going to delete lines 77 to 117 explicitly.
const lines = content.split('\n');
const newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (i >= 77 && i <= 105) {
    continue; // skip the extra broken functions
  }
  newLines.push(lines[i]);
}

content = newLines.join('\n');

fs.writeFileSync('src/pages/Dashboard.tsx', content);
