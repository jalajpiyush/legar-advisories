import React, { useState } from 'react';
import { Search, Database, Book, Scale, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from "motion/react";

const knowledgeBases: any[] = [];

export function Knowledge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bases, setBases] = useState<any[]>(knowledgeBases);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newBases = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newBases.push({
          id: Math.random(),
          title: file.name,
          description: "Custom uploaded dataset.",
          category: "Custom",
          icon: Database,
          status: "Ready",
          lastUpdated: "Just now",
          documents: 1,
          color: "text-blue-600",
          bg: "bg-blue-50"
        });
      }
      setBases(prev => [...prev, ...newBases]);
      e.target.value = '';
    }
  };

  const filteredBases = bases.filter(kb => 
    kb.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    kb.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 pt-16 md:pt-0">
      {/* Header section */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h1 layoutId="page-title" className="text-2xl font-serif text-gray-900 dark:text-neutral-100 mb-1">Knowledge Bases</motion.h1>
            <motion.p layoutId="page-description" className="text-[14px] text-gray-500 dark:text-neutral-400">Manage the legal datasets and training materials your AI has access to.</motion.p>
          </div>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="w-0 h-0 opacity-0 absolute overflow-hidden pointer-events-none" 
              multiple 
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-[14px] font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm flex items-center gap-2"
            >
              <Database className="w-4 h-4" /> Add Dataset
            </button>
          </div>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-gray-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search knowledge bases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-[14px] outline-none focus:border-gray-300 dark:border-neutral-700 focus:bg-white dark:bg-neutral-900 transition-all text-gray-800 dark:text-neutral-200 placeholder:text-gray-400 dark:text-neutral-500"
          />
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA] dark:bg-neutral-900">
        <div className="max-w-[1200px] mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBases.length > 0 ? (
              filteredBases.map(kb => (
                <div key={kb.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800/80 rounded-xl p-5 hover:shadow-md hover:border-gray-300 dark:border-neutral-700 transition-all flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      {kb.category === "Case Law" ? <Scale className="w-5 h-5" /> : <Book className="w-5 h-5" />}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[12px] font-medium ${
                      kb.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {kb.status === "Active" ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                      {kb.status}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-neutral-100 text-[15px] mb-1 line-clamp-2">
                    {kb.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between text-[13px] text-gray-500 dark:text-neutral-400">
                    <span className="font-medium px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-md">{kb.category}</span>
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {kb.size}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 dark:text-neutral-400">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                  <Database className="w-6 h-6 text-gray-400 dark:text-neutral-500" />
                </div>
                <p className="text-[15px] font-medium text-gray-900 dark:text-neutral-100 mb-1">No knowledge bases found</p>
                <p className="text-[14px]">Try adjusting your search query.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
