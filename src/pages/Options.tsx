import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Key, Database, Globe, Monitor, CreditCard } from 'lucide-react';
import { User as FirebaseUser, db } from '../lib/auth';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion } from "motion/react";


const optionTabs = [
  { id: "overview", label: "Account Dashboard", icon: Monitor },
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "plan", label: "Upgrade Plan", icon: CreditCard },
];

interface OptionsProps { user?: FirebaseUser | null; onUpdate?: () => void; }


const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
);

export function Options({ user, onUpdate }: OptionsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<any>(null);

  React.useEffect(() => {
    const fetchDashboard = async () => {
      if (activeTab === 'overview' && user) {
        try {
          try {
            const token = await user.getIdToken();
            const res = await fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
              const data = await res.json();
              
              let savedDocs: any[] = [];
              try {
                const docsSnap = await getDocs(query(collection(db, 'documents'), where('userId', '==', user.uid), orderBy('created_at', 'desc'), limit(5)));
                savedDocs = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
              } catch(e) {}
              
              setDashboardData({
                plan: data.plan,
                usage: data.usage,
                limits: data.limits,
                billingHistory: data.history ? data.history.slice(0, 5) : [],
                savedDocs
              });
            } else {
               console.error("Failed to fetch profile");
            }
          } catch(e) {
             console.error("Error fetching profile", e);
          }
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
        }
      }
    };
    fetchDashboard();
  }, [activeTab, user]);

  const [planType, setPlanType] = useState<"personal" | "business">("personal");
  const [firstName, setFirstName] = useState(user?.displayName?.split(" ")[0] || "Jane");
  const [lastName, setLastName] = useState(user?.displayName?.split(" ").slice(1).join(" ") || "Doe");
  const [email, setEmail] = useState(user?.email || "jane@whitford.com");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("legal_advisories_theme") || "System Default";
  });
  
  React.useEffect(() => {
    localStorage.setItem("legal_advisories_theme", theme);
    if (theme === "Dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "Light") {
      document.documentElement.classList.remove("dark");
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSaveChanges = async () => {
    const { auth, updateProfile } = await import('../lib/auth');
    const currentUser = auth.currentUser;
    
    if (!currentUser) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      
      await updateProfile(currentUser, {
        displayName: fullName
      });
      
      if (onUpdate) onUpdate();
      
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Auto-hide message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setSaveMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      setFirstName(user.displayName?.split(" ")[0] || "");
      setLastName(user.displayName?.split(" ").slice(1).join(" ") || "");
      setEmail(user.email || "");
    }
  }, [user]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 pt-16 md:pt-0">
      {/* Header section */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <motion.h1 layoutId="page-title" className="text-2xl font-serif text-gray-900 dark:text-neutral-100 mb-1">Settings</motion.h1>
            <motion.p layoutId="page-description" className="text-[14px] text-gray-500 dark:text-neutral-400">Manage your account settings and preferences.</motion.p>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAFA] dark:bg-neutral-900">
        <div className="max-w-[1000px] mx-auto p-8 flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0 space-y-1">
            {optionTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'plan') {
                      window.dispatchEvent(new CustomEvent('navigate', { detail: 'billing' }));
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-neutral-900 text-blue-600 shadow-sm border border-gray-200 dark:border-neutral-800/80"
                      : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:bg-neutral-800/50 hover:text-gray-900 dark:text-neutral-100 border border-transparent"
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] ${activeTab === tab.id ? "text-blue-600" : "text-gray-400 dark:text-neutral-500"}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800/80 rounded-2xl p-8 shadow-sm">
                        {activeTab === "overview" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 border-b border-gray-100 dark:border-neutral-800 pb-4">Account Dashboard</h2>
                {dashboardData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Plan & Usage */}
                    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100 mb-4">Current Plan</h3>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{dashboardData.plan}</div>
                      <button onClick={() => setActiveTab('plan')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Manage Subscription</button>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100 mb-4">
                        {dashboardData.plan === 'Free' ? "Today's Usage" : "Monthly Usage"}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-neutral-400">AI Chats</span>
                            <span className="font-medium text-gray-900 dark:text-neutral-100">
                              {dashboardData.usage?.chat || 0} / {dashboardData.limits.chat === -1 ? 'Unlimited' : dashboardData.limits.chat}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-neutral-800 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: dashboardData.limits.chat === -1 ? '100%' : `${Math.min(((dashboardData.usage?.chat || 0) / dashboardData.limits.chat) * 100, 100)}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-neutral-400">Document Analyses</span>
                            <span className="font-medium text-gray-900 dark:text-neutral-100">
                              {dashboardData.usage?.doc || 0} / {dashboardData.limits.doc === -1 ? 'Unlimited' : dashboardData.limits.doc}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-neutral-800 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: dashboardData.limits.doc === -1 ? '100%' : `${Math.min(((dashboardData.usage?.doc || 0) / dashboardData.limits.doc) * 100, 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment History */}
                    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm col-span-1 md:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100 mb-4">Recent Payments</h3>
                      {dashboardData.billingHistory && dashboardData.billingHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left text-gray-500 dark:text-neutral-400">
                            <thead className="text-xs text-gray-700 dark:text-neutral-300 uppercase bg-gray-50 dark:bg-neutral-800 border-b">
                              <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Plan</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardData.billingHistory.map((bill: any) => (
                                <tr key={bill.id} className="border-b">
                                  <td className="px-4 py-3">{new Date(bill.created_at).toLocaleDateString()}</td>
                                  <td className="px-4 py-3">{bill.plan}</td>
                                  <td className="px-4 py-3">₹{bill.amount}</td>
                                  <td className="px-4 py-3">
                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{bill.status}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-neutral-400">No payment history found.</p>
                      )}
                    </div>

                    {/* Saved Documents */}
                    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm col-span-1 md:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100 mb-4">Saved Documents</h3>
                      {dashboardData.savedDocs && dashboardData.savedDocs.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left text-gray-500 dark:text-neutral-400">
                            <thead className="text-xs text-gray-700 dark:text-neutral-300 uppercase bg-gray-50 dark:bg-neutral-800 border-b">
                              <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardData.savedDocs.map((doc: any) => (
                                <tr key={doc.id} className="border-b">
                                  <td className="px-4 py-3">{new Date(doc.created_at).toLocaleDateString()}</td>
                                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-neutral-100">{doc.title || "Untitled Document"}</td>
                                  <td className="px-4 py-3">{doc.type || "Analysis"}</td>
                                  <td className="px-4 py-3">
                                    <button className="text-blue-600 hover:underline">View</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-neutral-400">No saved documents found.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-neutral-400">Loading dashboard...</div>
                )}
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 border-b border-gray-100 dark:border-neutral-800 pb-4">Account Profile</h2>
                
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-400 dark:text-neutral-500 text-2xl font-medium overflow-hidden">
                    <img 
                      src={user?.photoURL || 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Paul_Graham_%28cropped%29.jpg'} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <button className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-neutral-200 px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-gray-50 dark:bg-neutral-800 transition-colors shadow-sm mb-2">
                      Change Avatar
                    </button>
                    <p className="text-[12px] text-gray-500 dark:text-neutral-400">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-gray-700 dark:text-neutral-300">First Name</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-800 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-gray-700 dark:text-neutral-300">Last Name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-800 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[13px] font-medium text-gray-700 dark:text-neutral-300">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-800 rounded-lg text-[14px] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {saveMessage && (
                    <p className={`text-[13px] font-medium ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {saveMessage.text}
                    </p>
                  )}
                  <div className="flex-1" />
                  <button 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black px-8 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 border-b border-gray-100 dark:border-neutral-800 pb-4">Appearance Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900 dark:text-neutral-100">Theme Preference</h3>
                      <p className="text-[13px] text-gray-500 dark:text-neutral-400">Select your preferred color theme.</p>
                    </div>
                    <select 
                      value={theme}
                      onChange={(e) => {
                        const newTheme = e.target.value;
                        setTheme(newTheme);
                      }}
                      className="px-3 py-2 border border-gray-200 dark:border-neutral-800 rounded-lg text-[14px] outline-none focus:border-blue-500 bg-white dark:bg-neutral-900"
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 border-b border-gray-100 dark:border-neutral-800 pb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900 dark:text-neutral-100">Email Notifications</h3>
                      <p className="text-[13px] text-gray-500 dark:text-neutral-400">Receive daily summaries and important alerts via email.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-neutral-900 after:border-gray-300 dark:border-neutral-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900 dark:text-neutral-100">Push Notifications</h3>
                      <p className="text-[13px] text-gray-500 dark:text-neutral-400">Get real-time alerts in your browser.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-neutral-900 after:border-gray-300 dark:border-neutral-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900 dark:text-neutral-100">Marketing Emails</h3>
                      <p className="text-[13px] text-gray-500 dark:text-neutral-400">Receive offers, product updates, and news.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-neutral-900 after:border-gray-300 dark:border-neutral-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 border-b border-gray-100 dark:border-neutral-800 pb-4">Privacy & Security</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900 dark:text-neutral-100">Data Sharing</h3>
                      <p className="text-[13px] text-gray-500 dark:text-neutral-400">Allow anonymous data collection to improve the product.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-neutral-900 after:border-gray-300 dark:border-neutral-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900 dark:text-neutral-100">Two-Factor Authentication (2FA)</h3>
                      <p className="text-[13px] text-gray-500 dark:text-neutral-400">Add an extra layer of security to your account.</p>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 text-[13px] font-medium rounded-lg hover:bg-gray-50 dark:bg-neutral-800 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                  <div className="py-3">
                    <h3 className="text-[14px] font-medium text-red-600 mb-1">Danger Zone</h3>
                    <p className="text-[13px] text-gray-500 dark:text-neutral-400 mb-3">Permanently delete your account and all data.</p>
                    <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 text-[13px] font-medium rounded-lg hover:bg-red-100 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
