import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  FileText, 
  LayoutDashboard, 
  Sparkles, 
  Wand2, 
  Folder, 
  Settings, 
  Command, 
  BookOpen, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { PageId } from './Sidebar';

export interface CommandPaletteProps {
  onNavigate: (pageId: PageId) => void;
}

const pages: { id: PageId; label: string; icon: React.ElementType; category: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Pages' },
  { id: 'vault', label: 'Vault', icon: Folder, category: 'Pages' },
  { id: 'document-analysis', label: 'Document Analysis', icon: FileText, category: 'Pages' },
  { id: 'cases', label: 'My Cases', icon: Briefcase, category: 'Pages' },
  { id: 'research', label: 'Legal Research', icon: BookOpen, category: 'Pages' },
  { id: 'generator', label: 'Document Generator', icon: Wand2, category: 'Pages' },
  { id: 'history', label: 'History', icon: Clock, category: 'Pages' },
  { id: 'compliance', label: 'Compliance Checker', icon: ShieldCheck, category: 'Pages' },
  { id: 'options', label: 'Settings', icon: Settings, category: 'Pages' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, category: 'Pages' },
];

const aiActions = [
  { id: 'ai-review', label: 'Review Contract with AI', icon: Sparkles, category: 'AI Actions' },
  { id: 'ai-summarize', label: 'Summarize Document', icon: Sparkles, category: 'AI Actions' },
  { id: 'ai-draft', label: 'Draft Legal Notice', icon: Wand2, category: 'AI Actions' },
];

const mockFiles = [
  { id: 'f1', label: 'NDA_Template.pdf', icon: FileText, category: 'Files' },
  { id: 'f2', label: 'Employment_Contract_2023.docx', icon: FileText, category: 'Files' },
  { id: 'f3', label: 'Q3_Compliance_Report.pdf', icon: FileText, category: 'Files' },
];

export function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Small delay to ensure the input is rendered before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allItems = [...pages, ...aiActions, ...mockFiles];
  const filteredItems = query 
    ? allItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
    : allItems;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: any) => {
    setIsOpen(false);
    
    if (item.category === 'Pages') {
      onNavigate(item.id as PageId);
    } else if (item.category === 'AI Actions') {
      // Typically you'd have a specific logic here, e.g., triggering a modal or navigating to a specific AI tool.
      onNavigate('dashboard'); 
      // Emulate dispatching a custom event that the dashboard could listen to
      window.dispatchEvent(new CustomEvent('trigger-ai-action', { detail: item.id }));
    } else if (item.category === 'Files') {
      onNavigate('vault');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[10vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center px-4 py-4 border-b border-gray-200/50 dark:border-neutral-800/50">
                <Search className="w-5 h-5 text-gray-500 dark:text-neutral-400 mr-3 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages, files, or ask AI..."
                  className="flex-1 bg-transparent border-none outline-none text-[16px] text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                />
                <div className="flex items-center gap-1.5 ml-3 shrink-0">
                  <span className="px-2 py-1 text-[11px] font-medium text-gray-500 dark:text-neutral-400 bg-gray-100/50 dark:bg-neutral-800/50 rounded-md border border-gray-200/50 dark:border-neutral-700/50">
                    Esc
                  </span>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                {filteredItems.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-[14px] text-gray-500 dark:text-neutral-400">No results found for "{query}"</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {/* Render Categories */}
                    {['Pages', 'AI Actions', 'Files'].map(category => {
                      const categoryItems = filteredItems.filter(i => i.category === category);
                      if (categoryItems.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-2 last:mb-0">
                          <div className="px-3 py-2 text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                            {category}
                          </div>
                          {categoryItems.map((item) => {
                            const index = filteredItems.indexOf(item);
                            const isSelected = index === selectedIndex;
                            const Icon = item.icon;
                            
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                  isSelected 
                                    ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' 
                                    : 'hover:bg-gray-100/50 dark:hover:bg-neutral-800/50 text-gray-700 dark:text-neutral-300'
                                }`}
                              >
                                <Icon className={`w-4 h-4 mr-3 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-neutral-400'}`} />
                                <span className="text-[14px] font-medium">{item.label}</span>
                                {isSelected && (
                                  <div className="ml-auto">
                                    <span className="text-[12px] font-medium opacity-60">↵ Jump</span>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="px-4 py-3 bg-gray-50/50 dark:bg-neutral-900/50 border-t border-gray-200/50 dark:border-neutral-800/50 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[12px] text-gray-500 dark:text-neutral-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-sm">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-sm">↓</kbd>
                    <span>to navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-sm">↵</kbd>
                    <span>to select</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-gray-400 dark:text-neutral-500">
                  <Command className="w-3.5 h-3.5" />
                  <span className="font-semibold">Legal Advisories</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
