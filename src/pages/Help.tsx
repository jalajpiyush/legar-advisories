import React, { useState } from 'react';
import { Search, MessageCircle, FileText, Mail, ExternalLink, ChevronRight, HelpCircle } from 'lucide-react';

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

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white pt-16 md:pt-0">
      {/* Header section */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-gray-900 mb-1">Help & Support</h1>
            <p className="text-[14px] text-gray-500">Get assistance, read documentation, and find answers to common questions.</p>
          </div>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-300 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" /> 
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map(faq => (
                    <div key={faq.id} className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm">
                      <h3 className="font-medium text-gray-900 text-[15px] mb-2">{faq.question}</h3>
                      <p className="text-[14px] text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-gray-200/80 rounded-xl p-8 text-center text-gray-500 shadow-sm">
                    No FAQs found matching "{searchQuery}".
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-sm">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Contact Support</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[14px] font-medium text-gray-700 group-hover:text-gray-900">Live Chat</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-[14px] font-medium text-gray-700 group-hover:text-gray-900">Email Support</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </button>
              </div>
            </section>

            <section className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-sm">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Resources</h2>
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-3 text-[14px] text-gray-600 hover:text-blue-600 transition-colors py-1">
                  <FileText className="w-4 h-4" />
                  Documentation
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </a>
                <a href="#" className="flex items-center gap-3 text-[14px] text-gray-600 hover:text-blue-600 transition-colors py-1">
                  <FileText className="w-4 h-4" />
                  Video Tutorials
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </a>
                <a href="#" className="flex items-center gap-3 text-[14px] text-gray-600 hover:text-blue-600 transition-colors py-1">
                  <FileText className="w-4 h-4" />
                  API Reference
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </a>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
