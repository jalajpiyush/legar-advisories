import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  /<button\n                  onClick=\{\(\) => setSourcesOpen\(\!sourcesOpen\)\}/,
  `<button type="button"\n                  onClick={(e) => { e.preventDefault(); setSourcesOpen(!sourcesOpen); }}`
);

content = content.replace(
  /<button onClick=\{\(e\) => \{ e.preventDefault\(\); setPromptsOpen\(\!promptsOpen\); \}\}/,
  `<button type="button" onClick={(e) => { e.preventDefault(); setPromptsOpen(!promptsOpen); }}`
);

content = content.replace(
  /<button onClick=\{\(e\) => \{ e.preventDefault\(\); setCustomizeOpen\(\!customizeOpen\); \}\}/,
  `<button type="button" onClick={(e) => { e.preventDefault(); setCustomizeOpen(!customizeOpen); }}`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
