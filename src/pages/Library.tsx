import React, { useState } from 'react';
import { Search, Filter, FileText, Download, MoreHorizontal, Book, BookOpen, Star, Clock } from 'lucide-react';

const categories = [
  "All", "Corporate", "Commercial", "Employment", "Real Estate", "IP", "Litigation"
];

const documents: any[] = [];

export function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [docs, setDocs] = useState<any[]>(documents);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newDocs = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newDocs.push({
          id: Math.random(),
          title: file.name,
          type: "Uploaded",
          category: selectedCategory === "All" ? "Corporate" : selectedCategory,
          date: new Date().toLocaleDateString(),
          updatedBy: "Me",
          size: (file.size / 1024).toFixed(0) + " KB",
          starred: false
        });
      }
      setDocs(prev => [...prev, ...newDocs]);
      e.target.value = '';
    }
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header section */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-gray-900 mb-1">Library</h1>
            <p className="text-[14px] text-gray-500">Access firm precedents, templates, and reference materials.</p>
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
              className="bg-black text-white px-4 py-2 rounded-lg text-[14px] font-semibold hover:bg-gray-800 transition-colors shadow-sm"
            >
              Upload Document
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search library..."
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
        <div className="max-w-[1200px] mx-auto">
          
          <div className="mb-8">
            <h2 className="text-[14px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Starred items
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {documents.filter(d => d.starred).map(doc => (
                <div key={doc.id} className="bg-white border border-gray-200/80 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-[14px] leading-snug mb-1 line-clamp-2">{doc.title}</h3>
                  <div className="flex items-center gap-2 text-[12px] text-gray-500">
                    <span className="font-medium px-1.5 py-0.5 rounded bg-gray-100">{doc.category}</span>
                    <span>•</span>
                    <span>{doc.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[14px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-500" /> All documents
            </h2>
            
            <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Last Updated</div>
                <div className="col-span-2">Updated By</div>
                <div className="col-span-1 text-right">Size</div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map(doc => (
                    <div key={doc.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors group cursor-pointer">
                      <div className="col-span-5 flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[14px] font-medium text-gray-900 truncate">{doc.title}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-gray-100 text-gray-600">
                          {doc.category}
                        </span>
                      </div>
                      <div className="col-span-2 text-[13px] text-gray-500">
                        {doc.date}
                      </div>
                      <div className="col-span-2 text-[13px] text-gray-500">
                        {doc.updatedBy}
                      </div>
                      <div className="col-span-1 flex items-center justify-end gap-3 text-[13px] text-gray-500">
                        <span className="group-hover:hidden">{doc.size}</span>
                        <div className="hidden group-hover:flex items-center gap-2">
                          <button className="p-1 hover:bg-white rounded text-gray-500 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-200">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center text-gray-500 text-[14px]">
                    No documents found matching "{searchQuery}" in {selectedCategory}.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
