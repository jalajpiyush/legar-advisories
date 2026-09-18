const fs = require('fs');
let c = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
const toInsert = `
const isDocumentMessage = (content: string) => {
  if (!content || content.length < 150) return false;
  if (/(^|\\n)#{1,4}\\s/.test(content)) return true;
  if (/(^|\\n)(Dear |To:|From:|Date:|Subject:|RE:)/i.test(content)) return true;
  if (/(^|\\n)(THIS AGREEMENT|WHEREAS|NOW THEREFORE|IN WITNESS WHEREOF|KNOW ALL MEN BY THESE PRESENTS)/i.test(content)) return true;
  if (/\\[(Name|Date|Address|Company|Client|Insert|Party)[^\\]]*\\]/i.test(content)) return true;
  return false;
};
`;
c = c.replace("export function Dashboard", toInsert + "\nexport function Dashboard");
fs.writeFileSync('src/pages/Dashboard.tsx', c);
