import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Change the action buttons row to justify-start on mobile and use smaller gaps
content = content.replace(
  /<div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-\[14px\] font-semibold text-gray-600">/,
  `<div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-3 sm:gap-6 text-[14px] font-semibold text-gray-600">`
);

// 2. Change the Ask Legal Advisories button container to not have huge top margin on mobile, maybe gap-4
content = content.replace(
  /<div className="flex items-center justify-center sm:justify-start gap-5 w-full sm:w-auto mt-2 sm:mt-0">/,
  `<div className="flex items-center justify-start gap-5 w-full sm:w-auto mt-4 sm:mt-0">`
);

// 3. For the pills below, maybe keep them centered but ensure they look good, or make them scrollable horizontally on mobile?
// Let's just make them justify-center with gap-2
content = content.replace(
  /<div className="flex flex-wrap items-center justify-center gap-3 mt-8">/,
  `<div className="flex flex-wrap items-center justify-center gap-2 mt-6">`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
