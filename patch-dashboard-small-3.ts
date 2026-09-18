import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  /className="flex items-center gap-2 text-gray-800 hover:text-black transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-\[0_1px_3px_rgb\(0,0,0,0.05\)\]"/g,
  `className="flex items-center gap-1.5 sm:gap-2 text-gray-800 hover:text-black transition-colors bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-200 shadow-[0_1px_3px_rgb(0,0,0,0.05)]"`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
