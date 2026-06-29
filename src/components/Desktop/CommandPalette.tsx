/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, CheckSquare, Calendar, Sparkles, Terminal, CornerDownLeft, Eye, CreditCard, ShoppingCart } from 'lucide-react';
import { APPS } from '../../services/apps';
import { DbService } from '../../services/db';
import { User } from '../../types';

interface CommandPaletteProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'app' | 'note' | 'task' | 'event';
  icon: any;
  action: () => void;
}

export default function CommandPalette({ user, isOpen, onClose, onOpenApp }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Load searchable data
  useEffect(() => {
    if (!isOpen) return;

    const userData = DbService.getUserData(user.id);
    const searchTerms = query.toLowerCase().trim();

    const matchedResults: SearchResult[] = [];

    // 1. Search APPS
    const appsList = APPS.filter(
      app =>
        app.title.toLowerCase().includes(searchTerms) ||
        app.id.toLowerCase().includes(searchTerms)
    );
    appsList.forEach(app => {
      matchedResults.push({
        id: `app_${app.id}`,
        title: app.title,
        subtitle: 'System Application',
        type: 'app',
        icon: Sparkles,
        action: () => {
          onOpenApp(app.id);
          onClose();
        },
      });
    });

    // If query is empty, we show apps by default as quick launch suggestions
    if (searchTerms === '') {
      setResults(matchedResults.slice(0, 8));
      return;
    }

    // 2. Search Notes
    const notesList = (userData.notes || []).filter(
      (note: any) =>
        note.title.toLowerCase().includes(searchTerms) ||
        note.content.toLowerCase().includes(searchTerms)
    );
    notesList.forEach((note: any) => {
      matchedResults.push({
        id: `note_${note.id}`,
        title: note.title,
        subtitle: `Note • ${note.content.substring(0, 45)}...`,
        type: 'note',
        icon: FileText,
        action: () => {
          onOpenApp('notes');
          // In the notes app, the note can be auto-selected
          localStorage.setItem(`adulting_os_selected_note_${user.id}`, note.id);
          window.dispatchEvent(new CustomEvent('adulting_os_select_note', { detail: note.id }));
          onClose();
        },
      });
    });

    // 3. Search Tasks
    const tasksList = (userData.tasks || []).filter(
      (task: any) =>
        task.title.toLowerCase().includes(searchTerms) ||
        (task.notes && task.notes.toLowerCase().includes(searchTerms))
    );
    tasksList.forEach((task: any) => {
      matchedResults.push({
        id: `task_${task.id}`,
        title: task.title,
        subtitle: `Task • Due ${task.dueDate} • Priority: ${task.priority}`,
        type: 'task',
        icon: CheckSquare,
        action: () => {
          onOpenApp('tasks');
          onClose();
        },
      });
    });

    // 4. Search Calendar Events
    const eventsList = (userData.events || []).filter(
      (event: any) =>
        event.title.toLowerCase().includes(searchTerms) ||
        (event.description && event.description.toLowerCase().includes(searchTerms))
    );
    eventsList.forEach((event: any) => {
      matchedResults.push({
        id: `event_${event.id}`,
        title: event.title,
        subtitle: `Event • Starts ${event.startDate.replace('T', ' ')}`,
        type: 'event',
        icon: Calendar,
        action: () => {
          onOpenApp('calendar');
          onClose();
        },
      });
    });

    setResults(matchedResults.slice(0, 10));
    setSelectedIndex(0);
  }, [query, isOpen, user.id]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1 < results.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
      {/* Dimmed backdrop */}
      <div className="fixed inset-0 bg-neutral-950/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Palette Body */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
          <Search className="w-5 h-5 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search applications, notes, tasks, calendar events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none border-none p-0"
          />
          <div className="flex items-center gap-1 bg-neutral-200/50 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-neutral-500 dark:text-neutral-400 font-mono flex-shrink-0">
            ESC
          </div>
        </div>

        {/* Results Body */}
        <div ref={resultsRef} className="max-h-[340px] overflow-y-auto p-2 scrollbar-thin">
          {results.length === 0 ? (
            <div className="py-12 text-center">
              <Terminal className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300">No matches found</div>
              <div className="text-[10px] text-neutral-400 mt-1">Try another search query or app name</div>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {results.map((result, index) => {
                const Icon = result.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={result.id}
                    onClick={result.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-violet-600 text-white'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                        isSelected ? 'bg-white/20' : 'bg-neutral-100 dark:bg-neutral-800'
                      }`}>
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{result.title}</div>
                        {result.subtitle && (
                          <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/70' : 'text-neutral-400 dark:text-neutral-500'}`}>
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 text-[10px] text-white/80 font-mono bg-white/10 px-1.5 py-0.5 rounded">
                        <span>Select</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-4 py-2 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="font-mono border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-zinc-800 px-1 rounded">↑↓</span> Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="font-mono border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-zinc-800 px-1 rounded">Enter</span> Launch
            </span>
          </div>
          <div>AdultingOS Command Palette</div>
        </div>
      </div>
    </div>
  );
}
