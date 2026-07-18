import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Key, Database, Globe, Monitor, CreditCard } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { getTheme, setTheme } from '../lib/theme';

const optionTabs = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Monitor },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "api", label: "API Keys", icon: Key },
  { id: "integrations", label: "Integrations", icon: Database },
  { id: "plan", label: "Upgrade Plan", icon: CreditCard },
];

interface OptionsProps { user?: FirebaseUser | null; }

export function Options({ user }: OptionsProps) {
  const [activeTab, setActiveTab] = useState("account");
  const [planType, setPlanType] = useState<"personal" | "business">("personal");
  const [theme, setLocalTheme] = useState(getTheme());
  const [firstName, setFirstName] = useState(user?.displayName?.split(" ")[0] || "Jane");
  const [lastName, setLastName] = useState(user?.displayName?.split(" ").slice(1).join(" ") || "Doe");
  const [email, setEmail] = useState(user?.email || "jane@whitford.com");
  
  React.useEffect(() => {
    if (user) {
      setFirstName(user.displayName?.split(" ")[0] || "");
      setLastName(user.displayName?.split(" ").slice(1).join(" ") || "");
      setEmail(user.email || "");
    }
  }, [user]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header section */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-serif text-gray-900 mb-1">Options</h1>
            <p className="text-[14px] text-gray-500">Manage your account settings and preferences.</p>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAFA]">
        <div className="max-w-[1000px] mx-auto p-8 flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0 space-y-1">
            {optionTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-sm border border-gray-200/80"
                      : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 border border-transparent"
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] ${activeTab === tab.id ? "text-blue-600" : "text-gray-400"}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-white border border-gray-200/80 rounded-2xl p-8 shadow-sm">
            {activeTab === "account" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">Account Profile</h2>
                
                <div className="flex items-center gap-6">
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
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-gray-700">Last Name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[13px] font-medium text-gray-700">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button className="bg-black text-white px-5 py-2 rounded-lg text-[14px] font-semibold hover:bg-gray-800 transition-colors shadow-sm">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">Appearance Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900">Theme Preference</h3>
                      <p className="text-[13px] text-gray-500">Select your preferred color theme.</p>
                    </div>
                    <select 
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
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-[13px] text-gray-500">Receive daily summaries and important alerts via email.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900">Push Notifications</h3>
                      <p className="text-[13px] text-gray-500">Get real-time alerts in your browser.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900">Marketing Emails</h3>
                      <p className="text-[13px] text-gray-500">Receive offers, product updates, and news.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">Privacy & Security</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900">Data Sharing</h3>
                      <p className="text-[13px] text-gray-500">Allow anonymous data collection to improve the product.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900">Two-Factor Authentication (2FA)</h3>
                      <p className="text-[13px] text-gray-500">Add an extra layer of security to your account.</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-[13px] font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                  <div className="py-3">
                    <h3 className="text-[14px] font-medium text-red-600 mb-1">Danger Zone</h3>
                    <p className="text-[13px] text-gray-500 mb-3">Permanently delete your account and all data.</p>
                    <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 text-[13px] font-medium rounded-lg hover:bg-red-100 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "api" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">API Keys</h2>
                <p className="text-[13px] text-gray-600">Manage your API keys for external services.</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-gray-700">OpenAI API Key</label>
                    <div className="flex gap-2">
                      <input type="password" placeholder="sk-..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors bg-gray-50" />
                      <button className="px-4 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors">Save</button>
                    </div>
                    <p className="text-[12px] text-gray-500">Used for generating text and summaries.</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-gray-50">
                    <label className="text-[13px] font-medium text-gray-700">Anthropic API Key</label>
                    <div className="flex gap-2">
                      <input type="password" placeholder="sk-ant-..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors bg-gray-50" />
                      <button className="px-4 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors">Save</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">Connected Apps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="border border-gray-200 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-medium text-gray-900">Google Drive</h3>
                        <p className="text-[12px] text-gray-500">Sync your documents.</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[12px] font-medium rounded-md hover:bg-gray-200 transition-colors">
                      Connect
                    </button>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-medium text-gray-900">Notion</h3>
                        <p className="text-[12px] text-gray-500">Export your notes.</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[12px] font-medium rounded-md hover:bg-gray-200 transition-colors">
                      Connect
                    </button>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 text-gray-800 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-medium text-gray-900">GitHub</h3>
                        <p className="text-[12px] text-gray-500">Import repositories.</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[12px] font-medium rounded-md hover:bg-gray-200 transition-colors">
                      Connect
                    </button>
                  </div>

                </div>
              </div>
            )}

            {activeTab === "plan" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upgrade your plan</h2>
                  
                  <div className="inline-flex bg-gray-100/80 p-1 rounded-full mb-8 border border-gray-200/50">
                    <button 
                      onClick={() => setPlanType("personal")}
                      className={`px-8 py-2 rounded-full text-[14px] font-medium transition-colors ${planType === "personal" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-900"}`}
                    >
                      Personal
                    </button>
                    <button 
                      onClick={() => setPlanType("business")}
                      className={`px-8 py-2 rounded-full text-[14px] font-medium transition-colors ${planType === "business" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-900"}`}
                    >
                      Business
                    </button>
                  </div>
                </div>

                {planType === "personal" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Go Plan */}
                    <div className="border border-gray-200 rounded-2xl p-6 bg-[#FAFAFA] shadow-sm flex flex-col">
                      <div className="mb-6 mt-[22px]">
                        <h3 className="text-[20px] font-semibold text-gray-900">Go</h3>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-[32px] font-bold text-gray-900">$8</span>
                          <span className="text-[14px] text-gray-500">USD / month</span>
                        </div>
                        <p className="text-[14px] text-gray-600 mt-4 h-10">Keep chatting with expanded access.</p>
                      </div>
                      
                      <button className="w-full bg-gray-100 border border-gray-200/50 text-gray-500 font-medium py-3 rounded-xl cursor-default mb-8 text-[15px]">
                        Your current plan
                      </button>
                      
                      <ul className="space-y-4 flex-1">
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-400">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Core model
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-400">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          More messages and uploads
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-400">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          More image creation
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-400">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Longer memory
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-400">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Expanded voice mode
                        </li>
                      </ul>
                    </div>

                    {/* Plus Plan */}
                    <div className="border border-gray-200 rounded-2xl p-6 relative bg-white shadow-sm flex flex-col">
                      <div className="mb-6 mt-[22px]">
                        <h3 className="text-[20px] font-semibold text-gray-900">Plus</h3>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-[32px] font-bold text-gray-900">$20</span>
                          <span className="text-[14px] text-gray-500">USD / month</span>
                        </div>
                        <p className="text-[14px] text-gray-600 mt-4 h-10">Unlock the full experience and advanced capabilities.</p>
                      </div>
                      
                      <button className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm mb-8 text-[15px]">
                        Upgrade to Plus
                      </button>
                      
                      <ul className="space-y-4 flex-1">
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-blue-600">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Advanced AI models
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-blue-600">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Advanced image creation with Thinking
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-blue-600">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Expanded memory across chats
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-blue-600">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Codex coding agent
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-blue-600">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Expanded deep research
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-blue-600">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Projects and custom GPTs
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-blue-600">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Add my website feature
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Business Plan */}
                    <div className="border-2 border-blue-600 rounded-2xl p-6 relative bg-blue-50/20 shadow-sm flex flex-col">
                      <div className="absolute top-6 right-6 bg-blue-100 text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Recommended
                      </div>
                      <div className="mb-6">
                        <h3 className="text-[20px] font-semibold text-gray-900">Business</h3>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-[32px] font-bold text-gray-900">$25</span>
                          <span className="text-[12px] text-gray-500">/ user / month (exclusive of GST)</span>
                        </div>
                        <p className="text-[14px] text-gray-600 mt-4 h-10">A secure workspace with company context and tools for teams, built for growing companies</p>
                      </div>
                      
                      <button className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm mb-8 text-[15px]">
                        Upgrade
                      </button>
                      
                      <ul className="space-y-4 flex-1">
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-600">
                            <Globe className="w-[18px] h-[18px]" />
                          </div>
                          Access ChatGPT and Codex across desktop and mobile apps
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-600">
                            <Monitor className="w-[18px] h-[18px]" />
                          </div>
                          AI for chat, coding, analysis, and workflows
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-600">
                            <Database className="w-[18px] h-[18px]" />
                          </div>
                          Connect tools like Microsoft 365, Google Drive, Slack, GitHub, Linear, Figma, and more
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-600">
                            <Settings className="w-[18px] h-[18px]" />
                          </div>
                          Build on company knowledge and team context with custom team agent plugins
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-600">
                            <Shield className="w-[18px] h-[18px]" />
                          </div>
                          Secure workspace with SAML SSO and MFA
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-600">
                            <User className="w-[18px] h-[18px]" />
                          </div>
                          No training on your business data by default
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-600">
                            <Globe className="w-[18px] h-[18px]" />
                          </div>
                          Add my website feature
                        </li>
                      </ul>
                    </div>

                    {/* Go Plan */}
                    <div className="border border-gray-200 rounded-2xl p-6 bg-[#FAFAFA] shadow-sm flex flex-col">
                      <div className="mb-6 mt-[22px]">
                        <h3 className="text-[20px] font-semibold text-gray-900">Go</h3>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-[32px] font-bold text-gray-900">$8</span>
                          <span className="text-[12px] text-gray-500">USD / month (inclusive of GST)</span>
                        </div>
                        <p className="text-[14px] text-gray-600 mt-4 h-10">Keep chatting with expanded access</p>
                      </div>
                      
                      <button className="w-full bg-gray-100 border border-gray-200/50 text-gray-500 font-medium py-3 rounded-xl cursor-default mb-8 text-[15px]">
                        Your current plan
                      </button>
                      
                      <ul className="space-y-4 flex-1">
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-400">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Core model
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-400">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          More messages and uploads
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-400">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          More image creation
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-400">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Longer memory
                        </li>
                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-400">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Expanded voice mode
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
