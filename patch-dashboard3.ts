import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Undo overflow-x-auto on the buttons
content = content.replace(
  /className="flex items-center sm:flex-wrap justify-start gap-4 sm:gap-6 text-\[14px\] font-semibold text-gray-600 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full snap-x"/,
  `className="flex flex-wrap items-center justify-start gap-x-4 gap-y-3 sm:gap-6 text-[14px] font-semibold text-gray-600 w-full"`
);

// Undo overflow-x-auto on Choose Project
content = content.replace(
  /className="flex items-center sm:flex-wrap justify-start gap-4 md:gap-6 mb-3 px-1 text-\[14px\] font-semibold text-gray-900 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full snap-x"/,
  `className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mb-3 px-1 text-[14px] font-semibold text-gray-900 w-full"`
);

// And we can leave shrink-0 snap-start, they won't hurt in flex-wrap.

fs.writeFileSync('src/pages/Dashboard.tsx', content);
