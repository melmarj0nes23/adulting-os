/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Calendar, AlertCircle, CheckCircle2, Circle, Clock, Check, ListFilter, ArrowUpDown, Tag } from 'lucide-react';
import { DbService } from '../../services/db';
import { User, TaskItem } from '../../types';

interface TasksAppProps {
  user: User;
}

export default function TasksApp({ user }: TasksAppProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('status');
  
  // Task Creation Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState('Personal');
  const [newNotes, setNewNotes] = useState('');

  // Load tasks initially and on update
  const loadTasks = () => {
    const data = DbService.getUserData(user.id);
    setTasks(data.tasks || []);
  };

  useEffect(() => {
    loadTasks();
    
    const handleUpdate = () => {
      loadTasks();
    };

    window.addEventListener('lifedesk_os_db_update', handleUpdate);
    return () => {
      window.removeEventListener('lifedesk_os_db_update', handleUpdate);
    };
  }, [user.id]);

  const saveAllTasks = (updatedTasks: TaskItem[]) => {
    const data = DbService.getUserData(user.id);
    data.tasks = updatedTasks;
    DbService.saveUserData(user.id, data);
    setTasks(updatedTasks);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      priority: newPriority,
      category: newCategory.trim() || 'Personal',
      notes: newNotes.trim() || undefined,
    };

    const updated = [newTask, ...tasks];
    saveAllTasks(updated);
    
    // Clear form
    setNewTitle('');
    setNewDueDate('');
    setNewPriority('medium');
    setNewCategory('Personal');
    setNewNotes('');
    setShowAddForm(false);

    // Push notification as a nice touch
    DbService.addNotification(user.id, {
      title: 'Task Added',
      message: `"${newTask.title}" was added to your tasks list.`,
      type: 'success',
      icon: 'CheckSquare',
    });
  };

  const handleToggleComplete = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const completed = !t.completed;
        // If completed, maybe push notification
        return { ...t, completed };
      }
      return t;
    });
    saveAllTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveAllTasks(updated);
  };

  // Get categories for filtering
  const categories = ['All', ...Array.from(new Set(tasks.map(t => t.category)))];

  // Sorting helper
  const priorityWeight = { high: 3, medium: 2, low: 1 };

  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'All' ? true : task.category === selectedCategory;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === 'status') {
        // Uncompleted tasks first
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        // Then by priority
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      if (sortBy === 'priority') {
        if (a.priority !== b.priority) return priorityWeight[b.priority] - priorityWeight[a.priority];
        return a.completed ? 1 : -1;
      }
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

  // Analytics Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-zinc-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200">
      {/* Category Selection Sidebar */}
      <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 p-3 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-shrink-0">
        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2 mb-1 hidden md:block">Categories</span>
        {categories.map(cat => {
          const catCount = cat === 'All' ? tasks.length : tasks.filter(t => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center justify-between gap-2 md:gap-0 px-3 py-1.5 md:py-2 rounded-xl text-xs transition-all text-left flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white font-semibold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-white/5'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-white/5 text-neutral-400'}`}>
                {catCount}
              </span>
            </button>
          );
        })}

        {/* Dynamic Progress Indicator */}
        <div className="hidden md:block mt-auto border-t border-zinc-100 dark:border-white/5 pt-4 px-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 mb-1">
            <span>Overall Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 dark:bg-violet-400 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1.5 text-center">
            {completedTasks} of {totalTasks} tasks completed
          </div>
        </div>
      </div>

      {/* Primary Tasks Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white dark:bg-zinc-950">
        {/* Workspace Header toolbar */}
        <div className="p-3 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          {/* Left search */}
          <div className="relative flex items-center bg-zinc-100 dark:bg-white/[0.04] rounded-xl px-2.5 py-1.5 w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none p-0 border-none"
            />
          </div>

          {/* Right Action Menu */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* Sort Toggle */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-white/[0.04] p-1 rounded-xl">
              <button
                onClick={() => setSortBy('status')}
                className={`px-2.5 py-1 text-[10px] rounded-lg font-medium transition-colors ${sortBy === 'status' ? 'bg-white dark:bg-zinc-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
              >
                Status
              </button>
              <button
                onClick={() => setSortBy('dueDate')}
                className={`px-2.5 py-1 text-[10px] rounded-lg font-medium transition-colors ${sortBy === 'dueDate' ? 'bg-white dark:bg-zinc-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
              >
                Due Date
              </button>
              <button
                onClick={() => setSortBy('priority')}
                className={`px-2.5 py-1 text-[10px] rounded-lg font-medium transition-colors ${sortBy === 'priority' ? 'bg-white dark:bg-zinc-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
              >
                Priority
              </button>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-medium hover:bg-violet-700 transition-colors shadow-sm w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Active Workspace Lists */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Inline Addition Form */}
          {showAddForm && (
            <form onSubmit={handleCreateTask} className="p-4 border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] rounded-2xl space-y-3 animate-in slide-in-from-top-4 duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter task name..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="Personal, Work..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Description / Notes</label>
                  <textarea
                    placeholder="Add extra context or descriptions..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500 h-16 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 border border-zinc-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 transition-colors"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          {/* Task Grid Items */}
          {filteredAndSortedTasks.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 dark:text-neutral-500">
              <CheckCircle2 className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
              <div className="text-xs font-semibold">Workspace is All Clean!</div>
              <p className="text-[10px] text-neutral-400 mt-1">No pending tasks found for this folder.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredAndSortedTasks.map(task => {
                const isOverdue = !task.completed && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
                return (
                  <div
                    key={task.id}
                    className={`group flex items-start gap-3 p-3 rounded-2xl border transition-all hover:shadow-sm ${
                      task.completed
                        ? 'border-zinc-200/50 bg-neutral-50/50 dark:border-white/5 dark:bg-white/[0.01] opacity-70'
                        : 'border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/40'
                    }`}
                  >
                    {/* Completion Check Circle */}
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className="mt-0.5 text-neutral-400 hover:text-violet-500 dark:text-neutral-500 dark:hover:text-violet-400 flex-shrink-0 transition-all"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-violet-500 dark:text-violet-400 fill-violet-500/10" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    {/* Task details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={`text-xs font-semibold leading-none ${task.completed ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-white'}`}>
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                          task.priority === 'high'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {task.priority}
                        </span>

                        {/* Category Badge */}
                        <span className="text-[8px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded-md">
                          {task.category}
                        </span>
                      </div>

                      {task.notes && (
                        <p className={`text-[10px] mt-1 ${task.completed ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                          {task.notes}
                        </p>
                      )}

                      {/* Due date stamp */}
                      <div className="flex items-center gap-1 text-[9px] text-neutral-400 mt-1.5">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
                          Due {task.dueDate} {isOverdue && '(Overdue)'}
                        </span>
                      </div>
                    </div>

                    {/* Trash Delete Action */}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
