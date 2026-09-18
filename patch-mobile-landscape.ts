import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Reduce top padding on short screens
content = content.replace(
  /<div className="flex flex-1 flex-col items-center pt-16 sm:pt-8 md:pt-12 px-4 md:px-8 max-w-\[1000px\] mx-auto min-h-full pb-6 sm:pb-20 w-full">/,
  `<div className="flex flex-1 flex-col items-center pt-16 [@media(max-height:500px)]:pt-6 sm:pt-8 md:pt-12 px-4 md:px-8 max-w-[1000px] mx-auto min-h-full pb-6 sm:pb-20 w-full">`
);

// 2. Reduce title wrapper margins on short screens
content = content.replace(
  /<div className="flex flex-col items-center mt-\[2vh\] md:mt-\[5vh\] mb-4 sm:mb-8 md:mb-12">/,
  `<div className="flex flex-col items-center mt-[1vh] md:mt-[5vh] mb-2 sm:mb-8 md:mb-12">`
);

// 3. Scale down logo size and bottom margin on mobile/short screens
content = content.replace(
  /<div className="w-14 h-14 bg-black rounded flex items-center justify-center mb-6 shadow-sm">/,
  `<div className="w-12 h-12 md:w-14 md:h-14 bg-black rounded flex items-center justify-center mb-3 md:mb-6 shadow-sm">`
);

// 4. Adjust L text size
content = content.replace(
  /<span className="text-white font-serif text-\[32px\] font-bold leading-none select-none" style=\{\{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' \}\}>L<\/span>/,
  `<span className="text-white font-serif text-[26px] md:text-[32px] font-bold leading-none select-none" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>L</span>`
);

// 5. Adjust main title font size on mobile
content = content.replace(
  /<h1 className="text-\[28px\] sm:text-\[36px\] md:text-\[44px\] font-serif text-gray-900 tracking-tight text-center w-full">Legal Advisories<\/h1>/,
  `<h1 className="text-[24px] sm:text-[36px] md:text-[44px] font-serif text-gray-900 tracking-tight text-center w-full">Legal Advisories</h1>`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
