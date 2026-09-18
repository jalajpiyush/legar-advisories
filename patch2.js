const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// 1. Remove stopSpeakingAndListen logic (we don't need it with Live API)
const stopLogicRegex = /  const stopSpeakingAndListen = \(\) => \{[\s\S]*?  \};\n/g;
content = content.replace(stopLogicRegex, '');

// 2. Replace the onClick in the waveform button with a no-op or just leave it for UI
content = content.replace(
  'onClick={stopSpeakingAndListen}',
  '/* No click handler needed for continuous live voice */'
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
console.log('Dashboard.tsx patched successfully');
