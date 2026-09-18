import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// textarea min-height
content = content.replace(
  /className=\{`w-full bg-transparent resize-none outline-none text-gray-800 placeholder:text-gray-400 \$\{chatHistory.length > 0 \? 'min-h-\[60px\] sm:min-h-\[80px\]' : 'min-h-\[60px\] \[@media\(max-height:500px\)\]:min-h-\[60px\] sm:min-h-\[140px\] sm:\[@media\(max-height:500px\)\]:min-h-\[80px\]'\} text-\[16px\] leading-relaxed font-medium`\}/,
  `className={\`w-full bg-transparent resize-none outline-none text-gray-800 placeholder:text-gray-400 \${chatHistory.length > 0 ? 'min-h-[40px] sm:min-h-[80px]' : 'min-h-[40px] sm:min-h-[140px] sm:[@media(max-height:500px)]:min-h-[80px]'} text-[15px] sm:text-[16px] leading-relaxed font-medium\`}`
);

// gap between text area and buttons
content = content.replace(
  /<div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">/,
  `<div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 sm:mt-4 gap-2 sm:gap-4">`
);

// Ask Legal Advisories button margin
content = content.replace(
  /<div className="flex items-center justify-start gap-5 w-full sm:w-auto mt-4 sm:mt-0">/,
  `<div className="flex items-center justify-start gap-5 w-full sm:w-auto mt-1 sm:mt-0">`
);

// Make the action bar buttons slightly smaller
content = content.replace(
  /<div className="flex items-center justify-start gap-3 sm:gap-6 text-\[13px\] sm:text-\[14px\] font-semibold text-gray-600 w-full overflow-x-auto hide-scrollbar pb-1 sm:pb-0 whitespace-nowrap">/,
  `<div className="flex items-center justify-start gap-2.5 sm:gap-6 text-[12px] sm:text-[14px] font-semibold text-gray-600 w-full overflow-x-auto hide-scrollbar pb-1 sm:pb-0 whitespace-nowrap">`
);

content = content.replace(
  /<button\n                  onClick=\{\(\) => setSourcesOpen\(!sourcesOpen\)\}\n                  className="flex items-center gap-2 text-gray-800 hover:text-black transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-\[0_1px_3px_rgb\(0,0,0,0.05\)\]"\n                >/,
  `<button
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 text-gray-800 hover:text-black transition-colors bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-200 shadow-[0_1px_3px_rgb(0,0,0,0.05)]"
                >`
);

content = content.replace(/<Plus className="w-\[18px\] h-\[18px\]" \/>/g, `<Plus className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />`);
content = content.replace(/<ListPlus className="w-\[18px\] h-\[18px\]" \/>/g, `<ListPlus className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />`);
content = content.replace(/<SlidersHorizontal className="w-\[18px\] h-\[18px\]" \/>/g, `<SlidersHorizontal className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />`);
content = content.replace(/<Wand2 className="w-\[18px\] h-\[18px\]" \/>/g, `<Wand2 className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />`);
content = content.replace(/<Activity className="w-\[18px\] h-\[18px\]" \/>/g, `<Activity className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />`);

content = content.replace(
  /className="flex items-center gap-2 hover:text-gray-900 transition-colors shrink-0"/g,
  `className="flex items-center gap-1.5 sm:gap-2 hover:text-gray-900 transition-colors shrink-0"`
);
content = content.replace(
  /className=\{`flex items-center gap-2 transition-colors \$\{isDeepResearch \? 'text-blue-600' : 'hover:text-gray-900'\} shrink-0`\}/g,
  `className={\`flex items-center gap-1.5 sm:gap-2 transition-colors \${isDeepResearch ? 'text-blue-600' : 'hover:text-gray-900'} shrink-0\`}`
);

// Reduce title sizes slightly for mobile
content = content.replace(
  /<div className="w-12 h-12 md:w-14 md:h-14 bg-black rounded flex items-center justify-center mb-3 md:mb-6 shadow-sm">/,
  `<div className="w-10 h-10 md:w-14 md:h-14 bg-black rounded flex items-center justify-center mb-2 md:mb-6 shadow-sm">`
);

content = content.replace(
  /<span className="text-white font-serif text-\[26px\] md:text-\[32px\] font-bold leading-none select-none"/,
  `<span className="text-white font-serif text-[22px] md:text-[32px] font-bold leading-none select-none"`
);

content = content.replace(
  /<h1 className="text-\[24px\] sm:text-\[36px\] md:text-\[44px\] font-serif text-gray-900 tracking-tight text-center w-full">Legal Advisories<\/h1>/,
  `<h1 className="text-[22px] sm:text-[36px] md:text-[44px] font-serif text-gray-900 tracking-tight text-center w-full">Legal Advisories</h1>`
);


// And finally, make the bottom pills margin smaller
content = content.replace(
  /<div className="flex flex-wrap items-center justify-center gap-2 mt-6">/,
  `<div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 text-[11px] sm:text-[12px]">`
);


fs.writeFileSync('src/pages/Dashboard.tsx', content);
