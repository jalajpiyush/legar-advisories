import React, { useState, useEffect } from 'react';
import { Search, Clock, MessageSquare, Wand2, FileText, MoreHorizontal, Filter, ChevronDown, ChevronUp, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getHistory, HistoryItem } from '../lib/history';

export function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  const filteredItems = historyItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return MessageSquare;
      case 'Wand2': return Wand2;
      case 'FileText': return FileText;
      default: return MessageSquare;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white pt-16 md:pt-0">
      {/* Header section */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-gray-900 mb-1">History</h1>
            <p className="text-[14px] text-gray-500">Review your past conversations, workflows, and document analyses.</p>
          </div>
          <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-[14px] font-semibold hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search history..."
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
              {filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const Icon = getIcon(item.iconName);
                  const isExpanded = expandedItem === item.id;
                  return (
                    <div key={item.id} className="border-b border-gray-100 last:border-0">
                      <div 
                        className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors cursor-pointer group"
                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h3 className="text-[15px] font-medium text-gray-900 mb-1.5 truncate">{item.title}</h3>
                          <div className="flex items-center gap-3 text-[13px] text-gray-500">
                            <span className="font-medium bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-sm">{item.type}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {item.date}</span>
                            {item.messages && item.messages.length > 0 && (
                               <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">{item.messages.length} messages</span>
                            )}
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all self-center">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {isExpanded && item.messages && (
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-6">
                          {item.messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`flex max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} gap-4`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-gray-900" : "bg-gray-100 border border-gray-200"}`}>
                                  {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <span className="text-gray-700 font-bold text-xs">AI</span>}
                                </div>
                                <div className={`p-4 rounded-2xl ${msg.role === "user" ? "bg-gray-100 text-gray-900" : "bg-white border border-gray-200/80 shadow-sm text-gray-800"}`}>
                                  <div className="text-[15px] prose prose-gray max-w-none prose-p:leading-relaxed">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-[15px] font-medium text-gray-900 mb-1">No history found</h3>
                  <p className="text-[14px] text-gray-500 max-w-sm">
                    We couldn't find any history items matching "{searchQuery}". Try adjusting your search.
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
