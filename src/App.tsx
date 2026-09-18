import React, { useState } from 'react';
import { Sidebar, PageId } from './components/Sidebar';
import { Cases } from './pages/Cases';
import { LegalResearch } from './pages/LegalResearch';
import { Generator } from './pages/Generator';
import { Compliance } from './pages/Compliance';
import { Dashboard } from './pages/Dashboard';
import { LegalChat } from './pages/LegalChat';
import { ContractReview } from './pages/ContractReview';
import { Settings } from './pages/Settings';
import { Billing } from './pages/Billing';
import { Landing } from './pages/Landing';
import { Library } from './pages/Library';
import { DocumentAnalysis } from './pages/DocumentAnalysis';
import { History } from './pages/History';
import { Workflows } from './pages/Workflows';
import { Guidance } from './pages/Guidance';
import { Help } from './pages/Help';
import { Vault } from './pages/Vault';
import { Create } from './pages/Create';
import { SharedThreads } from './pages/SharedThreads';
import { Tips } from './pages/Tips';
import { Options } from './pages/Options';
import { ContactSales } from './pages/ContactSales';
import { Terms, Privacy, Disclaimer } from './pages/LegalPages';
import { CookieBanner } from './components/Footer';
import { Knowledge } from './pages/Knowledge';
import { auth, logout, onAuthStateChanged, User } from './lib/auth';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import Hammer from 'hammerjs';
import { CommandPalette } from './components/CommandPalette';

