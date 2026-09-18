const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const newFunc = `const isDocumentContent = (content: string) => {
  if (!content) return false;
  
  // Extract textContent to check length without the JSON form
  let textContent = content;
  const formMatch = content.match(/\`\`\`json\\n([\\s\\S]*?)\\n\`\`\`/);
  if (formMatch) {
    try {
      const parsed = JSON.parse(formMatch[1]);
      if (parsed.type === 'dynamic_form') {
        textContent = content.replace(formMatch[0], '').trim();
      }
    } catch(e) {}
  }
  
  if (textContent.length > 150) return true;
  if (/^#+\\s/.test(textContent.trim())) return true;
  if (/(?:\\*\\*|#)\\s*(?:AGREEMENT|AFFIDAVIT|NOTICE|DEED|CONTRACT|POWER OF ATTORNEY|CERTIFICATE|MEMORANDUM|PETITION|APPLICATION)/i.test(textContent)) return true;
  return false;
};`;

content = content.replace(/const isDocumentContent = \(content: string\) => \{[\s\S]*?\};\n/, newFunc + '\n');

// Update ExportMenu to use textContent
content = content.replace(
  '{isDocumentContent(msg.content) && <ExportMenu title="Generated Document" content={msg.content} />}',
  `{isDocumentContent(msg.content) && (() => {
    let textContent = msg.content;
    const formMatch = msg.content.match(/\`\`\`json\\n([\\s\\S]*?)\\n\`\`\`/);
    if (formMatch) {
      try {
        const parsed = JSON.parse(formMatch[1]);
        if (parsed.type === 'dynamic_form') {
          textContent = msg.content.replace(formMatch[0], '').trim();
        }
      } catch(e) {}
    }
    return <ExportMenu title="Generated Document" content={textContent} />;
  })()}`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
