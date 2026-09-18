const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Remove the faulty useEffect
content = content.replace(
  /useEffect\(\(\) => \{\s+if \(chatHistory\.length === 0 && user\?\.uid\) \{\s+fetch\('\/api\/suggestions', \{\s+headers: \{ 'Authorization': `Bearer \$\{auth\.currentUser\?\.accessToken \|\| ''\}` \}\s+\}\)\s+\.then\(res => res\.json\(\)\)\s+\.then\(data => \{\s+if \(data && \(data\.templates \|\| data\.precedents\)\) \{\s+setKnowledgeSuggestions\(data\);\s+\}\s+\}\)\s+\.catch\(err => console\.error\("Failed to load knowledge graph", err\)\);\s+\}\s+\}, \[chatHistory\.length, user\?\.uid\]\);/,
  ''
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
