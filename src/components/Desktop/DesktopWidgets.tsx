/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, 
  Heart, 
  CreditCard, 
  StickyNote, 
  Repeat, 
  AlertTriangle,
  Plus, 
  Check, 
  Circle, 
  Droplet, 
  TrendingUp,
  LayoutGrid,
  X
} from 'lucide-react';
import { DbService } from '../../services/db';
import { User, UserPreferences, TaskItem, NoteItem, BillItem, SubscriptionItem, PantryItem } from '../../types';

interface DesktopWidgetsProps {
  user: User;
  preferences: UserPreferences;
  onOpenApp: (appId: string) => void;
  onUpdatePreferences: (preferences: UserPreferences) => void;
  isMobileDashboard?: boolean;
}

export default function DesktopWidgets({ user, preferences, onOpenApp, onUpdatePreferences, isMobileDashboard }: DesktopWidgetsProps) {
  const [userData, setUserData] = useState<any>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isWidgetPanelOpen, setIsWidgetPanelOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCompact = windowWidth < 1024;

  // Load user data on mount and whenever DB updates
  const loadData = () => {
    const data = DbService.getUserData(user.id);
    setUserData(data);
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

  // Render list of chosen widgets
  const activeWidgets = preferences.widgets || ['tasks', 'health', 'bills', 'notes'];
  const positions = preferences.widgetPositions || {};

  // Style helpers based on blur intensity
  const getBlurClass = () => {
    const blur = preferences.blurIntensity || 'medium';
    if (blur === 'none') return 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10';
    if (blur === 'high') return 'bg-white/30 dark:bg-zinc-950/20 backdrop-blur-2xl border-zinc-200/40 dark:border-white/5';
    return 'bg-white/60 dark:bg-zinc-900/30 backdrop-blur-md border-zinc-200/50 dark:border-white/5';
  };

  const getAccentColorClass = (type: 'text' | 'bg' | 'border' | 'ring') => {
    const accent = preferences.accentColor || 'violet';
    if (accent === 'emerald') {
      if (type === 'text') return 'text-emerald-500 dark:text-emerald-400';
      if (type === 'bg') return 'bg-emerald-600 hover:bg-emerald-500';
      if (type === 'border') return 'border-emerald-500/20';
      return 'focus:ring-emerald-500';
    }
    if (accent === 'sky') {
      if (type === 'text') return 'text-sky-500 dark:text-sky-400';
      if (type === 'bg') return 'bg-sky-500 hover:bg-sky-450';
      if (type === 'border') return 'border-sky-500/20';
      return 'focus:ring-sky-500';
    }
    if (accent === 'rose') {
      if (type === 'text') return 'text-rose-500 dark:text-rose-400';
      if (type === 'bg') return 'bg-rose-500 hover:bg-rose-400';
      if (type === 'border') return 'border-rose-500/20';
      return 'focus:ring-rose-500';
    }
    if (accent === 'amber') {
      if (type === 'text') return 'text-amber-500 dark:text-amber-400';
      if (type === 'bg') return 'bg-amber-500 hover:bg-amber-400';
      if (type === 'border') return 'border-amber-500/20';
      return 'focus:ring-amber-500';
    }
    // Default Violet
    if (type === 'text') return 'text-violet-500 dark:text-violet-400';
    if (type === 'bg') return 'bg-violet-600 hover:bg-violet-500';
    if (type === 'border') return 'border-violet-500/20';
    return 'focus:ring-violet-500';
  };

  const getDefaultPosition = (widgetId: string) => {
    switch (widgetId) {
      case 'tasks':
        return { x: 0, y: 0 };
      case 'health':
        return { x: 0, y: 220 };
      case 'bills':
        return { x: 0, y: 440 };
      case 'notes':
        return { x: -340, y: 0 };
      case 'subscriptions':
        return { x: -340, y: 220 };
      case 'pantry':
        return { x: -340, y: 440 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const handleDragEnd = (widgetId: string, offset: { x: number; y: number }) => {
    const currentPos = positions[widgetId] || getDefaultPosition(widgetId);

    const newPos = {
      x: currentPos.x + offset.x,
      y: currentPos.y + offset.y,
    };

    const updatedPreferences = {
      ...preferences,
      widgetPositions: {
        ...positions,
        [widgetId]: newPos,
      },
    };

    DbService.savePreferences(user.id, updatedPreferences);
    onUpdatePreferences(updatedPreferences);
  };

  const blurClass = getBlurClass();

  const renderWidgetContent = (widgetId: string) => {
    switch (widgetId) {
      case 'tasks':
        return (
          <TasksWidget 
            user={user}
            userData={userData}
            blurClass={blurClass}
            getAccentColorClass={getAccentColorClass}
            onOpenApp={onOpenApp}
          />
        );
      case 'health':
        return (
          <HealthWidget 
            user={user}
            userData={userData}
            blurClass={blurClass}
            getAccentColorClass={getAccentColorClass}
            onOpenApp={onOpenApp}
          />
        );
      case 'bills':
        return (
          <BillsWidget 
            user={user}
            userData={userData}
            blurClass={blurClass}
            getAccentColorClass={getAccentColorClass}
            onOpenApp={onOpenApp}
          />
        );
      case 'notes':
        return (
          <NotesWidget 
            user={user}
            userData={userData}
            blurClass={blurClass}
            getAccentColorClass={getAccentColorClass}
            onOpenApp={onOpenApp}
          />
        );
      case 'subscriptions':
        return (
          <SubscriptionsWidget 
            user={user}
            userData={userData}
            blurClass={blurClass}
            getAccentColorClass={getAccentColorClass}
            onOpenApp={onOpenApp}
          />
        );
      case 'pantry':
        return (
          <PantryWidget 
            user={user}
            userData={userData}
            blurClass={blurClass}
            onOpenApp={onOpenApp}
          />
        );
      default:
        return null;
    }
  };

  if (!userData) return null;

  if (isMobileDashboard) {
    return (
      <div className="w-full flex flex-col gap-4">
        {activeWidgets.map((widgetId) => {
          const content = renderWidgetContent(widgetId);
          if (!content) return null;

          return (
            <motion.div
              key={`${widgetId}-mobile-inline`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full pointer-events-auto"
            >
              {content}
            </motion.div>
          );
        })}

        {activeWidgets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-450 dark:text-neutral-400">
            <p className="text-sm">No active widgets</p>
            <p className="text-xs mt-1">Enable widgets in Settings App</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
      {!isCompact ? (
        <AnimatePresence mode="popLayout">
          {activeWidgets.map((widgetId) => {
            const pos = positions[widgetId] || getDefaultPosition(widgetId);
            const content = renderWidgetContent(widgetId);
            if (!content) return null;

            return (
              <motion.div
                key={`${widgetId}-widget`}
                drag
                dragMomentum={false}
                dragConstraints="#desktop-canvas"
                dragElastic={0}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: pos.x,
                  y: pos.y
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileDrag={{ scale: 1.03, zIndex: 50 }}
                onDragEnd={(e, info) => handleDragEnd(widgetId, info.offset)}
                className="absolute top-20 right-4 w-80 pointer-events-auto cursor-grab active:cursor-grabbing select-none"
              >
                {content}
              </motion.div>
            );
          })}
        </AnimatePresence>
      ) : (
        <>
          {/* Floating Widget Toggle Action Button */}
          <button
            onClick={() => setIsWidgetPanelOpen(!isWidgetPanelOpen)}
            className={`absolute top-4 right-4 z-40 p-2.5 rounded-full shadow-lg pointer-events-auto backdrop-blur-md border flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all text-xs font-semibold select-none ${getBlurClass()} ${getAccentColorClass('text')} ${getAccentColorClass('border')} shadow-black/5 dark:shadow-neutral-950/25`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="pr-1">Widgets</span>
            <span className={`w-1.5 h-1.5 rounded-full ${getAccentColorClass('bg')}`}></span>
          </button>

          {/* Slide-out widget tray overlay */}
          <AnimatePresence>
            {isWidgetPanelOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsWidgetPanelOpen(false)}
                  className="absolute inset-0 bg-black/10 dark:bg-black/30 backdrop-blur-sm z-40 pointer-events-auto"
                />

                {/* Sliding Widget Drawer panel */}
                <motion.div
                  initial={{ x: '100%', opacity: 0.95 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0.95 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                  className="absolute top-0 right-0 h-full w-[340px] max-w-[calc(100%-16px)] bg-white/85 dark:bg-zinc-950/45 backdrop-blur-2xl border-l border-zinc-200/50 dark:border-white/5 shadow-2xl z-50 flex flex-col pointer-events-auto"
                >
                  {/* Panel Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/50 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className={`w-4 h-4 ${getAccentColorClass('text')}`} />
                      <span className="font-display font-bold text-neutral-800 dark:text-neutral-100 text-sm tracking-tight">
                        Widget Center
                      </span>
                    </div>
                    <button
                      onClick={() => setIsWidgetPanelOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scrollable stack of active widgets */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-28 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {activeWidgets.map((widgetId) => {
                      const content = renderWidgetContent(widgetId);
                      if (!content) return null;

                      return (
                        <motion.div
                          key={`${widgetId}-compact`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          transition={{ duration: 0.2 }}
                          className="w-full flex-shrink-0"
                        >
                          {content}
                        </motion.div>
                      );
                    })}

                    {activeWidgets.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
                        <p className="text-sm">No active widgets</p>
                        <p className="text-xs mt-1">Enable widgets in Settings App</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// ======================== SUB-COMPONENTS ========================

interface WidgetSubProps {
  user: User;
  userData: any;
  blurClass: string;
  getAccentColorClass: (type: 'text' | 'bg' | 'border' | 'ring') => string;
  onOpenApp: (appId: string) => void;
}

// 1. Tasks Widget
function TasksWidget({ user, userData, blurClass, getAccentColorClass, onOpenApp }: WidgetSubProps) {
  const tasksList: TaskItem[] = userData.tasks || [];
  const activeTasks = tasksList.filter(t => !t.completed).slice(0, 4);
  const [quickTitle, setQuickTitle] = useState('');
  const [showInput, setShowInput] = useState(false);

  const toggleTask = (id: string) => {
    const updated = tasksList.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    const data = { ...userData, tasks: updated };
    DbService.saveUserData(user.id, data);
    
    const task = tasksList.find(t => t.id === id);
    if (task) {
      DbService.addNotification(user.id, {
        title: 'Task Completed',
        message: `"${task.title}" has been checked off.`,
        type: 'success',
        icon: 'CheckSquare',
      });
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: quickTitle.trim(),
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      category: 'Personal'
    };

    const data = { ...userData, tasks: [newTask, ...tasksList] };
    DbService.saveUserData(user.id, data);
    setQuickTitle('');
    setShowInput(false);
  };

  return (
    <div className={`p-4 rounded-2xl border ${blurClass} shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-3 group`}>
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onOpenApp('tasks')} 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left"
        >
          <CheckSquare className={`w-4 h-4 ${getAccentColorClass('text')}`} />
          <span className="font-bold text-xs tracking-wide uppercase text-neutral-800 dark:text-neutral-200">Task Checklist</span>
        </button>
        <button 
          onClick={() => setShowInput(!showInput)}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          title="Quick Add Task"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {showInput && (
        <form onSubmit={handleAddTask} className="flex gap-1.5 animate-in slide-in-from-top-2 duration-150">
          <input 
            type="text"
            required
            placeholder="Add task..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="flex-1 bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5 rounded-lg px-2 py-1 text-[11px] text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button 
            type="submit"
            className={`p-1.5 text-white rounded-lg transition-colors ${getAccentColorClass('bg')}`}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      <div className="space-y-2">
        {activeTasks.length === 0 ? (
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 py-2 italic text-center">
            All caught up! Let's take a break.
          </div>
        ) : (
          activeTasks.map(task => (
            <div key={task.id} className="flex items-start gap-2.5 group/item">
              <button 
                onClick={() => toggleTask(task.id)}
                className="mt-0.5 text-neutral-400 hover:text-violet-500 transition-colors flex-shrink-0"
              >
                <Circle className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 truncate block leading-tight">
                  {task.title}
                </span>
                {task.dueDate && (
                  <span className="text-[9px] text-neutral-400 block mt-0.5 font-mono">
                    Due {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 2. Health Widget
function HealthWidget({ user, userData, blurClass, getAccentColorClass, onOpenApp }: WidgetSubProps) {
  const health = userData.health || { medications: [], waterIntake: [] };
  const medications = health.medications || [];
  const waterIntake = health.waterIntake || [];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayWater = waterIntake
    .filter((w: any) => w.date === todayStr)
    .reduce((sum: number, w: any) => sum + w.amountMl, 0);

  const addWater = () => {
    const updatedIntake = [...waterIntake];
    const todayLogIndex = updatedIntake.findIndex((w: any) => w.date === todayStr);

    if (todayLogIndex !== -1) {
      updatedIntake[todayLogIndex] = {
        ...updatedIntake[todayLogIndex],
        amountMl: updatedIntake[todayLogIndex].amountMl + 250,
      };
    } else {
      updatedIntake.push({
        id: `wat_${Date.now()}`,
        date: todayStr,
        amountMl: 250,
      });
    }

    const data = {
      ...userData,
      health: {
        ...health,
        waterIntake: updatedIntake,
      }
    };
    DbService.saveUserData(user.id, data);
  };

  const toggleMed = (id: string) => {
    const updatedMeds = medications.map((m: any) => 
      m.id === id ? { ...m, takenToday: !m.takenToday } : m
    );

    const data = {
      ...userData,
      health: {
        ...health,
        medications: updatedMeds,
      }
    };
    DbService.saveUserData(user.id, data);

    const med = medications.find((m: any) => m.id === id);
    if (med) {
      DbService.addNotification(user.id, {
        title: 'Medication Tracker',
        message: med.takenToday 
          ? `Marked "${med.name}" as not taken today.` 
          : `Hooray! Marked "${med.name}" as taken today!`,
        type: 'success',
        icon: 'Heart',
      });
    }
  };

  const targetWater = 2000;
  const progressPercent = Math.min(100, Math.round((todayWater / targetWater) * 100));

  return (
    <div className={`p-4 rounded-2xl border ${blurClass} shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-3`}>
      <button 
        onClick={() => onOpenApp('health')} 
        className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left w-full"
      >
        <Heart className={`w-4 h-4 ${getAccentColorClass('text')}`} />
        <span className="font-bold text-xs tracking-wide uppercase text-neutral-800 dark:text-neutral-200">Daily Wellness</span>
      </button>

      {/* Water logger section */}
      <div className="bg-sky-500/5 dark:bg-sky-500/[0.02] border border-sky-500/10 rounded-xl p-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Droplet className="w-5 h-5 text-sky-500 flex-shrink-0 animate-bounce" />
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 block leading-tight">Hydration Tracker</span>
            <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400 mt-0.5 block">
              {todayWater} <span className="text-[9px] font-medium text-neutral-500">/ {targetWater} ml</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-10 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <button 
            onClick={addWater}
            className="p-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors"
            title="Add 250ml Water"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Medications Checklist section */}
      {medications.length > 0 && (
        <div className="space-y-1.5 border-t border-zinc-100 dark:border-white/5 pt-2">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Daily Medications</span>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {medications.map((med: any) => (
              <button 
                key={med.id}
                onClick={() => toggleMed(med.id)}
                className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left text-[11px] transition-colors"
              >
                <span className={`font-medium truncate flex-1 ${med.takenToday ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
                  {med.name} ({med.dosage})
                </span>
                <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${med.takenToday ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-neutral-300 dark:border-white/10 bg-transparent'}`}>
                  {med.takenToday && <Check className="w-2.5 h-2.5" />}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 3. Bills Widget
function BillsWidget({ user, userData, blurClass, getAccentColorClass, onOpenApp }: WidgetSubProps) {
  const bills: BillItem[] = userData.bills || [];
  const upcomingUnpaid = bills
    .filter(b => !b.paid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const payBill = (id: string) => {
    const updated = bills.map(b => b.id === id ? { ...b, paid: true } : b);
    const data = { ...userData, bills: updated };
    DbService.saveUserData(user.id, data);

    const bill = bills.find(b => b.id === id);
    if (bill) {
      DbService.addNotification(user.id, {
        title: 'Bill Marked Paid',
        message: `"${bill.name}" has been marked paid ($${bill.amount.toFixed(2)}).`,
        type: 'success',
        icon: 'CreditCard',
      });
    }
  };

  return (
    <div className={`p-4 rounded-2xl border ${blurClass} shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-3`}>
      <button 
        onClick={() => onOpenApp('bills')} 
        className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left w-full"
      >
        <CreditCard className={`w-4 h-4 ${getAccentColorClass('text')}`} />
        <span className="font-bold text-xs tracking-wide uppercase text-neutral-800 dark:text-neutral-200">Upcoming Bills</span>
      </button>

      <div className="space-y-2">
        {upcomingUnpaid.length === 0 ? (
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 py-2 italic text-center">
            All clear! No pending payments due.
          </div>
        ) : (
          upcomingUnpaid.map(bill => {
            const dateDiff = Math.ceil((new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const isOverdue = dateDiff < 0;

            return (
              <div key={bill.id} className="p-2 rounded-xl border border-zinc-200/50 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block leading-tight truncate">
                    {bill.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-bold font-mono text-rose-500 dark:text-rose-400">
                      ${bill.amount.toFixed(2)}
                    </span>
                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                    <span className={`text-[9px] font-semibold ${isOverdue ? 'text-rose-500 font-bold' : 'text-neutral-400'}`}>
                      {isOverdue ? 'Overdue!' : `In ${dateDiff} days`}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => payBill(bill.id)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white transition-all whitespace-nowrap"
                >
                  Pay
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 4. Notes Widget
function NotesWidget({ user, userData, blurClass, getAccentColorClass, onOpenApp }: WidgetSubProps) {
  const notes: NoteItem[] = userData.notes || [];
  let stickyNote = notes.find(n => n.title === 'Desktop Sticky Note');
  const [content, setContent] = useState('');

  // Sync content if stickyNote changes externally
  useEffect(() => {
    if (stickyNote) {
      setContent(stickyNote.content);
    } else {
      setContent('');
    }
  }, [stickyNote?.id, stickyNote?.content]);

  const handleSaveNote = (val: string) => {
    setContent(val);
    let updatedNotes = [...notes];
    const stickyIndex = updatedNotes.findIndex(n => n.title === 'Desktop Sticky Note');

    if (stickyIndex !== -1) {
      updatedNotes[stickyIndex] = {
        ...updatedNotes[stickyIndex],
        content: val,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updatedNotes.push({
        id: `note_${Date.now()}`,
        title: 'Desktop Sticky Note',
        content: val,
        pinned: true,
        favorite: false,
        tags: ['Desktop', 'QuickNote'],
        updatedAt: new Date().toISOString(),
      });
    }

    const data = { ...userData, notes: updatedNotes };
    DbService.saveUserData(user.id, data);
  };

  return (
    <div className={`p-4 rounded-2xl border ${blurClass} shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-2.5`}>
      <button 
        onClick={() => onOpenApp('notes')} 
        className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left w-full"
      >
        <StickyNote className={`w-4 h-4 ${getAccentColorClass('text')}`} />
        <span className="font-bold text-xs tracking-wide uppercase text-neutral-800 dark:text-neutral-200">Sticky Note</span>
      </button>

      <textarea 
        placeholder="Jot down a quick thought here..."
        value={content}
        onChange={(e) => handleSaveNote(e.target.value)}
        className="w-full h-24 bg-yellow-100/20 dark:bg-yellow-500/[0.03] border border-yellow-500/10 focus:border-yellow-500/30 rounded-xl p-2 text-[11px] text-neutral-800 dark:text-neutral-200 leading-normal focus:outline-none focus:ring-1 focus:ring-yellow-500 resize-none font-sans scrollbar-thin"
      />
      <div className="flex items-center justify-between text-[8px] text-neutral-400 font-mono">
        <span>Saves in notes database</span>
        <span>{content.length} chars</span>
      </div>
    </div>
  );
}

// 5. Subscriptions Widget
function SubscriptionsWidget({ user, userData, blurClass, getAccentColorClass, onOpenApp }: WidgetSubProps) {
  const subs: SubscriptionItem[] = userData.subscriptions || [];
  const monthlyTotal = subs.reduce((sum, item) => {
    return sum + (item.billingCycle === 'monthly' ? item.cost : item.cost / 12);
  }, 0);

  const upcomingSubs = subs
    .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
    .slice(0, 2);

  return (
    <div className={`p-4 rounded-2xl border ${blurClass} shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-3`}>
      <button 
        onClick={() => onOpenApp('subscriptions')} 
        className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left w-full"
      >
        <Repeat className={`w-4 h-4 ${getAccentColorClass('text')}`} />
        <span className="font-bold text-xs tracking-wide uppercase text-neutral-800 dark:text-neutral-200">Subscription Spend</span>
      </button>

      <div className="flex items-center justify-between p-2.5 rounded-xl bg-violet-500/5 dark:bg-violet-500/[0.02] border border-violet-500/10">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 block leading-tight">Monthly Expenditure</span>
          <div className="text-sm font-bold font-mono text-violet-600 dark:text-violet-400 mt-1">
            ${monthlyTotal.toFixed(2)}
          </div>
        </div>
        <TrendingUp className="w-6 h-6 text-violet-500/30" />
      </div>

      {upcomingSubs.length > 0 && (
        <div className="space-y-1 pt-1">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Upcoming Renewals</span>
          <div className="space-y-1">
            {upcomingSubs.map(sub => (
              <div key={sub.id} className="flex justify-between items-center text-[10px] p-1 rounded hover:bg-black/5 dark:hover:bg-white/5">
                <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[120px]">
                  {sub.serviceName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-neutral-500">${sub.cost.toFixed(2)}</span>
                  <span className="text-[9px] text-neutral-400">
                    {new Date(sub.renewalDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 6. Pantry Widget (Doesn't need getAccentColorClass since it uses warnings alerts)
interface PantryWidgetProps {
  user: User;
  userData: any;
  blurClass: string;
  onOpenApp: (appId: string) => void;
}

function PantryWidget({ user, userData, blurClass, onOpenApp }: PantryWidgetProps) {
  const pantry: PantryItem[] = userData.pantry || [];
  const lowStockItems = pantry.filter(item => item.quantity <= 1);
  
  const restockItem = (id: string) => {
    const updated = pantry.map(item => {
      if (item.id === id) {
        const qty = item.quantity + 1;
        return { ...item, quantity: qty };
      }
      return item;
    });
    const data = { ...userData, pantry: updated };
    DbService.saveUserData(user.id, data);

    const item = pantry.find(i => i.id === id);
    if (item) {
      DbService.addNotification(user.id, {
        title: 'Pantry Restocked',
        message: `Increased quantity of "${item.name}" to ${item.quantity + 1}.`,
        type: 'success',
        icon: 'Apple',
      });
    }
  };

  return (
    <div className={`p-4 rounded-2xl border ${blurClass} shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-3`}>
      <button 
        onClick={() => onOpenApp('pantry')} 
        className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left w-full"
      >
        <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
        <span className="font-bold text-xs tracking-wide uppercase text-neutral-800 dark:text-neutral-200">Pantry Monitor</span>
      </button>

      <div className="space-y-1.5">
        {lowStockItems.length === 0 ? (
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 py-2 italic text-center">
            Pantry fully stocked! No low supply alerts.
          </div>
        ) : (
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {lowStockItems.slice(0, 3).map(item => (
              <div key={item.id} className="flex justify-between items-center text-[10px] p-1.5 rounded bg-amber-500/5 border border-amber-500/10">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 block truncate leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold block mt-0.5">
                    {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'} ({item.quantity} {item.unit})
                  </span>
                </div>

                <button 
                  onClick={() => restockItem(item.id)}
                  className="p-1 rounded bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white transition-all text-[9px] font-bold"
                  title="Increment Quantity (+1)"
                >
                  +1 Restock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
