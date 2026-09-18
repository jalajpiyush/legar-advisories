import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Hide Prompts from main bar on mobile
content = content.replace(
  /<div className="relative shrink-0" ref=\{promptsRef\}>/,
  `<div className="relative shrink-0 hidden sm:block" ref={promptsRef}>`
);

// Hide Customize from main bar on mobile
content = content.replace(
  /<div className="relative shrink-0" ref=\{customizeRef\}>/,
  `<div className="relative shrink-0 hidden sm:block" ref={customizeRef}>`
);

// Hide Improve button on mobile
content = content.replace(
  /className="flex items-center gap-1\.5 sm:gap-2 hover:text-gray-900 transition-colors shrink-0"/,
  `className="hidden sm:flex items-center gap-1.5 sm:gap-2 hover:text-gray-900 transition-colors shrink-0"`
);

// Hide Deep research button on mobile
content = content.replace(
  /className=\{`flex items-center gap-1\.5 sm:gap-2 transition-colors \$\{isDeepResearch \? 'text-blue-600' : 'hover:text-gray-900'\} shrink-0`\}/,
  `className={\`hidden sm:flex items-center gap-1.5 sm:gap-2 transition-colors \${isDeepResearch ? 'text-blue-600' : 'hover:text-gray-900'} shrink-0\`}`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
