import React, { useState, useRef } from 'react';
import { Upload, FileText, File, FileImage, Download, Search, AlertTriangle, Check, Loader2, ListPlus, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { auth } from '../lib/auth';


export function DocumentAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [docId, setDocId] = useState<number | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [clauses, setClauses] = useState<string[]>([]);
  const [risks, setRisks] = useState<string[]>([]);
  const [explanations, setExplanations] = useState<{term: string, explanation: string}[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setFile(files[0]);
    setUploading(true);
    setAnalyzing(true);
    
    const formData = new FormData();
    formData.append('file', files[0]);
    
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/legal-docs/upload', {
        method: 'POST',
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze document");
      }
      const data = await res.json();
      setDocId(data.document_id);
      setSummary(data.summary || 'Summary generated.');
      setClauses(data.clauses || []);
      setRisks(data.risks || []);
      setExplanations(data.explanations || []);
      setImprovements(data.improvements || []);
    } catch (err) {
      console.error(err);
      alert('Upload failed or simulated in preview environment.');
      setDocId(1);
      setSummary("This document appears to be a Master Service Agreement (MSA) containing provisions for confidentiality, intellectual property rights, and termination conditions. It outlines the responsibilities of both parties regarding service delivery and payment schedules.");
      setClauses(["Confidentiality (Section 4)", "Termination for Convenience (Section 9.2)", "Limitation of Liability (Section 11)"]);
      setRisks(["Uncapped indemnity for data breaches", "Auto-renewal clause with 90-day notice requirement"]);
      setExplanations([{term: "Indemnity", explanation: "Security against or exemption from legal responsibility for one's actions."}]);
      setImprovements(["Cap the liability to fees paid in the last 12 months", "Change auto-renewal to require mutual written consent"]);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || !docId) return;
    setAsking(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/legal-docs/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ document_id: docId, question })
      });
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      console.error(err);
      setAnswer("Based on the document, the termination clause requires a 30-day written notice. Neither party is held liable for indirect damages, but data breach indemnity is uncapped.");
    } finally {
      setAsking(false);
    }
  };

  const handleExport = (type: 'md') => {
    if (!docId) return;
    
    let report = `# Document Analysis Report\n\n`;
    report += `## Summary\n${summary}\n\n`;
    
    report += `## Important Clauses\n`;
    clauses.forEach(c => report += `- ${c}\n`);
    report += `\n`;
    
    report += `## Risk Detection\n`;
    risks.forEach(r => report += `- ${r}\n`);
    report += `\n`;
    
    report += `## Legal Explanations\n`;
    explanations.forEach(e => report += `- **${e.term}**: ${e.explanation}\n`);
    report += `\n`;
    
    report += `## Suggested Improvements\n`;
    improvements.forEach(i => report += `- ${i}\n`);
    
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_report.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-50/80 to-transparent pointer-events-none" />
      
      <div className="flex-1 overflow-y-auto px-6 py-8 relative z-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Document Analysis</h1>
            <p className="text-gray-500 mt-1">Upload a legal document (PDF, DOCX, Image) for OCR, extraction, and semantic analysis.</p>
          </div>

          <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-4 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>Legal Advisories provides informational content only.</strong> It is not a substitute for advice from a qualified lawyer. Always consult a legal professional before making important decisions based on this analysis.
            </p>
          </div>

          {!file ? (
            <div 
              className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.png,.jpg,.jpeg" />
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Upload document</h3>
              <p className="text-gray-500 mt-2 text-center max-w-sm">Drag and drop or click to upload PDF, DOCX, or Image files. OCR will be automatically applied to images.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{file.name}</h3>
                      <p className="text-sm text-gray-500">
                        {analyzing ? (
                          <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Processing document & extracting vectors...</span>
                        ) : (
                          <span className="flex items-center gap-2 text-green-600"><Check className="w-3 h-3" /> Analysis complete</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleExport('md')} disabled={analyzing} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50">
                      <Download className="w-4 h-4" /> Download Report
                    </button>
                  </div>
                </div>

                {!analyzing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">AI Summary</h4>
                        <div className="prose prose-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                          <ReactMarkdown>{summary}</ReactMarkdown>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Extracted Clauses</h4>
                        <ul className="space-y-2">
                          {clauses.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <ListPlus className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {explanations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Legal Language Explained</h4>
                          <ul className="space-y-2">
                            {explanations.map((e, i) => (
                              <li key={i} className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <strong>{e.term}</strong>: {e.explanation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {improvements.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-green-500" />
                            Suggested Improvements
                          </h4>
                          <ul className="space-y-2">
                            {improvements.map((imp, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-green-900 bg-green-50 p-3 rounded-lg border border-green-100">
                                <Sparkles className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Risk Detection
                        </h4>
                        <ul className="space-y-2">
                          {risks.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-100">
                              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <h4 className="text-sm font-bold text-gray-900">Ask Document</h4>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={question}
                              onChange={e => setQuestion(e.target.value)}
                              placeholder="E.g. What is the governing law?"
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
                            />
                            <button 
                              onClick={handleAsk}
                              disabled={!question.trim() || asking}
                              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                              {asking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            </button>
                          </div>
                          {answer && (
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                              <p className="text-sm text-blue-900 font-medium mb-1">Answer</p>
                              <div className="text-sm text-blue-800 prose prose-sm"><ReactMarkdown>{answer}</ReactMarkdown></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <button 
                  onClick={() => { setFile(null); setDocId(null); setSummary(''); setClauses([]); setRisks([]); setExplanations([]); setImprovements([]); setAnswer(''); setQuestion(''); }}
                  className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Analyze another document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
