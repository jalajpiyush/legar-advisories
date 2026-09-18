import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// For "Choose project" and "Set client matter" buttons
content = content.replace(
  /<div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mb-3 px-1 text-\[14px\] font-semibold text-gray-900">/,
  `<div className="flex items-center sm:flex-wrap justify-start gap-4 md:gap-6 mb-3 px-1 text-[14px] font-semibold text-gray-900 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full snap-x">`
);

// We need to add shrink-0 to each button container inside that row too!
content = content.replace(
  /<div className="relative group">/g,
  `<div className="relative group shrink-0 snap-start">`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
