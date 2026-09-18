import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Update the buttons wrapper to be horizontally scrollable on mobile
content = content.replace(
  /<div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-3 sm:gap-6 text-\[14px\] font-semibold text-gray-600">/,
  `<div className="flex items-center sm:flex-wrap justify-start gap-4 sm:gap-6 text-[14px] font-semibold text-gray-600 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full snap-x">`
);

// We need to add shrink-0 to each button container inside that row
content = content.replace(
  /<div className="relative" ref=\{sourcesRef\}>/g,
  `<div className="relative shrink-0 snap-start" ref={sourcesRef}>`
);
content = content.replace(
  /<div className="relative" ref=\{promptsRef\}>/g,
  `<div className="relative shrink-0 snap-start" ref={promptsRef}>`
);
content = content.replace(
  /<div className="relative" ref=\{customizeRef\}>/g,
  `<div className="relative shrink-0 snap-start" ref={customizeRef}>`
);

// For Improve and Deep research which are just buttons:
content = content.replace(
  /className="flex items-center gap-2 hover:text-gray-900 transition-colors"/g,
  `className="flex items-center gap-2 hover:text-gray-900 transition-colors shrink-0 snap-start"`
);
content = content.replace(
  /className=\{`flex items-center gap-2 transition-colors \$\{isDeepResearch \? 'text-blue-600' : 'hover:text-gray-900'\}`\}/g,
  `className={\`flex items-center gap-2 transition-colors \${isDeepResearch ? 'text-blue-600' : 'hover:text-gray-900'} shrink-0 snap-start\`}`
);

// We also need to add hide-scrollbar class to index.css if not there, but we can just use tailwind arbitrary variant or standard scrollbar hiding.
// Tailwind doesn't have a built-in hide-scrollbar utility without a plugin. 
// We can inject standard CSS class in index.css

fs.writeFileSync('src/pages/Dashboard.tsx', content);

let cssContent = fs.readFileSync('src/index.css', 'utf8');
if (!cssContent.includes('.hide-scrollbar')) {
  cssContent += `
@layer utilities {
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
}
`;
  fs.writeFileSync('src/index.css', cssContent);
}

