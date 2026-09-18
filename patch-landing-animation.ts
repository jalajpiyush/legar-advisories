import fs from 'fs';

let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// 1. Convert the first section title and subtitle
content = content.replace(
  /<h2 className="text-\[3rem\] md:text-\[3.5rem\] font-serif text-\[#1F1F1F\] mb-6 tracking-tight">Legal Advisories for Enterprise.<\/h2>/,
  `<motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[3rem] md:text-[3.5rem] font-serif text-[#1F1F1F] mb-6 tracking-tight">Legal Advisories for Enterprise.</motion.h2>`
);

content = content.replace(
  /<p className="text-\[20px\] md:text-\[24px\] text-\[#1F1F1F\] max-w-3xl mx-auto font-sans font-medium mb-32 leading-snug">/g,
  `<motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-[20px] md:text-[24px] text-[#1F1F1F] max-w-3xl mx-auto font-sans font-medium mb-32 leading-snug">`
);
content = content.replace(
  /time it takes to finish this sentence.\n        <\/p>/g,
  `time it takes to finish this sentence.\n        </motion.p>`
);

// 2. Convert Talk Terms section
content = content.replace(
  /<div id="talk-terms" className="max-w-\[1200px\] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 text-left mb-40">/,
  `<motion.div 
          id="talk-terms" 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 text-left mb-40">`
);

content = content.replace(
  /<\/div>\n\n        {\/\* Workspaces Section \*\/}/,
  `</motion.div>\n\n        {/* Workspaces Section */}`
);

// 3. Convert Workspaces section
content = content.replace(
  /<div className="max-w-\[1200px\] mx-auto px-6 flex flex-col lg:flex-row-reverse items-center gap-16 text-left mb-32">/,
  `<motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row-reverse items-center gap-16 text-left mb-32">`
);

content = content.replace(
  /<\/div>\n      <\/div>\n\n      {\/\* Home Page Disclaimer \*\/}/,
  `</motion.div>\n      </div>\n\n      {/* Home Page Disclaimer */}`
);

fs.writeFileSync('src/pages/Landing.tsx', content);