export default function App() {
  const [currentPage, _setCurrentPage] = useState<PageId | "landing" | "contact-sales" | "terms" | "privacy" | "disclaimer">(() => {
    return (localStorage.getItem("currentPage") as any) || "landing";
  });

  const pageHistoryRef = React.useRef<string[]>([
    (localStorage.getItem("currentPage") as any) || "landing"
  ]);
  const historyIndexRef = React.useRef(0);
  const currentPageRef = React.useRef(currentPage);
  currentPageRef.current = currentPage;

  const setCurrentPage = React.useCallback((page: any) => {
    let newPage = typeof page === 'function' ? page(currentPageRef.current) : page;
    if (newPage !== currentPageRef.current) {
       const newHistory = pageHistoryRef.current.slice(0, historyIndexRef.current + 1);
       newHistory.push(newPage);
       pageHistoryRef.current = newHistory;
       historyIndexRef.current = newHistory.length - 1;
       _setCurrentPage(newPage);
    }
  }, []);

  const navigateBack = React.useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      _setCurrentPage(pageHistoryRef.current[historyIndexRef.current] as any);
    }
  }, []);

  const navigateForward = React.useCallback(() => {
    if (historyIndexRef.current < pageHistoryRef.current.length - 1) {
      historyIndexRef.current += 1;
      _setCurrentPage(pageHistoryRef.current[historyIndexRef.current] as any);
    }
  }, []);

  const [currentChatId, setCurrentChatId] = useState<string | null>(() => localStorage.getItem("currentChatId"));

  React.useEffect(() => {
    if (currentPage !== "landing" && currentPage !== "contact-sales" && currentPage !== "terms" && currentPage !== "privacy" && currentPage !== "disclaimer") {
      localStorage.setItem("currentPage", currentPage);
    }
  }, [currentPage]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userUpdateTrigger, setUserUpdateTrigger] = useState(0);
  const [is3DMode, setIs3DMode] = useState(false);
  const mainRef = React.useRef<HTMLElement>(null);
  const [swipeIndicator, setSwipeIndicator] = useState<'left' | 'right' | null>(null);
  const indicatorTimeoutRef = React.useRef<any>(null);

  const triggerIndicator = React.useCallback((direction: 'left' | 'right') => {
    setSwipeIndicator(direction);
    if (indicatorTimeoutRef.current) clearTimeout(indicatorTimeoutRef.current);
    indicatorTimeoutRef.current = setTimeout(() => setSwipeIndicator(null), 600);
  }, []);

  React.useEffect(() => {
    if (mainRef.current && currentPage !== 'landing' && currentPage !== 'contact-sales') {
      const mc = new Hammer(mainRef.current);
      mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
      
      const swipe3 = new Hammer.Swipe({ event: 'swipe3', pointers: 3, direction: Hammer.DIRECTION_HORIZONTAL });
      mc.add(swipe3);

      mc.on('swipeup', () => {
        setIs3DMode(true);
        setTimeout(() => setIs3DMode(false), 800);
      });
      
      mc.on('swipedown', () => {
        setIs3DMode(false);
      });

      mc.on('swiperight', () => {
        setIsSidebarOpen(true);
        triggerIndicator('right');
      });
      
      mc.on('swipeleft', () => {
        setIsSidebarOpen(false);
        triggerIndicator('left');
      });

      mc.on('swipe3right', () => {
        navigateBack();
        triggerIndicator('right');
      });

      mc.on('swipe3left', () => {
        navigateForward();
        triggerIndicator('left');
      });

      return () => {
        mc.destroy();
      };
    }
  }, [currentPage, navigateBack, navigateForward, triggerIndicator]);

  React.useEffect(() => {
    if (currentChatId) {
      localStorage.setItem("currentChatId", currentChatId);
    } else {
      localStorage.removeItem("currentChatId");
    }
  }, [currentChatId]);


  React.useEffect(() => {
    const handleNavigate = (e: any) => {
      const page = e.detail;
      setCurrentPage(page);
    };
    window.addEventListener('navigate', handleNavigate);
    
    // Initialize theme
    const theme = localStorage.getItem("legal_advisories_theme") || "System Default";
    if (theme === "Dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "Light") {
      document.documentElement.classList.remove("dark");
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    
    // Listen for OS theme changes if System Default
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("legal_advisories_theme") === "System Default" || !localStorage.getItem("legal_advisories_theme")) {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      window.removeEventListener('navigate', handleNavigate);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && currentPage === "landing") {
        setCurrentPage("dashboard");
      } else if (!user && currentPage !== "landing" && currentPage !== "contact-sales" && currentPage !== "terms" && currentPage !== "privacy" && currentPage !== "disclaimer") {
        setCurrentPage("landing");
      }
    });
    return () => unsubscribe();
  }, [currentPage]);

  if (currentPage === "landing") {
    return <Landing onEnter={() => setCurrentPage("dashboard")} onContactSales={() => setCurrentPage("contact-sales")} />;
  }
  if (currentPage === "contact-sales") {
    return <ContactSales onBack={() => setCurrentPage("landing")} />;
  }
  if (currentPage === "terms") {
    return <Terms onBack={() => setCurrentPage("landing")} />;
  }
  if (currentPage === "privacy") {
    return <Privacy onBack={() => setCurrentPage("landing")} />;
  }
  if (currentPage === "disclaimer") {
    return <Disclaimer onBack={() => setCurrentPage("landing")} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard currentChatId={currentChatId} onChatIdChange={setCurrentChatId} user={currentUser} />;
      case "vault":
        return <Vault />;
      case "vault-statements":
        return <Vault activeFolderId="statements" />;
      case "vault-delta":
        return <Vault activeFolderId="delta" />;
      case "vault-supply":
        return <Vault activeFolderId="supply-agreements" />;
      case "library":
        return <Library />;
      case "document-analysis":
        return <DocumentAnalysis />;
      case "history":
        return <History onResume={(id) => { setCurrentChatId(id); setCurrentPage("dashboard"); }} />;
      case "shared-threads":
        return <SharedThreads />;
      case "workflows":
        return <Workflows />;
      case "billing":
        return <Billing />;
      case "guidance":
        return <Guidance />;
      case "knowledge":
        return <Knowledge />;
      case "help":
        return <Help />;
      case "research": return <LegalResearch />;
      case "cases": return <Cases />;
      case "create":
        return <Create />;
      case "tips":
        return <Tips />;
      case "options":
        return <Options user={currentUser} onUpdate={() => setUserUpdateTrigger(v => v + 1)} />;
      default:
        return (
          <div className="flex-1 h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border border-gray-200 dark:border-neutral-800 rounded-xl bg-gray-50 dark:bg-neutral-900 mx-auto flex items-center justify-center">
                <span className="text-gray-400 dark:text-neutral-500 text-xl">🚧</span>
              </div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-neutral-100">Module Initializing</h2>
              <p className="text-sm text-gray-500 dark:text-neutral-400 max-w-sm mx-auto">This node of the Legal Advisories architecture is currently being built or is offline.</p>
            </div>
          </div>
        );
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard": return "Overview";
      case "vault": return "Vault";
      case "vault-statements": return "Vault";
      case "vault-delta": return "Vault";
      case "vault-supply": return "Vault";
      case "workflows": return "Workflows";
      case "billing": return "Billing & Subscriptions";
      case "history": return "History";
      case "shared-threads": return "Shared Threads";
      case "library": return "Library";
      case "document-analysis": return "Document Analysis";
      case "knowledge": return "Knowledge Bases";
      case "guidance": return "Guidance";
      case "help": return "Help & Support";
      case "research": return "AI Legal Research";
      case "cases": return "My Cases";
      case "compliance": return "Compliance Manager";
      case "generator": return "Contract Generator";
      case "create": return "Create New";
      case "tips": return "Tips & Tricks";
      case "options": return "Settings";
      default: return "Legal Advisories";
    }
  };

  return (
    <div className="flex h-[100dvh] bg-[#F9F9FA] dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900" style={{ perspective: '1200px' }}>
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        currentChatId={currentChatId}
        onChatSelect={(id) => { setCurrentChatId(id); setCurrentPage("dashboard"); }} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={logout}
        user={currentUser}
        key={`sidebar-${userUpdateTrigger}`}
      />
      
      <main 
        ref={mainRef}
        className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-neutral-950 relative overflow-hidden shadow-[-4px_0_24px_rgb(0,0,0,0.02)] dark:shadow-none border-l dark:border-neutral-800 border-transparent transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform-origin-bottom ${is3DMode ? 'scale-[0.93] -translate-y-4 rotate-x-[4deg] rounded-[2rem] shadow-2xl overflow-visible ring-1 ring-gray-200 dark:ring-neutral-800' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden absolute top-4 left-4 z-[60] p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-neutral-100 dark:hover:text-white bg-white dark:bg-neutral-900/90 dark:bg-neutral-900/90 backdrop-blur rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex-1 overflow-y-auto z-10 relative custom-scrollbar flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col min-h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
        <CookieBanner onAccept={() => {}} />

        <AnimatePresence>
          {swipeIndicator && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: swipeIndicator === 'left' ? 20 : -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: swipeIndicator === 'left' ? -20 : 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`absolute top-1/2 -translate-y-1/2 z-[100] pointer-events-none flex items-center justify-center w-24 h-24 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-sm ${
                swipeIndicator === 'left' ? 'right-8' : 'left-8'
              }`}
            >
              {swipeIndicator === 'left' ? (
                <ChevronLeft className="w-12 h-12 text-gray-400 dark:text-neutral-500 opacity-50" />
              ) : (
                <ChevronRight className="w-12 h-12 text-gray-400 dark:text-neutral-500 opacity-50" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <CommandPalette onNavigate={setCurrentPage} />
      </main>
    </div>
  );
}

