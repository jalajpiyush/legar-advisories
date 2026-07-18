const fs = require('fs');

let code = fs.readFileSync('src/pages/Options.tsx', 'utf-8');

const oldBlock = `            {activeTab !== "account" && activeTab !== "appearance" && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Settings className="w-12 h-12 text-gray-300 mb-4" />
                <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Options Coming Soon</h2>
                <p className="text-[14px] text-gray-500 max-w-sm">
                  We are actively working on the settings for the {optionTabs.find(t => t.id === activeTab)?.label} section. Check back later!
                </p>
              </div>
            )}`;

const newBlock = `            {activeTab === "notifications" && (
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
            )}`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync('src/pages/Options.tsx', code);
