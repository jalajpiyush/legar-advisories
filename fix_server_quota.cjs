const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/userData\?\.plan === 'Professional' \|\| userData\?\.plan === 'Enterprise' \|\| userData\?\.plan === 'Starter'/g, "userData?.plan !== 'Free' && userData?.plan !== 'None'");
fs.writeFileSync('server.ts', code);
