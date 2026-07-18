const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  'import { addHistoryItem } from "../lib/history";',
  'import { addHistoryItem, updateHistoryItemMessages } from "../lib/history";'
);

code = code.replace(
  'const [selectedTags, setSelectedTags] = useState<string[]>([]);',
  `const [selectedTags, setSelectedTags] = useState<string[]>([]);\n  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);`
);

// We need to replace the chat history saving part.
const oldFetchPart = `      if (chatHistory.length === 0) {
        addHistoryItem(currentPrompt.substring(0, 50) + (currentPrompt.length > 50 ? "..." : ""), "Chat");
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || \`Server responded with status \${res.status}\`);
      }

      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'model', content: data.reply || "Error parsing response." }]);
    } catch (error: any) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'model', content: \`**Error:** Failed to connect to the Legal Advisories backend.\\n\\nDetails: \${error.message}\` }]);
    }`;

const newFetchPart = `      let hId = currentHistoryId;
      if (!hId) {
        hId = addHistoryItem(currentPrompt.substring(0, 50) + (currentPrompt.length > 50 ? "..." : ""), "Chat", [...chatHistory, userMessage]);
        setCurrentHistoryId(hId);
      } else {
        updateHistoryItemMessages(hId, [...chatHistory, userMessage]);
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || \`Server responded with status \${res.status}\`);
      }

      const data = await res.json();
      const modelMsg = { role: 'model' as const, content: data.reply || "Error parsing response." };
      setChatHistory(prev => [...prev, modelMsg]);
      updateHistoryItemMessages(hId, [...chatHistory, userMessage, modelMsg]);
    } catch (error: any) {
      console.error(error);
      const errorMsg = { role: 'model' as const, content: \`**Error:** Failed to connect to the Legal Advisories backend.\\n\\nDetails: \${error.message}\` };
      setChatHistory(prev => [...prev, errorMsg]);
      if (currentHistoryId) {
        updateHistoryItemMessages(currentHistoryId, [...chatHistory, userMessage, errorMsg]);
      }
    }`;

code = code.replace(oldFetchPart, newFetchPart);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
