import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Folder, Briefcase, Plus, Search, ChevronDown, AlertTriangle,
  Settings2, Wand2, Globe, Building2, 
  ChevronRight, FileText, Activity, Users, Bot, User, Check, Mic, AudioLines, VenetianMask
} from "lucide-react";
import { ExportMenu } from '../components/ExportMenu';
import { DynamicForm } from '../components/DynamicForm';
import { FeedbackButtons } from '../components/FeedbackButtons';
import ReactMarkdown from "react-markdown";

import { addHistoryItem, updateHistoryItemMessages, getHistoryItem, ChatMessage } from "../lib/history";
import { sendEmailVerification, auth } from '../lib/auth';
import { useLiveVoice } from '../hooks/useLiveVoice';

import Hammer from 'hammerjs';



const isDocumentContent = (content: string) => {
  if (!content) return false;
  
  // Extract textContent to check length without the JSON form
  let textContent = content;
  const formMatch = content.match(/```json\n([\s\S]*?)\n```/);
  if (formMatch) {
    try {
      const parsed = JSON.parse(formMatch[1]);
      if (parsed.type === 'dynamic_form') {
        textContent = content.replace(formMatch[0], '').trim();
      }
    } catch(e) {}
  }
  
  if (textContent.length > 150) return true;
  if (/^#+\s/.test(textContent.trim())) return true;
  if (/(?:\*\*|#)\s*(?:AGREEMENT|AFFIDAVIT|NOTICE|DEED|CONTRACT|POWER OF ATTORNEY|CERTIFICATE|MEMORANDUM|PETITION|APPLICATION)/i.test(textContent)) return true;
  return false;
};

export function Dashboard({ currentChatId, onChatIdChange, user }: { currentChatId?: string | null, onChatIdChange?: (id: string | null) => void, user?: any }) {
  const [verificationSent, setVerificationSent] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [knowledgeSuggestions, setKnowledgeSuggestions] = useState<{concepts: string[], precedents: string[], templates: string[]}>({concepts: [], precedents: [], templates: []});
  
  
  const { isVoiceMode, voiceState, startVoiceMode, stopVoiceMode } = useLiveVoice();
  
  const recognitionRef = useRef<any>(null);
  const isLoadingRef = useRef(false);
  const promptRef = useRef("");
  const isVoiceModeRef = useRef(false);
  useEffect(() => { isVoiceModeRef.current = isVoiceMode; }, [isVoiceMode]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); stream.getTracks().forEach(t => t.stop());
    } catch (err) {
      alert("Microphone permission is required.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => console.log("[MIC] started");
    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setPrompt(prev => prev + (prev ? " " : "") + finalTranscript);
      }
    };
    recognition.onend = () => {
      console.log("[MIC] ended");
      setIsRecording(false);
    };
    recognition.onerror = (event: any) => {
      console.error("[MIC] error", event.error);
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const toggleVoiceMode = () => {
    if (isVoiceMode) {
      stopVoiceMode();
    } else {
      let initialContext = "";
      if (uploadedFiles && uploadedFiles.length > 0) {
        initialContext += "User uploaded documents: " + uploadedFiles.map(f => f.name).join(", ");
      }
      startVoiceMode(initialContext);
    }
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setVerificationSent(true);
      } catch (err) {
        console.error(err);
      }
    }
  };
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const sourcesRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        newFiles.push(files[i]);
      }
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setSourcesOpen(false);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles: File[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        newFiles.push(e.dataTransfer.files[i]);
      }
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => { promptRef.current = prompt; }, [prompt]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [prompt]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string, citations?: {source: string, act: string, section: string, doc: string}[]}[]>([]);

  useEffect(() => {
    if (chatHistory.length === 0 && user?.uid) {
      auth.currentUser?.getIdToken().then(token => {
        fetch('/api/suggestions', {
          headers: { 'Authorization': `Bearer ${token || ''}` }
        })
        .then(res => res.json())
        .then(data => {
           if (data && (data.templates || data.precedents)) {
               setKnowledgeSuggestions(data);
           }
        })
        .catch(err => console.error("Failed to load knowledge graph", err));
      }).catch(console.error);
    }
  }, [chatHistory.length, user?.uid]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  
  const [showIncognitoToast, setShowIncognitoToast] = useState<{show: boolean, active: boolean}>({ show: false, active: false });
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showIncognitoToast.show && toastRef.current) {
      const mc = new Hammer(toastRef.current, {
        recognizers: [
          [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }]
        ]
      });

      mc.on('swipeleft', () => {
        setShowIncognitoToast(prev => ({ ...prev, show: false }));
      });

      return () => mc.destroy();
    }
  }, [showIncognitoToast.show]);


  useEffect(() => {
    if (currentChatId) {
      const item = getHistoryItem(currentChatId);
      if (item && item.messages) {
        setChatHistory(item.messages as any[]);
        setCurrentHistoryId(currentChatId);
      }
    } else {
      setChatHistory([]);
      setCurrentHistoryId(null);
    }
    
    // Auto-focus the textarea when a chat is opened or resumed
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  }, [currentChatId]);

  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [chatHistory]);
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);

  const [promptsOpen, setPromptsOpen] = useState(false);
  const promptsRef = useRef<HTMLDivElement>(null);
  
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const customizeRef = useRef<HTMLDivElement>(null);
  
  const [isDeepResearch, setIsDeepResearch] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const getTagClass = (tag: string) => `flex items-center gap-2 text-[14px] font-semibold border px-4 py-2 rounded-full shadow-[0_1px_2px_rgb(0,0,0,0.03)] transition-colors cursor-pointer ${selectedTags.includes(tag) ? 'border-gray-800 dark:border-neutral-200 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100' : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:border-gray-300 dark:border-neutral-700'}`;
  const getTagSuffix = (tag: string) => <span className="text-gray-400 dark:text-neutral-500 font-normal ml-1">{selectedTags.includes(tag) ? '✓' : '+'}</span>;
  const getDropdownSourceClass = (tag: string, additionalClasses: string = "") => `w-full flex items-center px-3 py-2 rounded-lg transition-colors ${selectedTags.includes(tag) ? 'bg-gray-100 dark:bg-neutral-800/80 text-gray-900 dark:text-neutral-100 font-semibold' : 'hover:bg-gray-50 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 font-medium'} ${additionalClasses}`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sourcesRef.current && !sourcesRef.current.contains(event.target as Node)) {
        setSourcesOpen(false);
      }
      if (promptsRef.current && !promptsRef.current.contains(event.target as Node)) {
        setPromptsOpen(false);
      }
      if (customizeRef.current && !customizeRef.current.contains(event.target as Node)) {
        setCustomizeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAskLegalAdvisories = async (overridePrompt?: string | React.MouseEvent | any) => {
    const isEvent = overridePrompt && typeof overridePrompt === 'object' && 'preventDefault' in overridePrompt;
    const currentPromptText = typeof overridePrompt === 'string' ? overridePrompt : promptRef.current;
    
    if ((!currentPromptText.trim() && uploadedFiles.length === 0) || isLoadingRef.current) return;

    if (isVoiceModeRef.current) {
       console.log("[CHAT] request started for Voice Mode");
    }

    const currentPrompt = currentPromptText || "Please review the attached file(s).";
    const currentFiles = [...uploadedFiles];
    
    setIsLoading(true);

    try {
      const fileDataPromises = currentFiles.map(file => {
        return new Promise<{mimeType: string, data: string, name: string}>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            const base64Data = result.split(',')[1];
            resolve({
              mimeType: file.type || 'application/octet-stream',
              data: base64Data,
              name: file.name
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const fileParts = await Promise.all(fileDataPromises);
      
      let finalContent = currentPrompt;
      if (currentFiles.length > 0) {
        finalContent += "\n\n" + currentFiles.map(f => `[Attached File: ${f.name}]`).join("\n");
      }
      if (selectedTags.length > 0) {
        finalContent += "\n\n[Selected Sources: " + selectedTags.join(", ") + "]";
      }

      const userMessage = { role: 'user' as const, content: finalContent };
      setChatHistory(prev => [...prev, userMessage]);
      setPrompt("");
      setUploadedFiles([]);

      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          messages: [...chatHistory, userMessage],
          files: fileParts
        })
      });

      let hId = currentHistoryId;
      if (!isIncognito) {
        if (!hId) {
          hId = addHistoryItem(currentPrompt.substring(0, 50) + (currentPrompt.length > 50 ? "..." : ""), "Chat", [...chatHistory, userMessage]);
          setCurrentHistoryId(hId); if (onChatIdChange) onChatIdChange(hId);
        } else {
          updateHistoryItemMessages(hId, [...chatHistory, userMessage]);
        }
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const aiContent = data.message?.content || data.reply || "Error parsing response.";
      
      let mockCitations;
      if (aiContent.includes('Section') || aiContent.includes('Act') || aiContent.includes('Article') || aiContent.includes('law')) {
        mockCitations = [
          { source: 'Indian Kanoon', act: 'Negotiable Instruments Act, 1881', section: 'Section 138', doc: 'Dishonour of cheque' }
        ];
      }
      const modelMsg = { role: 'model' as const, content: aiContent, citations: mockCitations };

      setChatHistory(prev => {
        const newHistory = [...prev, modelMsg];
        if (!isIncognito) {
          setTimeout(() => { if (hId) updateHistoryItemMessages(hId, newHistory); }, 0);
        }
        return newHistory;
      });
    } catch (error: any) {
      console.error(error);
      const isNetworkError = error.message.includes("Load failed") || error.message.includes("Failed to fetch");
      const errorMsg = { 
        role: 'model' as const, 
        content: isNetworkError 
          ? `**Error:** Failed to connect to the server. The server might be restarting or updating. Please wait a few seconds and try again.\n\nDetails: ${error.message}`
          : `**Error:** Failed to connect to the Legal Advisories backend.\n\nDetails: ${error.message}` 
      };
      setChatHistory(prev => {
        const newHistory = [...prev, errorMsg];
        if (currentHistoryId && !isIncognito) {
          setTimeout(() => updateHistoryItemMessages(currentHistoryId, newHistory), 0);
        }
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'there';

  return (
    <div 
      className={`flex flex-1 flex-col items-center pt-24 [@media(max-height:500px)]:pt-16 md:pt-16 px-4 md:px-8 max-w-[1000px] mx-auto h-full pb-6 w-full relative transition-colors ${
        isDragging ? 'bg-blue-50/50 rounded-2xl ring-2 ring-blue-400 ring-inset' : ''
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-blue-50/80 backdrop-blur-sm rounded-2xl ring-4 ring-blue-500 ring-inset"
          >
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-full shadow-xl mb-4">
              <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-900">Drop files to upload</h2>
            <p className="text-blue-700 mt-2 font-medium">Add documents to your context</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incognito Toggle */}
      <AnimatePresence>
        {showIncognitoToast.show && (
          <motion.div 
            ref={toastRef}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-start gap-3.5 px-5 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border text-left min-w-[340px] max-w-md ${
              showIncognitoToast.active 
                ? 'bg-gray-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-gray-800 dark:border-neutral-200' 
                : 'bg-white dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 border-gray-200 dark:border-neutral-800'
            }`}
          >
            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${showIncognitoToast.active ? 'bg-gray-800 dark:bg-gray-200' : 'bg-gray-100 dark:bg-neutral-800'}`}>
              <VenetianMask className={`w-4.5 h-4.5 ${showIncognitoToast.active ? 'text-gray-300' : 'text-gray-600 dark:text-neutral-400'}`} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[15px]">
                Incognito mode {showIncognitoToast.active ? 'on' : 'off'}
              </span>
              <span className={`text-[13.5px] leading-relaxed ${showIncognitoToast.active ? 'text-gray-300' : 'text-gray-500 dark:text-neutral-400'}`}>
                {showIncognitoToast.active 
                  ? 'Your current session is private. New chats and context will not be saved to your history.' 
                  : 'Your session is now public. New interactions will be persistently saved to your account history.'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2">
        {isIncognito && (
          <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
            History paused
          </span>
        )}
        {chatHistory.length > 0 && (
          <ExportMenu 
            title="Legal Advisories — Conversation Export" 
            content={chatHistory.map(msg => `**${msg.role === 'user' ? 'User' : 'Legal Advisories'}**

${msg.content}`).join('\n\n---\n\n')} 
            buttonVariant="outline"
          />
        )}
        <button
          onClick={() => {
            const newState = !isIncognito;
            setIsIncognito(newState);
            setShowIncognitoToast({ show: true, active: newState });
            setTimeout(() => setShowIncognitoToast(prev => ({ ...prev, show: false })), 5000);
            
            if (newState) {
              setChatHistory([]);
              setCurrentHistoryId(null);
              if (onChatIdChange) onChatIdChange(null);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border shadow-sm ${
            isIncognito 
              ? 'bg-gray-900 dark:bg-neutral-100 text-gray-100 dark:text-neutral-900 border-gray-900 shadow-md' 
              : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:bg-neutral-800'
          }`}
          title={isIncognito ? "Incognito mode active. Chat history will not be saved." : "Switch to Incognito mode"}
        >
          <VenetianMask className="w-4 h-4" />
          <span className="hidden sm:inline">Incognito</span>
        </button>
      </div>

      {/* Title */}
      {chatHistory.length === 0 && (
        <div className="flex flex-col items-center mt-2 sm:mt-6 md:mt-[5vh] mb-2 sm:mb-4 md:mb-6 gap-1 sm:gap-2">
          <motion.h1 layoutId="page-title" className="text-[32px] sm:text-[40px] md:text-[48px] font-serif tracking-tight text-center w-full text-gray-900 dark:text-neutral-100">
            {getGreeting()}, {firstName}
          </motion.h1>
          <motion.p layoutId="page-description" className="text-[15px] sm:text-[17px] text-gray-500 dark:text-neutral-400 font-medium text-center max-w-lg">
            How can Legal Advisories assist you today?
          </motion.p>
        </div>
      )}
      
      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="w-full max-w-[800px] mb-8 space-y-6">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} gap-4`}>
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 rounded-xl" : "bg-black rounded-full"}`}>
                  {msg.role === "user" ? (
                    user?.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[14px] font-medium leading-none">
                        {user?.displayName ? user.displayName.substring(0, 1).toUpperCase() : user?.email ? user.email.substring(0, 1).toUpperCase() : "U"}
                      </span>
                    )
                  ) : (
                    <span className="text-white font-serif text-[18px] font-bold leading-none select-none" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>L</span>
                  )}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === "user" ? "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100" : "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800/80 shadow-sm text-gray-800 dark:text-neutral-200"}`}>
                  <div className="text-[15px] prose prose-gray max-w-none prose-p:leading-relaxed">
                    {(() => {
                      const formMatch = msg.content.match(/```json\n([\s\S]*?)\n```/);
                      let formSchema = null;
                      let textContent = msg.content;
                      if (formMatch) {
                        try {
                          const parsed = JSON.parse(formMatch[1]);
                          if (parsed.type === 'dynamic_form') {
                            formSchema = parsed;
                            textContent = msg.content.replace(formMatch[0], '');
                          }
                        } catch (e) {}
                      }
                      
                      return (
                        <div className="flex flex-col lg:flex-row gap-6 w-full">
                          <div className="flex-1">
                            <ReactMarkdown>{textContent}</ReactMarkdown>
                          </div>
                          {formSchema && (
                            <div className="w-full lg:w-80 shrink-0">
                              <DynamicForm 
                                schema={formSchema} 
                                disabled={idx !== chatHistory.length - 1}
                                onSubmit={(data) => handleAskLegalAdvisories(data)} 
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  {msg.role === 'model' && (
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-center">
                      <FeedbackButtons message={msg.content} />
                      {isDocumentContent(msg.content) && (() => {
    let textContent = msg.content;
    const formMatch = msg.content.match(/```json\n([\s\S]*?)\n```/);
    if (formMatch) {
      try {
        const parsed = JSON.parse(formMatch[1]);
        if (parsed.type === 'dynamic_form') {
          textContent = msg.content.replace(formMatch[0], '').trim();
        }
      } catch(e) {}
    }
    return <ExportMenu title="Generated Document" content={textContent} />;
  })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
            <div ref={messagesEndRef} />
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] flex-row gap-4">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-black rounded-full">
                  <span className="text-white font-serif text-[18px] font-bold leading-none select-none" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>L</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800/80 shadow-sm text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-gray-300 dark:bg-neutral-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 dark:bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-300 dark:bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Prompt Container */}
      <div className="w-full max-w-[800px] mt-auto shrink-0">
        {/* Top actions */}
        {chatHistory.length === 0 && (
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-3 px-1 text-[13px] md:text-[14px] font-semibold text-gray-900 dark:text-neutral-100 w-full">
            <div className="relative group shrink-0 snap-start">
              <button className="flex items-center gap-2 hover:text-gray-600 dark:text-neutral-400 transition-colors">
                <Folder className="w-[18px] h-[18px] opacity-80" /> Choose project
                <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-800 py-1.5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">Recent Projects</div>
                <div className="px-4 py-2 text-[13px] text-gray-500 dark:text-neutral-400 italic">No recent projects</div>
                <div className="h-px bg-gray-100 dark:bg-neutral-800 my-1"></div>
                <button className="w-full text-left px-4 py-2 text-[14px] font-medium text-blue-600 hover:bg-blue-50 transition-colors">+ Create New Project</button>
              </div>
            </div>
            
            <div className="relative group shrink-0 snap-start">
              <button className="flex items-center gap-2 hover:text-gray-600 dark:text-neutral-400 transition-colors">
                <Briefcase className="w-[18px] h-[18px] opacity-80" /> Set client matter
                <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-800 py-1.5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">Active Matters</div>
                <div className="px-4 py-2 text-[13px] text-gray-500 dark:text-neutral-400 italic">No active matters</div>
                <div className="h-px bg-gray-100 dark:bg-neutral-800 my-1"></div>
                <button className="w-full text-left px-4 py-2 text-[14px] font-medium text-blue-600 hover:bg-blue-50 transition-colors">View All Matters</button>
              </div>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="bg-[#f9f9fa] dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col relative focus-within:ring-2 focus-within:ring-gray-200 dark:ring-neutral-800 dark:focus-within:ring-neutral-700 transition-all shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-800 shadow-sm rounded-lg text-[13px] font-medium">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="hover:bg-gray-100 dark:bg-neutral-800 p-0.5 rounded-md ml-1 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:text-neutral-400 transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea 
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAskLegalAdvisories();
              }
            }}
            placeholder="Ask Legal Advisories anything..."
            className="w-full bg-transparent resize-none outline-none text-gray-800 dark:text-neutral-200 placeholder:text-gray-400 dark:text-neutral-500 dark:placeholder:text-neutral-500 dark:text-neutral-500 text-[15px] sm:text-[16px] leading-relaxed font-medium overflow-y-auto"
            style={{ minHeight: '24px', maxHeight: '200px' }}
            disabled={isLoading}
            rows={1}
          />
          
          <div className="flex items-end sm:items-center justify-between w-full mt-2 pt-1">
            {/* Left side tools */}
            <div className="flex items-center gap-1 sm:gap-2 text-gray-500 dark:text-neutral-400">
              <div className="relative shrink-0" ref={sourcesRef}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="w-0 h-0 opacity-0 absolute overflow-hidden pointer-events-none" 
                  multiple 
                  onChange={handleFileUpload} 
                />
                <button 
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:bg-neutral-700/60 dark:hover:bg-neutral-700/60 text-gray-700 dark:text-neutral-300 transition-colors"
                  title="Add files"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* Sources Dropdown */}
                {sourcesOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-[280px] bg-white dark:bg-neutral-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-neutral-800 py-2 z-50 text-[14px] max-h-[60vh] overflow-y-auto">
                    <div className="px-1 py-1 border-b border-gray-100 dark:border-neutral-800 mb-1">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-800 dark:text-neutral-200 font-medium"
                      >
                        <Plus className="w-[18px] h-[18px] text-gray-500 dark:text-neutral-400" /> Upload files
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTag('iManage'); }} className={getDropdownSourceClass('iManage', 'justify-between')}>
                        <div className="flex items-center gap-3">
                          <div className="w-[18px] h-[18px] bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">m</div>
                          Add from iManage
                        </div>
                        {selectedTags.includes('iManage') && <Check className="w-4 h-4 text-gray-900 dark:text-neutral-100" />}
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsVaultModalOpen(true); setSourcesOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-800 dark:text-neutral-200 font-medium transition-colors">
                        <div className="flex items-center gap-3"><Folder className="w-[18px] h-[18px] text-gray-500 dark:text-neutral-400" /> Add from Vault project</div>
                        <ChevronRight className="w-[18px] h-[18px] text-gray-400 dark:text-neutral-500" />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsKbModalOpen(true); setSourcesOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-800 dark:text-neutral-200 font-medium transition-colors">
                        <div className="flex items-center gap-3"><FileText className="w-[18px] h-[18px] text-gray-500 dark:text-neutral-400" /> Add from Knowledge base</div>
                        <ChevronRight className="w-[18px] h-[18px] text-gray-400 dark:text-neutral-500" />
                      </button>
                    </div>
                    <div className="px-4 py-2 text-[12px] font-semibold text-gray-500 dark:text-neutral-400 mb-0.5">Sources</div>
                    <div className="px-1">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTag('Legal Advisories'); }} className={getDropdownSourceClass('Legal Advisories', 'justify-between')}>
                        <div className="flex items-center gap-3">
                          <div className="w-[18px] h-[18px] bg-red-600 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white dark:bg-neutral-900 rounded-full"></div></div>
                          Legal Advisories
                        </div>
                        {selectedTags.includes('Legal Advisories') && <Check className="w-4 h-4 text-gray-900 dark:text-neutral-100" />}
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTag('Web search'); }} className={getDropdownSourceClass('Web search', 'justify-between')}>
                        <div className="flex items-center gap-3">
                          <Globe className="w-[18px] h-[18px] text-blue-500" /> Web search
                        </div>
                        {selectedTags.includes('Web search') && <Check className="w-4 h-4 text-gray-900 dark:text-neutral-100" />}
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTag('EDGAR'); }} className={getDropdownSourceClass('EDGAR', 'justify-between')}>
                        <div className="flex items-center gap-3">
                          <Building2 className="w-[18px] h-[18px] text-gray-500 dark:text-neutral-400" /> EDGAR
                        </div>
                        {selectedTags.includes('EDGAR') && <Check className="w-4 h-4 text-gray-900 dark:text-neutral-100" />}
                      </button>
                    </div>

                    <div className="sm:hidden px-1 border-t border-gray-100 dark:border-neutral-800 mt-1 pt-1">
                      <div className="px-4 py-2 text-[12px] font-semibold text-gray-500 dark:text-neutral-400 mb-0.5">Actions</div>
                      {chatHistory.length === 0 && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsDeepResearch(!isDeepResearch); setSourcesOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-800 dark:text-neutral-200 font-medium transition-colors">
                          <div className="flex items-center gap-3"><Activity className={`w-[18px] h-[18px] ${isDeepResearch ? 'text-blue-600' : 'text-gray-500 dark:text-neutral-400'}`} /> <span className={isDeepResearch ? 'text-blue-600' : ''}>Deep research</span></div>
                          {isDeepResearch && <Check className="w-[18px] h-[18px] text-blue-600" />}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>


            </div>

            {/* Right side tools */}
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              <button 
                type="button" 
                onClick={toggleRecording}
                className={`w-8 h-8 sm:w-9 sm:h-9 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-200 dark:bg-neutral-700/60 dark:hover:bg-neutral-700/60 text-gray-700 dark:text-neutral-300'} rounded-full flex items-center justify-center transition-colors`}
                title="Voice dictate"
              >
                <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
              <button 
                type="button" 
                onClick={toggleVoiceMode}
                className={`w-8 h-8 sm:w-9 sm:h-9 ${isVoiceMode ? 'bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 animate-pulse shadow-lg' : 'hover:bg-gray-200 dark:bg-neutral-700/60 dark:hover:bg-neutral-700/60 text-gray-700 dark:text-neutral-300'} rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95`}
                title="Voice assistant mode"
              >
                <AudioLines className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isVoiceMode ? 'text-white' : ''}`} />
              </button>
              <button 
                onClick={handleAskLegalAdvisories}
                disabled={isLoading || (!prompt.trim() && uploadedFiles.length === 0)}
                className="flex items-center justify-center gap-1 bg-black dark:bg-white text-white dark:text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[13px] font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:shadow-md hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.98] disabled:opacity-50 ml-1"
              >
                {isLoading ? (
                  <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 rounded-full animate-spin"></div>
                    <div className="absolute w-2 h-2 bg-white dark:bg-neutral-900/80 rounded-full blur-[1px]"></div>
                  </div>
                ) : (
                  <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 rounded-full animate-ping opacity-30"></div>
                    <div className="absolute w-3 h-3 bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.6)]"></div>
                    <div className="absolute w-2 h-2 bg-white dark:bg-neutral-900/80 rounded-full blur-[1px]"></div>
                  </div>
                )}
                <span className="hidden sm:inline">Ask</span>
              </button>
            </div>
          </div>
        </div>

        
        {/* Knowledge Graph Suggestions */}
        {chatHistory.length === 0 && (knowledgeSuggestions.templates?.length > 0 || knowledgeSuggestions.precedents?.length > 0) && (
          <div className="hidden sm:flex flex-col items-center justify-center mt-4 w-full">
            <p className="text-xs font-semibold text-gray-500 dark:text-neutral-500 uppercase tracking-wider mb-2">Smart Suggestions based on your history</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {knowledgeSuggestions.templates?.slice(0, 3).map(template => (
                 <button key={template} onClick={() => setPrompt(`Draft a ${template}`)} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[12px] font-medium rounded-full border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                    📄 {template}
                 </button>
              ))}
              {knowledgeSuggestions.precedents?.slice(0, 3).map(prec => (
                 <button key={prec} onClick={() => setPrompt(`What is the relevance of ${prec}?`)} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[12px] font-medium rounded-full border border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
                    ⚖️ {prec}
                 </button>
              ))}
            </div>
          </div>
        )}
        {/* Selected Sources Pills */}
        {chatHistory.length === 0 && (
          <>
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 text-[11px] sm:text-[12px]">
              <button type="button" onClick={(e) => { e.preventDefault(); toggleTag('iManage'); }} className={getTagClass('iManage')}>
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[9px] text-white font-bold">m</div>
                iManage {getTagSuffix('iManage')}
              </button>
              <button type="button" onClick={(e) => { e.preventDefault(); toggleTag('Legal Advisories'); }} className={getTagClass('Legal Advisories')}>
                <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white dark:bg-neutral-900 rounded-full"></div></div>
                Legal Advisories {getTagSuffix('Legal Advisories')}
              </button>
              <button type="button" onClick={(e) => { e.preventDefault(); toggleTag('Web search'); }} className={getTagClass('Web search')}>
                <Globe className="w-4 h-4 text-blue-500" />
                Web search {getTagSuffix('Web search')}
              </button>
              <button type="button" onClick={(e) => { e.preventDefault(); toggleTag('EDGAR'); }} className={getTagClass('EDGAR')}>
                <Building2 className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
                EDGAR {getTagSuffix('EDGAR')}
              </button>
              {selectedTags.filter(t => t.startsWith('Vault project:')).map(t => (
                <button key={t} onClick={() => toggleTag(t)} className={getTagClass(t)}>
                  <Folder className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
                  {t.replace('Vault project: ', '')} {getTagSuffix(t)}
                </button>
              ))}
              {selectedTags.filter(t => t.startsWith('Knowledge base:')).map(t => (
                <button key={t} onClick={() => toggleTag(t)} className={getTagClass(t)}>
                  <FileText className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
                  {t.replace('Knowledge base: ', '')} {getTagSuffix(t)}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Empty placeholder to keep chat input at bottom when history is empty */}
        {chatHistory.length === 0 && (
          <div className="flex-1" />
        )}

        {/* Vault Modal */}
        {isVaultModalOpen && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[100]">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-[400px] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-neutral-200">Select Vault Project</h3>
                <button onClick={() => setIsVaultModalOpen(false)} className="text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:text-neutral-400">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {['Project Alpha (M&A)', 'Project Horizon (IP)', 'Project Phoenix (Litigation)', 'Project Titan (Compliance)'].map(proj => (
                  <button 
                    key={proj}
                    onClick={() => { 
                      if (!selectedTags.includes(`Vault project: ${proj}`)) {
                        setSelectedTags(prev => [...prev, `Vault project: ${proj}`]);
                      }
                      setIsVaultModalOpen(false); 
                    }}
                    className="w-full flex items-center justify-between text-left px-3 py-2.5 hover:bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-700 dark:text-neutral-300 font-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Folder className="w-[18px] h-[18px] text-gray-400 dark:text-neutral-500" />
                      {proj}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Base Modal */}
        {isKbModalOpen && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[100]">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-[400px] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-neutral-200">Select Knowledge Base</h3>
                <button onClick={() => setIsKbModalOpen(false)} className="text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:text-neutral-400">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {['Contracts Playbook', 'Employment Law Guidelines', 'Tax Regulations 2024', 'Corporate Governance Memos'].map(kb => (
                  <button 
                    key={kb}
                    onClick={() => { 
                      if (!selectedTags.includes(`Knowledge base: ${kb}`)) {
                        setSelectedTags(prev => [...prev, `Knowledge base: ${kb}`]);
                      }
                      setIsKbModalOpen(false); 
                    }}
                    className="w-full flex items-center justify-between text-left px-3 py-2.5 hover:bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-700 dark:text-neutral-300 font-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-[18px] h-[18px] text-gray-400 dark:text-neutral-500" />
                      {kb}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Voice Mode Overlay */}
        <AnimatePresence>
          {isVoiceMode && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              className="fixed inset-0 bg-white dark:bg-neutral-900/60 z-[200] flex flex-col items-center justify-center p-6"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                className="max-w-2xl w-full flex flex-col items-center"
              >
                <div className="mb-16 text-center space-y-3">
                   <motion.h2 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                     className="text-3xl sm:text-4xl font-serif text-gray-900 dark:text-neutral-100 tracking-tight"
                   >
                     Voice Assistant
                   </motion.h2>
                   <motion.p 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="text-lg text-gray-500 dark:text-neutral-400 font-medium"
                   >
                     {voiceState === 'listening' ? 'Listening...' :
                      voiceState === 'speaking' ? 'Speaking...' :
                      voiceState === 'error' ? 'An error occurred' : 'Tap to speak'}
                   </motion.p>
                </div>

                <div className="relative flex items-center justify-center mb-16 h-40 w-40">
                  {/* Glowing Aura */}
                  <AnimatePresence>
                    {(voiceState === 'listening' || voiceState === 'speaking') && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-[-40%]"
                      >
                         <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 via-fuchsia-500 to-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDuration: '3s' }}></div>
                         <div className="absolute inset-0 bg-gradient-to-bl from-amber-300 via-orange-500 to-rose-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                         <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '2s' }}></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {}}
                    className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${
                      voiceState === 'error' ? 'bg-red-500' :
                      'bg-black/90 backdrop-blur-xl border border-white/10'
                    }`}
                  >
                    {voiceState === 'speaking' ? (
                      <div className="flex items-center gap-1.5 h-8">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ 
                              height: ["20%", "100%", "20%"] 
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.1
                            }}
                            className="w-1.5 bg-white dark:bg-neutral-900 rounded-full"
                          />
                        ))}
                      </div>
                    ) : (
                      <AudioLines className={`w-10 h-10 ${voiceState === 'listening' ? 'opacity-100 animate-pulse' : 'opacity-60'}`} />
                    )}
                  </motion.button>
                </div>
                
                <div className="text-center min-h-[120px] w-full max-w-xl px-6">
                   <AnimatePresence mode="wait">
                     <motion.p 
                       key={prompt || 'empty'}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="text-2xl sm:text-3xl text-gray-800 dark:text-neutral-200 font-medium leading-tight tracking-tight"
                     >
                       {prompt || (voiceState === 'listening' ? "..." : "")}
                     </motion.p>
                   </AnimatePresence>
                   
                   <AnimatePresence>
                     {voiceState === 'speaking' && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'model' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-6 p-6 bg-white dark:bg-neutral-900/50 rounded-2xl border border-gray-200 dark:border-neutral-800/50 backdrop-blur-sm shadow-sm"
                        >
                          <p className="text-lg text-gray-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                            {chatHistory[chatHistory.length - 1].content.replace(/[#*_]/g, '')}
                          </p>
                        </motion.div>
                     )}
                   </AnimatePresence>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-16"
                >
                  <button 
                    onClick={toggleVoiceMode}
                    className="px-8 py-3.5 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-full font-semibold transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5"
                  >
                    End Voice Mode
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

    </div>
  );

}