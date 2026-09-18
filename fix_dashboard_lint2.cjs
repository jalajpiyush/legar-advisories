const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Insert the fixed hook after chatHistory is declared
const correctHook = `
  useEffect(() => {
    if (chatHistory.length === 0 && user?.uid) {
      auth.currentUser?.getIdToken().then(token => {
        fetch('/api/suggestions', {
          headers: { 'Authorization': \`Bearer \${token || ''}\` }
        })
        .then(res => res.json())
        .then(data => {
           if (data && (data.templates || data.precedents)) {
               setKnowledgeSuggestions(data);
           }
        })
        .catch(err => console.error("Failed to load knowledge graph", err));
      }).catch(console.error);
    }
  }, [chatHistory.length, user?.uid]);
`;

content = content.replace(
  'const [chatHistory, setChatHistory] = useState<{role: \'user\' | \'model\', content: string, citations?: {source: string, act: string, section: string, doc: string}[]}[]>([]);',
  `const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string, citations?: {source: string, act: string, section: string, doc: string}[]}[]>([]);\n${correctHook}`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
