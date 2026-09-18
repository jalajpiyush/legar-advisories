const fs = require('fs');
const path = require('path');

const targetFiles = [
  'Cases.tsx',
  'Compliance.tsx',
  'ContractReview.tsx',
  'Create.tsx',
  'Dashboard.tsx',
  'DocumentAnalysis.tsx',
  'Generator.tsx',
  'Guidance.tsx',
  'Help.tsx',
  'History.tsx',
  'Knowledge.tsx',
  'LegalResearch.tsx',
  'Library.tsx',
  'Options.tsx',
  'SharedThreads.tsx',
  'Tips.tsx',
  'Vault.tsx',
  'Workflows.tsx'
];

for (const file of targetFiles) {
  const filePath = path.join(__dirname, 'src/pages', file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace <h1... with <motion.h1 layoutId="page-title"...
  if (content.includes('<h1 ') && !content.includes('layoutId="page-title"')) {
    content = content.replace(/<h1 /g, '<motion.h1 layoutId="page-title" ');
    content = content.replace(/<\/h1>/g, '</motion.h1>');
    changed = true;
  }
  
  // A simple hack to change the description tags.
  // We look for '<p className="text-[14px] text-gray-500' and change it to '<motion.p layoutId="page-description" className...'
  // Then we find the first '</p>' after it and change to '</motion.p>'
  
  const searchStrings = [
    '<p className="text-[14px] text-gray-500',
    '<p className="mt-1 text-sm text-neutral-500',
    '<p className="mt-2 text-neutral-600',
    '<p className="text-[15px] sm:text-[17px] text-gray-500'
  ];

  for (const s of searchStrings) {
    let idx = content.indexOf(s);
    if (idx !== -1 && !content.includes('layoutId="page-description"')) {
      // Find the closing </p>
      let closeIdx = content.indexOf('</p>', idx);
      if (closeIdx !== -1) {
        let before = content.slice(0, idx);
        let match = content.slice(idx, idx + 2); // '<p'
        let rest = content.slice(idx + 2, closeIdx);
        let after = content.slice(closeIdx + 4);
        content = before + '<motion.p layoutId="page-description"' + rest + '</motion.p>' + after;
        changed = true;
      }
    }
  }

  // Add import if needed
  if (changed && !content.includes('import { motion } from "motion/react"') && !content.includes('import { motion } from "framer-motion"')) {
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + 'import { motion } from "motion/react";\n' + content.slice(endOfLine + 1);
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
  }
}
