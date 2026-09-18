const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const newFunc = `const isDocumentContent = (content: string) => {
  if (!content) return false;
  if (content.includes('"type": "dynamic_form"')) return false;
  if (content.length > 100) return true;
  if (/^#+\\s/.test(content.trim())) return true;
  if (/(?:\\*\\*|#)\\s*(?:AGREEMENT|AFFIDAVIT|NOTICE|DEED|CONTRACT|POWER OF ATTORNEY|CERTIFICATE|MEMORANDUM|PETITION|APPLICATION)/i.test(content)) return true;
  return false;
};`;

content = content.replace(/const isDocumentContent = \(content: string\) => \{[\s\S]*?\};\n/, newFunc + '\n');
fs.writeFileSync('src/pages/Dashboard.tsx', content);
