import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  /<div className="flex flex-1 flex-col items-center pt-16 \[@media\(max-height:500px\)\]:pt-6 sm:pt-8 md:pt-12 px-4 md:px-8 max-w-\[1000px\] mx-auto min-h-full pb-6 sm:pb-20 w-full">/,
  `<div className="flex flex-1 flex-col items-center pt-8 [@media(max-height:500px)]:pt-6 sm:pt-8 md:pt-12 px-4 md:px-8 max-w-[1000px] mx-auto min-h-full pb-6 sm:pb-20 w-full">`
);

// Reduce padding inside the textarea container
content = content.replace(
  /<div className="bg-\[#f9f9fa\] border border-gray-200\/80 rounded-2xl p-3 sm:p-5 flex flex-col relative focus-within:ring-2 focus-within:ring-gray-200 transition-all shadow-\[0_2px_12px_rgb\(0,0,0,0.02\)\]">/,
  `<div className="bg-[#f9f9fa] border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col relative focus-within:ring-2 focus-within:ring-gray-200 transition-all shadow-[0_2px_12px_rgb(0,0,0,0.02)]">`
);

// Also the Ask button could be a bit smaller padded
content = content.replace(
  /<button\n                onClick=\{handleAskLegalAdvisories\}\n                disabled=\{isLoading \|\| \(\!prompt.trim\(\) && uploadedFiles.length === 0\)\}\n                className="w-full sm:w-auto bg-black text-white px-5 py-2.5 rounded-lg text-\[14px\] font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"\n              >/,
  `<button
                onClick={handleAskLegalAdvisories}
                disabled={isLoading || (!prompt.trim() && uploadedFiles.length === 0)}
                className="w-full sm:w-auto bg-black text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-[13px] sm:text-[14px] font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
              >`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
