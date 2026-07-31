
const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');
const lines = content.split('\n');

let stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('try {')) {
    stack.push(i + 1);
  } else if (line.includes('} catch')) {
    if (stack.length === 0) {
      console.log(`Unmatched catch at line ${i + 1}`);
    } else {
      stack.pop();
    }
  }
}
stack.forEach(line => console.log(`Unmatched try at line ${line}`));
