const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// There are extra fragments leftover from patching:
const extraFragment = /  const toggleVoiceMode = \(\) => \{\n    if \(isVoiceMode\) \{\n      stopVoiceMode\(\);\n    \} else \{\n      let initialContext = "";\n      if \(currentFiles && currentFiles\.length > 0\) \{\n        initialContext \+= "User uploaded documents: " \+ currentFiles\.map\(f => f\.name\)\.join\(", "\);\n      \}\n      startVoiceMode\(initialContext\);\n    \}\n  \};\n        \n    utterance\.onend = \(\) => \{\n        console\.log\("\[TTS\] finished"\);\n        if \(isVoiceModeRef\.current\) \{\n            startVoiceListening\(\);\n        \}\n    \};\n        \n    utterance\.onerror = \(e\) => \{\n        console\.error\("\[TTS\] error", e\);\n        if \(isVoiceModeRef\.current\) \{\n            startVoiceListening\(\);\n        \}\n    \};\n       \n    window\.speechSynthesis\.speak\(utterance\);\n  \};\n/g;

content = content.replace(extraFragment, '');

fs.writeFileSync('src/pages/Dashboard.tsx', content);
