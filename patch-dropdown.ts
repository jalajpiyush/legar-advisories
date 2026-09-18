import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const injection = `
                    <div className="sm:hidden px-1 border-t border-gray-100 mt-1 pt-1">
                      <div className="px-4 py-2 text-[12px] font-semibold text-gray-500 mb-0.5">Actions</div>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPromptsOpen(!promptsOpen); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-800 font-medium transition-colors">
                        <div className="flex items-center gap-3"><ListPlus className="w-[18px] h-[18px] text-gray-500" /> Prompts</div>
                        <ChevronDown className={\`w-[18px] h-[18px] text-gray-400 transition-transform \${promptsOpen ? 'rotate-180' : ''}\`} />
                      </button>
                      {promptsOpen && (
                        <div className="pl-9 pr-2 py-1 space-y-1">
                           <button onClick={(e) => { e.preventDefault(); setPrompt("Draft a mutual NDA governed by California law."); setPromptsOpen(false); setSourcesOpen(false); }} className="w-full text-left px-2 py-1.5 text-[13px] text-gray-600 hover:text-gray-900 rounded hover:bg-gray-50">Mutual NDA (CA)</button>
                           <button onClick={(e) => { e.preventDefault(); setPrompt("Summarize the key indemnification obligations in this agreement."); setPromptsOpen(false); setSourcesOpen(false); }} className="w-full text-left px-2 py-1.5 text-[13px] text-gray-600 hover:text-gray-900 rounded hover:bg-gray-50">Summarize Indemnification</button>
                           <button onClick={(e) => { e.preventDefault(); setPrompt("Identify any non-standard representations and warranties."); setPromptsOpen(false); setSourcesOpen(false); }} className="w-full text-left px-2 py-1.5 text-[13px] text-gray-600 hover:text-gray-900 rounded hover:bg-gray-50">Analyze Reps & Warranties</button>
                        </div>
                      )}
                  
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCustomizeOpen(!customizeOpen); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-800 font-medium transition-colors">
                        <div className="flex items-center gap-3"><SlidersHorizontal className="w-[18px] h-[18px] text-gray-500" /> Customize</div>
                        <ChevronDown className={\`w-[18px] h-[18px] text-gray-400 transition-transform \${customizeOpen ? 'rotate-180' : ''}\`} />
                      </button>
                      {customizeOpen && (
                        <div className="pl-9 pr-2 py-1 space-y-1">
                           <button onClick={(e) => { e.preventDefault(); setCustomizeOpen(false); setSourcesOpen(false); }} className="w-full flex items-center justify-between px-2 py-1.5 text-[13px] text-gray-600 hover:text-gray-900 rounded hover:bg-gray-50">Concise <Check className="w-3 h-3" /></button>
                           <button onClick={(e) => { e.preventDefault(); setCustomizeOpen(false); setSourcesOpen(false); }} className="w-full flex items-center justify-between px-2 py-1.5 text-[13px] text-gray-600 hover:text-gray-900 rounded hover:bg-gray-50">Detailed</button>
                           <button onClick={(e) => { e.preventDefault(); setCustomizeOpen(false); setSourcesOpen(false); }} className="w-full flex items-center justify-between px-2 py-1.5 text-[13px] text-gray-600 hover:text-gray-900 rounded hover:bg-gray-50">Bullet Points</button>
                        </div>
                      )}
                      
                      {chatHistory.length === 0 && (
                        <>
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPrompt(prev => prev ? prev + " Please ensure the analysis is legally sound and cites relevant precedents where applicable." : "Please provide a legally sound analysis of the provided context."); setSourcesOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-800 font-medium transition-colors">
                            <div className="flex items-center gap-3"><Wand2 className="w-[18px] h-[18px] text-gray-500" /> Improve</div>
                          </button>
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsDeepResearch(!isDeepResearch); setSourcesOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-800 font-medium transition-colors">
                            <div className="flex items-center gap-3"><Activity className={\`w-[18px] h-[18px] \${isDeepResearch ? 'text-blue-600' : 'text-gray-500'}\`} /> <span className={isDeepResearch ? 'text-blue-600' : ''}>Deep research</span></div>
                            {isDeepResearch && <Check className="w-[18px] h-[18px] text-blue-600" />}
                          </button>
                        </>
                      )}
                    </div>
`;

content = content.replace(
  /                    <\/div>\n                  <\/div>\n                \)}\n              <\/div>/,
  `                    </div>\n${injection}\n                  </div>\n                )}\n              </div>`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
