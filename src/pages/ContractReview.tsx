import React, { useState } from "react";
import { UploadCloud, FileText, AlertTriangle, FileCheck, CheckCircle2, Search, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function ContractReview() {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setIsAnalyzing(true);
        setTimeout(() => {
          setIsAnalyzing(false);
          setResults(true);
        }, 2500); // Simulate local OCR/AI processing
      }, 1000);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">AI Contract Review & OCR</h1>
        <p className="text-sm text-gray-500 mt-1">Upload scanned documents, PDFs, or DOCX for local AI extraction and clause analysis.</p>
      </div>

      {!file && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-2xl bg-[#121214] hover:bg-[#151518] transition-colors relative"
        >
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            accept=".pdf,.docx,.txt"
            onChange={handleUpload}
          />
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
              <UploadCloud className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200">Drag & Drop Legal Document</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">Supports PDF, DOCX, TXT, Scanned Images (Auto OCR via local vision model).</p>
          </div>
        </motion.div>
      )}

      {(isUploading || isAnalyzing) && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 border-4 border-gray-800 border-t-indigo-500 rounded-full mb-6"
          />
          <h3 className="text-xl font-medium text-gray-200">
            {isUploading ? "Extracting Document Text (OCR)..." : "AI Multi-Agent Analysis..."}
          </h3>
          <p className="text-sm text-gray-500 mt-2 font-mono">
            {isAnalyzing ? "> Vectorizing context & running compliance checks..." : "> Running layout analysis"}
          </p>
        </div>
      )}

      {results && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Document Viewer */}
          <div className="lg:col-span-2 bg-[#121214] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            <div className="border-b border-gray-800 p-4 bg-gray-900/50 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-200">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>{file?.name || "Master_Services_Agreement_v2.pdf"}</span>
              </div>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded border border-emerald-500/20 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> OCR Complete
                </span>
              </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-gray-50 text-gray-900 font-serif text-sm leading-relaxed relative">
              <div className="max-w-2xl mx-auto bg-white p-12 shadow-sm min-h-full">
                <h2 className="text-xl font-bold text-center mb-8 uppercase tracking-widest">Master Services Agreement</h2>
                <p className="mb-4">This Master Services Agreement ("Agreement") is made effective as of <strong>[Date]</strong>, by and between <strong>[Company A]</strong>, and <strong>[Company B]</strong>.</p>
                <div className="bg-amber-100/80 border-l-4 border-amber-500 p-2 my-4 relative group">
                  <p className="font-bold mb-1 text-amber-900">3. LIMITATION OF LIABILITY</p>
                  <p>In no event shall either party be liable for any indirect, incidental, or consequential damages. The total liability of Provider under this Agreement shall not exceed the total amount paid by Client during the preceding twelve (12) months.</p>
                  <div className="absolute left-full ml-4 top-0 w-64 bg-[#121214] border border-gray-800 rounded-lg p-3 hidden group-hover:block z-10 shadow-xl">
                     <p className="text-xs text-amber-400 font-semibold mb-1 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> High Risk Clause</p>
                     <p className="text-xs text-gray-300 font-sans">Liability cap is unusually low for this industry standard. Consider negotiating to 24 months or a fixed higher cap.</p>
                  </div>
                </div>
                <p className="mb-4">4. TERMINATION. Either party may terminate this Agreement for cause upon thirty (30) days written notice of a material breach.</p>
                <div className="bg-red-100/80 border-l-4 border-red-500 p-2 my-4 relative group">
                  <p className="font-bold mb-1 text-red-900">8. NON-COMPETE</p>
                  <p>Client agrees not to hire any employee of Provider for a period of five (5) years following the termination of this agreement.</p>
                   <div className="absolute left-full ml-4 top-0 w-64 bg-[#121214] border border-gray-800 rounded-lg p-3 hidden group-hover:block z-10 shadow-xl">
                     <p className="text-xs text-red-400 font-semibold mb-1 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Critical Legal Risk</p>
                     <p className="text-xs text-gray-300 font-sans">A 5-year non-compete is generally unenforceable in many jurisdictions (e.g., California). Recommended maximum is 1-2 years.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results Sidebar */}
          <div className="space-y-6 flex flex-col h-full overflow-hidden">
            <div className="bg-[#121214] border border-gray-800 rounded-xl p-6 shrink-0">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                <Zap className="w-5 h-5 text-indigo-400 mr-2" />
                AI Analysis Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Document Type</span>
                  <span className="text-sm font-medium text-gray-200">Services Agreement</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Risk Score</span>
                  <span className="text-sm font-bold text-amber-500">Medium / 64%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Missing Clauses</span>
                  <span className="text-sm font-medium text-red-400">Data Privacy (GDPR)</span>
                </div>
              </div>
            </div>

            <div className="bg-[#121214] border border-gray-800 rounded-xl p-6 flex-1 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Detected Issues</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div className="ml-2">
                      <p className="text-sm font-medium text-red-200">Unenforceable Non-Compete</p>
                      <p className="text-xs text-gray-400 mt-1">Section 8 specifies a 5-year term.</p>
                      <button className="text-xs text-indigo-400 mt-2 font-medium hover:text-indigo-300">Draft counter-proposal</button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div className="ml-2">
                      <p className="text-sm font-medium text-amber-200">Low Liability Cap</p>
                      <p className="text-xs text-gray-400 mt-1">Section 3 limits liability to 12 months fees.</p>
                      <button className="text-xs text-indigo-400 mt-2 font-medium hover:text-indigo-300">Draft counter-proposal</button>
                    </div>
                  </div>
                </div>
              </div>

               <div className="mt-6 pt-6 border-t border-gray-800">
                 <button onClick={() => {setFile(null); setResults(false)}} className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-sm font-medium text-white rounded-lg transition-colors">
                   Analyze Another Document
                 </button>
               </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
