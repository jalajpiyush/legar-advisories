const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const helper = `
const isDocumentContent = (content: string) => {
  if (!content) return false;
  if (content.length < 50 || content.includes('"type": "dynamic_form"')) return false;
  if (/^#+\\s/.test(content.trim())) return true;
  if (/(?:\\*\\*|#)\\s*(?:AGREEMENT|AFFIDAVIT|NOTICE|DEED|CONTRACT|POWER OF ATTORNEY|CERTIFICATE|MEMORANDUM|PETITION|APPLICATION)/i.test(content)) return true;
  return false;
};

export function Dashboard`;

content = content.replace('export function Dashboard', helper);

// Update where ExportMenu is rendered for messages
content = content.replace(
  '<ExportMenu title="Generated Document" content={msg.content} />',
  '{isDocumentContent(msg.content) && <ExportMenu title="Generated Document" content={msg.content} />}'
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
