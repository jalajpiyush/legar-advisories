const fs = require('fs');

let code = fs.readFileSync('src/pages/Options.tsx', 'utf-8');

code = code.replace(
  "import { Settings, User, Bell, Shield, Key, Database, Globe, Monitor } from 'lucide-react';",
  "import { Settings, User, Bell, Shield, Key, Database, Globe, Monitor, CreditCard } from 'lucide-react';"
);

code = code.replace(
  "  { id: \"integrations\", label: \"Integrations\", icon: Database },\n];",
  "  { id: \"integrations\", label: \"Integrations\", icon: Database },\n  { id: \"plan\", label: \"Upgrade Plan\", icon: CreditCard },\n];"
);

const planContent = `            {activeTab === "plan" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">Upgrade Plan</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-[16px] font-semibold text-gray-900">Pro Plan</h3>
                      <p className="text-[13px] text-gray-500 mt-1">Perfect for professionals and small teams.</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[24px] font-bold text-gray-900">$49<span className="text-[14px] text-gray-500 font-normal">/mo</span></div>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-[14px] text-gray-700">
                      <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[12px]">✓</div>
                      Unlimited queries
                    </li>
                    <li className="flex items-center gap-2 text-[14px] text-gray-700">
                      <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[12px]">✓</div>
                      Priority support
                    </li>
                    <li className="flex items-center gap-2 text-[14px] text-gray-700">
                      <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[12px]">✓</div>
                      Advanced AI models
                    </li>
                  </ul>
                  <button className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            )}

            {activeTab !== "account" && activeTab !== "appearance"`;

code = code.replace(
  '{activeTab !== "account" && activeTab !== "appearance"',
  planContent
);

const fallbackFix = `            {activeTab !== "account" && activeTab !== "appearance" && activeTab !== "notifications" && activeTab !== "privacy" && activeTab !== "api" && activeTab !== "integrations" && activeTab !== "plan" && (`;

code = code.replace(
  '{activeTab !== "account" && activeTab !== "appearance" && (',
  fallbackFix
);

fs.writeFileSync('src/pages/Options.tsx', code);
