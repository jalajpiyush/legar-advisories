import React, { useState, useRef } from 'react';
import { Search, Folder, FileText, MoreHorizontal, Download, Upload, Filter, Plus } from 'lucide-react';

const vaultFolders: any[] = [];
const allDocuments: any[] = [];

interface VaultProps {
  activeFolderId?: string;
}

export function Vault({ activeFolderId }: VaultProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localActiveFolder, setLocalActiveFolder] = useState<string | null>(activeFolderId || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<any[]>(allDocuments);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newDocs = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newDocs.push({
          id: Math.random().toString(),
          title: file.name,
          type: "Uploaded",
          folder: localActiveFolder || "Default",
          date: new Date().toLocaleDateString(),
          size: (file.size / 1024).toFixed(0) + " KB"
        });
      }
      setDocuments(prev => [...prev, ...newDocs]);
      e.target.value = '';
    }
  };

  React.useEffect(() => {
    setLocalActiveFolder(activeFolderId || null);
  }, [activeFolderId]);

  const activeFolder = localActiveFolder;
  const setActiveFolder = setLocalActiveFolder;

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolder ? doc.folder === activeFolder : true;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header section */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-gray-900 mb-1">Vault</h1>
            <p className="text-[14px] text-gray-500">Secure storage for your confidential documents and contracts.</p>
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
              className="bg-black text-white px-4 py-2 rounded-lg text-[14px] font-semibold hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload Files
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search vault..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-300 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> New Folder
            </button>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Folders */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-gray-800 flex items-center gap-2">
                <Folder className="w-4 h-4 text-blue-500" /> Folders
              </h2>
              {activeFolder && (
                <button 
                  onClick={() => setActiveFolder(null)}
                  className="text-[13px] font-medium text-blue-600 hover:text-blue-800"
                >
                  Clear Selection
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vaultFolders.map(folder => (
                <div 
                  key={folder.id} 
                  onClick={() => setActiveFolder(folder.id === activeFolder ? null : folder.id)}
                  className={`bg-white border rounded-xl p-4 transition-all cursor-pointer group ${
                    activeFolder === folder.id 
                      ? "border-blue-500 ring-1 ring-blue-500 shadow-sm" 
                      : "border-gray-200/80 hover:shadow-md hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Folder className="w-5 h-5 fill-blue-100" />
                    </div>
                    <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-[15px] mb-1">{folder.name}</h3>
                  <div className="flex items-center gap-2 text-[13px] text-gray-500">
                    <span>{folder.count} files</span>
                    <span>•</span>
                    <span>Updated {folder.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Files List */}
          <div>
            <h2 className="text-[14px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" /> 
              {activeFolder ? `Files in ${vaultFolders.find(f => f.id === activeFolder)?.name}` : "All Files"}
            </h2>
            
            <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-6">Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Modified</div>
                <div className="col-span-2 text-right">Size</div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map(doc => (
                    <div key={doc.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors group cursor-pointer">
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center border border-gray-100">
                          <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <span className="text-[14px] font-medium text-gray-900 truncate">{doc.title}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-gray-100 text-gray-600">
                          {doc.type}
                        </span>
                      </div>
                      <div className="col-span-2 text-[13px] text-gray-500">
                        {doc.date}
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-3 text-[13px] text-gray-500">
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
                    No files found matching your criteria.
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
