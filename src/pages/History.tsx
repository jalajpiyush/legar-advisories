import React, { useState, useEffect } from 'react';
import { Search, Clock, MessageSquare, Wand2, FileText, MoreHorizontal, Filter, ChevronDown, ChevronUp, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getHistory, HistoryItem, deleteHistoryItem, renameHistoryItem } from '../lib/history';
import { auth } from '../lib/auth';

interface HistoryProps {
  onResume?: (id: string) => void;
}

export function History({ onResume }: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteHistoryItem(id);
      setHistoryItems(getHistory());
    }
  };

  const startEdit = (e: React.MouseEvent, item: HistoryItem) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const saveEdit = (e: React.FormEvent | React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.type === 'submit') e.preventDefault();
    if (editTitle.trim()) {
      renameHistoryItem(id, editTitle.trim());
      setHistoryItems(getHistory());
    }
    setEditingId(null);
  };


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
                        onClick={() => {
                          if (onResume && item.type === "Chat") {
                            onResume(item.id);
                          } else {
                            setExpandedItem(isExpanded ? null : item.id);
                          }
                        }}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          
                          {editingId === item.id ? (
                            <form onSubmit={(e) => saveEdit(e, item.id)} className="mb-1.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="text" 
                                value={editTitle} 
                                onChange={e => setEditTitle(e.target.value)} 
                                autoFocus
                                className="px-2 py-1 border border-gray-300 rounded text-sm w-full max-w-xs focus:outline-none focus:border-blue-500" 
                              />
                              <button type="button" onClick={(e) => saveEdit(e, item.id)} className="text-sm text-white bg-blue-600 px-2 py-1 rounded">Save</button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">Cancel</button>
                            </form>
                          ) : (
                            <h3 className="text-[15px] font-medium text-gray-900 mb-1.5 truncate flex items-center gap-2 group/title">
                              {item.title}
                              <button onClick={(e) => startEdit(e, item)} className="opacity-0 group-hover/title:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                              </button>
                            </h3>
                          )}

                          <div className="flex items-center gap-3 text-[13px] text-gray-500">
                            <span className="font-medium bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-sm">{item.type}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {item.date}</span>
                            {item.messages && item.messages.length > 0 && (
                               <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">{item.messages.length} messages</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 self-center">
                          <button onClick={(e) => handleDelete(e, item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete chat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && item.messages && (
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-6">
                          {item.messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`flex max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} gap-4`}>
                                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-gray-200 text-gray-800 rounded-xl" : "bg-black rounded-full"}`}>
                                  {msg.role === "user" ? (
                                    auth.currentUser?.photoURL ? (
                                      <img src={auth.currentUser.photoURL} alt="User" className="w-8 h-8 rounded-xl object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      <span className="text-[14px] font-medium leading-none">
                                        {auth.currentUser?.displayName ? auth.currentUser.displayName.substring(0, 1).toUpperCase() : auth.currentUser?.email ? auth.currentUser.email.substring(0, 1).toUpperCase() : "U"}
                                      </span>
                                    )
                                  ) : <span className="text-white font-serif text-[18px] font-bold leading-none select-none" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>L</span>}
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
