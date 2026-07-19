import React, { useState } from 'react';
import { Search, BookOpen, Shield, Scale, FileText, ChevronRight } from 'lucide-react';

const guidanceTopics = [
  { 
    id: 1, 
    title: "M&A Playbook: Due Diligence", 
    category: "Corporate",
    description: "Standard procedures and checklists for conducting M&A due diligence, including red flag identification.",
    icon: BookOpen,
    readTime: "15 min read"
  },
  { 
    id: 2, 
    title: "GDPR vs. CCPA Comparison Guide", 
    category: "Data Privacy",
    description: "Detailed breakdown of the differences between European and California data privacy frameworks.",
    icon: Shield,
    readTime: "20 min read"
  },
  { 
    id: 3, 
    title: "Standard Limitation of Liability Clauses", 
    category: "Commercial",
    description: "Firm-approved limitation of liability clauses and fallback positions for SaaS and enterprise agreements.",
    icon: Scale,
    readTime: "10 min read"
  },
  { 
    id: 4, 
    title: "Employee Termination Guidelines", 
    category: "Employment",
    description: "Step-by-step guidance for high-risk employee terminations across various jurisdictions.",
    icon: FileText,
    readTime: "12 min read"
  },
  { 
    id: 5, 
    title: "Open Source Software Compliance", 
    category: "IP & Tech",
    description: "How to evaluate open source licenses (GPL, MIT, Apache) during technology transactions.",
    icon: Shield,
    readTime: "18 min read"
  },
  { 
    id: 6, 
    title: "Drafting Indemnification Clauses", 
    category: "Commercial",
    description: "Best practices for drafting and negotiating mutual and unilateral indemnities.",
    icon: Scale,
    readTime: "25 min read"
  }
];

const categories = ["All", "Corporate", "Data Privacy", "Commercial", "Employment", "IP & Tech"];

export function Guidance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTopics = guidanceTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-white pt-16 md:pt-0">
      {/* Header section */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-gray-900 mb-1">Guidance & Playbooks</h1>
            <p className="text-[14px] text-gray-500">Firm-approved guides, standard positions, and legal playbooks.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search guidance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-300 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {categories.map(category => (
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
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.length > 0 ? (
              filteredTopics.map(topic => {
                const Icon = topic.icon;
                return (
                  <div key={topic.id} className="bg-white border border-gray-200/80 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-gray-100 text-gray-600">
                        {topic.category}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 text-[16px] mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {topic.title}
                    </h3>
                    
                    <p className="text-[14px] text-gray-500 mb-6 flex-1 line-clamp-3">
                      {topic.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <span className="text-[12px] font-medium text-gray-400">
                        {topic.readTime}
                      </span>
                      <div className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0 -translate-x-2">
                        Read guide <ChevronRight className="w-4 h-4" />
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
                <p className="text-[15px] font-medium text-gray-900 mb-1">No guidance found</p>
                <p className="text-[14px]">Try adjusting your search query or category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
