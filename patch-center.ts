import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Top action buttons (Choose project, Set client matter)
content = content.replace(
  /<div className="flex items-center justify-center md:justify-start gap-4 md:gap-6 mb-3 px-1 text-\[13px\] md:text-\[14px\] font-semibold text-gray-900 w-full whitespace-nowrap overflow-x-auto hide-scrollbar">/g,
  `<div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-3 px-1 text-[13px] md:text-[14px] font-semibold text-gray-900 w-full">`
);

// If the above replace didn't hit because it was already modified to something else, let's catch it:
content = content.replace(
  /<div className="flex items-center justify-center gap-4 md:gap-6 mb-3 px-1 text-\[13px\] md:text-\[14px\] font-semibold text-gray-900 w-full whitespace-nowrap overflow-x-auto hide-scrollbar">/g,
  `<div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-3 px-1 text-[13px] md:text-[14px] font-semibold text-gray-900 w-full">`
);

// Inner prompt action buttons
// "flex items-center justify-start gap-2.5 sm:gap-6 text-[12px] sm:text-[14px] font-semibold text-gray-600 w-full overflow-x-auto hide-scrollbar pb-1 sm:pb-0 whitespace-nowrap"
// Let's make it justify-center
content = content.replace(
  /className="flex items-center justify-start gap-2.5 sm:gap-6 text-\[12px\] sm:text-\[14px\] font-semibold text-gray-600 w-full overflow-x-auto hide-scrollbar pb-1 sm:pb-0 whitespace-nowrap"/g,
  `className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-6 text-[12px] sm:text-[14px] font-semibold text-gray-600 w-full overflow-x-auto hide-scrollbar pb-1 sm:pb-0 whitespace-nowrap"`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
