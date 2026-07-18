const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  '      } else if (!user && currentPage !== "landing") {\n        setCurrentPage("landing");\n      }',
  '      } else if (!user && currentPage !== "landing" && currentPage !== "contact-sales") {\n        setCurrentPage("landing");\n      }'
);

fs.writeFileSync('src/App.tsx', code);
