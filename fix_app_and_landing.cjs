const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');
if (!app.includes('import { ContactSales }')) {
  app = app.replace(
    "import { Options } from './pages/Options';",
    "import { Options } from './pages/Options';\nimport { ContactSales } from './pages/ContactSales';"
  );
}

if (!app.includes('"contact-sales"')) {
  app = app.replace(
    '  const [currentPage, setCurrentPage] = useState<PageId | "landing">("landing");',
    '  const [currentPage, setCurrentPage] = useState<PageId | "landing" | "contact-sales">("landing");'
  );

  app = app.replace(
    '  if (currentPage === "landing") {\n    return <Landing onEnter={() => setCurrentPage("dashboard")} />;\n  }',
    '  if (currentPage === "landing") {\n    return <Landing onEnter={() => setCurrentPage("dashboard")} onContactSales={() => setCurrentPage("contact-sales")} />;\n  }\n  if (currentPage === "contact-sales") {\n    return <ContactSales onBack={() => setCurrentPage("landing")} />;\n  }'
  );
}

fs.writeFileSync('src/App.tsx', app);

let landing = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');
if (!landing.includes('onContactSales?: () => void;')) {
  landing = landing.replace(
    'interface LandingProps {\n  onEnter: () => void;\n}',
    'interface LandingProps {\n  onEnter: () => void;\n  onContactSales?: () => void;\n}'
  );
}

landing = landing.replace(
  'export function Landing({ onEnter }: LandingProps)',
  'export function Landing({ onEnter, onContactSales }: LandingProps)'
);

landing = landing.replace(
  '<button className="bg-white text-black text-[17px] font-medium px-8 py-4 rounded-sm hover:bg-gray-100 transition-colors" onClick={onEnter}>\n                Request a Demo\n              </button>',
  '<button className="bg-white text-black text-[17px] font-medium px-8 py-4 rounded-sm hover:bg-gray-100 transition-colors" onClick={onContactSales || onEnter}>\n                Request a Demo\n              </button>'
);

fs.writeFileSync('src/pages/Landing.tsx', landing);
