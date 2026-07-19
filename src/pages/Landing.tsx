import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowRight, Paperclip, Building2, Sparkles, SlidersHorizontal, Search, MessageSquare, MoreHorizontal, Pause, Plus, X, Edit3, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { googleSignIn } from '../lib/auth';

export function Landing({ onEnter, onContactSales }: { onEnter: () => void; onContactSales?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await googleSignIn();
      // App.tsx auth observer will handle redirect
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black/10 selection:text-black overflow-x-hidden">
      {/* Top Banner */}
      <div className="bg-black text-white text-[13px] py-2.5 px-4 flex justify-center items-center gap-1.5 font-medium tracking-wide border-b border-white/10 z-50 relative flex-wrap text-center">
        Legal Advisories Agents execute legal work end-to-end <a href="#" className="underline underline-offset-4 hover:text-gray-300 ml-1">Learn more</a>
      </div>

      {/* Navbar */}
      <nav className={`left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'fixed top-0 bg-black/80 backdrop-blur-md py-4' : 'absolute bg-transparent py-4 md:py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="text-[32px] font-serif tracking-tight text-white cursor-pointer leading-[1.1]" onClick={onEnter}>
              Legal<br/>Advisories
            </div>
            
            <div className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-white/90">
              <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">Platform <ChevronDown className="w-3.5 h-3.5" /></a>
              <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">Solutions <ChevronDown className="w-3.5 h-3.5" /></a>
              <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">Customers <ChevronDown className="w-3.5 h-3.5" /></a>
              <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">Security <ChevronDown className="w-3.5 h-3.5" /></a>
              <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">Resources <ChevronDown className="w-3.5 h-3.5" /></a>
              <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">Company <ChevronDown className="w-3.5 h-3.5" /></a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              className="px-5 py-2 border border-white/40 text-white rounded-[4px] text-[15px] font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
            <button className="px-6 py-2 bg-white text-black rounded-[4px] text-[15px] font-medium hover:bg-gray-100 transition-colors" onClick={(e) => { e.preventDefault(); if (onContactSales) onContactSales(); else onEnter(); }}>
              Request a Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-[90vh] pt-32 pb-20 flex flex-col items-center justify-center bg-black overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop"
            alt="Legal professional"
            className="w-full h-full object-cover object-center opacity-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 w-full flex flex-col justify-between h-full py-20 pb-10">
          
          <div className="max-w-2xl mt-12 md:mt-24">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-[4rem] md:text-[6rem] font-serif text-white leading-[1.05] tracking-tight mb-8"
            >
              Practice Made Perfect
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-[22px] md:text-[26px] text-white/95 font-light leading-[1.4] mb-12 max-w-xl"
            >
              Today's top law firms and in-house legal teams trust Legal Advisories to elevate their craft and navigate complexity.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <button className="bg-white text-black text-[17px] font-medium px-8 py-4 rounded-sm hover:bg-gray-100 transition-colors" onClick={(e) => { e.preventDefault(); if (onContactSales) onContactSales(); else onEnter(); }}>
                Request a Demo
              </button>
            </motion.div>
          </div>

          {/* Customer Logos Strip */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mt-auto pt-20"
          >
            <div className="flex items-center gap-8 md:gap-14 opacity-80 flex-wrap">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#e5e5e5]">ReedSmith</span>
              <span className="font-sans text-3xl md:text-4xl font-bold lowercase tracking-tighter text-[#e5e5e5]">pwc</span>
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#e5e5e5]">O'Melveny</span>
              <span className="font-sans text-xl md:text-2xl font-bold uppercase tracking-widest text-[#e5e5e5]">Bridgewater</span>
              <span className="font-serif text-xl md:text-2xl tracking-[0.2em] text-[#e5e5e5]">MACFARLANES</span>
              <span className="font-sans text-2xl md:text-3xl font-bold tracking-[0.15em] text-[#e5e5e5]">KKR</span>
              <span className="font-sans text-xl md:text-2xl font-bold tracking-[0.1em] text-[#e5e5e5]">A&O SHEARMAN</span>
            </div>
            
            <button className="border border-white/50 text-white px-6 py-2.5 rounded-sm text-[15px] font-medium hover:bg-white/10 transition-colors whitespace-nowrap">
              Our Customers
            </button>
          </motion.div>
        </div>
      </div>

      {/* Prompt UI Section */}
      <div className="bg-[#FAFAFA] py-24 border-b border-gray-100">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 p-2 overflow-hidden mx-auto">
             <div className="bg-[#F9FAFB] rounded-lg p-6 md:p-8 border border-gray-100">
               <p className="text-[19px] md:text-[21px] leading-relaxed text-[#1F1F1F] mb-12 font-medium">
                 I represent Acme Corp in the attached lawsuit. Research the strongest pieces of evidence in my client's favor and draft an email that summarizes key allegations and highlights the strongest pieces of evidence in our defense.
               </p>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div className="flex items-center gap-5">
                   <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-[15px] font-medium">
                     <Paperclip className="w-[18px] h-[18px]" /> Files
                   </button>
                   
                   <button className="flex items-center gap-2 text-gray-900 transition-colors text-[15px] font-medium bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-200">
                     <Building2 className="w-[18px] h-[18px]" /> Sources
                   </button>
                   <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-[15px] font-medium">
                     <Sparkles className="w-[18px] h-[18px]" /> Improve
                   </button>
                 </div>
                 <div className="flex items-center gap-4 self-end sm:self-auto">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-2">
                      <SlidersHorizontal className="w-5 h-5" />
                    </button>
                    <button className="bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors shadow-md">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                 </div>
               </div>
             </div>
             <div className="flex flex-wrap items-center gap-3 mt-4 px-2 pb-2">
               <button className="flex items-center gap-2.5 text-[14px] font-medium border border-gray-200 text-gray-700 px-5 py-2 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                 <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                 </div>
                 Ask LexisNexis® <span className="text-gray-400 font-light ml-1">+</span>
               </button>
               <button className="flex items-center gap-2.5 text-[14px] font-medium border border-gray-200 text-gray-700 px-5 py-2 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                 <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[11px] text-white font-bold">m</div>
                 iManage <span className="text-gray-400 font-light ml-1">+</span>
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="bg-white py-32 text-center">
        <h2 className="text-[3rem] md:text-[3.5rem] font-serif text-[#1F1F1F] mb-6 tracking-tight">Legal AI for Enterprise.</h2>
        <p className="text-[20px] md:text-[24px] text-[#1F1F1F] max-w-3xl mx-auto font-sans font-medium mb-32 leading-snug">
          Our AI-powered platform reviews, analyses, and finalises contracts in the<br className="hidden md:block" />time it takes to finish this sentence.
        </p>

        {/* Talk Terms Section */}
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 text-left mb-40">
          <div className="flex-1">
            <h3 className="text-[2.5rem] md:text-[3rem] font-serif text-[#1F1F1F] mb-6 tracking-tight">Talk Terms.</h3>
            <p className="text-[20px] md:text-[24px] text-[#1F1F1F] font-medium leading-[1.3] mb-6">
              Talk to Robin about your documents in<br className="hidden md:block" />searchable conversations.
            </p>
            <p className="text-[17px] md:text-[19px] text-[#4A4A4A] leading-[1.6]">
              Our Chat features let you hash out the fine print with AI<br className="hidden md:block" />and teammates in one secure, searchable thread — so<br className="hidden md:block" />questions, clarifications, and lightbulb moments about<br className="hidden md:block" />your documents never get lost in your inbox again.
            </p>
          </div>
          
          {/* Mock Chat UI */}
          <div className="flex-1 w-full bg-[#F5F3ED] rounded-xl border border-gray-200/60 shadow-sm overflow-hidden text-sm">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60 bg-transparent">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                New Chat <Edit3 className="w-3.5 h-3.5 ml-1" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-gray-200/50 text-[13px] text-gray-600">
                  124 Documents <Plus className="w-3.5 h-3.5 ml-1" />
                </div>
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-[#F5F3ED] overflow-hidden"><img src="https://ui-avatars.com/api/?name=User&background=random" /></div>
                  <div className="w-7 h-7 rounded-full bg-green-100 border-2 border-[#F5F3ED] overflow-hidden"><img src="https://ui-avatars.com/api/?name=Admin&background=random" /></div>
                  <div className="w-7 h-7 rounded-full bg-white border-2 border-[#F5F3ED] flex items-center justify-center text-[10px] text-gray-500 font-medium">+4</div>
                </div>
                <button className="p-1 hover:bg-black/5 rounded-full ml-1"><X className="w-4 h-4 text-gray-500" /></button>
              </div>
            </div>
            
            {/* Chat Body */}
            <div className="p-6 space-y-5">
              {/* Robin Msg */}
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-[#2A2A2A] flex items-center justify-center flex-shrink-0 text-white mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm text-gray-800 shadow-sm inline-block border border-gray-100">
                    Great, let's chat about the new documents you shared.
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm text-gray-800 shadow-sm inline-block border border-gray-100">
                    How can I help?
                  </div>
                </div>
              </div>

              {/* User Msg */}
              <div className="flex justify-end gap-3">
                 <div className="bg-[#EAE8E2] p-3.5 rounded-2xl rounded-tr-sm text-gray-800 inline-block">
                    What are the different laws that govern each contract?
                 </div>
                 <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden"><img src="https://ui-avatars.com/api/?name=User&background=random" /></div>
              </div>

              {/* Robin Msg */}
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-[#2A2A2A] flex items-center justify-center flex-shrink-0 text-white mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="flex-1">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-sm text-[#1F1F1F] shadow-sm inline-block border border-gray-100 text-[13px] leading-relaxed">
                    There are 84 jurisdictions specified in the documents. Here are the top 5:<br/>
                    United Kingdom (56) <span className="inline-block px-1 bg-gray-100 rounded text-[10px] text-gray-500 mx-0.5">1</span><br/>
                    United States of America (24) <span className="inline-block px-1 bg-gray-100 rounded text-[10px] text-gray-500 mx-0.5">2</span><span className="inline-block px-1 bg-gray-100 rounded text-[10px] text-gray-500 mx-0.5">3</span><span className="inline-block px-1 bg-gray-100 rounded text-[10px] text-gray-500 mx-0.5">4</span><br/>
                    France (20) <span className="inline-block px-1 bg-gray-100 rounded text-[10px] text-gray-500 mx-0.5">4</span><br/>
                    Germany (14) <span className="inline-block px-1 bg-gray-100 rounded text-[10px] text-gray-500 mx-0.5">5</span><span className="inline-block px-1 bg-gray-100 rounded text-[10px] text-gray-500 mx-0.5">6</span><br/>
                    Singapore (8) <span className="inline-block px-1 bg-gray-100 rounded text-[10px] text-gray-500 mx-0.5">7</span>
                  </div>
                </div>
              </div>
              
              {/* User Msg */}
              <div className="flex justify-end gap-3">
                 <div className="bg-[#EAE8E2] p-3.5 rounded-2xl rounded-tr-sm text-gray-800 inline-block text-right max-w-[80%]">
                    Are there certain jurisdictions known for data regulations that could cause issues?
                 </div>
                 <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden"><img src="https://ui-avatars.com/api/?name=User&background=random" /></div>
              </div>
              
              {/* Robin Msg */}
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-[#2A2A2A] flex items-center justify-center flex-shrink-0 text-white mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="flex-1">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-sm text-[#1F1F1F] shadow-sm inline-block border border-gray-100 text-[13px] leading-relaxed">
                    Laws like the EU's General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA) have "extraterritorial" scope. This means if you collect or process personal data of EU residents, even if your company is based in the US or Asia, you may still be subject to GDPR. Similarly, the CCPA/CPRA can apply to businesses outside California if they process California residents' data and meet certain thresholds.
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-transparent border-t border-gray-200/40">
              <div className="bg-white rounded-full p-2 flex items-center shadow-sm border border-gray-200">
                <div className="w-7 h-7 rounded-full bg-gray-200 ml-1 overflow-hidden flex-shrink-0"><img src="https://ui-avatars.com/api/?name=User&background=random" /></div>
                <input type="text" placeholder="Chat with Robin..." className="flex-1 bg-transparent px-3 outline-none text-[14px] text-gray-700" />
                <div className="flex items-center gap-1.5 mr-1">
                  <button className="px-3 py-1.5 bg-[#1F1F1F] text-white text-[12px] font-medium rounded-full">Ask</button>
                  <button className="px-3 py-1.5 bg-white text-gray-500 text-[12px] font-medium rounded-full border border-gray-200">Research</button>
                  <button className="w-7 h-7 bg-[#1F1F1F] text-white rounded-full flex items-center justify-center">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workspaces Section */}
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row-reverse items-center gap-16 text-left mb-32">
          <div className="flex-1">
            <h3 className="text-[2.5rem] md:text-[3rem] font-serif text-[#1F1F1F] mb-6 tracking-tight">Room for many more.</h3>
            <p className="text-[20px] md:text-[24px] text-[#1F1F1F] font-medium leading-[1.3] mb-6">
              One workspace, all your moving parts —<br className="hidden md:block" />synced, searchable, and secure.
            </p>
            <p className="text-[17px] md:text-[19px] text-[#4A4A4A] leading-[1.6]">
              Built for legal teams who hate chaos — Workspaces<br className="hidden md:block" />combines structure with flexibility so nothing falls<br className="hidden md:block" />through the cracks.
            </p>
          </div>
          
          {/* Mock Workspaces UI */}
          <div className="flex-1 w-full bg-[#FAF9F5] rounded-xl border border-gray-200/80 shadow-sm overflow-hidden p-6 font-sans">
             {/* Header */}
             <div className="flex items-center justify-between mb-8">
               <h4 className="text-[24px] font-serif text-gray-900">Workspaces</h4>
               <div className="flex items-center gap-2">
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[13px] text-gray-600 shadow-sm">
                   <Search className="w-3.5 h-3.5" /> Search
                 </button>
                 <button className="px-4 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-[13px] font-medium text-gray-700 shadow-sm">
                   Create Table
                 </button>
                 <button className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-[13px] font-medium text-gray-700 shadow-sm">
                   <MessageSquare className="w-3.5 h-3.5" /> Chat
                 </button>
               </div>
             </div>

             {/* Templates */}
             <div className="mb-8">
               <div className="flex items-center justify-between mb-4">
                 <div className="text-[13px] text-gray-500 font-medium">Start with a Prompt Set Template</div>
                 <div className="flex items-center gap-3">
                   <div className="flex gap-1 text-gray-400">
                     <span className="cursor-pointer hover:text-gray-600">&lt;</span>
                     <span className="cursor-pointer hover:text-gray-600">&gt;</span>
                   </div>
                   <span className="text-[12px] font-bold text-gray-900 cursor-pointer">View All</span>
                 </div>
               </div>
               <div className="flex gap-4 overflow-hidden">
                 <div className="bg-[#EBE7DF] p-4 rounded-xl min-w-[200px] flex-1 flex flex-col justify-between h-[110px]">
                   <div className="text-[14px] font-medium text-gray-900">M&A Due Diligence</div>
                   <div className="flex items-center justify-between text-[11px]">
                     <span className="flex items-center gap-1 text-orange-500 font-medium"><Sparkles className="w-3 h-3 fill-current" /> 20 Prompts</span>
                     <div className="w-5 h-5 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold text-[9px]">TL</div>
                   </div>
                 </div>
                 <div className="bg-[#EBE7DF] p-4 rounded-xl min-w-[200px] flex-1 flex flex-col justify-between h-[110px]">
                   <div className="text-[14px] font-medium text-gray-900">Tom's GV Legal Analysis</div>
                   <div className="flex items-center justify-between text-[11px]">
                     <span className="flex items-center gap-1 text-orange-500 font-medium"><Sparkles className="w-3 h-3 fill-current" /> 20 Prompts</span>
                     <div className="w-5 h-5 rounded-full bg-blue-200 overflow-hidden"><img src="https://ui-avatars.com/api/?name=T&background=random" /></div>
                   </div>
                 </div>
                 <div className="bg-[#EBE7DF] p-4 rounded-xl min-w-[200px] flex-1 flex flex-col justify-between h-[110px]">
                   <div className="text-[14px] font-medium text-gray-900">Vendor Agreement Summary Report</div>
                   <div className="flex items-center justify-between text-[11px]">
                     <span className="flex items-center gap-1 text-orange-500 font-medium"><Sparkles className="w-3 h-3 fill-current" /> 20 Prompts</span>
                     <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600"><Building2 className="w-3 h-3" /></div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Active Workspaces List */}
             <div>
               <div className="text-[13px] text-gray-500 font-medium mb-3">Active Workspaces</div>
               <div className="space-y-1">
                 {/* Item 1 */}
                 <div className="flex items-center justify-between py-2 border-b border-gray-200/50">
                   <div className="flex items-center gap-3">
                     <Sparkles className="w-4 h-4 text-gray-500" />
                     <span className="text-[13px] font-medium text-gray-900">Side Letter Summary</span>
                     <span className="text-[11px] text-gray-400">Just now</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="text-[11px] text-gray-400">Building Table... 24%</span>
                     <button className="px-3 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-medium shadow-sm">Pause</button>
                     <MoreHorizontal className="w-4 h-4 text-gray-400" />
                   </div>
                 </div>
                 {/* Item 2 */}
                 <div className="flex items-center justify-between py-2 border-b border-gray-200/50">
                   <div className="flex items-center gap-3">
                     <Sparkles className="w-4 h-4 text-gray-500" />
                     <span className="text-[13px] font-medium text-gray-900">M&A Diligence Table</span>
                     <span className="text-[11px] text-gray-400">1h ago</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="text-[11px] text-gray-400">12 Prompts</span>
                     <button className="px-3 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-medium shadow-sm">Build Table</button>
                     <MoreHorizontal className="w-4 h-4 text-gray-400" />
                   </div>
                 </div>
                 {/* Item 3 */}
                 <div className="flex items-center justify-between py-2 border-b border-gray-200/50">
                   <div className="flex items-center gap-3">
                     <Sparkles className="w-4 h-4 text-orange-500 fill-current" />
                     <span className="text-[13px] font-medium text-gray-900">LPA Summary</span>
                     <span className="text-[11px] text-gray-400">5h ago</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="text-[11px] text-gray-400">20 Prompts</span>
                     <button className="px-3 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-medium shadow-sm flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> Chat with Results</button>
                     <button className="px-3 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-medium shadow-sm">View Results</button>
                     <MoreHorizontal className="w-4 h-4 text-gray-400" />
                   </div>
                 </div>
                 {/* Item 4 */}
                 <div className="flex items-center justify-between py-2 border-b border-gray-200/50">
                   <div className="flex items-center gap-3">
                     <MessageSquare className="w-4 h-4 text-gray-500" />
                     <span className="text-[13px] font-medium text-gray-900">Chat – LPA Analysis</span>
                     <span className="text-[11px] text-gray-400">Yesterday</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <button className="px-3 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-medium shadow-sm">View Chat</button>
                     <MoreHorizontal className="w-4 h-4 text-gray-400" />
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-[1000px] mx-auto px-6 flex flex-col md:flex-row justify-between text-left pt-20 mt-10">
          <div className="mb-10 md:mb-0">
            <div className="text-[4.5rem] font-serif text-[#1F1F1F] mb-1 leading-none tracking-tight">80%</div>
            <div className="text-[22px] font-medium text-[#1F1F1F]">Faster review</div>
          </div>
          <div className="mb-10 md:mb-0">
            <div className="text-[4.5rem] font-serif text-[#1F1F1F] mb-1 leading-none tracking-tight">500k+</div>
            <div className="text-[22px] font-medium text-[#1F1F1F]">Docs processed</div>
          </div>
          <div>
            <div className="text-[4.5rem] font-serif text-[#1F1F1F] mb-1 leading-none tracking-tight">24/7</div>
            <div className="text-[22px] font-medium text-[#1F1F1F]">Global coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
}
