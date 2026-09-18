import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# I will just write a python script to replace the big block of tools with the simplified one.
# Looking at the output from lines 650-697...

old_tools = '''              <div className="relative shrink-0 hidden sm:block" ref={promptsRef}>
                <button type="button" onClick={(e) => { e.preventDefault(); setPromptsOpen(!promptsOpen); }} className="w-8 h-8 hidden sm:flex items-center justify-center rounded-full hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 transition-colors shrink-0" title="Prompts">
                  <ListPlus className="w-4 h-4" />
                </button>
                {promptsOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-100 dark:border-neutral-800 z-50 py-2">
                    <div className="px-3 py-1.5 text-[12px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Templates</div>
                    <button onClick={(e) => { e.preventDefault(); setPrompt("Draft a mutual NDA governed by California law."); setPromptsOpen(false); }} className="w-full text-left px-4 py-2 text-[14px] text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:bg-neutral-800 transition-colors">Mutual NDA (CA)</button>
                    <button onClick={(e) => { e.preventDefault(); setPrompt("Summarize the key indemnification obligations in this agreement."); setPromptsOpen(false); }} className="w-full text-left px-4 py-2 text-[14px] text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:bg-neutral-800 transition-colors">Summarize Indemnification</button>
                    <button onClick={(e) => { e.preventDefault(); setPrompt("Identify any non-standard representations and warranties."); setPromptsOpen(false); }} className="w-full text-left px-4 py-2 text-[14px] text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:bg-neutral-800 transition-colors">Analyze Reps & Warranties</button>
                  </div>
                )}
              </div>

              <div className="relative shrink-0 hidden sm:block" ref={customizeRef}>
                <button type="button" onClick={(e) => { e.preventDefault(); setCustomizeOpen(!customizeOpen); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 transition-colors shrink-0" title="Customize">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                {customizeOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-100 dark:border-neutral-800 z-50 py-2">
                    <div className="px-3 py-1.5 text-[12px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Output Style</div>
                    <button onClick={(e) => { e.preventDefault(); setCustomizeOpen(false); }} className="w-full text-left px-4 py-2 text-[14px] text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:bg-neutral-800 transition-colors flex justify-between items-center">
                      Concise <Check className="w-4 h-4 text-gray-900 dark:text-neutral-100" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setCustomizeOpen(false); }} className="w-full text-left px-4 py-2 text-[14px] text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:bg-neutral-800 transition-colors flex justify-between items-center">
                      Detailed 
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setCustomizeOpen(false); }} className="w-full text-left px-4 py-2 text-[14px] text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:bg-neutral-800 transition-colors flex justify-between items-center">
                      Bullet Points
                    </button>
                  </div>
                )}
              </div>

              {chatHistory.length === 0 && (
                <button onClick={(e) => { e.preventDefault(); setPrompt(prev => prev ? prev + " Please ensure the analysis is legally sound and cites relevant precedents where applicable." : "Please provide a legally sound analysis of the provided context."); }} className="w-8 h-8 hidden sm:flex items-center justify-center rounded-full hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 transition-colors shrink-0" title="Improve prompt">
                  <Wand2 className="w-4 h-4" />
                </button>
              )}
              {chatHistory.length === 0 && (
                <button onClick={(e) => { e.preventDefault(); setIsDeepResearch(!isDeepResearch); }} className={`w-8 h-8 hidden sm:flex items-center justify-center rounded-full hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 transition-colors shrink-0 ${isDeepResearch ? 'text-blue-600' : ''}`} title="Deep research">
                  <Activity className="w-4 h-4" />
                </button>
              )}'''

if old_tools in content:
    content = content.replace(old_tools, '')
    with open("src/pages/Dashboard.tsx", "w") as f:
        f.write(content)
    print("Replaced!")
else:
    print("Could not find string")
