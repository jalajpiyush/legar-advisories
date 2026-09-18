const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// Replace setVoiceState('thinking') since we removed it
content = content.replace(
  "    if (isVoiceModeRef.current) {\n       setVoiceState('thinking');\n       console.log(\"[CHAT] request started for Voice Mode\");\n    }",
  "    if (isVoiceModeRef.current) {\n       console.log(\"[CHAT] request started for Voice Mode\");\n    }"
);

// We had an issue with voiceState === 'thinking' in UI too. Let's find line 701.
content = content.replace(
  "voiceState === 'thinking' ? 'bg-blue-600' :",
  ""
);
content = content.replace(
  "voiceState === 'thinking' ? 'Thinking...' :",
  ""
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
