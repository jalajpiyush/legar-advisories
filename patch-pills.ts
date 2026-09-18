import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  /<div className="flex flex-wrap items-center justify-center gap-1\.5 sm:gap-2 mt-4 sm:mt-6 text-\[11px\] sm:text-\[12px\]">/,
  `<div className="hidden sm:flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 text-[11px] sm:text-[12px]">`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
