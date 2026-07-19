import React, { useState, useRef, useEffect } from "react";
import { 
  Folder, Briefcase, Plus, Search, ChevronDown,
  Settings2, Wand2, Globe, Building2, 
  ChevronRight, FileText, ListPlus, SlidersHorizontal, Activity, Users, Bot, User, Check
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { addHistoryItem, updateHistoryItemMessages } from "../lib/history";

export function Dashboard() {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const sourcesRef = useRef<HTMLDivElement>(null);
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        newFiles.push(files[i]);
      }
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setSourcesOpen(false);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const getTagClass = (tag: string) => `flex items-center gap-2 text-[14px] font-semibold border px-4 py-2 rounded-full shadow-[0_1px_2px_rgb(0,0,0,0.03)] transition-colors cursor-pointer ${selectedTags.includes(tag) ? 'border-gray-800 bg-gray-50 text-gray-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`;
  const getTagSuffix = (tag: string) => <span className="text-gray-400 font-normal ml-1">{selectedTags.includes(tag) ? '✓' : '+'}</span>;
  const getDropdownSourceClass = (tag: string, additionalClasses: string = "") => `w-full flex items-center px-3 py-2 rounded-lg transition-colors ${selectedTags.includes(tag) ? 'bg-gray-100/80 text-gray-900 font-semibold' : 'hover:bg-gray-50 text-gray-800 font-medium'} ${additionalClasses}`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sourcesRef.current && !sourcesRef.current.contains(event.target as Node)) {
        setSourcesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAskLegalAdvisories = async () => {
    if ((!prompt.trim() && uploadedFiles.length === 0) || isLoading) return;

    const currentPrompt = prompt || "Please review the attached file(s).";
    const currentFiles = [...uploadedFiles];
    
    setIsLoading(true);

    try {
      const fileDataPromises = currentFiles.map(file => {
        return new Promise<{mimeType: string, data: string, name: string}>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            const base64Data = result.split(',')[1];
            resolve({
              mimeType: file.type || 'application/octet-stream',
              data: base64Data,
              name: file.name
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const fileParts = await Promise.all(fileDataPromises);
      
      let finalContent = currentPrompt;
      if (currentFiles.length > 0) {
        finalContent += "\n\n" + currentFiles.map(f => `[Attached File: ${f.name}]`).join("\n");
      }
      if (selectedTags.length > 0) {
        finalContent += "\n\n[Selected Sources: " + selectedTags.join(", ") + "]";
      }

      const userMessage = { role: 'user' as const, content: finalContent };
      setChatHistory(prev => [...prev, userMessage]);
      setPrompt("");
      setUploadedFiles([]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatHistory, userMessage],
          files: fileParts
        })
      });

      let hId = currentHistoryId;
      if (!hId) {
        hId = addHistoryItem(currentPrompt.substring(0, 50) + (currentPrompt.length > 50 ? "..." : ""), "Chat", [...chatHistory, userMessage]);
        setCurrentHistoryId(hId);
      } else {
        updateHistoryItemMessages(hId, [...chatHistory, userMessage]);
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const modelMsg = { role: 'model' as const, content: data.reply || "Error parsing response." };
      setChatHistory(prev => {
        const newHistory = [...prev, modelMsg];
        updateHistoryItemMessages(hId, newHistory);
        return newHistory;
      });
    } catch (error: any) {
      console.error(error);
      const errorMsg = { role: 'model' as const, content: `**Error:** Failed to connect to the Legal Advisories backend.\n\nDetails: ${error.message}` };
      setChatHistory(prev => {
        const newHistory = [...prev, errorMsg];
        if (currentHistoryId) {
          updateHistoryItemMessages(currentHistoryId, newHistory);
        }
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center pt-4 sm:pt-8 md:pt-12 px-4 md:px-8 max-w-[1000px] mx-auto min-h-full pb-6 sm:pb-20 w-full">
      {/* Title */}
      {chatHistory.length === 0 && (
        <h1 className="text-[28px] sm:text-[36px] md:text-[44px] font-serif text-gray-900 mb-4 sm:mb-8 md:mb-12 tracking-tight mt-[2vh] md:mt-[5vh] text-center w-full">Legal Advisories</h1>
      )}
      
      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="w-full max-w-[900px] mb-8 space-y-6">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} gap-4`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-gray-900" : "bg-gray-100 border border-gray-200"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-gray-700" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === "user" ? "bg-gray-100 text-gray-900" : "bg-white border border-gray-200/80 shadow-sm text-gray-800"}`}>
                  <div className="text-[15px] prose prose-gray max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] flex-row gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-100 border border-gray-200">
                  <Bot className="w-4 h-4 text-gray-700" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm text-gray-800 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Prompt Container */}
      <div className="w-full max-w-[900px] mt-auto">
        {/* Top actions */}
        {chatHistory.length === 0 && (
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mb-3 px-1 text-[14px] font-semibold text-gray-900">
            <div className="relative group">
              <button className="flex items-center gap-2 hover:text-gray-600 transition-colors">
                <Folder className="w-[18px] h-[18px] opacity-80" /> Choose project
                <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Projects</div>
                <div className="px-4 py-2 text-[13px] text-gray-500 italic">No recent projects</div>
                <div className="h-px bg-gray-100 my-1"></div>
                <button className="w-full text-left px-4 py-2 text-[14px] font-medium text-blue-600 hover:bg-blue-50 transition-colors">+ Create New Project</button>
              </div>
            </div>
            
            <div className="relative group">
              <button className="flex items-center gap-2 hover:text-gray-600 transition-colors">
                <Briefcase className="w-[18px] h-[18px] opacity-80" /> Set client matter
                <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Matters</div>
                <div className="px-4 py-2 text-[13px] text-gray-500 italic">No active matters</div>
                <div className="h-px bg-gray-100 my-1"></div>
                <button className="w-full text-left px-4 py-2 text-[14px] font-medium text-blue-600 hover:bg-blue-50 transition-colors">View All Matters</button>
              </div>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="bg-[#f9f9fa] border border-gray-200/80 rounded-2xl p-5 flex flex-col relative focus-within:ring-2 focus-within:ring-gray-200 transition-all shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 shadow-sm rounded-lg text-[13px] font-medium">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="hover:bg-gray-100 p-0.5 rounded-md ml-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAskLegalAdvisories();
              }
            }}
            placeholder="Ask Legal Advisories anything..."
            className={`w-full bg-transparent resize-none outline-none text-gray-800 placeholder:text-gray-400 ${chatHistory.length > 0 ? 'min-h-[60px] sm:min-h-[80px]' : 'min-h-[80px] sm:min-h-[140px]'} text-[16px] leading-relaxed font-medium`}
            disabled={isLoading}
          />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-[14px] font-semibold text-gray-600">
              <div className="relative" ref={sourcesRef}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="w-0 h-0 opacity-0 absolute overflow-hidden pointer-events-none" 
                  multiple 
                  onChange={handleFileUpload} 
                />
                <button 
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="flex items-center gap-2 text-gray-800 hover:text-black transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-[0_1px_3px_rgb(0,0,0,0.05)]"
                >
                  <Plus className="w-[18px] h-[18px]" /> Files and sources
                </button>

                {/* Sources Dropdown */}
                {sourcesOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-[280px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 text-[14px]">
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
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTag('LexisNexis'); }} className={getDropdownSourceClass('LexisNexis', 'justify-between')}>
                        <div className="flex items-center gap-3">
                          <div className="w-[18px] h-[18px] bg-red-600 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>
                          LexisNexis
                        </div>
                        {selectedTags.includes('LexisNexis') && <Check className="w-4 h-4 text-gray-900" />}
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
                  </div>
                )}
              </div>

              <button className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                <ListPlus className="w-[18px] h-[18px]" /> Prompts
              </button>
              <button className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                <SlidersHorizontal className="w-[18px] h-[18px]" /> Customize
              </button>
              {chatHistory.length === 0 && (
                <button className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                  <Wand2 className="w-[18px] h-[18px]" /> Improve
                </button>
              )}
              {chatHistory.length === 0 && (
                <button className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                  <Activity className="w-[18px] h-[18px]" />
                  Deep research
                </button>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-5 w-full sm:w-auto mt-2 sm:mt-0">
              <button 
                onClick={handleAskLegalAdvisories}
                disabled={isLoading || (!prompt.trim() && uploadedFiles.length === 0)}
                className="w-full sm:w-auto bg-black text-white px-5 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
              >
                Ask Legal Advisories
              </button>
            </div>
          </div>
        </div>

        {/* Selected Sources Pills */}
        {chatHistory.length === 0 && (
          <>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <button onClick={() => toggleTag('iManage')} className={getTagClass('iManage')}>
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[9px] text-white font-bold">m</div>
                iManage {getTagSuffix('iManage')}
              </button>
              <button onClick={() => toggleTag('LexisNexis')} className={getTagClass('LexisNexis')}>
                <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>
                LexisNexis {getTagSuffix('LexisNexis')}
              </button>
              <button onClick={() => toggleTag('Web search')} className={getTagClass('Web search')}>
                <Globe className="w-4 h-4 text-blue-500" />
                Web search {getTagSuffix('Web search')}
              </button>
              <button onClick={() => toggleTag('EDGAR')} className={getTagClass('EDGAR')}>
                <Building2 className="w-4 h-4 text-gray-500" />
                EDGAR {getTagSuffix('EDGAR')}
              </button>
              {selectedTags.filter(t => t.startsWith('Vault project:')).map(t => (
                <button key={t} onClick={() => toggleTag(t)} className={getTagClass(t)}>
                  <Folder className="w-4 h-4 text-gray-500" />
                  {t.replace('Vault project: ', '')} {getTagSuffix(t)}
                </button>
              ))}
              {selectedTags.filter(t => t.startsWith('Knowledge base:')).map(t => (
                <button key={t} onClick={() => toggleTag(t)} className={getTagClass(t)}>
                  <FileText className="w-4 h-4 text-gray-500" />
                  {t.replace('Knowledge base: ', '')} {getTagSuffix(t)}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Empty placeholder to keep chat input at bottom when history is empty */}
        {chatHistory.length === 0 && (
          <div className="flex-1" />
        )}

        {/* Vault Modal */}
        {isVaultModalOpen && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-xl shadow-xl w-[400px] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Select Vault Project</h3>
                <button onClick={() => setIsVaultModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {['Project Alpha (M&A)', 'Project Horizon (IP)', 'Project Phoenix (Litigation)', 'Project Titan (Compliance)'].map(proj => (
                  <button 
                    key={proj}
                    onClick={() => { 
                      if (!selectedTags.includes(`Vault project: ${proj}`)) {
                        setSelectedTags(prev => [...prev, `Vault project: ${proj}`]);
                      }
                      setIsVaultModalOpen(false); 
                    }}
                    className="w-full flex items-center justify-between text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg text-gray-700 font-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Folder className="w-[18px] h-[18px] text-gray-400" />
                      {proj}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Base Modal */}
        {isKbModalOpen && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-xl shadow-xl w-[400px] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Select Knowledge Base</h3>
                <button onClick={() => setIsKbModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {['Contracts Playbook', 'Employment Law Guidelines', 'Tax Regulations 2024', 'Corporate Governance Memos'].map(kb => (
                  <button 
                    key={kb}
                    onClick={() => { 
                      if (!selectedTags.includes(`Knowledge base: ${kb}`)) {
                        setSelectedTags(prev => [...prev, `Knowledge base: ${kb}`]);
                      }
                      setIsKbModalOpen(false); 
                    }}
                    className="w-full flex items-center justify-between text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg text-gray-700 font-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-[18px] h-[18px] text-gray-400" />
                      {kb}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

