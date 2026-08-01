import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/auth';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  FileText, Wand2, Download, Search, Edit3, 
  ChevronRight, Save, Trash2, ShieldAlert, Sparkles, Loader2, ArrowLeft,
  X, Check, Plus
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';

interface Template {
  id: string;
  category: string;
  title: string;
  fields: { name: string; label: string; placeholder: string }[];
}

const TEMPLATES: Template[] = [
  {
    id: 'emp-agreement',
    category: 'Business',
    title: 'Employment Agreement',
    fields: [
      { name: 'companyName', label: 'Company Name', placeholder: 'e.g. Acme Corp' },
      { name: 'employeeName', label: 'Employee Name', placeholder: 'e.g. John Doe' },
      { name: 'designation', label: 'Designation / Role', placeholder: 'e.g. Software Engineer' },
      { name: 'salary', label: 'Annual Salary', placeholder: 'e.g. Rs. 12,00,000' },
      { name: 'joiningDate', label: 'Date of Joining', placeholder: 'e.g. 1st Aug 2026' },
      { name: 'noticePeriod', label: 'Notice Period', placeholder: 'e.g. 30 Days' },
      { name: 'location', label: 'Work Location', placeholder: 'e.g. Bangalore' },
      { name: 'workingHours', label: 'Working Hours', placeholder: 'e.g. 9 AM to 6 PM, Monday to Friday' }
    ]
  },
  {
    id: 'nda',
    category: 'Business',
    title: 'Non-Disclosure Agreement (NDA)',
    fields: [
      { name: 'party1', label: 'Disclosing Party Name', placeholder: 'e.g. Acme Corp' },
      { name: 'party2', label: 'Receiving Party Name', placeholder: 'e.g. Stark Industries' },
      { name: 'purpose', label: 'Purpose of NDA', placeholder: 'e.g. Exploring potential partnership' },
      { name: 'duration', label: 'Confidentiality Duration', placeholder: 'e.g. 2 Years' },
      { name: 'jurisdiction', label: 'Jurisdiction', placeholder: 'e.g. Courts of New Delhi' }
    ]
  },
  {
    id: 'rent-agreement',
    category: 'Property',
    title: 'Rent Agreement',
    fields: [
      { name: 'landlordName', label: 'Landlord Name', placeholder: 'e.g. Rajesh Sharma' },
      { name: 'tenantName', label: 'Tenant Name', placeholder: 'e.g. Vikram Singh' },
      { name: 'propertyAddress', label: 'Property Address', placeholder: 'e.g. Flat 101, Residency, Mumbai' },
      { name: 'rentAmount', label: 'Monthly Rent', placeholder: 'e.g. Rs. 25,000' },
      { name: 'deposit', label: 'Security Deposit', placeholder: 'e.g. Rs. 1,00,000' },
      { name: 'duration', label: 'Duration (Months)', placeholder: 'e.g. 11 Months' },
      { name: 'startDate', label: 'Start Date', placeholder: 'e.g. 1st Sep 2026' }
    ]
  }
];

interface GeneratedDoc {
  id: string;
  title: string;
  templateTitle: string;
  content: string;
  createdAt: number;
}

