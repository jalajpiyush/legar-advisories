const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// I am adding the refs right here.
content = content.replace(
  '  const isLoadingRef = useRef(false);',
  '  const isLoadingRef = useRef(false);\n  const promptRef = useRef("");\n  const isVoiceModeRef = useRef(false);\n  useEffect(() => { isVoiceModeRef.current = isVoiceMode; }, [isVoiceMode]);'
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
