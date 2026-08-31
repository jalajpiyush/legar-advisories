import fs from 'fs';

let content = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

// add Eye, EyeOff to lucide-react import
content = content.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, Eye, EyeOff } from 'lucide-react';");

// add state
content = content.replace(/const \[password, setPassword\] = useState\(''\);/, "const [password, setPassword] = useState('');\n  const [showPassword, setShowPassword] = useState(false);");

// update input
const replacement = `                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>`;

content = content.replace(/                    <div className="relative">\s*<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">\s*<Lock className="w-5 h-5 text-gray-400" \/>\s*<\/div>\s*<input\s*type="password"\s*required\s*value=\{password\}\s*onChange=\{\(e\) => setPassword\(e.target.value\)\}\s*className="[^"]+"\s*placeholder="[^"]+"\s*\/>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/AuthModal.tsx', content);
