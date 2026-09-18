const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// The issue is likely a missing closing brace or an extra one.
// Let's count them roughly by deleting the file contents and replacing with our git repo backup if this fails.
// Instead of messing around with regex, I'll count braces manually in the JS context.

let openBraces = (content.match(/\{/g) || []).length;
let closeBraces = (content.match(/\}/g) || []).length;

console.log('Open:', openBraces, 'Close:', closeBraces);

if (openBraces > closeBraces) {
  content += '\n}'.repeat(openBraces - closeBraces);
} else if (closeBraces > openBraces) {
  // Try to remove from the end
  for (let i = 0; i < closeBraces - openBraces; i++) {
     content = content.replace(/\}\s*$/, '');
  }
}

fs.writeFileSync('src/pages/Dashboard.tsx', content);
