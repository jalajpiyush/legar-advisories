const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// There's a trailing syntax error, likely due to an unclosed block or misplaced bracket.
// I will just use Prettier to format it and see if it's a syntax error.
fs.writeFileSync('src/pages/Dashboard.tsx', content);
