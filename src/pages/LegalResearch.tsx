import React, { useState } from 'react';
import { Search, BookOpen, Scale, FileText, Bookmark, Bell, FileDown, Loader2, Sparkles, ChevronRight, Library } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { auth } from '../lib/auth';

export function LegalResearch() {
  const [activeTab, setActiveTab] = useState<'ai' | 'acts' | 'cases' | 'updates'>('ai');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResult(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query })
      });
      
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      } else {
        setResult("Error performing research. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setResult("An error occurred during research.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-[#f9f9fa] overflow-hidden">
      {/* Header */}
      <div className="flex-none bg-white border-b border-neutral-200 px-6 py-4 dark:bg-neutral-900 dark:border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <Scale className="h-6 w-6 text-[#c6a87c]" />
              AI Legal Research
            </h1>
            <p className="mt-1 text-sm text-neutral-500">Search laws, analyze cases, and generate comprehensive research reports.</p>
          </div>
          
          <div className="flex bg-neutral-100 p-1 rounded-lg dark:bg-neutral-800">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'ai' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}`}
            >
              <Sparkles className="h-4 w-4" /> AI Research
            </button>
            <button
              onClick={() => setActiveTab('acts')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'acts' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}`}
            >
              <BookOpen className="h-4 w-4" /> Bare Acts
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'cases' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}`}
            >
              <Library className="h-4 w-4" /> Case Laws
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'updates' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}`}
            >
              <Bell className="h-4 w-4" /> Updates
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto w-full h-full">
          {activeTab === 'ai' && (
            <div className="flex flex-col h-full gap-6 lg:flex-row">
              {/* Search Panel */}
              <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Research Query</h2>
                  <form onSubmit={handleResearch} className="flex flex-col gap-4">
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="E.g., Can an employer terminate an employee without notice under Indian labor laws?"
                      className="w-full h-32 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-900 outline-none focus:border-[#c6a87c] focus:ring-1 focus:ring-[#c6a87c] dark:border-neutral-800 dark:bg-neutral-950 dark:text-white resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !query.trim()}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#c6a87c] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#b5986c] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      Generate Research Report
                    </button>
                  </form>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800 flex-1">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-[#c6a87c]" />
                    Saved Research
                  </h3>
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <FileText className="h-8 w-8 text-neutral-300 mb-2" />
                    <p className="text-sm text-neutral-500">No saved reports yet.</p>
                  </div>
                </div>
              </div>

              {/* Report Panel */}
              <div className="w-full lg:w-2/3 flex flex-col">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800 flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                    <h2 className="font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-neutral-400" />
                      Research Report
                    </h2>
                    {result && (
                      <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm font-medium text-[#c6a87c] hover:text-[#b5986c] transition-colors bg-[#c6a87c]/10 px-3 py-1.5 rounded-lg">
                        <FileDown className="h-4 w-4" /> Export PDF
                      </button>
                    )}
                  </div>
                  <div className="p-6 md:p-8 overflow-y-auto flex-1 print:p-0">
                    {!result && !isLoading && (
                      <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-[#c6a87c]/10 rounded-2xl flex items-center justify-center mb-4">
                          <Scale className="h-8 w-8 text-[#c6a87c]" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Smart Legal Research</h3>
                        <p className="text-sm text-neutral-500">
                          Enter your legal query on the left. The AI will analyze facts, find applicable laws, cite landmark judgments, and provide a structured conclusion.
                        </p>
                      </div>
                    )}
                    
                    {isLoading && (
                      <div className="h-full flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#c6a87c] mb-4" />
                        <p className="text-sm font-medium text-neutral-600 animate-pulse">Analyzing laws and judgments...</p>
                      </div>
                    )}

                    {result && (
                      <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-[#c6a87c] prose-h2:border-b prose-h2:border-neutral-100 prose-h2:pb-2">
                        <ReactMarkdown>{result}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'acts' && (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 dark:bg-neutral-900 dark:border-neutral-800 min-h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Bare Acts Library</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input type="text" placeholder="Search acts..." className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#c6a87c] focus:ring-1 focus:ring-[#c6a87c] w-64" />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {['Constitution of India', 'Bharatiya Nyaya Sanhita (BNS)', 'Bharatiya Nagarik Suraksha Sanhita (BNSS)', 'Bharatiya Sakshya Adhiniyam (BSA)', 'Indian Contract Act, 1872', 'Companies Act, 2013', 'Consumer Protection Act, 2019', 'Digital Personal Data Protection Act, 2023', 'Income Tax Act, 1961'].map(act => (
                  <div key={act} className="group flex items-start gap-4 p-4 rounded-xl border border-neutral-100 hover:border-[#c6a87c]/30 hover:shadow-sm transition-all cursor-pointer bg-neutral-50/50">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-neutral-100 text-[#c6a87c]">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-sm mb-1 group-hover:text-[#c6a87c] transition-colors">{act}</h3>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">Read full act <ChevronRight className="h-3 w-3" /></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cases' && (
             <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 dark:bg-neutral-900 dark:border-neutral-800 min-h-full flex flex-col items-center justify-center text-center">
                <Library className="h-12 w-12 text-neutral-300 mb-4" />
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Case Law Database</h2>
                <p className="text-neutral-500 max-w-md">Search across Supreme Court, High Court, and Tribunal orders. Full case law integration is coming in the next update.</p>
             </div>
          )}

          {activeTab === 'updates' && (
             <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 dark:bg-neutral-900 dark:border-neutral-800 min-h-full">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Recent Legal Updates</h2>
                <div className="space-y-4 max-w-3xl">
                  {[
                    { title: "Supreme Court Guidelines on Bail under BNSS", date: "July 24, 2026", type: "Judgment" },
                    { title: "New Amendments to DPDP Act Rules Published", date: "July 22, 2026", type: "Notification" },
                    { title: "Clarification on GST for Software Services", date: "July 18, 2026", type: "Circular" }
                  ].map((update, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Bell className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 uppercase tracking-wider">{update.type}</span>
                          <span className="text-xs text-neutral-400">{update.date}</span>
                        </div>
                        <h3 className="font-medium text-neutral-900">{update.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
