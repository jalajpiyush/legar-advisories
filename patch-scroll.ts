import fs from 'fs';

let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// Replace all once: true with once: false
content = content.replace(/once: true/g, 'once: false');

// Let's add staggered children animation to the stats section
// Replace the stats section divs with motion.divs
content = content.replace(
  /<div className="mb-10 md:mb-0">\n            <div className="text-\[4.5rem\] font-serif text-\[#1F1F1F\] mb-1 leading-none tracking-tight">80%<\/div>/,
  `<motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            viewport={{ once: false }}
            className="mb-10 md:mb-0">
            <div className="text-[4.5rem] font-serif text-[#1F1F1F] mb-1 leading-none tracking-tight">80%</div>`
);

content = content.replace(
  /<\/div>\n          <div className="mb-10 md:mb-0">\n            <div className="text-\[4.5rem\] font-serif text-\[#1F1F1F\] mb-1 leading-none tracking-tight">500k\+<\/div>/,
  `</motion.div>\n          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: false }}
            className="mb-10 md:mb-0">
            <div className="text-[4.5rem] font-serif text-[#1F1F1F] mb-1 leading-none tracking-tight">500k+</div>`
);

content = content.replace(
  /<\/div>\n          <div>\n            <div className="text-\[4.5rem\] font-serif text-\[#1F1F1F\] mb-1 leading-none tracking-tight">24\/7<\/div>/,
  `</motion.div>\n          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            viewport={{ once: false }}
            className="mb-10 md:mb-0">
            <div className="text-[4.5rem] font-serif text-[#1F1F1F] mb-1 leading-none tracking-tight">24/7</div>`
);

content = content.replace(
  /<\/div>\n        <\/motion.div>/,
  `</motion.div>\n        </motion.div>`
);

fs.writeFileSync('src/pages/Landing.tsx', content);
