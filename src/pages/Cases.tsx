import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/auth';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  FolderOpen, Plus, Search, Calendar, User as UserIcon, 
  FileText, MessageSquare, AlertCircle, Trash2, Edit, X, Loader2, Pin 
} from 'lucide-react';

interface Case {
  id: string;
  title: string;
  clientName: string;
  caseType: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Pending' | 'Closed';
  pinned?: boolean;
  createdAt: number;
}

export function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Case>>({
    title: '',
    clientName: '',
    caseType: 'Civil',
    description: '',
    priority: 'Medium',
    status: 'Open'
  });

  const fetchCases = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, 'cases'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Case));
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [auth.currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      if (isEditing && currentCaseId) {
        await updateDoc(doc(db, 'cases', currentCaseId), {
          ...formData,
          updatedAt: Date.now()
        });
      } else {
        await addDoc(collection(db, 'cases'), {
          ...formData,
          userId: user.uid,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          pinned: false
        });
      }
      
      setIsModalOpen(false);
      setFormData({ title: '', clientName: '', caseType: 'Civil', description: '', priority: 'Medium', status: 'Open' });
      setIsEditing(false);
      setCurrentCaseId(null);
      fetchCases();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePin = async (c: Case) => {
    try {
      if (!auth.currentUser) return;
      await updateDoc(doc(db, 'cases', c.id), {
        pinned: !c.pinned
      });
      fetchCases();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCase = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this case?")) return;
    try {
      if (!auth.currentUser) return;
      await deleteDoc(doc(db, 'cases', id));
      fetchCases();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (c: Case) => {
    setFormData({
      title: c.title,
      clientName: c.clientName,
      caseType: c.caseType,
      description: c.description,
      priority: c.priority,
      status: c.status
    });
    setCurrentCaseId(c.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const sortedCases = [...cases].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt - a.createdAt);
  const filteredCases = sortedCases.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#c6a87c]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">My Cases</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">Manage and organize your legal matters.</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({ title: '', clientName: '', caseType: 'Civil', description: '', priority: 'Medium', status: 'Open' });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#c6a87c] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#b5986c]"
        >
          <Plus className="h-4 w-4" />
          New Case
        </button>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search cases by title, client, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none focus:border-[#c6a87c] focus:ring-1 focus:ring-[#c6a87c] dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-[#c6a87c]"
          />
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-20 text-center dark:border-neutral-800">
          <FolderOpen className="mb-4 h-12 w-12 text-neutral-400" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white">No cases found</h3>
          <p className="mt-1 text-sm text-neutral-500">Create a new case to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map(c => (
            <div key={c.id} className="group relative rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-[#c6a87c]" />
                  <span className="text-xs font-mono text-neutral-500">{c.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                    ${c.status === 'Open' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                      c.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                      'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'}`}>
                    {c.status}
                  </span>
                  <div className="relative opacity-0 transition-opacity group-hover:opacity-100">
                    
                    <button onClick={() => togglePin(c)} className={c.pinned ? "p-1 text-[#c6a87c]" : "p-1 text-neutral-400 hover:text-[#c6a87c]"}>
                      <Pin className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEditModal(c)} className="p-1 text-neutral-400 hover:text-[#c6a87c]"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => deleteCase(c.id)} className="p-1 text-neutral-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
              <h3 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-white line-clamp-1">{c.title}</h3>
              <p className="mb-4 flex items-center gap-1.5 text-sm text-neutral-500">
                <UserIcon className="h-4 w-4" />
                {c.clientName}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <Calendar className="h-3 w-3" />
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <AlertCircle className="h-3 w-3" />
                  {c.priority} Priority
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {c.caseType}
                </span>
              </div>
              
              <div className="flex border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <button className="flex flex-1 items-center justify-center gap-2 text-sm text-neutral-500 hover:text-[#c6a87c]">
                  <FileText className="h-4 w-4" /> Docs
                </button>
                <div className="w-px bg-neutral-100 dark:bg-neutral-800" />
                <button className="flex flex-1 items-center justify-center gap-2 text-sm text-neutral-500 hover:text-[#c6a87c]">
                  <MessageSquare className="h-4 w-4" /> Chats
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {isEditing ? 'Edit Case' : 'Create New Case'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Case Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#c6a87c] focus:ring-1 focus:ring-[#c6a87c] dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  placeholder="e.g. Sharma Property Dispute"
                />
              </div>
              
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Client Name</label>
                <input
                  required
                  type="text"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#c6a87c] focus:ring-1 focus:ring-[#c6a87c] dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  placeholder="Client or Company Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Case Type</label>
                  <select
                    value={formData.caseType}
                    onChange={e => setFormData({...formData, caseType: e.target.value})}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#c6a87c] focus:ring-1 focus:ring-[#c6a87c] dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  >
                    <option>Civil</option>
                    <option>Criminal</option>
                    <option>Corporate</option>
                    <option>Family</option>
                    <option>Property</option>
                    <option>Taxation</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value as any})}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#c6a87c] focus:ring-1 focus:ring-[#c6a87c] dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#c6a87c] focus:ring-1 focus:ring-[#c6a87c] dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  >
                    <option>Open</option>
                    <option>Pending</option>
                    <option>Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Description / Notes</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#c6a87c] focus:ring-1 focus:ring-[#c6a87c] dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  placeholder="Optional notes about the case..."
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#c6a87c] px-4 py-2 text-sm font-medium text-white hover:bg-[#b5986c]"
                >
                  {isEditing ? 'Save Changes' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
