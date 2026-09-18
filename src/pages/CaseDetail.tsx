import React, { useState } from 'react';
import { ArrowLeft, FileText, Clock, Users, HelpCircle, Search, Edit3, BookOpen, FileCode, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { ExportMenu } from '../components/ExportMenu';

export function CaseDetail({ caseData, onBack }: { caseData: any, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = [
    { name: 'Overview', icon: BookOpen },
    { name: 'Documents', icon: FileText },
    { name: 'Timeline', icon: Clock },
    { name: 'People', icon: Users },
    { name: 'Questions', icon: HelpCircle },
    { name: 'Research', icon: Search },
    { name: 'Drafts', icon: Edit3 },
    { name: 'Notes', icon: FileCode },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-neutral-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-neutral-400" />
            </button>
            <div>
              <div className="text-sm font-semibold text-[#c6a87c] tracking-wider uppercase mb-1">CASE: {caseData.caseType || 'Matter'}</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{caseData.title}</h1>
            </div>
          </div>
          <ExportMenu 
            title={`Case Summary - ${caseData.title}`} 
            content={`# Case: ${caseData.title}

**Type:** ${caseData.caseType || 'Matter'}
**Status:** ${caseData.status || 'Active'}

## Description
${caseData.description || "No description provided."}`} 
            buttonVariant="outline" 
          />
        </div>
        
        {/* Tabs */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={cn(
                "flex items-center gap-2 pb-3 border-b-2 text-[14px] font-medium transition-colors whitespace-nowrap",
                activeTab === tab.name
                  ? "border-[#c6a87c] text-[#c6a87c]"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-300"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Case Summary</h3>
                <p className="text-gray-600 dark:text-neutral-400">{caseData.description || "No description provided."}</p>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Client</div>
                    <div className="font-medium text-gray-900 dark:text-white">{caseData.clientName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</div>
                    <div className="font-medium text-gray-900 dark:text-white">{caseData.status}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Priority</div>
                    <div className="font-medium text-gray-900 dark:text-white">{caseData.priority}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created</div>
                    <div className="font-medium text-gray-900 dark:text-white">{new Date(caseData.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Context Memory</h3>
                <p className="text-[14px] text-gray-500 dark:text-neutral-400 mb-4">
                  The AI assistant automatically maintains context across all documents, research, and notes within this case.
                </p>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm border border-blue-100 dark:border-blue-900/50">
                  <CheckSquare className="w-5 h-5 flex-shrink-0" />
                  <span>Context synchronization active. You can switch tabs or ask questions, and the AI will recall the specifics of {caseData.title}.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Documents' && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center bg-gray-50 dark:bg-neutral-900">
                <h3 className="font-semibold text-gray-900 dark:text-white">Case Documents</h3>
                <button className="px-3 py-1.5 bg-[#c6a87c] text-white rounded-lg text-sm font-medium hover:bg-[#b5986c] transition-colors">
                  Upload Document
                </button>
              </div>
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-gray-900 dark:text-white font-medium mb-1">No documents yet</h4>
                <p className="text-gray-500 text-sm max-w-sm">Upload contracts, evidence, or related files. The AI will instantly analyze and remember them.</p>
              </div>
            </div>
          )}

          {activeTab === 'Questions' && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
                <h3 className="font-semibold text-gray-900 dark:text-white">Ask AI About This Case</h3>
                <p className="text-xs text-gray-500 mt-1">AI remembers all documents and history inside {caseData.title}</p>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-end bg-[#FAFAFA] dark:bg-neutral-950">
                {/* Chat Mockup */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-4 rounded-2xl rounded-tl-sm max-w-[80%] text-sm text-gray-700 dark:text-neutral-300">
                      I have loaded the context for <strong>{caseData.title}</strong>. I'm ready to answer questions, analyze the documents, or help draft responses.
                    </div>
                  </div>
                </div>
                {/* Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ask a question about this matter..."
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[#c6a87c] focus:ring-1 focus:ring-[#c6a87c] text-gray-900 dark:text-white"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#c6a87c] text-white rounded-lg hover:bg-[#b5986c] transition-colors">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Placeholders for other tabs */}
          {['Timeline', 'People', 'Research', 'Drafts', 'Notes'].includes(activeTab) && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-[400px] items-center justify-center text-center p-8">
               <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  {activeTab === 'Timeline' && <Clock className="w-8 h-8" />}
                  {activeTab === 'People' && <Users className="w-8 h-8" />}
                  {activeTab === 'Research' && <Search className="w-8 h-8" />}
                  {activeTab === 'Drafts' && <Edit3 className="w-8 h-8" />}
                  {activeTab === 'Notes' && <FileCode className="w-8 h-8" />}
               </div>
               <h4 className="text-gray-900 dark:text-white font-medium mb-2">{activeTab}</h4>
               <p className="text-gray-500 text-sm max-w-md">This section is synced with the AI's case memory. Items added here will be automatically factored into your case context.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
