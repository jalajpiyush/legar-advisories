import React from "react";
import { Users, Lightbulb, ChevronDown, Sidebar as SidebarIcon, Menu } from "lucide-react";

interface HeaderProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <div className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-8 z-20 bg-white border-b border-gray-100">
      <div className="flex items-center">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <button className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          <Users className="w-[18px] h-[18px] hidden sm:block" /> 
          <span className="hidden sm:inline">View shared threads</span>
        </button>
        <button className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          <Lightbulb className="w-[18px] h-[18px]" /> 
          <span className="hidden sm:inline">Tips</span>
        </button>
      </div>
    </div>
  );
}
