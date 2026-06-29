/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Folder, File, Calendar, ShieldAlert, Sparkles, UploadCloud, CheckCircle, Clock } from 'lucide-react';
import { DbService } from '../../services/db';
import { User, DocumentItem } from '../../types';

interface DocumentsAppProps {
  user: User;
}

export default function DocumentsApp({ user }: DocumentsAppProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Drag & drop file states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedSize, setUploadedSize] = useState<string | null>(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Personal ID');
  const [newExpiration, setNewExpiration] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const loadDocuments = () => {
    const data = DbService.getUserData(user.id);
    setDocuments(data.documents || []);
  };

  useEffect(() => {
    loadDocuments();

    const handleUpdate = () => {
      loadDocuments();
    };

    window.addEventListener('lifedesk_os_db_update', handleUpdate);
    return () => {
      window.removeEventListener('lifedesk_os_db_update', handleUpdate);
    };
  }, [user.id]);

  const saveDocuments = (updated: DocumentItem[]) => {
    const data = DbService.getUserData(user.id);
    data.documents = updated;
    DbService.saveUserData(user.id, data);
    setDocuments(updated);
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExpiration) return;

    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      expirationDate: newExpiration,
      notes: newNotes.trim() || undefined,
      fileUrl: uploadedFileName || 'uploaded_secure_doc.pdf',
      fileSize: uploadedSize || '2.4 MB',
    };

    const updated = [...documents, newDoc];
    saveDocuments(updated);

    // Reset Form
    setNewTitle('');
    setNewExpiration('');
    setNewNotes('');
    setUploadedFileName(null);
    setUploadedSize(null);
    setUploadProgress(null);
    setShowAddForm(false);

    DbService.addNotification(user.id, {
      title: 'Document Secured',
      message: `"${newDoc.title}" has been securely logged in your documents organizer.`,
      type: 'success',
      icon: 'Folder',
    });
  };

  const handleDeleteDocument = (id: string) => {
    const updated = documents.filter(doc => doc.id !== id);
    saveDocuments(updated);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const simulateUpload = (name: string, sizeBytes: number) => {
    setIsDragging(false);
    setUploadProgress(0);
    const sizeStr = (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB';

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadedFileName(name);
          setUploadedSize(sizeStr);
          setUploadProgress(null);
        }, 150);
      }
    }, 100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      simulateUpload(files[0].name, files[0].size);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateUpload(files[0].name, files[0].size);
    }
  };

  const now = new Date();
  const formatToday = now.toISOString().split('T')[0];
  const expiringSoonThresholdDays = 90;

  const expiringSoonDocs = documents.filter(doc => {
    const diffTime = new Date(doc.expirationDate).getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= expiringSoonThresholdDays;
  });

  const categories = ['All', ...Array.from(new Set(documents.map(d => d.category)))];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' ? true : doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200">
      {/* 1. Expiration Warnings banner */}
      {expiringSoonDocs.length > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 flex-shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">
              {expiringSoonDocs.length} important document{expiringSoonDocs.length !== 1 && 's'} expiring within {expiringSoonThresholdDays} days!
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase font-mono tracking-widest bg-amber-500/15 px-1.5 py-0.5 rounded">Action Required</span>
        </div>
      )}

      {/* 2. Workspace controls toolbar */}
      <div className="p-3 border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex items-center bg-zinc-100 dark:bg-white/[0.04] rounded-xl px-2.5 py-1.5 w-full sm:w-52">
            <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none p-0 border-none"
            />
          </div>

          {/* Folder Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-xl focus:outline-none w-full sm:w-auto"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* 3. Primary Workspace folder deck */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Document secure uploading forms */}
        {showAddForm && (
          <form onSubmit={handleCreateDocument} className="p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg space-y-3 animate-in slide-in-from-top-4 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Driver's License, US Passport..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="Personal ID">Personal ID</option>
                    <option value="Finance">Finance</option>
                    <option value="Housing">Housing</option>
                    <option value="Medical">Medical</option>
                    <option value="Insurance">Insurance Policies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={newExpiration}
                    onChange={(e) => setNewExpiration(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Secure Drag & Drop Uploader container */}
              <div className="col-span-1 sm:col-span-2">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDragging
                      ? 'border-violet-500 bg-violet-500/[0.04]'
                      : 'border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/[0.01]'
                  }`}
                >
                  <input
                    type="file"
                    id="secure-doc-input"
                    className="hidden"
                    onChange={handleManualUpload}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                  <label htmlFor="secure-doc-input" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className="w-8 h-8 text-neutral-400 dark:text-neutral-500 mb-2" />
                    <span className="text-xs font-semibold block">Drag & drop files here, or click to upload</span>
                    <span className="text-[10px] text-neutral-400 mt-1">Accepts PDF, PNG, JPG (Max 20MB)</span>
                  </label>

                  {uploadProgress !== null && (
                    <div className="mt-3 max-w-[200px] mx-auto">
                      <div className="text-[10px] font-bold text-neutral-500 mb-1">Uploading... {uploadProgress}%</div>
                      <div className="w-full h-1 bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {uploadedFileName && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-500">
                      <CheckCircle className="w-4 h-4" />
                      <span>{uploadedFileName} ({uploadedSize}) ready to log</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Secure Notes</label>
                <textarea
                  placeholder="Document registry keys, renewal details, or secure comments..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500 h-16 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 border border-zinc-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs hover:bg-zinc-100 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700"
              >
                Save Document
              </button>
            </div>
          </form>
        )}

        {/* Secured Document lists */}
        {filteredDocuments.length === 0 ? (
          <div className="py-12 text-center text-neutral-400">
            <Folder className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
            <div className="text-xs font-semibold">Folder Vault is Empty</div>
            <p className="text-[10px] text-neutral-400 mt-1">Upload and catalog your passports, driver licenses, or tenancy deeds safely.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredDocuments.map(doc => {
              const diffTime = new Date(doc.expirationDate).getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isExpired = diffDays < 0;
              const isExpiringSoon = diffDays >= 0 && diffDays <= expiringSoonThresholdDays;

              return (
                <div
                  key={doc.id}
                  className="flex flex-col justify-between p-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex-shrink-0">
                      <File className="w-4.5 h-4.5 text-neutral-500" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="text-xs font-bold truncate block">{doc.title}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest bg-zinc-100 dark:bg-white/5 text-neutral-500 px-1.5 py-0.5 rounded">
                          {doc.category}
                        </span>
                      </div>

                      {doc.notes && (
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">
                          {doc.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 mt-3">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className={`font-semibold ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-amber-500' : ''}`}>
                          {isExpired
                            ? `Expired on ${doc.expirationDate}`
                            : `Expires on ${doc.expirationDate} (${diffDays} days left)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-white/5 text-[9px] text-neutral-400">
                    <span className="text-neutral-400 dark:text-neutral-500">Secure File: {doc.fileUrl} ({doc.fileSize})</span>
                    
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
