import React, { useState } from 'react';
import { Sidebar, PageId } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LegalChat } from './pages/LegalChat';
import { ContractReview } from './pages/ContractReview';
import { Settings } from './pages/Settings';
import { Landing } from './pages/Landing';
import { Library } from './pages/Library';
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
import { Knowledge } from './pages/Knowledge';
import { auth, logout, onAuthStateChanged, User } from './lib/auth';
import { Menu } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId | "landing" | "contact-sales">(() => {
    return (localStorage.getItem("currentPage") as any) || "landing";
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => localStorage.getItem("currentChatId"));

  React.useEffect(() => {
    if (currentPage !== "landing" && currentPage !== "contact-sales") {
      localStorage.setItem("currentPage", currentPage);
    }
  }, [currentPage]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  React.useEffect(() => {
    if (currentChatId) {
      localStorage.setItem("currentChatId", currentChatId);
    } else {
      localStorage.removeItem("currentChatId");
    }
  }, [currentChatId]);


  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && currentPage === "landing") {
        setCurrentPage("dashboard");
      } else if (!user && currentPage !== "landing" && currentPage !== "contact-sales") {
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

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard currentChatId={currentChatId} onChatIdChange={setCurrentChatId} />;
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
      case "history":
        return <History />;
      case "shared-threads":
        return <SharedThreads />;
      case "workflows":
        return <Workflows />;
      case "guidance":
        return <Guidance />;
      case "knowledge":
        return <Knowledge />;
      case "help":
        return <Help />;
      case "create":
        return <Create />;
      case "tips":
        return <Tips />;
      case "options":
        return <Options user={currentUser} />;
      default:
        return (
          <div className="flex-1 h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border border-gray-200 rounded-xl bg-gray-50 mx-auto flex items-center justify-center">
                <span className="text-gray-400 text-xl">🚧</span>
              </div>
              <h2 className="text-xl font-medium text-gray-900">Module Initializing</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">This node of the Legal Advisories architecture is currently being built or is offline.</p>
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
      case "history": return "History";
      case "shared-threads": return "Shared Threads";
      case "library": return "Library";
      case "knowledge": return "Knowledge Bases";
      case "guidance": return "Guidance";
      case "help": return "Help & Support";
      case "create": return "Create New";
      case "tips": return "Tips & Tricks";
      case "options": return "Options";
      default: return "Legal Advisories";
    }
  };

  return (
    <div className="flex h-screen bg-[#F9F9FA] text-gray-900 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        currentChatId={currentChatId}
        onChatSelect={(id) => { setCurrentChatId(id); setCurrentPage("dashboard"); }} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={logout}
        user={currentUser}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden shadow-[-4px_0_24px_rgb(0,0,0,0.02)]">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden absolute top-4 left-4 z-[60] p-2 text-gray-600 hover:text-gray-900 bg-white/90 backdrop-blur rounded-xl shadow-sm border border-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex-1 overflow-y-auto z-10 relative custom-scrollbar flex flex-col">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

