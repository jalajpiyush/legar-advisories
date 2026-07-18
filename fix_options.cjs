const fs = require('fs');
let code = fs.readFileSync('src/pages/Options.tsx', 'utf-8');

code = code.replace(
  "import { Settings, User, Bell, Shield, Key, Database, Globe, Monitor } from 'lucide-react';",
  "import { Settings, User, Bell, Shield, Key, Database, Globe, Monitor } from 'lucide-react';\nimport { User as FirebaseUser } from 'firebase/auth';"
);

code = code.replace(
  "export function Options() {",
  "interface OptionsProps { user?: FirebaseUser | null; }\n\nexport function Options({ user }: OptionsProps) {"
);

const oldAccountBlock = `                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-medium overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <button className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-colors shadow-sm mb-2">
                      Change Avatar
                    </button>
                    <p className="text-[12px] text-gray-500">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-gray-700">First Name</label>
                    <input type="text" defaultValue="Jane" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-gray-700">Last Name</label>
                    <input type="text" defaultValue="Doe" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[13px] font-medium text-gray-700">Email Address</label>
                    <input type="email" defaultValue="jane@whitford.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>`;

const newAccountBlock = `                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-medium overflow-hidden">
                    <img 
                      src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <button className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-colors shadow-sm mb-2">
                      Change Avatar
                    </button>
                    <p className="text-[12px] text-gray-500">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-gray-700">First Name</label>
                    <input type="text" defaultValue={user?.displayName?.split(" ")[0] || "Jane"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-gray-700">Last Name</label>
                    <input type="text" defaultValue={user?.displayName?.split(" ").slice(1).join(" ") || "Doe"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[13px] font-medium text-gray-700">Email Address</label>
                    <input type="email" defaultValue={user?.email || "jane@whitford.com"} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>`;

code = code.replace(oldAccountBlock, newAccountBlock);
fs.writeFileSync('src/pages/Options.tsx', code);
