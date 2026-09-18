import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  /className="flex-1 sm:flex-none bg-\[#7b7b7b\] text-white px-3 sm:px-4 py-1\.5 sm:py-2 rounded-md sm:rounded-lg text-\[13px\] font-semibold hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-50"/,
  `className="flex-1 sm:flex-none bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
