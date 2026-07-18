import React from "react";
import { Users, Lightbulb, ChevronDown, Sidebar as SidebarIcon } from "lucide-react";

interface HeaderProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-end px-8 z-20 bg-white/50 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          <Users className="w-[18px] h-[18px]" /> View shared threads
        </button>
        <button className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          <Lightbulb className="w-[18px] h-[18px]" /> Tips
        </button>
      </div>
    </div>
  );
}
