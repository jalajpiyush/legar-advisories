import fs from 'fs';

let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

content = content.replace(
  /<div className="max-w-\[1000px\] mx-auto px-6 flex flex-col md:flex-row justify-between text-left pt-20 mt-10">/,
  `<motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[1000px] mx-auto px-6 flex flex-col md:flex-row justify-between text-left pt-20 mt-10">`
);

content = content.replace(
  /<\/div>\n      <\/div>\n\n      {\/\* Home Page Disclaimer \*\/}/,
  `</motion.div>\n      </div>\n\n      {/* Home Page Disclaimer */}`
);

fs.writeFileSync('src/pages/Landing.tsx', content);
