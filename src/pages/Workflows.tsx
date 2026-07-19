import React, { useState } from 'react';
import { Search, Wand2, Activity, Plus, FileText, ArrowRight, Network } from 'lucide-react';

const workflowCategories = [
  "All", "Drafting", "Extraction", "Analysis", "Compliance", "Due Diligence"
];

const workflows = [
  { id: 1, title: "Draft a client alert", description: "Generate a comprehensive client alert on recent regulatory changes or case law updates.", category: "Drafting", icon: Wand2, steps: 5, color: "text-purple-600", bg: "bg-purple-50" },
  { id: 2, title: "Generate post-closing timeline", description: "Create a detailed timeline of obligations and deadlines following a transaction closing.", category: "Analysis", icon: Activity, steps: 2, color: "text-blue-600", bg: "bg-blue-50" },
  { id: 3, title: "Extract chronology of key events", description: "Analyze case files to build a chronological sequence of factual events.", category: "Extraction", icon: Plus, steps: 2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: 4, title: "Extract terms from stock purchase agreements", description: "Identify and tabulate key commercial terms from SPAs.", category: "Extraction", icon: Activity, steps: 2, color: "text-blue-600", bg: "bg-blue-50" },
  { id: 5, title: "Draft employment contract", description: "Generate a standard employment agreement based on role, jurisdiction, and compensation.", category: "Drafting", icon: Wand2, steps: 4, color: "text-purple-600", bg: "bg-purple-50" },
  { id: 6, title: "Analyze non-compete enforceability", description: "Review restrictive covenants against current state laws to assess enforceability.", category: "Compliance", icon: Network, steps: 3, color: "text-amber-600", bg: "bg-amber-50" },
  { id: 7, title: "M&A Due Diligence summary", description: "Summarize red flags and material findings from a data room export.", category: "Due Diligence", icon: FileText, steps: 6, color: "text-rose-600", bg: "bg-rose-50" },
  { id: 8, title: "Draft board resolutions", description: "Create standard board resolutions for routine corporate actions.", category: "Drafting", icon: Wand2, steps: 3, color: "text-purple-600", bg: "bg-purple-50" },
];

export function Workflows() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase()) || w.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || w.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header section */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 bg-white sticky top-0 z-10 pt-16 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-serif text-gray-900 mb-1">Workflows</h1>
            <p className="text-[14px] text-gray-500">Automate complex legal tasks with multi-step AI agents.</p>
          </div>
          <button className="bg-black text-white px-4 py-2 rounded-lg text-[14px] font-semibold hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Create Workflow
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-300 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {workflowCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  selectedCategory === category 
                    ? "bg-gray-900 text-white" 
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkflows.length > 0 ? (
            filteredWorkflows.map(workflow => {
              const Icon = workflow.icon;
              return (
                <div key={workflow.id} className="bg-white border border-gray-200/80 rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${workflow.bg} ${workflow.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium bg-gray-50 text-gray-600 border border-gray-100">
                      {workflow.category}
                    </span>
                  </div>
                  
                  <h3 className="text-[16px] font-semibold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {workflow.title}
                  </h3>
                  
                  <p className="text-[14px] text-gray-500 mb-6 flex-1">
                    {workflow.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="text-[13px] font-medium text-gray-500">
                      {workflow.steps} steps
                    </div>
                    <div className="flex items-center gap-1 text-[13px] font-semibold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform">
                      Run workflow <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-[15px] font-medium text-gray-900 mb-1">No workflows found</p>
              <p className="text-[14px]">Try adjusting your search or category filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
