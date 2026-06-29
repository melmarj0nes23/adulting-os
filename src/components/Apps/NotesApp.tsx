/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Pin, Star, Tag, FileText, Calendar, Edit3, FolderHeart, Sparkles, ArrowLeft } from 'lucide-react';
import { DbService } from '../../services/db';
import { User, NoteItem } from '../../types';

interface NotesAppProps {
  user: User;
}

export default function NotesApp({ user }: NotesAppProps) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pinned' | 'favorites'>('all');
  const [newTagInput, setNewTagInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load notes initially and on DB updates
  const loadNotes = () => {
    const data = DbService.getUserData(user.id);
    const loadedNotes = data.notes || [];
    setNotes(loadedNotes);

    // Auto-select first note if none selected (unless on mobile)
    if (loadedNotes.length > 0 && !selectedNoteId) {
      // Check if there was a note selected by command palette search
      const savedSelected = localStorage.getItem(`adulting_os_selected_note_${user.id}`);
      if (savedSelected && loadedNotes.some((n: any) => n.id === savedSelected)) {
        setSelectedNoteId(savedSelected);
        setMobileView('editor');
        localStorage.removeItem(`adulting_os_selected_note_${user.id}`);
      } else if (window.innerWidth >= 768) {
        setSelectedNoteId(loadedNotes[0].id);
      }
    }
  };

  useEffect(() => {
    loadNotes();

    const handleUpdate = () => {
      loadNotes();
    };

    const handleSelectNote = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSelectedNoteId(customEvent.detail);
        setMobileView('editor');
      }
    };

    window.addEventListener('adulting_os_db_update', handleUpdate);
    window.addEventListener('adulting_os_select_note', handleSelectNote);

    return () => {
      window.removeEventListener('adulting_os_db_update', handleUpdate);
      window.removeEventListener('adulting_os_select_note', handleSelectNote);
    };
  }, [user.id]);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  // Auto-save mechanism
  const saveAllNotes = (updatedNotes: NoteItem[]) => {
    const data = DbService.getUserData(user.id);
    data.notes = updatedNotes;
    DbService.saveUserData(user.id, data);
    setNotes(updatedNotes);
  };

  const selectNote = (id: string | null) => {
    setSelectedNoteId(id);
    if (id) {
      setMobileView('editor');
    }
  };

  const handleCreateNote = () => {
    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      pinned: false,
      favorite: false,
      tags: [],
      updatedAt: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    saveAllNotes(updated);
    setSelectedNoteId(newNote.id);
    setMobileView('editor');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveAllNotes(updated);
    if (selectedNoteId === id) {
      const nextId = updated.length > 0 ? updated[0].id : null;
      setSelectedNoteId(nextId);
      if (!nextId) {
        setMobileView('list');
      }
    }
  };

  const handleUpdateNoteField = (fields: Partial<NoteItem>) => {
    if (!selectedNoteId) return;
    const updated = notes.map(n => {
      if (n.id === selectedNoteId) {
        return {
          ...n,
          ...fields,
          updatedAt: new Date().toISOString(),
        };
      }
      return n;
    });
    saveAllNotes(updated);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNote || !newTagInput.trim()) return;
    const tag = newTagInput.trim();
    if (!selectedNote.tags.includes(tag)) {
      const updatedTags = [...selectedNote.tags, tag];
      handleUpdateNoteField({ tags: updatedTags });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedNote) return;
    const updatedTags = selectedNote.tags.filter(t => t !== tagToRemove);
    handleUpdateNoteField({ tags: updatedTags });
  };

  // Get all unique tags for filter panel
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  // Filter notes based on sidebar settings
  const filteredNotes = notes.filter(note => {
    // Search query match
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    // Tag filter match
    const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;

    // Tabs filter
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'pinned'
        ? note.pinned
        : note.favorite;

    return matchesSearch && matchesTag && matchesTab;
  });

  return (
    <div className="flex h-full w-full bg-zinc-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200">
      {/* Sidebar: Navigation, Tags & Search */}
      <div className={`w-full md:w-64 border-r border-zinc-200 dark:border-white/5 flex flex-col bg-white dark:bg-zinc-900/40 ${mobileView === 'editor' ? 'hidden md:flex' : 'flex'}`}>
        {/* Search */}
        <div className="p-3 border-b border-zinc-100 dark:border-white/5">
          <div className="relative flex items-center bg-zinc-100 dark:bg-white/[0.04] rounded-lg px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none p-0 border-none"
            />
          </div>
        </div>

        {/* Filters Tabs */}
        <div className="p-2 flex gap-1 border-b border-zinc-100 dark:border-white/5 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => { setActiveTab('all'); setSelectedTag(null); }}
            className={`flex-1 py-1 rounded-md text-center transition-colors ${activeTab === 'all' && !selectedTag ? 'bg-zinc-100 dark:bg-white/5 text-neutral-900 dark:text-white font-semibold' : 'hover:text-neutral-900 dark:hover:text-white'}`}
          >
            All
          </button>
          <button
            onClick={() => { setActiveTab('pinned'); setSelectedTag(null); }}
            className={`flex-1 py-1 rounded-md text-center transition-colors ${activeTab === 'pinned' ? 'bg-zinc-100 dark:bg-white/5 text-neutral-900 dark:text-white font-semibold' : 'hover:text-neutral-900 dark:hover:text-white'}`}
          >
            Pinned
          </button>
          <button
            onClick={() => { setActiveTab('favorites'); setSelectedTag(null); }}
            className={`flex-1 py-1 rounded-md text-center transition-colors ${activeTab === 'favorites' ? 'bg-zinc-100 dark:bg-white/5 text-neutral-900 dark:text-white font-semibold' : 'hover:text-neutral-900 dark:hover:text-white'}`}
          >
            Favs
          </button>
        </div>

        {/* Notes List Scroll Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <span>Recent Notes</span>
            <button
              onClick={handleCreateNote}
              className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-white/5 text-violet-500 hover:text-violet-600"
              title="Create note"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
              No notes found.
            </div>
          ) : (
            filteredNotes.map(note => (
              <button
                key={note.id}
                onClick={() => selectNote(note.id)}
                className={`w-full flex flex-col items-start p-2.5 rounded-lg text-left transition-all relative ${
                  selectedNoteId === note.id
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'hover:bg-zinc-100 dark:hover:bg-white/[0.03] text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-1.5 w-full min-w-0">
                  {note.pinned && <Pin className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                  {note.favorite && <Star className="w-3 h-3 text-rose-400 fill-rose-400 flex-shrink-0" />}
                  <span className="text-xs font-semibold truncate flex-1">{note.title || 'Untitled Note'}</span>
                </div>
                <p className={`text-[10px] truncate w-full mt-1 ${
                  selectedNoteId === note.id ? 'text-white/85' : 'text-neutral-400 dark:text-neutral-500'
                }`}>
                  {note.content ? note.content.substring(0, 50) : 'Empty note...'}
                </p>
                <span className={`text-[9px] mt-1.5 block ${
                  selectedNoteId === note.id ? 'text-white/70' : 'text-neutral-400 dark:text-neutral-500'
                }`}>
                  {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </button>
            ))
          )}

          {/* Tags Section */}
          {allTags.length > 0 && (
            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-white/5">
              <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                Filter by Tags
              </div>
              <div className="flex flex-wrap gap-1 px-1.5">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors flex items-center gap-1 ${
                      selectedTag === tag
                        ? 'bg-violet-500 text-white font-medium'
                        : 'bg-zinc-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-zinc-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Panel */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-zinc-950 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
        {selectedNote ? (
          <>
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-2">
                {/* Back Button on Mobile */}
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 mr-1 flex items-center gap-1 text-xs font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Notes</span>
                </button>

                <button
                  onClick={() => handleUpdateNoteField({ pinned: !selectedNote.pinned })}
                  className={`p-1.5 rounded-lg transition-colors ${selectedNote.pinned ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'hover:bg-zinc-100 dark:hover:bg-white/5 text-neutral-400'}`}
                  title={selectedNote.pinned ? 'Unpin note' : 'Pin note'}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUpdateNoteField({ favorite: !selectedNote.favorite })}
                  className={`p-1.5 rounded-lg transition-colors ${selectedNote.favorite ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-500' : 'hover:bg-zinc-100 dark:hover:bg-white/5 text-neutral-400'}`}
                  title={selectedNote.favorite ? 'Unfavorite note' : 'Favorite note'}
                >
                  <Star className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Edited: {new Date(selectedNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor Text Workspace */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
              {/* Note Title Input */}
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => handleUpdateNoteField({ title: e.target.value })}
                placeholder="Title..."
                className="w-full bg-transparent text-xl font-bold font-display text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-700 focus:outline-none border-none p-0"
              />

              {/* Note Content Textarea */}
              <textarea
                value={selectedNote.content}
                onChange={(e) => handleUpdateNoteField({ content: e.target.value })}
                placeholder="Start writing notes, checklists (- [ ] task) or random thoughts here..."
                className="w-full flex-1 bg-transparent text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-300 dark:placeholder-neutral-750 focus:outline-none border-none p-0 resize-none font-sans leading-relaxed"
              />

              {/* Note Tag Creator and List footer */}
              <div className="pt-4 border-t border-zinc-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mr-1 uppercase">Tags:</span>
                  {selectedNote.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5 px-2 py-0.5 rounded-full text-[10px] text-neutral-600 dark:text-neutral-300"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="w-3 h-3 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 flex items-center justify-center text-[8px] text-neutral-400 hover:text-neutral-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={handleAddTag} className="flex items-center bg-zinc-100 dark:bg-white/[0.04] rounded-lg px-2 py-1 max-w-[160px]">
                  <Tag className="w-3 h-3 text-neutral-400 dark:text-neutral-500 mr-1.5 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="New Tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="w-full bg-transparent text-[10px] text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none p-0 border-none"
                  />
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400 dark:text-neutral-500">
            <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-3" />
            <div className="text-sm font-semibold">No Note Selected</div>
            <p className="text-xs text-neutral-400 max-w-xs mt-1">
              Select an existing note from the list, or create a brand new one to start writing.
            </p>
            <button
              onClick={handleCreateNote}
              className="mt-4 px-3.5 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-medium hover:bg-violet-700 transition-colors shadow-sm"
            >
              Create New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
