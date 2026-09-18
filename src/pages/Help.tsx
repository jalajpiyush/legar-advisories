import React, { useState, useRef, useEffect } from 'react';
import { Search, MessageCircle, FileText, Mail, ExternalLink, ChevronRight, HelpCircle, X, Send, BookOpen, Video, Code } from 'lucide-react';
import Hammer from 'hammerjs';
import { motion } from "motion/react";

const faqs = [
  { 
    id: 1,
    question: "How does Legal Advisories analyze contracts?", 
    answer: "Legal Advisories uses advanced natural language processing (NLP) models specifically trained on legal documents to extract key provisions, identify risks, and compare terms against standard playbooks." 
  },
  { 
    id: 2,
    question: "Is my data secure?", 
    answer: "Yes. All documents uploaded to Legal Advisories are encrypted in transit and at rest. We do not use your proprietary documents to train our foundation models." 
  },
  { 
    id: 3,
    question: "Can I create custom workflows?", 
    answer: "Absolutely. You can build custom workflows by chaining different AI agents together using our visual workflow builder in the Workflows section." 
  },
  { 
    id: 4,
    question: "How do I update the firm's guidance playbook?", 
    answer: "Firm playbooks can be updated by administrators in the Guidance section. Contact your IT department to request admin permissions." 
  },
];

