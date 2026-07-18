const fs = require('fs');
let code = fs.readFileSync('src/pages/Options.tsx', 'utf-8');

const planContent = `            {activeTab === "plan" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">Upgrade your plan</h2>
                
                <div className="flex bg-gray-100/50 p-1 rounded-xl w-fit mx-auto mb-8 border border-gray-200/50">
                  <button className="px-6 py-2 rounded-lg text-[14px] font-medium bg-white text-gray-900 shadow-sm border border-gray-200/50">Personal</button>
                  <button className="px-6 py-2 rounded-lg text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">Business</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {/* Plus Plan */}
                  <div className="border-2 border-blue-600 rounded-2xl p-6 relative bg-white shadow-sm">
                    <div className="absolute -top-3 left-6 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Recommended
                    </div>
                    <div className="mb-6">
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
                    
                    <ul className="space-y-4">
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
                        Expanded deep research
                      </li>
                    </ul>
                  </div>

                  {/* Free Plan */}
                  <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                    <div className="mb-6 mt-[22px]">
                      <h3 className="text-[20px] font-semibold text-gray-900">Go</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-[32px] font-bold text-gray-900">$8</span>
                        <span className="text-[14px] text-gray-500">USD / month</span>
                      </div>
                      <p className="text-[14px] text-gray-600 mt-4 h-10">Keep chatting with expanded access.</p>
                    </div>
                    
                    <button className="w-full bg-gray-100 text-gray-500 font-medium py-3 rounded-xl cursor-default mb-8 text-[15px]">
                      Your current plan
                    </button>
                    
                    <ul className="space-y-4">
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
                    </ul>
                  </div>
                </div>
              </div>
            )}
`;

code = code.replace(
  '          </div>\n        </div>\n      </div>\n    </div>\n  );\n}',
  planContent + '\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}'
);

fs.writeFileSync('src/pages/Options.tsx', code);
