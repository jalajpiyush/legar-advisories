import React, { useState, useEffect } from "react";
import { Server, Shield, HardDrive, Key, Save } from "lucide-react";
import { motion } from "framer-motion";

export function Settings() {
  const [endpoint, setEndpoint] = useState("http://127.0.0.1:11434/api/chat");
  const [model, setModel] = useState("llama3");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedEndpoint = localStorage.getItem("legal_advisories_llm_endpoint");
    const savedModel = localStorage.getItem("legal_advisories_llm_model");
    if (savedEndpoint) setEndpoint(savedEndpoint);
    if (savedModel) setModel(savedModel);
  }, []);

  const handleSave = () => {
    localStorage.setItem("legal_advisories_llm_endpoint", endpoint);
    localStorage.setItem("legal_advisories_llm_model", model);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">System Configuration</h1>
        <p className="text-sm text-gray-500 mt-1">Manage local AI connections, database routing, and security policies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center space-x-3 px-3 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm font-medium">
            <Server className="w-4 h-4" />
            <span>Local AI Engine</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-400 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
            <HardDrive className="w-4 h-4" />
            <span>Vector Database</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-400 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
            <Shield className="w-4 h-4" />
            <span>Access Control</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-400 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
            <Key className="w-4 h-4" />
            <span>API Keys (Internal)</span>
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121214] border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-gray-100 mb-6">Local Inference Engine</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">API Endpoint (e.g., Ollama or vLLM)</label>
                <input 
                  type="text" 
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                  placeholder="http://127.0.0.1:11434/api/chat"
                />
                <p className="text-xs text-gray-600 mt-1">Must be accessible from the server or client context.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Model Name</label>
                <input 
                  type="text" 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                  placeholder="llama3"
                />
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{saved ? "Saved!" : "Save Configuration"}</span>
                </button>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
              <div className="flex items-start space-x-3 text-sm">
                <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-gray-400">
                  <p className="font-semibold text-gray-200">Security Guarantee</p>
                  <p className="mt-1">By connecting directly to your local instance, Legal Advisories guarantees that no documents, cases, or queries leave your on-premise infrastructure. External APIs (OpenAI, Gemini) are strictly disabled as per organizational policy.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
