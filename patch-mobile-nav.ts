import fs from 'fs';

let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// 1. Fix Top Banner text size
content = content.replace(
  /<div className="bg-black text-white text-\[13px\] py-2.5 px-4 flex justify-center items-center gap-1.5 font-medium tracking-wide border-b border-white\/10 z-50 relative flex-wrap text-center">/,
  `<div className="bg-black text-white text-[11px] sm:text-[13px] py-2.5 px-4 flex justify-center items-center gap-1.5 font-medium tracking-wide border-b border-white/10 z-50 relative flex-wrap text-center">`
);

// 2. Fix Logo size and text on mobile
content = content.replace(
  /<div className="flex items-center gap-4 cursor-pointer" onClick={onEnter}>/,
  `<div className="flex items-center gap-2 md:gap-4 cursor-pointer" onClick={onEnter}>`
);

content = content.replace(
  /<div className="w-10 h-10 bg-black rounded flex items-center justify-center">/,
  `<div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded flex items-center justify-center shrink-0">`
);

content = content.replace(
  /<span className="text-white font-serif text-\[22px\] font-bold leading-none select-none" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>L<\/span>/,
  `<span className="text-white font-serif text-[18px] md:text-[22px] font-bold leading-none select-none" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>L</span>`
);

content = content.replace(
  /<div className="text-\[28px\] font-serif tracking-tight text-white leading-\[1.1\]">/,
  `<div className="text-[20px] md:text-[28px] font-serif tracking-tight text-white leading-[1.1]">`
);

// 3. Fix Login and Request Demo Buttons
content = content.replace(
  /<div className="flex items-center gap-4">/,
  `<div className="flex items-center gap-2 md:gap-4">`
);

content = content.replace(
  /<button \n              className="px-5 py-2 border border-white\/40 text-white rounded-\[4px\] text-\[15px\] font-medium hover:bg-white\/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"/,
  `<button 
              className="px-3 py-1.5 md:px-5 md:py-2 border border-white/40 text-white rounded-[4px] text-[13px] md:text-[15px] font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"`
);

content = content.replace(
  /<button className="px-6 py-2 bg-white text-black rounded-\[4px\] text-\[15px\] font-medium hover:bg-gray-100 transition-colors" onClick={\(e\) => { e.preventDefault\(\); if \(onContactSales\) onContactSales\(\); else onEnter\(\); }}>/,
  `<button className="px-3 py-1.5 md:px-6 md:py-2 bg-white text-black rounded-[4px] text-[12px] md:text-[15px] font-medium hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={(e) => { e.preventDefault(); if (onContactSales) onContactSales(); else onEnter(); }}>`
);

// 4. Navbar padding on mobile
content = content.replace(
  /<div className="max-w-\[1400px\] mx-auto px-6 md:px-12 flex items-center justify-between">/,
  `<div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">`
);

fs.writeFileSync('src/pages/Landing.tsx', content);
