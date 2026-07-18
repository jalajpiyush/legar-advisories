const fs = require('fs');
let code = fs.readFileSync('src/pages/History.tsx', 'utf-8');

code = code.replace(
  "import { Search, Clock, MessageSquare, Wand2, FileText, MoreHorizontal, Filter } from 'lucide-react';",
  "import { Search, Clock, MessageSquare, Wand2, FileText, MoreHorizontal, Filter, ChevronDown, ChevronUp, User, Bot } from 'lucide-react';\nimport ReactMarkdown from 'react-markdown';"
);

code = code.replace(
  'const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);',
  'const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);\n  const [expandedItem, setExpandedItem] = useState<string | null>(null);'
);

const oldItemRender = `                  return (
                    <div key={item.id} className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className={\`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 \${item.bg} \${item.color}\`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-[15px] font-medium text-gray-900 mb-1.5 truncate">{item.title}</h3>
                        <div className="flex items-center gap-3 text-[13px] text-gray-500">
                          <span className="font-medium bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-sm">{item.type}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {item.date}</span>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all self-center">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  );`;

const newItemRender = `                  const isExpanded = expandedItem === item.id;
                  return (
                    <div key={item.id} className="border-b border-gray-100 last:border-0">
                      <div 
                        className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors cursor-pointer group"
                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                      >
                        <div className={\`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 \${item.bg} \${item.color}\`}>
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
                            <div key={idx} className={\`flex \${msg.role === "user" ? "justify-end" : "justify-start"}\`}>
                              <div className={\`flex max-w-[85%] \${msg.role === "user" ? "flex-row-reverse" : "flex-row"} gap-4\`}>
                                <div className={\`w-8 h-8 rounded-full flex items-center justify-center shrink-0 \${msg.role === "user" ? "bg-gray-900" : "bg-gray-100 border border-gray-200"}\`}>
                                  {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <span className="text-gray-700 font-bold text-xs">AI</span>}
                                </div>
                                <div className={\`p-4 rounded-2xl \${msg.role === "user" ? "bg-gray-100 text-gray-900" : "bg-white border border-gray-200/80 shadow-sm text-gray-800"}\`}>
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
                  );`;

code = code.replace(oldItemRender, newItemRender);
fs.writeFileSync('src/pages/History.tsx', code);
