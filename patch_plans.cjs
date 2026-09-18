const fs = require('fs');
let content = fs.readFileSync('src/pages/Billing.tsx', 'utf8');

const plansRegex = /const DEFAULT_PLANS = \[[\s\S]*?\];\n/;

const newPlans = `const DEFAULT_PLANS = [
  {
    id: "plan_free",
    heading: "Start Free",
    description: "Explore AI-powered legal assistance with limited daily usage. Perfect for students and first-time users.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    isFree: true,
    featuresTitle: "",
    features: [
      "20 AI chats/day",
      "3 document uploads/day",
      "Basic legal research",
      "Document summaries",
      "Community support"
    ]
  },
  {
    id: "plan_individual",
    heading: "For Individuals",
    description: "Everything you need for personal legal guidance and document analysis.",
    monthlyPrice: 499,
    yearlyPrice: 4790,
    featuresTitle: "",
    features: [
      "500 AI chats/month",
      "100 document uploads",
      "Contract analysis",
      "Legal notice review",
      "Clause explanation",
      "Export PDF",
      "Priority support"
    ]
  },
  {
    id: "plan_lawyer",
    heading: "For Lawyers & Professionals",
    description: "Built for advocates, consultants, startups, and professionals who need advanced legal AI.",
    monthlyPrice: 1999,
    yearlyPrice: 19190,
    featuresTitle: "",
    features: [
      "Unlimited AI chats",
      "Unlimited document analysis",
      "OCR for scanned PDFs",
      "AI contract drafting",
      "Case law research"
    ]
  }
];\n`;

content = content.replace(plansRegex, newPlans);

content = content.replace(
  `const currentPlan = profile?.planName || (profile?.planId === 'plan_individual' ? 'Pro' : (profile?.planId === 'plan_lawyer' ? 'Max' : 'Free'));`,
  `const currentPlan = profile?.planName || (profile?.planId === 'plan_individual' ? 'Individuals' : (profile?.planId === 'plan_lawyer' ? 'Lawyers & Professionals' : 'Free'));`
);

fs.writeFileSync('src/pages/Billing.tsx', content);
