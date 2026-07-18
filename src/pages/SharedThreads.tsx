import React, { useState } from 'react';
import { Search, Share2, Users, Clock, MoreHorizontal, MessageSquare, ExternalLink } from 'lucide-react';

const sharedThreads: any[] = [];

export function SharedThreads() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredThreads = sharedThreads.filter(thread => 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    thread.sharedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.sharedWith.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header section */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-gray-900 mb-1">Shared Threads</h1>
            <p className="text-[14px] text-gray-500">Collaborate and view AI conversations shared with your team.</p>
          </div>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search shared threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-300 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
        <div className="max-w-[1000px] mx-auto">
          <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredThreads.length > 0 ? (
                filteredThreads.map(thread => (
                  <div key={thread.id} className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-[15px] font-medium text-gray-900 mb-1.5 truncate group-hover:text-blue-600 transition-colors">
                        {thread.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[13px] text-gray-500">
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {thread.sharedBy} → {thread.sharedWith}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {thread.date}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {thread.messages} messages</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-center">
                      <button className="flex items-center gap-1 text-[13px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md">
                        <ExternalLink className="w-3.5 h-3.5" /> Open
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Share2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-[15px] font-medium text-gray-900 mb-1">No shared threads found</h3>
                  <p className="text-[14px] text-gray-500 max-w-sm">
                    We couldn't find any threads matching "{searchQuery}".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
