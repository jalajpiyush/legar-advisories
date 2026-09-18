import re

with open("src/pages/Dashboard.tsx", "r") as f:
    content = f.read()

# I will replace the entire block starting from `          <div className="flex items-end sm:items-center justify-between w-full mt-2 pt-1">`
# to the end of the composer. Let me just use regex to replace everything between that and `          </div>\n        </div>\n\n        {/* Selected Sources Pills */}`

start_marker = '<div className="flex items-end sm:items-center justify-between w-full mt-2 pt-1">'
end_marker = '{/* Selected Sources Pills */}'

# Wait, let's find the exact text of the current Dashboard.tsx
start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    old_block = content[start_idx:end_idx]
    
    # We will reconstruct this block entirely.
    new_block = '''<div className="flex items-end sm:items-center justify-between w-full mt-2 pt-1">
            {/* Left side tools */}
            <div className="flex items-center gap-1 sm:gap-2 text-gray-500">
              <div className="relative shrink-0" ref={sourcesRef}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="w-0 h-0 opacity-0 absolute overflow-hidden pointer-events-none" 
                  multiple 
                  onChange={handleFileUpload} 
                />
                <button 
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/60 text-gray-700 transition-colors"
                  title="Add files"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* Sources Dropdown */}
                {sourcesOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-[280px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 text-[14px] max-h-[60vh] overflow-y-auto">
                    <div className="px-1 py-1 border-b border-gray-100 mb-1">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-800 font-medium"
                      >
                        <Plus className="w-[18px] h-[18px] text-gray-500" /> Upload files
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTag('iManage'); }} className={getDropdownSourceClass('iManage', 'justify-between')}>
                        <div className="flex items-center gap-3">
                          <div className="w-[18px] h-[18px] bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">m</div>
                          Add from iManage
                        </div>
                        {selectedTags.includes('iManage') && <Check className="w-4 h-4 text-gray-900" />}
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsVaultModalOpen(true); setSourcesOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-800 font-medium transition-colors">
                        <div className="flex items-center gap-3"><Folder className="w-[18px] h-[18px] text-gray-500" /> Add from Vault project</div>
                        <ChevronRight className="w-[18px] h-[18px] text-gray-400" />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsKbModalOpen(true); setSourcesOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-800 font-medium transition-colors">
                        <div className="flex items-center gap-3"><FileText className="w-[18px] h-[18px] text-gray-500" /> Add from Knowledge base</div>
                        <ChevronRight className="w-[18px] h-[18px] text-gray-400" />
                      </button>
                    </div>
                    <div className="px-4 py-2 text-[12px] font-semibold text-gray-500 mb-0.5">Sources</div>
                    <div className="px-1">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTag('Legal Advisories'); }} className={getDropdownSourceClass('Legal Advisories', 'justify-between')}>
                        <div className="flex items-center gap-3">
                          <div className="w-[18px] h-[18px] bg-red-600 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>
                          Legal Advisories
                        </div>
                        {selectedTags.includes('Legal Advisories') && <Check className="w-4 h-4 text-gray-900" />}
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTag('Web search'); }} className={getDropdownSourceClass('Web search', 'justify-between')}>
                        <div className="flex items-center gap-3">
                          <Globe className="w-[18px] h-[18px] text-blue-500" /> Web search
                        </div>
                        {selectedTags.includes('Web search') && <Check className="w-4 h-4 text-gray-900" />}
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTag('EDGAR'); }} className={getDropdownSourceClass('EDGAR', 'justify-between')}>
                        <div className="flex items-center gap-3">
                          <Building2 className="w-[18px] h-[18px] text-gray-500" /> EDGAR
                        </div>
                        {selectedTags.includes('EDGAR') && <Check className="w-4 h-4 text-gray-900" />}
                      </button>
                    </div>

                    <div className="sm:hidden px-1 border-t border-gray-100 mt-1 pt-1">
                      <div className="px-4 py-2 text-[12px] font-semibold text-gray-500 mb-0.5">Actions</div>
                      {chatHistory.length === 0 && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsDeepResearch(!isDeepResearch); setSourcesOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-800 font-medium transition-colors">
                          <div className="flex items-center gap-3"><Activity className={`w-[18px] h-[18px] ${isDeepResearch ? 'text-blue-600' : 'text-gray-500'}`} /> <span className={isDeepResearch ? 'text-blue-600' : ''}>Deep research</span></div>
                          {isDeepResearch && <Check className="w-[18px] h-[18px] text-blue-600" />}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative shrink-0 hidden sm:block" ref={promptsRef}>
                <button type="button" onClick={(e) => { e.preventDefault(); setPromptsOpen(!promptsOpen); }} className="w-8 h-8 hidden sm:flex items-center justify-center rounded-full hover:bg-gray-200/60 transition-colors shrink-0" title="Prompts">
                  <ListPlus className="w-4 h-4" />
                </button>
                {promptsOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2">
                    <div className="px-3 py-1.5 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Templates</div>
                    <button onClick={(e) => { e.preventDefault(); setPrompt("Draft a mutual NDA governed by California law."); setPromptsOpen(false); }} className="w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors">Mutual NDA (CA)</button>
                    <button onClick={(e) => { e.preventDefault(); setPrompt("Summarize the key indemnification obligations in this agreement."); setPromptsOpen(false); }} className="w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors">Summarize Indemnification</button>
                    <button onClick={(e) => { e.preventDefault(); setPrompt("Identify any non-standard representations and warranties."); setPromptsOpen(false); }} className="w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors">Analyze Reps & Warranties</button>
                  </div>
                )}
              </div>

              <div className="relative shrink-0 hidden sm:block" ref={customizeRef}>
                <button type="button" onClick={(e) => { e.preventDefault(); setCustomizeOpen(!customizeOpen); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/60 transition-colors shrink-0" title="Customize">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                {customizeOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2">
                    <div className="px-3 py-1.5 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Output Style</div>
                    <button onClick={(e) => { e.preventDefault(); setCustomizeOpen(false); }} className="w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors flex justify-between items-center">
                      Concise <Check className="w-4 h-4 text-gray-900" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setCustomizeOpen(false); }} className="w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors flex justify-between items-center">
                      Detailed 
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setCustomizeOpen(false); }} className="w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors flex justify-between items-center">
                      Bullet Points
                    </button>
                  </div>
                )}
              </div>

              {chatHistory.length === 0 && (
                <button onClick={(e) => { e.preventDefault(); setPrompt(prev => prev ? prev + " Please ensure the analysis is legally sound and cites relevant precedents where applicable." : "Please provide a legally sound analysis of the provided context."); }} className="w-8 h-8 hidden sm:flex items-center justify-center rounded-full hover:bg-gray-200/60 transition-colors shrink-0" title="Improve prompt">
                  <Wand2 className="w-4 h-4" />
                </button>
              )}
              {chatHistory.length === 0 && (
                <button onClick={(e) => { e.preventDefault(); setIsDeepResearch(!isDeepResearch); }} className={`w-8 h-8 hidden sm:flex items-center justify-center rounded-full hover:bg-gray-200/60 transition-colors shrink-0 ${isDeepResearch ? 'text-blue-600' : ''}`} title="Deep research">
                  <Activity className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Right side tools */}
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              <button 
                type="button" 
                onClick={toggleRecording}
                className={`w-8 h-8 sm:w-9 sm:h-9 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-200/60 text-gray-700'} rounded-full flex items-center justify-center transition-colors`}
                title="Voice dictate"
              >
                <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
              <button 
                type="button" 
                onClick={toggleVoiceMode}
                className={`w-8 h-8 sm:w-9 sm:h-9 ${isVoiceMode ? 'bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 animate-pulse shadow-lg' : 'hover:bg-gray-200/60 text-gray-700'} rounded-full flex items-center justify-center transition-all`}
                title="Voice assistant mode"
              >
                <AudioLines className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isVoiceMode ? 'text-white' : ''}`} />
              </button>
              <button 
                onClick={handleAskLegalAdvisories}
                disabled={isLoading || (!prompt.trim() && uploadedFiles.length === 0)}
                className="flex items-center justify-center gap-1 bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[13px] font-semibold hover:bg-gray-800 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.12)] disabled:opacity-50 ml-1"
              >
                {isLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                ) : (
                  <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 rounded-full animate-ping opacity-30"></div>
                    <div className="absolute w-3 h-3 bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.6)]"></div>
                    <div className="absolute w-2 h-2 bg-white/80 rounded-full blur-[1px]"></div>
                  </div>
                )}
                <span className="hidden sm:inline">Ask</span>
              </button>
            </div>
          </div>
        </div>

        '''
    
    with open("src/pages/Dashboard.tsx", "w") as f:
        f.write(content[:start_idx] + new_block + content[end_idx:])
        
