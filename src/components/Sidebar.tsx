import React from "react";
import { 
  Plus,
  Folder,
  Network,
  Clock,
  BookOpen,
  FileText,
  HelpCircle,
  Wand2,
  ChevronDown,
  MoreVertical,
  Sidebar as SidebarIcon,
  Share2,
  Lightbulb,
  Settings,
  Database,
  LogOut
} from "lucide-react";
import { cn } from "../lib/utils";
import { User } from "../lib/auth";

export type PageId = "dashboard" | "vault" | "vault-statements" | "vault-delta" | "vault-supply" | "workflows" | "history" | "library" | "guidance" | "knowledge" | "help" | "create" | "shared-threads" | "tips" | "options";

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout?: () => void;
  user?: User | null;
}

export function Sidebar({ currentPage, onPageChange, isOpen, onToggle, onLogout, user }: SidebarProps) {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = React.useState(false);
  const workspaceRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setIsWorkspaceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) {
    return (
      <aside className="hidden md:flex w-[60px] bg-[#F9F9FA] flex-col items-center py-4 h-screen text-gray-800 border-r border-gray-200/80 transition-all flex-shrink-0 z-40">
        <button 
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
          title="Expand Sidebar"
        >
          <SidebarIcon className="w-5 h-5" />
        </button>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="md:hidden fixed inset-0 bg-black/20 z-40"
        onClick={onToggle}
      />
      
      <aside className="fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-[#F9F9FA] flex flex-col h-screen text-gray-800 border-r border-gray-200/80 transition-all flex-shrink-0">
        <div className="p-4">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative" ref={workspaceRef}>
            <button 
              onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
              className="flex items-center gap-2 hover:bg-gray-100 p-1.5 -ml-1.5 rounded-lg transition-colors"
            >
              <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-white text-xs font-semibold">
                {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "MW"}
              </div>
              <span className="text-[14px] font-semibold text-gray-900">{user?.displayName || "My Workspace"}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {/* Workspace Dropdown */}
            {isWorkspaceOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <div className="text-[12px] text-gray-500 font-medium mb-1">Current Workspace</div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center text-white text-[10px] font-semibold">
                      {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "MW"}
                    </div>
                    <span className="text-[13px] font-semibold text-gray-900">{user?.displayName || "My Workspace"}</span>
                  </div>
                </div>
                <div className="px-2">
                </div>
                <div className="border-t border-gray-100 mt-1 pt-1 px-2">
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg text-gray-700 text-[13px]">
                    <Plus className="w-4 h-4 text-gray-400" />
                    Create workspace
                  </button>
                  <button 
                    onClick={() => {
                      setIsWorkspaceOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-red-50 rounded-lg text-red-600 text-[13px] mt-1"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
            title="Collapse Sidebar"
          >
            <SidebarIcon className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Create Button */}
        <button 
          onClick={() => { onPageChange("create"); if (window.innerWidth < 768) onToggle(); }}
          className="w-full flex items-center justify-between bg-white border border-gray-200 shadow-sm hover:shadow transition-shadow rounded-xl px-3 py-2 text-[14px] font-semibold text-gray-800 mb-6"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-[18px] h-[18px]" />
            Create
          </div>
          <span className="text-gray-400 font-serif font-normal italic">⌘K</span>
        </button>

        {/* Navigation */}
        <nav className="space-y-1">
          <button 
            onClick={() => { onPageChange("dashboard"); if (window.innerWidth < 768) onToggle(); }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
              currentPage === "dashboard" ? "bg-white shadow-sm border border-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
            )}
          >
            <Wand2 className={cn("w-[18px] h-[18px]", currentPage === "dashboard" ? "text-gray-900" : "text-gray-500")} />
            Assistant
          </button>

          <div>
            <button 
              onClick={() => { onPageChange("vault"); if (window.innerWidth < 768) onToggle(); }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
                currentPage.startsWith("vault") ? "bg-white shadow-sm border border-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
              )}
            >
              <Folder className={cn("w-[18px] h-[18px]", currentPage.startsWith("vault") ? "text-gray-900" : "text-gray-500")} />
              Vault
            </button>
          </div>

          <button 
            onClick={() => { onPageChange("workflows"); if (window.innerWidth < 768) onToggle(); }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
              currentPage === "workflows" ? "bg-white shadow-sm border border-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
            )}
          >
            <Network className={cn("w-[18px] h-[18px]", currentPage === "workflows" ? "text-gray-900" : "text-gray-500")} />
            Workflows
          </button>

          <button 
            onClick={() => { onPageChange("history"); if (window.innerWidth < 768) onToggle(); }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
              currentPage === "history" ? "bg-white shadow-sm border border-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
            )}
          >
            <Clock className={cn("w-[18px] h-[18px]", currentPage === "history" ? "text-gray-900" : "text-gray-500")} />
            History
          </button>

          <button 
            onClick={() => { onPageChange("shared-threads"); if (window.innerWidth < 768) onToggle(); }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
              currentPage === "shared-threads" ? "bg-white shadow-sm border border-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
            )}
          >
            <Share2 className={cn("w-[18px] h-[18px]", currentPage === "shared-threads" ? "text-gray-900" : "text-gray-500")} />
            Shared Threads
          </button>

          <button 
            onClick={() => { onPageChange("library"); if (window.innerWidth < 768) onToggle(); }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
              currentPage === "library" ? "bg-white shadow-sm border border-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
            )}
          >
            <BookOpen className={cn("w-[18px] h-[18px]", currentPage === "library" ? "text-gray-900" : "text-gray-500")} />
            Library
          </button>

          <button 
            onClick={() => { onPageChange("knowledge"); if (window.innerWidth < 768) onToggle(); }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
              currentPage === "knowledge" ? "bg-white shadow-sm border border-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
            )}
          >
            <Database className={cn("w-[18px] h-[18px]", currentPage === "knowledge" ? "text-gray-900" : "text-gray-500")} />
            Knowledge
          </button>

          <button 
            onClick={() => { onPageChange("guidance"); if (window.innerWidth < 768) onToggle(); }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
              currentPage === "guidance" ? "bg-white shadow-sm border border-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
            )}
          >
            <FileText className={cn("w-[18px] h-[18px]", currentPage === "guidance" ? "text-gray-900" : "text-gray-500")} />
            Guidance
          </button>

          <button 
            onClick={() => { onPageChange("tips"); if (window.innerWidth < 768) onToggle(); }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
              currentPage === "tips" ? "bg-white shadow-sm border border-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
            )}
          >
            <Lightbulb className={cn("w-[18px] h-[18px]", currentPage === "tips" ? "text-gray-900" : "text-gray-500")} />
            Tips
          </button>
        </nav>
      </div>

      <div className="mt-auto p-4 space-y-1">
        <button 
          onClick={() => { onPageChange("help"); onToggle(); }}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
            currentPage === "help" ? "bg-white shadow-sm border border-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
          )}
        >
          <HelpCircle className={cn("w-[18px] h-[18px]", currentPage === "help" ? "text-gray-900" : "text-gray-500")} />
          Help
        </button>
        <button 
          onClick={() => { onPageChange("options"); onToggle(); }}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
            currentPage === "options" ? "bg-white shadow-sm border border-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
          )}
        >
          <Settings className={cn("w-[18px] h-[18px]", currentPage === "options" ? "text-gray-900" : "text-gray-500")} />
          Options
        </button>
      </div>
    </aside>
    </>
  );
}
