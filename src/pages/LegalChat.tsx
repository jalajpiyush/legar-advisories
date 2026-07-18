import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Shield, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export function LegalChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello. I am your Legal Advisories AI Assistant. How can I help you with legal research, drafting, or analysis today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Fetch user configured endpoint from localStorage or use default
      const endpoint = localStorage.getItem("legal_advisories_llm_endpoint") || "http://127.0.0.1:11434/api/chat";
      
      // Call our proxy backend to avoid CORS issues
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint,
          model: localStorage.getItem("legal_advisories_llm_model") || "llama3",
          messages: [...messages, userMessage]
        })
      });

      if (!res.ok) {
        throw new Error("Failed to connect to local AI engine.");
      }

      const data = await res.json();
      
      // Adapt response depending on common local LLM structures (Ollama vs vLLM/OpenAI)
      let aiContent = "Error parsing response.";
      if (data.message?.content) {
        aiContent = data.message.content; // Ollama format
      } else if (data.choices?.[0]?.message?.content) {
        aiContent = data.choices[0].message.content; // OpenAI/vLLM format
      }

      setMessages(prev => [...prev, { role: "assistant", content: aiContent }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `**Error:** Unable to reach the local LLM. Ensure your AI engine (e.g. Ollama) is running and configured correctly in Settings.\n\n*Details: ${error.message}*` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto p-6">
      <div className="bg-[#121214] border border-gray-800 rounded-xl flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-gray-800 p-4 flex items-center justify-between bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-100">AI Legal Counsel</h2>
              <p className="text-xs text-gray-500">Connected to Local Secure Model</p>
            </div>
          </div>
          <button onClick={() => setMessages([messages[0]])} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors" title="Reset Conversation">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-indigo-600 ml-3" : "bg-gray-800 mr-3"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-gray-300" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-800/80 text-gray-200 border border-gray-700/50"}`}>
                  <div className="text-sm prose prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-800 mr-3">
                  <Bot className="w-4 h-4 text-gray-300" />
                </div>
                <div className="p-4 rounded-2xl bg-gray-800/80 text-gray-200 border border-gray-700/50">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 bg-gray-900/50 border-t border-gray-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a legal question or request a draft..."
              className="w-full bg-[#0a0a0b] border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
             <span className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">Legal Advisories AI responses are for research purposes, not legal advice.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
