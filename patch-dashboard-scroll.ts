import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Action buttons (Files and sources, Prompts, Customize, etc)
content = content.replace(
  /<div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-3 sm:gap-6 text-\[14px\] font-semibold text-gray-600 w-full">/,
  `<div className="flex items-center justify-start gap-3 sm:gap-6 text-[13px] sm:text-[14px] font-semibold text-gray-600 w-full overflow-x-auto hide-scrollbar pb-1 sm:pb-0 whitespace-nowrap">`
);

// We need to make sure the relative groups have shrink-0 so they don't get squished
content = content.replace(
  /<div className="relative shrink-0 snap-start" ref=\{sourcesRef\}>/g,
  `<div className="relative shrink-0" ref={sourcesRef}>`
);
content = content.replace(
  /<div className="relative shrink-0 snap-start" ref=\{promptsRef\}>/g,
  `<div className="relative shrink-0" ref={promptsRef}>`
);
content = content.replace(
  /<div className="relative shrink-0 snap-start" ref=\{customizeRef\}>/g,
  `<div className="relative shrink-0" ref={customizeRef}>`
);

content = content.replace(
  /className="flex items-center gap-2 hover:text-gray-900 transition-colors shrink-0 snap-start"/g,
  `className="flex items-center gap-2 hover:text-gray-900 transition-colors shrink-0"`
);
content = content.replace(
  /className=\{`flex items-center gap-2 transition-colors \$\{isDeepResearch \? 'text-blue-600' : 'hover:text-gray-900'\} shrink-0 snap-start`\}/g,
  `className={\`flex items-center gap-2 transition-colors \${isDeepResearch ? 'text-blue-600' : 'hover:text-gray-900'} shrink-0\`}`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
