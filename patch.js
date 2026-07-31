const fs = require('fs');
let content = fs.readFileSync('src/pages/Billing.tsx', 'utf8');
content = content.replace('import { auth } from "../lib/auth";', 'import { auth, db } from "../lib/auth";\nimport { doc, getDoc } from "firebase/firestore";');
content = content.replace('const [discountPercent, setDiscountPercent] = useState(0);', 'const [appliedCoupon, setAppliedCoupon] = useState<any>(null);');
fs.writeFileSync('src/pages/Billing.tsx', content);
