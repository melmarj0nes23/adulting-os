/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, Clock, MapPin, Tag, Search, Check, Sparkles } from 'lucide-react';
import { DbService } from '../../services/db';
import { User, CalendarEvent, BillItem, TaskItem } from '../../types';

interface CalendarAppProps {
  user: User;
}

export default function CalendarApp({ user }: CalendarAppProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [bills, setBills] = useState<BillItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileTab, setMobileTab] = useState<'calendar' | 'agenda'>('calendar');

  // Event creation form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newColor, setNewColor] = useState('violet');
  const [newReminder, setNewReminder] = useState<'none' | '15m' | '1h' | '1d' | '1w'>('1h');

  const loadData = () => {
    const data = DbService.getUserData(user.id);
    setEvents(data.events || []);
    setBills(data.bills || []);
    setTasks(data.tasks || []);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('lifedesk_os_db_update', handleUpdate);
    return () => {
      window.removeEventListener('lifedesk_os_db_update', handleUpdate);
    };
  }, [user.id]);

  const saveEvents = (updatedEvents: CalendarEvent[]) => {
    const data = DbService.getUserData(user.id);
    data.events = updatedEvents;
    DbService.saveUserData(user.id, data);
    setEvents(updatedEvents);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newEventDate) return;

    const newEvent: CalendarEvent = {
      id: `event_${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      startDate: `${newEventDate}T${newEventTime}`,
      endDate: `${newEventDate}T${parseInt(newEventTime.split(':')[0]) + 1}:00`, // mock 1 hour duration
      color: newColor,
      reminder: newReminder,
    };

    const updated = [...events, newEvent];
    saveEvents(updated);

    // Clear form
    setNewTitle('');
    setNewDescription('');
    setNewEventDate('');
    setNewEventTime('10:00');
    setNewColor('violet');
    setNewReminder('1h');
    setShowAddForm(false);

    DbService.addNotification(user.id, {
      title: 'Event Scheduled',
      message: `"${newEvent.title}" has been successfully scheduled on your calendar.`,
      type: 'success',
      icon: 'Calendar',
    });
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    saveEvents(updated);
  };

  // Month navigation helpers
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const startDayIndex = (startOfMonth.getDay() + 6) % 7; // Align to Monday start (0=Mon, 6=Sun)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Color mapping utilities
  const colorMap: Record<string, string> = {
    violet: 'bg-violet-500/15 text-violet-700 border-violet-500/30 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-500/20',
    indigo: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30 dark:bg-indigo-400/10 dark:text-indigo-300 dark:border-indigo-500/20',
    emerald: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-500/20',
    amber: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-500/20',
    rose: 'bg-rose-500/15 text-rose-700 border-rose-500/30 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-500/20',
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Combine events, bills, and task deadlines into a single lookup map
  const getDayItems = (year: number, month: number, day: number) => {
    const items: Array<{ id: string; title: string; color: string; type: 'event' | 'bill' | 'task' }> = [];
    const datestr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 1. Matches events
    events.forEach(e => {
      if (e.startDate.startsWith(datestr)) {
        items.push({ id: e.id, title: e.title, color: e.color, type: 'event' });
      }
    });

    // 2. Matches bills (life dashboard integration!)
    bills.forEach(b => {
      if (b.dueDate === datestr) {
        items.push({ id: b.id, title: `💵 ${b.name}`, color: 'amber', type: 'bill' });
      }
    });

    // 3. Matches task deadlines
    tasks.forEach(t => {
      if (t.dueDate === datestr && !t.completed) {
        items.push({ id: t.id, title: `✓ ${t.title}`, color: 'indigo', type: 'task' });
      }
    });

    return items;
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200">
      {/* Calendar Header with navigation and action keys */}
      <div className="p-3 border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <CalendarIcon className="w-5 h-5 text-violet-500" />
          <h1 className="text-sm font-bold font-display">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>

          <div className="flex items-center gap-1.5 ml-3">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-neutral-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-neutral-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Selection & Creation triggers */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center bg-zinc-100 dark:bg-white/[0.04] rounded-lg px-2.5 py-1 w-full sm:w-44">
            <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none p-0 border-none"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Mobile view selector tab */}
      <div className="flex md:hidden bg-zinc-100 dark:bg-white/[0.04] p-1 mx-3 mt-3 rounded-xl border border-zinc-200 dark:border-white/5 flex-shrink-0">
        <button
          onClick={() => setMobileTab('calendar')}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'calendar'
              ? 'bg-white dark:bg-zinc-800 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Calendar Grid
        </button>
        <button
          onClick={() => setMobileTab('agenda')}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'agenda'
              ? 'bg-white dark:bg-zinc-800 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Agenda & Events
        </button>
      </div>

      {/* Primary Calendar Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-0">
        {/* Left main grid view */}
        <div className={`flex-1 overflow-y-auto p-4 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/5 ${mobileTab === 'calendar' ? 'flex' : 'hidden md:flex'}`}>
          {/* Event Schedule Form Overlay */}
          {showAddForm && (
            <form onSubmit={handleCreateEvent} className="mb-4 p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg space-y-3 animate-in slide-in-from-top-4 duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Doctors Appointment, Family Dinner..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Time</label>
                    <input
                      type="time"
                      required
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Label Color</label>
                    <select
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="violet">Violet</option>
                      <option value="indigo">Indigo</option>
                      <option value="emerald">Emerald</option>
                      <option value="amber">Amber</option>
                      <option value="rose">Rose</option>
                    </select>
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Reminder</label>
                  <select
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="none">No Reminder</option>
                    <option value="15m">15 Minutes Before</option>
                    <option value="1h">1 Hour Before</option>
                    <option value="1d">1 Day Before</option>
                    <option value="1w">1 Week Before</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Notes / Description</label>
                  <textarea
                    placeholder="Enter descriptions or additional details..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
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
                  Schedule Event
                </button>
              </div>
            </form>
          )}

          {/* 1. Weekday labels */}
          <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center">
            {dayNames.map(day => (
              <div key={day} className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest py-1">
                {day}
              </div>
            ))}
          </div>

          {/* 2. Month Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[300px]">
            {/* Empty cells for matching offset */}
            {Array.from({ length: startDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="rounded-2xl border border-dashed border-zinc-200 dark:border-white/5 bg-zinc-50/10 dark:bg-transparent" />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isToday =
                dayNum === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              const dayItems = getDayItems(currentDate.getFullYear(), currentDate.getMonth(), dayNum);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`rounded-2xl border min-h-[80px] p-2 flex flex-col justify-between transition-all ${
                    isToday
                      ? 'border-violet-500 bg-violet-500/[0.03] shadow-inner'
                      : 'border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30'
                  }`}
                >
                  {/* Day label */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-violet-500 bg-violet-500/10 rounded-full w-5 h-5 flex items-center justify-center' : 'text-neutral-700 dark:text-neutral-300'}`}>
                      {dayNum}
                    </span>
                  </div>

                  {/* Day item list */}
                  <div className="flex flex-col gap-1 mt-1.5 overflow-hidden">
                    {dayItems.slice(0, 3).map(item => (
                      <div
                        key={item.id}
                        className={`text-[9px] font-semibold py-0.5 px-1.5 rounded border truncate ${
                          colorMap[item.color] || colorMap.violet
                        }`}
                        title={item.title}
                      >
                        {item.title}
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-[8px] text-neutral-400 text-center font-bold">
                        +{dayItems.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Agenda Sidebar */}
        <div className={`w-full md:w-80 overflow-y-auto p-4 bg-white dark:bg-zinc-900/10 flex flex-col gap-4 flex-shrink-0 ${mobileTab === 'agenda' ? 'flex' : 'hidden md:flex'}`}>
          <div>
            <h2 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Agenda & Events</h2>
            
            {/* List of Scheduled Events */}
            <div className="space-y-2.5">
              {events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400 dark:text-neutral-500 bg-zinc-50/50 dark:bg-white/[0.01] border border-dashed border-zinc-200 dark:border-white/5 rounded-2xl">
                  <Clock className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                  No events scheduled.
                </div>
              ) : (
                events
                  .filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .map(e => {
                    const formatDateLabel = (dateTimeStr: string) => {
                      try {
                        const d = new Date(dateTimeStr);
                        return d.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' }) + ' @ ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      } catch {
                        return dateTimeStr;
                      }
                    };

                    const dotColorMap: Record<string, string> = {
                      violet: 'bg-violet-500',
                      indigo: 'bg-indigo-500',
                      emerald: 'bg-emerald-500',
                      amber: 'bg-amber-500',
                      rose: 'bg-rose-500',
                    };

                    return (
                      <div
                        key={e.id}
                        className="p-3 border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 rounded-2xl flex items-start gap-2.5 hover:shadow-sm transition-all"
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColorMap[e.color] || dotColorMap.violet}`} />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 leading-tight truncate">
                            {e.title}
                          </h3>
                          {e.description && (
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal mt-0.5 animate-pulse">
                              {e.description}
                            </p>
                          )}
                          <span className="text-[9px] text-neutral-400 font-mono block mt-1.5">
                            {formatDateLabel(e.startDate)}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            handleDeleteEvent(e.id);
                            DbService.addNotification(user.id, {
                              title: 'Event Deleted',
                              message: `"${e.title}" was removed from your schedule.`,
                              type: 'info',
                              icon: 'Calendar',
                            });
                          }}
                          className="p-1 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
