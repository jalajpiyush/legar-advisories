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

  // Add import if needed
  if (!content.includes('import { motion } from "motion/react"') && !content.includes('import { motion } from "framer-motion"')) {
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + 'import { motion } from "motion/react";\n' + content.slice(endOfLine + 1);
    }
  }

  // Replace <h1... with <motion.h1 layoutId="page-title"...
  if (content.includes('<h1 ') && !content.includes('layoutId="page-title"')) {
    content = content.replace(/<h1 /g, '<motion.h1 layoutId="page-title" ');
    content = content.replace(/<\/h1>/g, '</motion.h1>');
    changed = true;
  }
  
  // Now let's try to do the description paragraphs
  // E.g. <p className="text-[14px] text-gray-500
  // or <p className="mt-1 text-sm text-neutral-500
  // or <p className="mt-2 text-neutral-600
  // or <p className="text-[15px] sm:text-[17px] text-gray-500
  // We can just replace those specific class strings
  const pRegexes = [
    /<p (className="text-\[14px\] text-gray-500[^"]*")/g,
    /<p (className="mt-1 text-sm text-neutral-500[^"]*")/g,
    /<p (className="mt-2 text-neutral-600[^"]*")/g,
    /<p (className="text-\[15px\] sm:text-\[17px\] text-gray-500[^"]*")/g
  ];

  for (const regex of pRegexes) {
    if (regex.test(content) && !content.includes('layoutId="page-description"')) {
      content = content.replace(regex, '<motion.p layoutId="page-description" $1');
      // replace the first matching </p> after it? This is tricky with regex.
      // Wait, <motion.p layoutId="page-description" className="...">...
      // The closing tag for this would be </p> which we need to change to </motion.p>
      changed = true;
    }
  }

  if (changed) {
    // If we changed <p to <motion.p, we need to balance it.
    // Instead of regex on <p, let's just do a string replacement on the exact lines!
  }
}
