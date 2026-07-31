import React from 'react';
import { FileText, Download, Eye } from 'lucide-react';

interface PdfDocumentCardProps {
  fileName: string;
  downloadUrl: string;
}

export function PdfDocumentCard({ fileName, downloadUrl }: PdfDocumentCardProps) {
  return (
    <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 flex items-center gap-3">
      <div className="w-10 h-10 rounded bg-indigo-500/20 flex items-center justify-center shrink-0">
        <FileText className="w-6 h-6 text-indigo-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate">{fileName}</p>
        <p className="text-xs text-gray-400">Created: {new Date().toLocaleDateString()}</p>
      </div>
      <div className="flex items-center gap-2">
        <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-600 rounded text-gray-300">
          <Eye className="w-4 h-4" />
        </a>
        <a href={downloadUrl} download className="p-2 hover:bg-gray-600 rounded text-gray-300">
          <Download className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
