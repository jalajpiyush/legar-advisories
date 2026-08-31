import fs from 'fs';

let content = fs.readFileSync('src/pages/Options.tsx', 'utf8');

const importReplacement = `import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Key, Database, Globe, Monitor, CreditCard } from 'lucide-react';
import { User as FirebaseUser, db } from '../lib/auth';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Billing } from './Billing';`;

content = content.replace(/import React, \{ useState \} from 'react';[\s\S]*?import \{ Billing \} from '\.\/Billing';/, importReplacement);

const fetchReplacement = `  React.useEffect(() => {
    const fetchDashboard = async () => {
      if (activeTab === 'overview' && user) {
        try {
          // Fetch user data directly from Firestore client side
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.exists() ? userDoc.data() : { plan: 'Free' };
          
          let rawPlan = userData?.plan || 'Free';
          let plan = 'Free';
          const str = String(rawPlan).toLowerCase().trim();
          if (str.includes('lawyer') || str.includes('pro') || str.includes('enterprise')) plan = 'Lawyer';
          else if (str.includes('individual')) plan = 'Individual';
          
          const isLawyer = plan === 'Lawyer';
          const isIndividual = plan === 'Individual';
          
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const monthStr = todayStr.substring(0, 7);
      
          let chatUsedToday = Number(userData?.chatUsedToday) || 0;
          let chatUsedMonth = Number(userData?.chatUsedMonth) || 0;
          let documentUsedToday = Number(userData?.documentUsedToday) || 0;
          let documentUsedMonth = Number(userData?.documentUsedMonth) || 0;
      
          if (userData?.lastChatDate !== todayStr) chatUsedToday = 0;
          if (userData?.lastDocDate !== todayStr) documentUsedToday = 0;
          if (userData?.lastChatMonth !== monthStr) chatUsedMonth = 0;
          if (userData?.lastDocMonth !== monthStr) documentUsedMonth = 0;
          
          let billingHistory: any[] = [];
          try {
            const billingSnap = await getDocs(query(collection(db, 'users', user.uid, 'billing_history'), orderBy('created_at', 'desc'), limit(5)));
            billingHistory = billingSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          } catch(e) {}
          
          let savedDocs: any[] = [];
          try {
            const docsSnap = await getDocs(query(collection(db, 'documents'), where('userId', '==', user.uid), orderBy('created_at', 'desc'), limit(5)));
            savedDocs = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          } catch(e) {}
          
          setDashboardData({
            plan: plan,
            usage: {
              chat: isIndividual ? chatUsedMonth : chatUsedToday,
              doc: isIndividual ? documentUsedMonth : documentUsedToday
            },
            billingHistory,
            savedDocs,
            limits: {
              chat: isLawyer ? -1 : (isIndividual ? 500 : 20),
              doc: isLawyer ? -1 : (isIndividual ? 100 : 3)
            }
          });
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
        }
      }
    };
    fetchDashboard();
  }, [activeTab, user]);`;

content = content.replace(/  React\.useEffect\(\(\) => \{[\s\S]*?  \}, \[activeTab, user\]\);/, fetchReplacement);
fs.writeFileSync('src/pages/Options.tsx', content);
