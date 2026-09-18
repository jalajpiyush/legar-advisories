import fs from 'fs';

let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

content = content.replace(
  /className="text-\[5rem\] md:text-\[7.5rem\] font-serif text-white leading-\[0.9\] tracking-tight mb-8"/,
  `className="text-[4.2rem] sm:text-[5.5rem] md:text-[7.5rem] font-serif text-white leading-[0.9] tracking-tight mb-8"`
);

content = content.replace(
  /className="text-\[22px\] md:text-\[26px\] text-white\/95 font-light leading-\[1.4\] mb-12 max-w-xl"/,
  `className="text-[18px] sm:text-[22px] md:text-[26px] text-white/95 font-light leading-[1.4] mb-12 max-w-xl"`
);

// We need to check if there is any other overlap in the hero buttons
content = content.replace(
  /className="bg-white text-black text-\[17px\] font-medium px-8 py-4 rounded-sm hover:bg-gray-100 transition-colors"/,
  `className="bg-white text-black text-[15px] sm:text-[17px] font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-sm hover:bg-gray-100 transition-colors"`
);

fs.writeFileSync('src/pages/Landing.tsx', content);
