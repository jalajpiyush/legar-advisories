import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Calendar, FileText, Bell, Sparkles, Building2, 
  CheckCircle2, AlertTriangle, XCircle, ChevronRight, Loader2, Play
} from 'lucide-react';
import { auth } from '../lib/auth';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Company {
  id: string;
  name: string;
  cin: string;
  gst: string;
  pan: string;
}

interface ComplianceTask {
  id: string;
  type: string;
  dueDate: number;
  status: 'Completed' | 'Pending' | 'Overdue';
}

const mockCompliances: ComplianceTask[] = [
  { id: '1', type: 'GST Returns (GSTR-3B)', dueDate: Date.now() + 86400000 * 5, status: 'Pending' },
  { id: '2', type: 'Income Tax Advance Tax', dueDate: Date.now() - 86400000 * 2, status: 'Completed' },
  { id: '3', type: 'ROC Filing (AOC-4)', dueDate: Date.now() + 86400000 * 12, status: 'Pending' },
  { id: '4', type: 'Labour Compliance', dueDate: Date.now() + 86400000 * 20, status: 'Pending' },
  { id: '5', type: 'Trademark Renewal', dueDate: Date.now() - 86400000 * 10, status: 'Overdue' }
];

export function Compliance() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'vault' | 'ai'>('dashboard');
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [tasks, setTasks] = useState<ComplianceTask[]>(mockCompliances);
  
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    // In a real app we'd fetch companies and tasks here.
    // For now we'll mock one company if none exist
    if (companies.length === 0) {
      const mockCompany: Company = {
        id: 'c1', name: 'LexMind Technologies Pvt Ltd', cin: 'U72900MH2023PTC123456', gst: '27AADCB2230M1Z2', pan: 'AADCB2230M'
      };
      setCompanies([mockCompany]);
      setActiveCompany(mockCompany);
    }
  }, []);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoadingAi(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/compliances/ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query, companyContext: activeCompany })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.result);
      }
    } catch (e) {
      console.error(e);
      setAiResponse("Failed to get response from AI. Please try again.");
    } finally {
      setLoadingAi(false);
    }
  };

  const calculateScore = () => {
    if (tasks.length === 0) return 100;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    return Math.round(((completed + pending * 0.5) / tasks.length) * 100);
  };
  
  const score = calculateScore();

  return (
    <div className="flex flex-col h-full bg-[#f9f9fa] overflow-hidden">
      {/* Header */}
      <div className="flex-none bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-green-600" />
              Compliance Manager
            </h1>
            <p className="mt-1 text-sm text-neutral-500">Track due dates, store documents, and get AI guidance.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {activeCompany && (
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
                <Building2 className="h-4 w-4 text-neutral-500" />
                {activeCompany.name}
              </div>
            )}
            <div className="flex bg-neutral-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn("flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'dashboard' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900')}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={cn("flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'calendar' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900')}
              >
                Calendar
              </button>
              <button
                onClick={() => setActiveTab('vault')}
                className={cn("flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'vault' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900')}
              >
                Vault
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={cn("flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'ai' ? 'bg-[#c6a87c] text-white shadow-sm' : 'text-[#c6a87c] hover:bg-neutral-200')}
              >
                <Sparkles className="h-4 w-4" /> AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Score & Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col items-center justify-center text-center col-span-1">
                  <div className="relative mb-2">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-neutral-100" />
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={56 * 2 * Math.PI} strokeDashoffset={56 * 2 * Math.PI - (score / 100) * 56 * 2 * Math.PI} className={score > 80 ? "text-green-500" : score > 50 ? "text-yellow-500" : "text-red-500"} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-neutral-900">{score}%</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-neutral-900">Compliance Score</h3>
                  <p className="text-sm text-neutral-500 mt-1">Good standing. Keep it up!</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm col-span-1 md:col-span-2">
                  <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-yellow-500" /> Action Required
                  </h3>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status !== 'Completed').map(task => (
                      <div key={task.id} className={cn("flex items-center justify-between p-3 rounded-xl border", task.status === 'Overdue' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100')}>
                        <div className="flex items-center gap-3">
                          {task.status === 'Overdue' ? <XCircle className="h-5 w-5 text-red-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                          <div>
                            <p className={cn("font-medium text-sm", task.status === 'Overdue' ? "text-red-900" : "text-yellow-900")}>{task.type}</p>
                            <p className={cn("text-xs", task.status === 'Overdue' ? "text-red-600" : "text-yellow-700")}>
                              {task.status === 'Overdue' ? 'Overdue by ' : 'Due in '} 
                              {Math.abs(Math.ceil((task.dueDate - Date.now()) / (1000 * 60 * 60 * 24)))} days
                            </p>
                          </div>
                        </div>
                        <button className={cn("text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors", task.status === 'Overdue' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-yellow-500 text-white hover:bg-yellow-600')}>
                          Take Action
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#c6a87c]" /> Smart Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                    <p className="text-sm text-neutral-700">"Renew your trademark within 10 days to avoid late fees."</p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                    <p className="text-sm text-neutral-700">"File GSTR-3B before the due date to maintain your perfect streak."</p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                    <p className="text-sm text-neutral-700">"Your company should maintain statutory registers updated for this financial year."</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-neutral-400" /> Upcoming Deadlines
                </h2>
              </div>
              <div className="space-y-4">
                {tasks.sort((a, b) => a.dueDate - b.dueDate).map(task => (
                  <div key={task.id} className="flex items-center gap-4 p-4 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors">
                    <div className="w-16 flex flex-col items-center justify-center border-r border-neutral-100 pr-4">
                      <span className="text-xs font-bold text-neutral-400 uppercase">{new Date(task.dueDate).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-2xl font-black text-neutral-800">{new Date(task.dueDate).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900">{task.type}</h4>
                      <p className="text-xs text-neutral-500 mt-1">Status: {task.status}</p>
                    </div>
                    <div>
                      {task.status === 'Completed' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                      ) : task.status === 'Overdue' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                          <XCircle className="h-3 w-3" /> Overdue
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                          <AlertTriangle className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm min-h-[500px]">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-neutral-400" /> Document Vault
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {['Certificate of Incorporation', 'PAN Card', 'TAN Letter', 'GST Registration', 'Trademark Certificate', 'Shop & Establishment Licence'].map((doc, i) => (
                  <div key={i} className="group p-4 border border-neutral-200 rounded-xl hover:border-[#c6a87c] hover:shadow-md transition-all cursor-pointer bg-neutral-50 flex flex-col items-center text-center">
                    <FileText className="h-10 w-10 text-[#c6a87c] mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <h4 className="text-sm font-medium text-neutral-900">{doc}</h4>
                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">View Document <ChevronRight className="h-3 w-3" /></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm h-[600px] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
                <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#c6a87c]" /> AI Compliance Assistant
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Ask questions about required filings, due dates, or general Indian corporate compliance.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/30">
                {aiResponse ? (
                  <div className="prose prose-sm max-w-none prose-neutral prose-headings:font-serif prose-headings:text-[#c6a87c] bg-white p-6 rounded-xl border border-neutral-100 shadow-sm">
                    <ReactMarkdown>{aiResponse}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                    <Sparkles className="h-12 w-12 text-neutral-200 mb-4" />
                    <p className="text-sm">Try asking: "What compliances does my private limited company need this month?"</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-neutral-100 bg-white">
                <form onSubmit={handleAskAI} className="relative max-w-4xl mx-auto">
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Ask a compliance question..."
                    disabled={loadingAi}
                    className="w-full pl-4 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-[#c6a87c] focus:ring-1 focus:ring-[#c6a87c] disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={loadingAi || !query.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#c6a87c] text-white rounded-lg hover:bg-[#b5986c] disabled:opacity-50 transition-colors"
                  >
                    {loadingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
