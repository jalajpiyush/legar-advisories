const fs = require('fs');
let c = fs.readFileSync('src/pages/Cases.tsx', 'utf8');
c = c.replace('import { \nimport { motion } from "motion/react";', 'import { motion } from "motion/react";\nimport {');
c = c.replace('import { import { motion } from "motion/react";', 'import { motion } from "motion/react";\nimport {');
fs.writeFileSync('src/pages/Cases.tsx', c);
