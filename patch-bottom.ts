import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  /className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-6 text-\[12px\] sm:text-\[14px\] font-semibold text-gray-600 w-full overflow-x-auto hide-scrollbar pb-1 sm:pb-0 whitespace-nowrap"/g,
  `className="flex items-center justify-start gap-2.5 sm:gap-6 text-[12px] sm:text-[14px] font-semibold text-gray-600 w-full overflow-x-auto hide-scrollbar pb-1 sm:pb-0 whitespace-nowrap"`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