export function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatStatus, setChatStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toastMessage && toastRef.current) {
      const mc = new Hammer(toastRef.current, {
        recognizers: [
          [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }]
        ]
      });

      mc.on('swipeleft', () => {
        setToastMessage(null);
      });

      return () => mc.destroy();
    }
  }, [toastMessage]);

  const [activeModal, setActiveModal] = useState<'docs' | 'videos' | 'api' | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatStatus('sending');
    // Simulate network delay
    setTimeout(() => {
      setChatStatus('sent');
      setChatMessage('');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 pt-16 md:pt-0 relative">
      {/* Header section */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h1 layoutId="page-title" className="text-2xl font-serif text-gray-900 dark:text-neutral-100 mb-1">Help & Support</motion.h1>
            <motion.p layoutId="page-description" className="text-[14px] text-gray-500 dark:text-neutral-400">Get assistance, read documentation, and find answers to common questions.</motion.p>
          </div>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-gray-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-[14px] outline-none focus:border-gray-300 dark:border-neutral-700 focus:bg-white dark:bg-neutral-900 transition-all text-gray-800 dark:text-neutral-200 placeholder:text-gray-400 dark:text-neutral-500"
          />
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA] dark:bg-neutral-900">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" /> 
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map(faq => (
                    <div key={faq.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800/80 rounded-xl p-5 shadow-sm">
                      <h3 className="font-medium text-gray-900 dark:text-neutral-100 text-[15px] mb-2">{faq.question}</h3>
                      <p className="text-[14px] text-gray-600 dark:text-neutral-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800/80 rounded-xl p-8 text-center text-gray-500 dark:text-neutral-400 shadow-sm">
                    No FAQs found matching "{searchQuery}".
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800/80 rounded-xl p-6 shadow-sm">
              <h2 className="text-[15px] font-semibold text-gray-900 dark:text-neutral-100 mb-4">Contact Support</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:bg-neutral-900 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[14px] font-medium text-gray-700 dark:text-neutral-300 group-hover:text-gray-900 dark:text-neutral-100">Live Chat</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-neutral-500 group-hover:text-gray-600 dark:text-neutral-400" />
                </button>
                
                <button 
                  onClick={() => window.location.href = 'mailto:legaladvisoriesofficial@gmail.com'}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:bg-neutral-900 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-[14px] font-medium text-gray-700 dark:text-neutral-300 group-hover:text-gray-900 dark:text-neutral-100">Email Support</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-neutral-500 group-hover:text-gray-600 dark:text-neutral-400" />
                </button>
              </div>
            </section>

            <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800/80 rounded-xl p-6 shadow-sm">
              <h2 className="text-[15px] font-semibold text-gray-900 dark:text-neutral-100 mb-4">Resources</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveModal('docs')}
                  className="w-full flex items-center gap-3 text-[14px] text-gray-600 dark:text-neutral-400 hover:text-blue-600 transition-colors py-1 text-left"
                >
                  <FileText className="w-4 h-4" />
                  Documentation
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </button>
                <button 
                  onClick={() => setActiveModal('videos')}
                  className="w-full flex items-center gap-3 text-[14px] text-gray-600 dark:text-neutral-400 hover:text-blue-600 transition-colors py-1 text-left"
                >
                  <FileText className="w-4 h-4" />
                  Video Tutorials
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </button>
                <button 
                  onClick={() => setActiveModal('api')}
                  className="w-full flex items-center gap-3 text-[14px] text-gray-600 dark:text-neutral-400 hover:text-blue-600 transition-colors py-1 text-left"
                >
                  <FileText className="w-4 h-4" />
                  API Reference
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </button>
              </div>
            </section>
          </div>

        </div>
      </div>

      {/* Floating Chat Widget */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-[340px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 z-[100] flex flex-col overflow-hidden">
          <div className="bg-[#111111] text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-medium text-[15px]">Live Support</span>
            </div>
            <button 
              onClick={() => { setIsChatOpen(false); setChatStatus('idle'); }}
              className="text-gray-400 dark:text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-[300px] bg-gray-50 dark:bg-neutral-900 p-4 overflow-y-auto flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-3 rounded-2xl rounded-tl-sm text-[14px] text-gray-700 dark:text-neutral-300 shadow-sm">
                Hi! How can we help you today?
              </div>
            </div>
            
            {chatStatus === 'sent' && (
              <div className="flex justify-end gap-3">
                <div className="bg-[#111111] text-white p-3 rounded-2xl rounded-tr-sm text-[14px] shadow-sm max-w-[85%]">
                  {chatMessage || "Thanks for your message!"}
                </div>
              </div>
            )}
            
            {chatStatus === 'sent' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-3 rounded-2xl rounded-tl-sm text-[14px] text-gray-700 dark:text-neutral-300 shadow-sm">
                  We've received your message. An agent will get back to you via email shortly!
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800">
            <form onSubmit={handleSendChat} className="relative">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={chatStatus !== 'idle'}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-[14px] outline-none focus:border-gray-300 dark:border-neutral-700 focus:bg-white dark:bg-neutral-900 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim() || chatStatus !== 'idle'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#111111] text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div ref={toastRef} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gray-900 dark:bg-gray-100 text-white px-4 py-3 rounded-lg shadow-xl text-[14px] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
            {toastMessage}
          </div>
        </div>
      )}

      {/* Resource Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  {activeModal === 'docs' && <BookOpen className="w-5 h-5" />}
                  {activeModal === 'videos' && <Video className="w-5 h-5" />}
                  {activeModal === 'api' && <Code className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {activeModal === 'docs' && "Product Documentation"}
                    {activeModal === 'videos' && "Video Tutorials"}
                    {activeModal === 'api' && "API Reference"}
                  </h2>
                  <p className="text-[14px] text-gray-500 dark:text-neutral-400">
                    {activeModal === 'docs' && "Learn how to use Legal Advisories effectively."}
                    {activeModal === 'videos' && "Watch step-by-step guides and feature overviews."}
                    {activeModal === 'api' && "Integrate Legal Advisories with your own systems."}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:text-neutral-100 hover:bg-gray-100 dark:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeModal === 'docs' && (
                <div className="space-y-6">
                  <div className="prose prose-sm prose-blue max-w-none">
                    <h3 className="text-gray-900 dark:text-neutral-100 font-semibold mb-2">Getting Started</h3>
                    <p className="text-gray-600 dark:text-neutral-400 mb-4">Welcome to the Legal Advisories documentation. Here you'll find everything you need to set up your workspace and start analyzing contracts.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
                        <h4 className="font-medium text-gray-900 dark:text-neutral-100 mb-1">Contract Analysis</h4>
                        <p className="text-[13px] text-gray-500 dark:text-neutral-400">Learn how to upload and analyze your first MSA.</p>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
                        <h4 className="font-medium text-gray-900 dark:text-neutral-100 mb-1">Playbook Setup</h4>
                        <p className="text-[13px] text-gray-500 dark:text-neutral-400">Configure your firm's custom risk parameters.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'videos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="group cursor-pointer">
                      <div className="aspect-video bg-gray-100 dark:bg-neutral-800 rounded-xl mb-3 relative overflow-hidden flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-neutral-900/90 shadow-sm flex items-center justify-center text-gray-900 dark:text-neutral-100 group-hover:scale-110 transition-transform">
                          <Video className="w-5 h-5 ml-1" />
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-neutral-100 text-[14px] group-hover:text-blue-600 transition-colors">
                        {i === 1 ? 'Getting Started Guide' : i === 2 ? 'Advanced Search Techniques' : i === 3 ? 'Building Custom Workflows' : 'Setting up Integrations'}
                      </h4>
                      <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-1">4:3{i} mins</p>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'api' && (
                <div className="space-y-6">
                  <div className="bg-gray-900 dark:bg-gray-100 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-[13px] text-gray-300">
                      <code>{`// Authenticate with your API key
const client = new LegalAdvisories({
  apiKey: process.env.LEGAL_API_KEY
});

// Analyze a contract
const result = await client.contracts.analyze({
  documentId: 'doc_123',
  playbook: 'standard_msa',
  extract: ['governing_law', 'liability_cap']
});

console.log(result.risks);`}</code>
                    </pre>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-neutral-100">Popular Endpoints</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-800">
                        <span className="px-2 py-1 bg-green-100 text-green-700 font-mono text-[12px] font-semibold rounded">POST</span>
                        <span className="font-mono text-[13px] text-gray-600 dark:text-neutral-400">/v1/contracts/analyze</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-800">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 font-mono text-[12px] font-semibold rounded">GET</span>
                        <span className="font-mono text-[13px] text-gray-600 dark:text-neutral-400">/v1/playbooks</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 rounded-lg text-[14px] font-medium hover:bg-gray-50 dark:bg-neutral-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

