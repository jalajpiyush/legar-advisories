import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  /className=\{`w-full bg-transparent resize-none outline-none text-gray-800 placeholder:text-gray-400 \$\{chatHistory.length > 0 \? 'min-h-\[60px\] sm:min-h-\[80px\]' : 'min-h-\[80px\] sm:min-h-\[140px\]'\} text-\[16px\] leading-relaxed font-medium`\}/,
  `className={\`w-full bg-transparent resize-none outline-none text-gray-800 placeholder:text-gray-400 \${chatHistory.length > 0 ? 'min-h-[60px] sm:min-h-[80px]' : 'min-h-[60px] [@media(max-height:500px)]:min-h-[60px] sm:min-h-[140px] sm:[@media(max-height:500px)]:min-h-[80px]'} text-[16px] leading-relaxed font-medium\`}`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
