const fs = require('fs');

let code = fs.readFileSync('src/pages/Options.tsx', 'utf-8');

if (!code.includes("import { getTheme, setTheme } from '../lib/theme';")) {
  code = code.replace(
    "import { User as FirebaseUser } from 'firebase/auth';",
    "import { User as FirebaseUser } from 'firebase/auth';\nimport { getTheme, setTheme } from '../lib/theme';"
  );
}

// Add state for theme
if (!code.includes("const [theme, setLocalTheme] = useState")) {
  code = code.replace(
    '  const [activeTab, setActiveTab] = useState("account");',
    '  const [activeTab, setActiveTab] = useState("account");\n  const [theme, setLocalTheme] = useState(getTheme());'
  );
}

// Replace the select to use state
const oldSelect = `<select className="px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 bg-white">
                      <option>System Default</option>
                      <option>Light</option>
                      <option>Dark</option>
                    </select>`;

const newSelect = `<select 
                      value={theme}
                      onChange={(e) => {
                        const newTheme = e.target.value;
                        setLocalTheme(newTheme);
                        setTheme(newTheme);
                      }}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="System Default">System Default</option>
                      <option value="Light">Light</option>
                      <option value="Dark">Dark</option>
                    </select>`;

code = code.replace(oldSelect, newSelect);

fs.writeFileSync('src/pages/Options.tsx', code);
