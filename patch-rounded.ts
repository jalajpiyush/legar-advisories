import fs from 'fs';

['src/pages/LegalChat.tsx', 'src/pages/Dashboard.tsx', 'src/pages/History.tsx', 'src/pages/ContactSales.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Specifically fix bg-black rounded-full for the L icon
    content = content.replace(/bg-black rounded-full/g, 'bg-black rounded');
    
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  }
});
