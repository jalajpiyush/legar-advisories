import React, { useState, useRef } from 'react';
import { Search, Plus, FileText, Wand2, ArrowRight, Upload, FileCode, CheckCircle2 } from 'lucide-react';

const createTemplates = [
  { id: 1, title: "New Document", description: "Start from a blank slate or upload an existing file to analyze.", icon: FileText, category: "Document", color: "text-blue-600", bg: "bg-blue-50" },
  { id: 2, title: "Custom Workflow", description: "Design a new AI workflow by combining different agent steps.", icon: Wand2, category: "Automation", color: "text-purple-600", bg: "bg-purple-50" },
  { id: 3, title: "Contract Analysis", description: "Upload a contract for automatic risk analysis and term extraction.", icon: FileCode, category: "Review", color: "text-amber-600", bg: "bg-amber-50" },
  { id: 4, title: "Client Alert Draft", description: "Generate a client alert based on recent regulatory changes.", icon: FileText, category: "Drafting", color: "text-emerald-600", bg: "bg-emerald-50" },
];

export function Create() {
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        newFiles.push(files[i]);
      }
      setUploadedFiles(prev => [...prev, ...newFiles]);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const filteredTemplates = createTemplates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white pt-16 md:pt-0">
      {/* Header section */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-gray-900 mb-1">Create</h1>
            <p className="text-[14px] text-gray-500">Start a new document, workflow, or analysis task.</p>
          </div>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-300 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
        <div className="max-w-[1000px] mx-auto">
          
          <div className="mb-10">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Upload</h2>
                <p className="text-[14px] text-gray-600 mb-4 max-w-md">
                  Drag and drop a document here, or click to browse. We'll automatically categorize and extract key information.
                </p>
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4 max-w-md">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-[13px] font-medium">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(index)} className="hover:bg-gray-100 p-1 rounded-md ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="w-0 h-0 opacity-0 absolute overflow-hidden pointer-events-none" 
                  multiple 
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg text-[14px] font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Browse Files
                </button>
              </div>
              <div className="w-full sm:w-auto p-6 border-2 border-dashed border-blue-200 rounded-xl bg-white/50 text-center text-blue-600 font-medium text-[14px]">
                Drop files here
              </div>
            </div>
          </div>

          <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Start from Template</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map(template => {
                const Icon = template.icon;
                return (
                  <div key={template.id} className="bg-white border border-gray-200/80 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${template.bg} ${template.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-gray-100 text-gray-600">
                        {template.category}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 text-[16px] mb-2 group-hover:text-blue-600 transition-colors">
                      {template.title}
                    </h3>
                    
                    <p className="text-[14px] text-gray-500 mb-6 flex-1">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-end pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0 -translate-x-2">
                        Use Template <ArrowRight className="w-4 h-4" />
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
                <p className="text-[15px] font-medium text-gray-900 mb-1">No templates found</p>
                <p className="text-[14px]">Try adjusting your search query.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