export function Generator() {
  const [activeTab, setActiveTab] = useState<'templates' | 'mydocs'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [myDocs, setMyDocs] = useState<GeneratedDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState("");

  const [smartLoading, setSmartLoading] = useState<string | null>(null);
  const [smartResult, setSmartResult] = useState<{ type: string; content: string } | null>(null);

  const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];

  const fetchDocs = async () => {
    setLoadingDocs(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const q = query(
        collection(db, 'generated_documents'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setMyDocs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GeneratedDoc)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mydocs') {
      fetchDocs();
    }
  }, [activeTab]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;
    setGenerating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/contracts/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          templateTitle: activeTemplate.title,
          inputs: formData
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedContent(data.content);
        setEditingContent(data.content);
        setDocTitle(`${activeTemplate.title} - ${new Date().toLocaleDateString()}`);
        setActiveDocId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent && !editingContent) return;
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const docData = {
        title: docTitle,
        templateTitle: activeTemplate?.title || 'Custom Document',
        content: isEditing ? editingContent : generatedContent,
        userId: user.uid,
        updatedAt: Date.now()
      };
      
      if (activeDocId) {
        await updateDoc(doc(db, 'generated_documents', activeDocId), docData);
        alert("Document saved successfully!");
      } else {
        const docRef = await addDoc(collection(db, 'generated_documents'), {
          ...docData,
          createdAt: Date.now()
        });
        setActiveDocId(docRef.id);
        alert("Document saved successfully!");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save document.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      if (!auth.currentUser) return;
      await deleteDoc(doc(db, 'generated_documents', id));
      fetchDocs();
      if (activeDocId === id) resetView();
    } catch (e) {
      console.error(e);
    }
  };

  const resetView = () => {
    setActiveTemplate(null);
    setGeneratedContent(null);
    setFormData({});
    setActiveDocId(null);
    setSmartResult(null);
    setIsEditing(false);
  };

  const openDoc = (doc: GeneratedDoc) => {
    setActiveTemplate({ id: 'custom', title: doc.templateTitle, category: 'Custom', fields: [] });
    setDocTitle(doc.title);
    setGeneratedContent(doc.content);
    setEditingContent(doc.content);
    setActiveDocId(doc.id);
  };

  const handleSmartFeature = async (action: 'explain' | 'improve' | 'detect_missing') => {
    const text = isEditing ? editingContent : generatedContent;
    if (!text) return;
    
    setSmartLoading(action);
    setSmartResult(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/contracts/smart-feature', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ action, text })
      });
      if (res.ok) {
        const data = await res.json();
        setSmartResult({ type: action, content: data.result });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSmartLoading(null);
    }
  };

  const downloadAsTxt = () => {
    const text = isEditing ? editingContent : generatedContent;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle || 'Document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsDocx = () => {
    // For a real app, use docx library. Here we generate a simple HTML masquerading as DOC.
    const text = isEditing ? editingContent : generatedContent;
    if (!text) return;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    // Basic Markdown to HTML conversion for docx structure
    const htmlContent = text.replace(/\\n/g, '<br>').replace(/## (.*?)<br>/g, '<h2>$1</h2>').replace(/\\*\\*(.*?)\\*\\*/g, '<b>$1</b>');
    const sourceHTML = header + htmlContent + footer;
    const blob = new Blob(['\\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle || 'Document'}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const downloadAsPdf = () => {
    const text = isEditing ? editingContent : generatedContent;
    if (!text) return;

    try {
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 54;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 17;
      const normalizedText = text
        .replace(/\r\n/g, '\n')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/^[-*+]\s+/gm, '• ')
        .replace(/₹/g, 'Rs. ')
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[–—]/g, '-');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      const titleLines = pdf.splitTextToSize(docTitle || 'Document', contentWidth);
      pdf.text(titleLines, margin, margin);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      let cursorY = margin + titleLines.length * 22 + 18;

      normalizedText.split('\n').forEach(paragraph => {
        const lines = paragraph.trim()
          ? pdf.splitTextToSize(paragraph, contentWidth)
          : [''];

        lines.forEach((line: string) => {
          if (cursorY > pageHeight - margin) {
            pdf.addPage();
            cursorY = margin;
          }
          pdf.text(line, margin, cursorY);
          cursorY += lineHeight;
        });
        cursorY += 5;
      });

      const fileName = (docTitle || 'Document')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
        .trim()
        .replace(/\s+/g, '_') || 'Document';
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to create the PDF. Please try again.');
    }
  };

  // View: Document Form or Generated
  if (activeTemplate) {
    if (generatedContent) {
      return (
        <div className="flex h-full flex-col bg-[#f9f9fa]">
          <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={resetView} className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <input 
                  type="text" 
                  value={docTitle} 
                  onChange={e => setDocTitle(e.target.value)}
                  className="font-bold text-lg text-neutral-900 border-b border-transparent focus:border-[#c6a87c] outline-none bg-transparent w-64"
                />
                <p className="text-xs text-neutral-500">{activeTemplate.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isEditing ? 'bg-blue-50 text-blue-700' : 'text-neutral-600 hover:bg-neutral-100'}`}>
                <Edit3 className="h-4 w-4" /> {isEditing ? 'Preview' : 'Edit'}
              </button>
              <div className="relative group">
                <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                  <Download className="h-4 w-4" /> Export
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button onClick={downloadAsPdf} className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">PDF</button>
                  <button onClick={downloadAsDocx} className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">DOCX</button>
                  <button onClick={downloadAsTxt} className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">TXT</button>
                </div>
              </div>
              <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-[#c6a87c] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#b5986c]">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex justify-center">
              <div className="w-full max-w-[850px] bg-white rounded-lg shadow-sm border border-neutral-200 p-8 min-h-[1000px] print:m-0 print:border-none print:shadow-none print:p-0">
                {isEditing ? (
                  <textarea
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    className="w-full h-full min-h-[800px] resize-none outline-none font-mono text-sm leading-relaxed text-neutral-800 p-2"
                  />
                ) : (
                  <div className="prose prose-neutral max-w-none prose-headings:font-serif prose-h1:text-2xl prose-h2:text-xl prose-p:text-[15px] prose-p:leading-relaxed">
                    <ReactMarkdown>{editingContent}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Tools Sidebar */}
            <div className="w-80 border-l border-neutral-200 bg-white flex flex-col print:hidden">
              <div className="p-4 border-b border-neutral-100">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#c6a87c]" /> AI Tools
                </h3>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <button 
                  onClick={() => handleSmartFeature('detect_missing')}
                  disabled={!!smartLoading}
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:border-[#c6a87c] transition-colors"
                >
                  <ShieldAlert className="h-4 w-4" /> Check Missing Clauses
                </button>
                <button 
                  onClick={() => handleSmartFeature('improve')}
                  disabled={!!smartLoading}
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:border-[#c6a87c] transition-colors"
                >
                  <Wand2 className="h-4 w-4" /> Rewrite & Improve
                </button>
                <button 
                  onClick={() => handleSmartFeature('explain')}
                  disabled={!!smartLoading}
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:border-[#c6a87c] transition-colors"
                >
                  <FileText className="h-4 w-4" /> Explain Document
                </button>
              </div>

              {(smartLoading || smartResult) && (
                <div className="flex-1 overflow-y-auto p-4 border-t border-neutral-100 bg-neutral-50/50">
                  {smartLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
                      <Loader2 className="h-6 w-6 animate-spin mb-2" />
                      <p className="text-sm">Analyzing document...</p>
                    </div>
                  ) : smartResult ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          {smartResult.type === 'explain' ? 'Explanation' : smartResult.type === 'improve' ? 'Improvements' : 'Missing Clauses'}
                        </span>
                        <button onClick={() => setSmartResult(null)} className="text-neutral-400 hover:text-neutral-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="prose prose-sm prose-neutral">
                        <ReactMarkdown>{smartResult.content}</ReactMarkdown>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-3xl p-6 md:p-12">
        <button onClick={resetView} className="mb-6 flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Templates
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Generate {activeTemplate.title}</h1>
            <p className="text-neutral-500">Fill in the key details below. The AI will draft a complete, legally sound document based on Indian law.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTemplate.fields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">{field.label}</label>
                  <input
                    required
                    type="text"
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#c6a87c] focus:bg-white focus:ring-1 focus:ring-[#c6a87c] transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={generating}
                className="flex items-center gap-2 rounded-xl bg-[#c6a87c] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#b5986c] disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#c6a87c]/20"
              >
                {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
                Generate Document
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // View: Main Dashboard (Templates & My Docs)
  return (
    <div className="flex flex-col h-full bg-[#f9f9fa] overflow-hidden">
      <div className="flex-none bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-6xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#c6a87c]" />
              AI Contract Generator
            </h1>
            <p className="mt-1 text-sm text-neutral-500">Generate, edit, and export enterprise-grade legal documents in seconds.</p>
          </div>
          <div className="flex bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'templates' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              <Plus className="h-4 w-4" /> New Document
            </button>
            <button
              onClick={() => setActiveTab('mydocs')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'mydocs' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              <FileText className="h-4 w-4" /> My Documents
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto w-full">
          {activeTab === 'templates' ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${selectedCategory === cat ? 'bg-[#c6a87c] text-white border-[#c6a87c]' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {TEMPLATES.filter(t => selectedCategory === 'All' || t.category === selectedCategory).map(template => (
                  <div 
                    key={template.id} 
                    onClick={() => setActiveTemplate(template)}
                    className="group bg-white rounded-xl border border-neutral-200 p-5 cursor-pointer hover:border-[#c6a87c] hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="mb-4 w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center text-[#c6a87c] group-hover:scale-110 group-hover:bg-[#c6a87c]/10 transition-transform">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">{template.category}</span>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">{template.title}</h3>
                    <div className="mt-auto pt-4 flex items-center justify-between text-sm text-neutral-500 font-medium">
                      <span>{template.fields.length} dynamic fields</span>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#c6a87c]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {loadingDocs ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-[#c6a87c]" />
                </div>
              ) : myDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">No documents found</h3>
                  <p className="text-neutral-500 max-w-sm mb-6">You haven't generated any documents yet. Head over to the templates to create your first contract.</p>
                  <button onClick={() => setActiveTab('templates')} className="rounded-lg bg-[#c6a87c] px-4 py-2 text-sm font-medium text-white hover:bg-[#b5986c] transition-colors">
                    Browse Templates
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {myDocs.map(doc => (
                    <div key={doc.id} className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                          {doc.templateTitle}
                        </span>
                        <button onClick={() => handleDelete(doc.id)} className="text-neutral-400 hover:text-red-500 p-1 rounded-md hover:bg-neutral-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4 truncate" title={doc.title}>{doc.title}</h3>
                      <div className="flex items-center justify-between mt-auto border-t border-neutral-100 pt-3">
                        <span className="text-xs text-neutral-500">{new Date(doc.createdAt).toLocaleDateString()}</span>
                        <button onClick={() => openDoc(doc)} className="text-sm font-medium text-[#c6a87c] hover:text-[#b5986c] transition-colors">
                          Open & Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
