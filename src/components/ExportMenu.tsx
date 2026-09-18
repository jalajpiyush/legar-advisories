import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileCode, FileType2, Copy, Check } from 'lucide-react';
import { exportToPDF, exportToWord, exportToMarkdown, exportToText, copyToClipboard, markdownToHtml } from '../lib/exportUtils';
import { cn } from '../lib/utils';

interface ExportMenuProps {
  title: string;
  content: string; // Markdown content
  className?: string;
  align?: 'left' | 'right';
  buttonVariant?: 'icon' | 'outline' | 'solid';
}

export function ExportMenu({ title, content, className, align = 'right', buttonVariant = 'icon' }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (type: 'pdf' | 'docx' | 'md' | 'txt' | 'copy') => {
    try {
      setIsExporting(true);
      switch (type) {
        case 'pdf':
          const html = await markdownToHtml(content);
          await exportToPDF(title, html);
          break;
        case 'docx':
          await exportToWord(title, content);
          break;
        case 'md':
          exportToMarkdown(title, content);
          break;
        case 'txt':
          exportToText(title, content);
          break;
        case 'copy':
          const success = await copyToClipboard(content);
          if (success) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
          }
          break;
      }
    } catch (err) {
      console.error(`Error exporting to ${type}:`, err);
    } finally {
      setIsExporting(false);
      if (type !== 'copy') setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative inline-block text-left", className)} ref={menuRef}>
      {buttonVariant === 'icon' && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 text-gray-400 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          title="Export"
        >
          <Download className="w-4 h-4" />
        </button>
      )}
      
      {buttonVariant === 'outline' && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      )}
      
      {buttonVariant === 'solid' && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-[#c6a87c] text-white rounded-lg text-sm font-medium hover:bg-[#b5986c] transition-colors shadow-sm"
        >
          {isExporting ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div> : <Download className="w-4 h-4" />}
          <span>Export</span>
        </button>
      )}

      {isOpen && (
        <div 
          className={cn(
            "absolute top-full mt-1 w-48 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl shadow-xl z-50 py-1 overflow-hidden",
            align === 'right' ? "right-0" : "left-0"
          )}
        >
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider bg-gray-50 dark:bg-neutral-900/50">
            Export Format
          </div>
          
          <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors">
            <FileType2 className="w-4 h-4 text-red-500" /> PDF Document (.pdf)
          </button>
          
          <button onClick={() => handleExport('docx')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors">
            <FileText className="w-4 h-4 text-blue-500" /> Word Document (.docx)
          </button>
          
          <button onClick={() => handleExport('txt')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors">
            <FileText className="w-4 h-4 text-gray-500" /> Text File (.txt)
          </button>
          
          <button onClick={() => handleExport('md')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors">
            <FileCode className="w-4 h-4 text-indigo-500" /> Markdown (.md)
          </button>
          
          <div className="h-px bg-gray-100 dark:bg-neutral-800 my-1"></div>
          
          <button onClick={() => handleExport('copy')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors">
            {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />} 
            {isCopied ? 'Copied!' : 'Copy to clipboard'}
          </button>
        </div>
      )}
    </div>
  );
}
