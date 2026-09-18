import React, { useState, useEffect } from 'react';
import { auth } from '../lib/auth';
import { documentSchemas, DocSchema, FormField } from '../lib/documentSchemas';
import { saveGeneratedDocument, getUserDocuments, GeneratedDocument } from '../lib/documentService';
import { FileText, Wand2, ArrowLeft, Loader2, Sparkles, AlertCircle, FileCheck2, Clock, CheckCircle2 } from 'lucide-react';
import { ExportMenu } from '../components/ExportMenu';
import ReactMarkdown from 'react-markdown';
import { motion } from "motion/react";

export function Generator() {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // Stepper State
  const [step, setStep] = useState(1);
  const [selectedSchema, setSelectedSchema] = useState<DocSchema | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [aiPrompt, setAiPrompt] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (view === 'list' && auth.currentUser) {
      loadDocuments();
    }
  }, [view, auth.currentUser]);

  const loadDocuments = async () => {
    setLoadingList(true);
    try {
      const docs = await getUserDocuments(auth.currentUser!.uid);
      setDocuments(docs);
    } catch (e) {
      console.error(e);
    }
    setLoadingList(false);
  };

  const handleStartNew = () => {
    setStep(1);
    setSelectedSchema(null);
    setFormData({});
    setAiPrompt("");
    setGeneratedContent("");
    setErrors({});
    setCurrentDocId(null);
    setView('create');
  };

  const handleResume = (doc: GeneratedDocument) => {
    const schema = documentSchemas.find(s => s.id === doc.schemaId);
    if (schema) {
      setSelectedSchema(schema);
      setFormData(doc.formData || {});
      setGeneratedContent(doc.content || "");
      setCurrentDocId(doc.id);
      setStep(5);
      setView('create');
    }
  };

  const handleExtractFields = async () => {
    if (!aiPrompt.trim() || !selectedSchema) return;
    setIsExtracting(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/extract-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(idToken && { "Authorization": `Bearer ${idToken}` }) },
        body: JSON.stringify({ prompt: aiPrompt, schema: selectedSchema })
      });
      const data = await res.json();
      if (data.extractedData) {
        setFormData(prev => ({ ...prev, ...data.extractedData }));
      }
    } catch (e) {
      console.error(e);
    }
    setIsExtracting(false);
  };

  const handleGenerate = async () => {
    if (!selectedSchema || !auth.currentUser) return;
    setStep(4);
    setIsGenerating(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch("/api/draft-document", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(idToken && { "Authorization": `Bearer ${idToken}` }) },
        body: JSON.stringify({ schema: selectedSchema, formData })
      });
      const data = await res.json();
      if (data.document) {
        setGeneratedContent(data.document);
        // Save to Firestore
        const docId = await saveGeneratedDocument(auth.currentUser.uid, {
          id: currentDocId || undefined,
          schemaId: selectedSchema.id,
          title: selectedSchema.title,
          formData,
          content: data.document,
          status: 'draft'
        });
        setCurrentDocId(docId);
        setStep(5);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate document.");
      setStep(3); // go back to review
    }
    setIsGenerating(false);
  };

  const checkCondition = (field: FormField) => {
    if (!field.condition) return true;
    return formData[field.condition.field] === field.condition.value;
  };

  const visibleFields = selectedSchema?.fields.filter(checkCondition) || [];
  
  const handleNextStep2 = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    visibleFields.forEach(f => {
      const value = formData[f.id];

      // Required check
      if (f.required && (value === undefined || value === '' || value === null)) {
        newErrors[f.id] = `${f.label} is required`;
        hasError = true;
        return;
      }

      // Advanced Validation
      if (value && f.validation) {
        if (typeof value === 'string') {
          if (f.validation.min !== undefined && value.length < f.validation.min) {
            newErrors[f.id] = f.validation.customError || `Minimum length is ${f.validation.min} characters`;
            hasError = true;
            return;
          }
          if (f.validation.max !== undefined && value.length > f.validation.max) {
            newErrors[f.id] = f.validation.customError || `Maximum length is ${f.validation.max} characters`;
            hasError = true;
            return;
          }
          if (f.validation.pattern) {
            const regex = new RegExp(f.validation.pattern);
            if (!regex.test(value)) {
              newErrors[f.id] = f.validation.customError || `Invalid format`;
              hasError = true;
              return;
            }
          }
        } else if (typeof value === 'number') {
          if (f.validation.min !== undefined && value < f.validation.min) {
            newErrors[f.id] = f.validation.customError || `Minimum value is ${f.validation.min}`;
            hasError = true;
            return;
          }
          if (f.validation.max !== undefined && value > f.validation.max) {
            newErrors[f.id] = f.validation.customError || `Maximum value is ${f.validation.max}`;
            hasError = true;
            return;
          }
        }
      }
    });

    setErrors(newErrors);
    if (hasError) return;
    setStep(3);
  };

  if (view === 'list') {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-neutral-900 overflow-y-auto">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <motion.h1 layoutId="page-title" className="text-2xl font-serif text-gray-900 dark:text-neutral-100 mb-1">Smart Document Generation</motion.h1>
            <motion.p layoutId="page-description" className="text-[14px] text-gray-500 dark:text-neutral-400">Generate professional legal documents tailored to your needs.</motion.p>
          </div>
          <button onClick={handleStartNew} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-[14px] font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
            <Sparkles className="w-4 h-4" /> Create New
          </button>
        </div>
        
        <div className="p-8 max-w-5xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" /> Recent Documents
          </h2>
          {loadingList ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl">
              <FileText className="w-10 h-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-neutral-400 text-sm">No documents generated yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map(doc => (
                <div key={doc.id} onClick={() => handleResume(doc)} className="border border-gray-200 dark:border-neutral-800 p-5 rounded-xl hover:border-[#c6a87c] dark:hover:border-[#c6a87c] cursor-pointer transition-colors bg-white dark:bg-neutral-900 group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-gray-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center group-hover:bg-[#c6a87c]/10 transition-colors">
                      <FileCheck2 className="w-5 h-5 text-gray-600 dark:text-neutral-400 group-hover:text-[#c6a87c]" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 rounded">v{doc.version}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{doc.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">Last updated: {doc.updatedAt ? new Date(doc.updatedAt.toDate()).toLocaleDateString() : 'Recently'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // CREATE WORKFLOW
  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 overflow-y-auto">
      <div className="px-8 py-4 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-10">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Documents
        </button>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-between max-w-3xl mx-auto mb-4 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 dark:bg-neutral-800 -z-10" />
          {[
            { id: 1, label: 'Document' },
            { id: 2, label: 'Details' },
            { id: 3, label: 'Review' },
            { id: 4, label: 'Generate' },
            { id: 5, label: 'Preview' }
          ].map(s => (
            <div key={s.id} className={`flex flex-col items-center gap-2 bg-white dark:bg-neutral-900 px-2 ${step === s.id ? 'text-[#c6a87c]' : step > s.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${step === s.id ? 'border-[#c6a87c] bg-[#c6a87c]/10' : step > s.id ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-black' : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'}`}>
                {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Select Document Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentSchemas.map(schema => (
                <div key={schema.id} onClick={() => { setSelectedSchema(schema); setStep(2); }} className="border border-gray-200 dark:border-neutral-800 p-5 rounded-xl hover:border-[#c6a87c] dark:hover:border-[#c6a87c] cursor-pointer transition-all hover:shadow-md bg-white dark:bg-neutral-900 group">
                  <div className="text-xs font-semibold text-[#c6a87c] tracking-wider uppercase mb-2">{schema.category}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{schema.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-400 line-clamp-3">{schema.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedSchema && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-2">{selectedSchema.title} Details</h2>
              <p className="text-gray-500 dark:text-neutral-400">Please provide the necessary information to generate your document.</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium">
                <Wand2 className="w-5 h-5" /> AI Assist
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300">Describe what you need in plain English, and the AI will pre-fill the form for you.</p>
              <div className="flex gap-2">
                <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g. I took a year off after 12th for JEE prep and need this for BTech admission..." className="flex-1 bg-white dark:bg-neutral-900 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                <button onClick={handleExtractFields} disabled={isExtracting || !aiPrompt.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                  {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Auto-Fill'}
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {Array.from(new Set(visibleFields.map(f => f.section))).map(section => (
                <div key={section} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-neutral-800 pb-2">{section}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleFields.filter(f => f.section === section).map(field => (
                      <div key={field.id} className={`${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                        <label className="block text-[13px] font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea value={formData[field.id] || ''} onChange={e => { setFormData({...formData, [field.id]: e.target.value}); if (errors[field.id]) setErrors({...errors, [field.id]: ''}); }} placeholder={field.placeholder} className={`w-full bg-gray-50 dark:bg-neutral-800/50 border rounded-lg px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all min-h-[100px] ${errors[field.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-neutral-800 focus:ring-[#c6a87c]/20 focus:border-[#c6a87c]'}`} />
                        ) : field.type === 'select' ? (
                          <select value={formData[field.id] || ''} onChange={e => { setFormData({...formData, [field.id]: e.target.value}); if (errors[field.id]) setErrors({...errors, [field.id]: ''}); }} className={`w-full bg-gray-50 dark:bg-neutral-800/50 border rounded-lg px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${errors[field.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-neutral-800 focus:ring-[#c6a87c]/20 focus:border-[#c6a87c]'}`}>
                            <option value="">Select option</option>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : field.type === 'boolean' ? (
                          <div className="flex items-center gap-3 h-10">
                            <button onClick={() => { setFormData({...formData, [field.id]: true}); if (errors[field.id]) setErrors({...errors, [field.id]: ''}); }} className={`px-4 py-1.5 rounded-md text-sm font-medium border ${formData[field.id] === true ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-gray-700 border-gray-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800'} ${errors[field.id] ? 'border-red-500' : ''}`}>Yes</button>
                            <button onClick={() => { setFormData({...formData, [field.id]: false}); if (errors[field.id]) setErrors({...errors, [field.id]: ''}); }} className={`px-4 py-1.5 rounded-md text-sm font-medium border ${formData[field.id] === false ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-gray-700 border-gray-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800'} ${errors[field.id] ? 'border-red-500' : ''}`}>No</button>
                          </div>
                        ) : (
                          <input type={field.type} value={formData[field.id] || ''} onChange={e => { setFormData({...formData, [field.id]: e.target.value}); if (errors[field.id]) setErrors({...errors, [field.id]: ''}); }} placeholder={field.placeholder} className={`w-full bg-gray-50 dark:bg-neutral-800/50 border rounded-lg px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${errors[field.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-neutral-800 focus:ring-[#c6a87c]/20 focus:border-[#c6a87c]'}`} />
                        )}
                        {errors[field.id] && <p className="text-red-500 text-[12px] mt-1.5 font-medium animate-in fade-in">{errors[field.id]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-gray-100 dark:border-neutral-800 flex justify-end gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg text-[14px] font-semibold text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors">Cancel</button>
              <button onClick={handleNextStep2} className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm">Review Information</button>
            </div>
          </div>
        )}

        {step === 3 && selectedSchema && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-2">Review Details</h2>
                <p className="text-gray-500 dark:text-neutral-400">Verify your information before we generate the final document.</p>
              </div>
              <button onClick={() => setStep(2)} className="text-sm font-medium text-[#c6a87c] hover:underline">Edit Details</button>
            </div>

            <div className="bg-gray-50 dark:bg-neutral-800/30 rounded-xl p-6 border border-gray-200 dark:border-neutral-800 space-y-6">
              {Array.from(new Set(visibleFields.map(f => f.section))).map(section => (
                <div key={section}>
                  <h4 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3">{section}</h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleFields.filter(f => f.section === section).map(field => (
                      <div key={field.id}>
                        <dt className="text-[13px] text-gray-500 dark:text-neutral-500">{field.label}</dt>
                        <dd className="text-[15px] font-medium text-gray-900 dark:text-white mt-0.5">
                          {field.type === 'boolean' ? (formData[field.id] ? 'Yes' : 'No') : (formData[field.id] || <span className="text-gray-400 italic">Not provided</span>)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-5 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-400">
                <strong className="font-semibold block mb-1">Legal Disclaimer</strong>
                This document is generated based on your inputs. It may require review, modification, stamping, notarization, or registration depending on your jurisdiction. We do not fabricate notary information or government stamps.
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-neutral-800 flex justify-end gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-lg text-[14px] font-semibold text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors">Back</button>
              <button onClick={handleGenerate} className="bg-[#c6a87c] hover:bg-[#b5986c] text-white px-6 py-2.5 rounded-lg text-[14px] font-semibold transition-colors flex items-center gap-2 shadow-sm">
                <Sparkles className="w-4 h-4" /> Generate Document
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
            <Loader2 className="w-12 h-12 animate-spin text-[#c6a87c] mb-6" />
            <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-2">Drafting Document...</h2>
            <p className="text-gray-500 dark:text-neutral-400 max-w-sm mx-auto">
              Our AI is currently drafting your professional document based on your provided information. This will just take a moment.
            </p>
          </div>
        )}

        {step === 5 && selectedSchema && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-4 rounded-xl sticky top-24 z-10 shadow-sm">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{selectedSchema.title}</h3>
                <p className="text-xs text-gray-500">Drafted successfully. Ready for export.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg text-[14px] font-medium text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors">Edit Details</button>
                <ExportMenu title={selectedSchema.title} content={generatedContent} buttonVariant="solid" />
              </div>
            </div>

            <div className="bg-white dark:bg-white p-8 md:p-12 border border-gray-200 shadow-sm rounded-xl min-h-[800px] prose prose-gray max-w-none print:shadow-none print:border-none">
              <ReactMarkdown>{generatedContent}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
