import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  /<div className="bg-\[#f9f9fa\] border border-gray-200\/80 rounded-2xl p-5 flex flex-col relative focus-within:ring-2 focus-within:ring-gray-200 transition-all shadow-\[0_2px_12px_rgb\(0,0,0,0.02\)\]">/,
  `<div className="bg-[#f9f9fa] border border-gray-200/80 rounded-2xl p-3 sm:p-5 flex flex-col relative focus-within:ring-2 focus-within:ring-gray-200 transition-all shadow-[0_2px_12px_rgb(0,0,0,0.02)]">`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
