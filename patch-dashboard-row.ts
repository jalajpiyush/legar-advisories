import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  /<div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mb-3 px-1 text-\[14px\] font-semibold text-gray-900 w-full">/,
  `<div className="flex items-center justify-center sm:justify-start gap-4 md:gap-6 mb-3 px-1 text-[13px] md:text-[14px] font-semibold text-gray-900 w-full">`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
