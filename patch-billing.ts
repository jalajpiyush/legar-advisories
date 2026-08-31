import fs from 'fs';

let content = fs.readFileSync('src/pages/Billing.tsx', 'utf8');

const replacement = `      // Also fetch billing history from backend
      const fetchProfileAndHistory = async () => {
        try {
          const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
          const billingSnap = await getDocs(query(collection(db, 'users', user.uid, 'billing_history'), orderBy('created_at', 'desc'), limit(10)));
          const historyData = billingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setHistory(historyData);
        } catch (err) {
          console.error("Error fetching user history:", err);
        } finally {
          setLoading(false);
        }
      };`;

content = content.replace(/      \/\/ Also fetch billing history from backend[\s\S]*?      \};/, replacement);
fs.writeFileSync('src/pages/Billing.tsx', content);
