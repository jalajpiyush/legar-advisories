const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
  '      case "options":\n        return <Options />;',
  '      case "options":\n        return <Options user={currentUser} />;'
);

fs.writeFileSync('src/App.tsx', code);
