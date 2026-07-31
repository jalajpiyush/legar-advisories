const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('} catch') && !lines[i].includes('try {')) {
    // go up and find the start of the block
    let j = i - 1;
    let found = false;
    let tryIndent = "    ";
    
    // First, try to find an if/else or function definition that needs a try
    while (j >= 0) {
      if (lines[j].includes('async (req: AuthRequest, res) => {') ||
          lines[j].includes('async (req, res) => {') ||
          lines[j].includes('upload.single("file"), async (req: AuthRequest, res) => {') ||
          lines[j].includes('express.json(), async (req, res) => {') ||
          lines[j].includes('app.get(') ||
          lines[j].includes('app.post(') ||
          lines[j].includes('app.put(') ||
          lines[j].includes('app.delete(') ||
          lines[j].includes('const optionalAuth =') ||
          lines[j].includes('async function extractTextFromBuffer') ||
          lines[j].includes('if (geminiKey) {') ||
          lines[j].includes('if (docId) {') ||
          lines[j].includes('await adminDb.runTransaction') ||
          lines[j].match(/try\s*\{/)) { // If we hit a try, stop
        
        if (lines[j].match(/try\s*\{/)) {
          // already has try
          break;
        }

        // We found a block that usually starts with try
        // Need to be careful. Let's just insert it after this line.
        if (lines[j].includes('async (req: AuthRequest, res) => {') || lines[j].includes('async (req, res) => {')) {
           // insert try { after usage checks
           let k = j + 1;
           while (lines[k].includes('const usageCheck') || lines[k].includes('if (!usageCheck.allowed)') || lines[k].includes('return res.status(403)')) {
             k++;
           }
           if (lines[k].includes('}')) k++; // skip the closing brace of the if block
           
           // Now insert try
           lines.splice(k, 0, "    try {");
           i++; // adjust for added line
           found = true;
           break;
        } else if (lines[j].includes('const optionalAuth =')) {
           lines.splice(j + 6, 0, "  try {");
           i++; found = true; break;
        } else if (lines[j].includes('async function extractTextFromBuffer')) {
           lines.splice(j + 2, 0, "  try {");
           i++; found = true; break;
        } else if (lines[j].includes('if (geminiKey) {')) {
           lines.splice(j + 1, 0, "        try {");
           i++; found = true; break;
        } else if (lines[j].includes('await adminDb.runTransaction')) {
           lines.splice(j, 0, "  try {");
           i++; found = true; break;
        }
      }
      
      // Let's also look for `const token = authHeader.split('Bearer ')[1];`
      if (lines[j].includes("const token = authHeader.split('Bearer ')[1];")) {
         lines.splice(j + 1, 0, "  try {");
         i++; found = true; break;
      }
      
      // What about razorpay order create?
      if (lines[j].includes("const order = await razorpay.orders.create(options);")) {
         // wait, razorpay try is usually before `const options`
      }
      
      j--;
    }
  }
}

fs.writeFileSync('server2.ts', lines.join('\n'));
