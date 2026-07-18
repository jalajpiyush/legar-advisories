const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

code = code.replace(
  '<button className="text-[15px] font-medium bg-white text-black px-6 py-2.5 rounded-sm hover:bg-gray-100 transition-colors" onClick={onEnter}>\n              Request a Demo',
  '<button className="text-[15px] font-medium bg-white text-black px-6 py-2.5 rounded-sm hover:bg-gray-100 transition-colors" onClick={onContactSales || onEnter}>\n              Request a Demo'
);

code = code.replace(
  'onClick={onContactSales || onEnter}',
  'onClick={(e) => { e.preventDefault(); if (onContactSales) onContactSales(); else onEnter(); }}'
);
code = code.replace(
  'onClick={onContactSales || onEnter}',
  'onClick={(e) => { e.preventDefault(); if (onContactSales) onContactSales(); else onEnter(); }}'
);

fs.writeFileSync('src/pages/Landing.tsx', code);
