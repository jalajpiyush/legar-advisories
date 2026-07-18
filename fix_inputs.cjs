const fs = require('fs');
let code = fs.readFileSync('src/pages/Options.tsx', 'utf-8');

if (!code.includes("const [firstName, setFirstName] = useState")) {
  code = code.replace(
    '  const [theme, setLocalTheme] = useState(getTheme());',
    '  const [theme, setLocalTheme] = useState(getTheme());\n  const [firstName, setFirstName] = useState(user?.displayName?.split(" ")[0] || "Jane");\n  const [lastName, setLastName] = useState(user?.displayName?.split(" ").slice(1).join(" ") || "Doe");\n  const [email, setEmail] = useState(user?.email || "jane@whitford.com");\n  \n  React.useEffect(() => {\n    if (user) {\n      setFirstName(user.displayName?.split(" ")[0] || "");\n      setLastName(user.displayName?.split(" ").slice(1).join(" ") || "");\n      setEmail(user.email || "");\n    }\n  }, [user]);'
  );
}

const oldFirst = `<input type="text" defaultValue={user?.displayName?.split(" ")[0] || "Jane"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />`;
const newFirst = `<input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />`;

const oldLast = `<input type="text" defaultValue={user?.displayName?.split(" ").slice(1).join(" ") || "Doe"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />`;
const newLast = `<input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />`;

const oldEmail = `<input type="email" defaultValue={user?.email || "jane@whitford.com"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />`;
const newEmail = `<input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />`;

code = code.replace(oldFirst, newFirst);
code = code.replace(oldLast, newLast);
code = code.replace(oldEmail, newEmail);

fs.writeFileSync('src/pages/Options.tsx', code);
