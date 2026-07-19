import React, { useState } from 'react';
import { Search, Lightbulb, ChevronRight, Zap, Target, BookOpen } from 'lucide-react';

const tips = [
  { id: 1, title: "Optimize Your Prompts", category: "Best Practices", description: "Learn how to structure your prompts for more accurate and comprehensive legal analysis.", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
  { id: 2, title: "Keyboard Shortcuts", category: "Productivity", description: "Speed up your workflow with these essential keyboard shortcuts for Legal Advisories.", icon: Target, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 3, title: "Effective Document Comparison", category: "Review", description: "Discover the best techniques for comparing multiple versions of a contract.", icon: BookOpen, color: "text-purple-500", bg: "bg-purple-50" },
  { id: 4, title: "Customizing Workflows", category: "Advanced", description: "Tailor the AI agents to match your firm's specific review protocols.", icon: Lightbulb, color: "text-emerald-500", bg: "bg-emerald-50" },
];

export function Tips() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTips = tips.filter(tip => 
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tip.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white pt-16 md:pt-0">
      {/* Header section */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-gray-900 mb-1">Tips & Tricks</h1>
            <p className="text-[14px] text-gray-500">Enhance your productivity with expert advice and best practices.</p>
          </div>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-300 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTips.length > 0 ? (
            filteredTips.map(tip => {
              const Icon = tip.icon;
              return (
                <div key={tip.id} className="bg-white border border-gray-200/80 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tip.bg} ${tip.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-gray-100 text-gray-600">
                      {tip.category}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 text-[16px] mb-2 group-hover:text-blue-600 transition-colors">
                    {tip.title}
                  </h3>
                  
                  <p className="text-[14px] text-gray-500 mb-6 flex-1">
                    {tip.description}
                  </p>
                  
                  <div className="flex items-center justify-end pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0 -translate-x-2">
                      Read tip <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-[15px] font-medium text-gray-900 mb-1">No tips found</p>
              <p className="text-[14px]">Try adjusting your search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
