const fs = require('fs');
let lines = fs.readFileSync('server2.ts', 'utf8').split('\n');
let newLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  // checkAndIncrementUsage missing try
  if (line.includes('const checkAndIncrementUsage =')) {
    newLines.push(line);
    i++;
    newLines.push(lines[i]); // if (!userId) {
    i++;
    newLines.push(lines[i]); // return { allowed: true };
    i++;
    newLines.push(lines[i]); // }
    newLines.push("  try {");
    continue;
  }
  
  newLines.push(line);
}

fs.writeFileSync('server3.ts', newLines.join('\n'));
