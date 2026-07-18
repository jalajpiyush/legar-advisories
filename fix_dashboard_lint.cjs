const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const oldCatch = `    } catch (error: any) {
      console.error(error);
      const errorMsg = { role: 'model' as const, content: \`**Error:** Failed to connect to the Legal Advisories backend.\\n\\nDetails: \${error.message}\` };
      setChatHistory(prev => [...prev, errorMsg]);
      if (currentHistoryId) {
        updateHistoryItemMessages(currentHistoryId, [...chatHistory, userMessage, errorMsg]);
      }
    } finally {`;

const newCatch = `    } catch (error: any) {
      console.error(error);
      const errorMsg = { role: 'model' as const, content: \`**Error:** Failed to connect to the Legal Advisories backend.\\n\\nDetails: \${error.message}\` };
      setChatHistory(prev => {
        const newHistory = [...prev, errorMsg];
        if (currentHistoryId) {
          updateHistoryItemMessages(currentHistoryId, newHistory);
        }
        return newHistory;
      });
    } finally {`;

code = code.replace(oldCatch, newCatch);

const oldSuccess = `      const data = await res.json();
      const modelMsg = { role: 'model' as const, content: data.reply || "Error parsing response." };
      setChatHistory(prev => [...prev, modelMsg]);
      updateHistoryItemMessages(hId, [...chatHistory, userMessage, modelMsg]);`;

const newSuccess = `      const data = await res.json();
      const modelMsg = { role: 'model' as const, content: data.reply || "Error parsing response." };
      setChatHistory(prev => {
        const newHistory = [...prev, modelMsg];
        updateHistoryItemMessages(hId, newHistory);
        return newHistory;
      });`;

code = code.replace(oldSuccess, newSuccess);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
