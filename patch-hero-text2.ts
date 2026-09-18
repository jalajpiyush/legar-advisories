import fs from 'fs';

let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

content = content.replace(
  /className="text-\[4rem\] md:text-\[6rem\] font-serif text-white leading-\[1.05\] tracking-tight mb-8"/,
  `className="text-[3.5rem] sm:text-[4rem] md:text-[6rem] font-serif text-white leading-[1.05] tracking-tight mb-8"`
);

content = content.replace(
  /className="bg-white text-black text-\[17px\] font-medium px-8 py-4 rounded-sm hover:bg-gray-100 transition-colors"/,
  `className="bg-white text-black text-[15px] sm:text-[17px] font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-sm hover:bg-gray-100 transition-colors"`
);

fs.writeFileSync('src/pages/Landing.tsx', content);
