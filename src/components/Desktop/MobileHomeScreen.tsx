/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, Grid, Search, X, Sparkles, Clock, Bell, LogOut, Check, Trash2, User as UserIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AppManifest, User, UserPreferences } from '../../types';
import { DbService } from '../../services/db';
import DesktopWidgets from './DesktopWidgets';

interface MobileHomeScreenProps {
  user: User;
  preferences: UserPreferences;
  onOpenApp: (appId: string) => void;
  onUpdatePreferences: (preferences: UserPreferences) => void;
  apps: AppManifest[];
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  onSignOut?: () => void;
}

export default function MobileHomeScreen({
  user,
  preferences,
  onOpenApp,
  onUpdatePreferences,
  apps,
  isDrawerOpen,
  setIsDrawerOpen,
  onSignOut,
}: MobileHomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  // Mobile Notification and Profile Menu states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Load notifications from local storage DB service
  const loadNotifications = () => {
    if (!user) return;
    const data = DbService.getUserData(user.id);
    setNotifications(data.notifications || []);
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('lifedesk_os_db_update', handleUpdate);
    return () => {
      window.removeEventListener('lifedesk_os_db_update', handleUpdate);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    if (!user) return;
    const data = DbService.getUserData(user.id);
    data.notifications = (data.notifications || []).map((n: any) => ({ ...n, read: true }));
    DbService.saveUserData(user.id, data);
  };

  const handleClearAll = () => {
    if (!user) return;
    const data = DbService.getUserData(user.id);
    data.notifications = [];
    DbService.saveUserData(user.id, data);
  };

  // Update time and date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter and sort apps based on search query alphabetically
  const filteredApps = [...apps]
    .filter(app => app.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title));

  // Time-based welcoming greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Helper styles based on preferences
  const getBlurClass = () => {
    const blur = preferences.blurIntensity || 'medium';
    if (blur === 'none') return 'bg-white/95 dark:bg-zinc-900/95 border-zinc-200 dark:border-white/10';
    if (blur === 'high') return 'bg-white/45 dark:bg-zinc-950/35 backdrop-blur-3xl border-white/20 dark:border-white/5';
    return 'bg-white/65 dark:bg-zinc-900/45 backdrop-blur-2xl border-white/20 dark:border-white/5';
  };

  const getAccentColorClass = (type: 'text' | 'bg' | 'border') => {
    const accent = preferences.accentColor || 'violet';
    if (accent === 'emerald') {
      if (type === 'text') return 'text-emerald-500 dark:text-emerald-400';
      if (type === 'bg') return 'bg-emerald-600 hover:bg-emerald-500';
      return 'border-emerald-500/20';
    }
    if (accent === 'sky') {
      if (type === 'text') return 'text-sky-500 dark:text-sky-400';
      if (type === 'bg') return 'bg-sky-500 hover:bg-sky-400';
      return 'border-sky-500/20';
    }
    if (accent === 'rose') {
      if (type === 'text') return 'text-rose-500 dark:text-rose-400';
      if (type === 'bg') return 'bg-rose-500 hover:bg-rose-400';
      return 'border-rose-500/20';
    }
    if (accent === 'amber') {
      if (type === 'text') return 'text-amber-500 dark:text-amber-400';
      if (type === 'bg') return 'bg-amber-500 hover:bg-amber-400';
      return 'border-amber-500/20';
    }
    // Default Violet
    if (type === 'text') return 'text-violet-500 dark:text-violet-400';
    if (type === 'bg') return 'bg-violet-600 hover:bg-violet-500';
    return 'border-violet-500/20';
  };

  // Icon style loader for the App grid in the App Drawer
  const getAppIconStyle = (appId: string) => {
    switch (appId) {
      case 'daily-briefing':
        return 'bg-indigo-500/10 dark:bg-indigo-500/25 border-indigo-500/20 text-indigo-600 dark:text-indigo-400';
      case 'notes':
        return 'bg-amber-500/10 dark:bg-amber-500/25 border-amber-500/20 text-amber-600 dark:text-amber-450';
      case 'tasks':
        return 'bg-violet-500/10 dark:bg-violet-500/25 border-violet-500/20 text-violet-600 dark:text-violet-400';
      case 'calendar':
        return 'bg-rose-500/10 dark:bg-rose-500/25 border-rose-500/20 text-rose-600 dark:text-rose-400';
      case 'bills':
        return 'bg-emerald-500/10 dark:bg-emerald-500/25 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'subscriptions':
        return 'bg-cyan-500/10 dark:bg-cyan-500/25 border-cyan-500/20 text-cyan-600 dark:text-cyan-400';
      case 'grocery':
        return 'bg-orange-500/10 dark:bg-orange-500/25 border-orange-500/20 text-orange-600 dark:text-orange-400';
      case 'pantry':
        return 'bg-amber-600/10 dark:bg-amber-600/25 border-amber-600/20 text-amber-600 dark:text-amber-400';
      case 'inventory':
        return 'bg-zinc-500/10 dark:bg-zinc-500/25 border-zinc-500/20 text-zinc-600 dark:text-zinc-400';
      case 'documents':
        return 'bg-blue-500/10 dark:bg-blue-500/25 border-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'vehicle':
        return 'bg-slate-500/10 dark:bg-slate-500/25 border-slate-500/20 text-slate-600 dark:text-slate-400';
      case 'health':
        return 'bg-pink-500/10 dark:bg-pink-500/25 border-pink-500/20 text-pink-600 dark:text-pink-400';
      case 'profile':
        return 'bg-teal-500/10 dark:bg-teal-500/25 border-teal-500/20 text-teal-600 dark:text-teal-400';
      case 'settings':
        return 'bg-neutral-500/10 dark:bg-neutral-500/25 border-neutral-500/20 text-neutral-600 dark:text-neutral-400';
      case 'about':
        return 'bg-sky-500/10 dark:bg-sky-500/25 border-sky-500/20 text-sky-600 dark:text-sky-400';
      default:
        return 'bg-violet-500/10 dark:bg-violet-500/25 border-violet-500/20 text-violet-600 dark:text-violet-400';
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-[84px] overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pointer-events-auto">
      <div className="w-full flex flex-col items-center px-4 pt-8 pb-6">
        {/* 1. Header panel with high-contrast text backing for maximum readability */}
        <div className={`w-full max-w-md p-4 rounded-2xl border mb-4 flex flex-col gap-3 shadow-lg shadow-black/5 ${getBlurClass()}`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Sparkles className={`w-3 h-3 ${getAccentColorClass('text')}`} />
                {getGreeting()}
              </span>
              <h1 className="text-base font-extrabold text-neutral-800 dark:text-white truncate max-w-[180px]">
                {user.username}
              </h1>
            </div>

            {/* Quick Action Buttons: Notifications and Profile Menu */}
            <div className="flex items-center gap-2">
              {/* Notifications Button */}
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsUserMenuOpen(false);
                }}
                className="relative p-2.5 rounded-xl border border-neutral-200/50 dark:border-white/5 bg-neutral-100/40 dark:bg-neutral-900/40 hover:bg-neutral-200/50 dark:hover:bg-white/5 transition-all text-neutral-600 dark:text-neutral-300 focus:outline-none"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-violet-500" />
                  </>
                )}
              </button>

              {/* Profile/User Button */}
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotificationOpen(false);
                }}
                className="relative p-2 rounded-xl border border-neutral-200/50 dark:border-white/5 bg-neutral-100/40 dark:bg-neutral-900/40 hover:bg-neutral-200/50 dark:hover:bg-white/5 transition-all flex items-center justify-center focus:outline-none"
              >
                <div className="w-5 h-5 rounded-lg bg-violet-500/10 dark:bg-violet-600/20 flex items-center justify-center font-bold text-[10px] text-violet-600 dark:text-violet-300">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              </button>
            </div>
          </div>
          
          {/* Subheader info: Local time/date badge */}
          <div className="flex items-center justify-between border-t border-neutral-200/30 dark:border-white/5 pt-2 text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 opacity-60" />
              {currentTime}
            </span>
            <span>{currentDate}</span>
          </div>
        </div>

        {/* Quick Drawer/Dropdown Overlays */}
        <AnimatePresence>
          {isNotificationOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-md mb-4 p-4 rounded-2xl border bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-zinc-200 dark:border-white/10 shadow-xl flex flex-col z-30"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200/50 dark:border-white/5">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Notifications ({unreadCount})
                </span>
                {notifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-bold text-violet-500 hover:text-violet-600 px-1.5 py-0.5 rounded hover:bg-violet-500/5"
                    >
                      Read All
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="text-[10px] font-bold text-red-500 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-500/5"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-neutral-200/50 dark:divide-white/5">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-neutral-400 dark:text-neutral-500">
                    <Bell className="w-6 h-6 mb-1.5 opacity-40" />
                    <p className="text-xs font-semibold">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div key={notif.id} className={`py-2.5 flex gap-3 ${notif.read ? 'opacity-50' : ''}`}>
                      <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 h-fit text-violet-500">
                        {(() => {
                          const IconComp = (LucideIcons as any)[notif.icon] || Bell;
                          return <IconComp className="w-3.5 h-3.5" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-800 dark:text-white truncate">
                            {notif.title}
                          </span>
                          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
                        </div>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-normal">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {isUserMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-md mb-4 p-4 rounded-2xl border bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-zinc-200 dark:border-white/10 shadow-xl flex flex-col gap-2 z-30"
            >
              <div className="pb-2 border-b border-neutral-200/50 dark:border-white/5">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                  Workspace User
                </span>
                <span className="text-sm font-extrabold text-neutral-800 dark:text-white mt-1 block">
                  {user.username}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                  {user.email}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    onOpenApp('profile');
                    setIsUserMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl border border-neutral-200/50 dark:border-white/5 bg-neutral-100/50 dark:bg-neutral-900/50 hover:bg-neutral-200/70 dark:hover:bg-white/10 transition-colors text-left flex items-center gap-2"
                >
                  <div className="p-1.5 rounded-lg bg-violet-500/15 text-violet-500">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200">
                    View Profile
                  </span>
                </button>

                <button
                  onClick={() => {
                    onSignOut?.();
                    setIsUserMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl border border-red-200/30 dark:border-red-500/10 bg-red-50/40 dark:bg-red-950/15 hover:bg-red-50/70 dark:hover:bg-red-950/25 transition-colors text-left flex items-center gap-2 text-red-600 dark:text-red-400"
                >
                  <div className="p-1.5 rounded-lg bg-red-500/15 text-red-500">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold">
                    Lock Workspace
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Interactive Active Widgets Dashboard rendered directly on mobile home screen */}
        <div className="w-full max-w-md flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-neutral-200/40 dark:border-white/5 pb-2 px-1">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Active Widgets Dashboard
            </span>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
              At a Glance
            </span>
          </div>

          {/* Real-time sync list of user active widgets as standalone native blocks */}
          <DesktopWidgets
            user={user}
            preferences={preferences}
            onOpenApp={onOpenApp}
            onUpdatePreferences={onUpdatePreferences}
            isMobileDashboard={true}
          />
        </div>
      </div>

      {/* Sliding App Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 pointer-events-auto"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed inset-0 h-full w-full bg-zinc-100/95 dark:bg-zinc-950/95 backdrop-blur-3xl border-t border-white/20 dark:border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.3)] z-50 pointer-events-auto flex flex-col select-none"
            >
              {/* Drawer handle / Swipe indicator */}
              <div className="w-full flex justify-center py-3">
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full hover:bg-neutral-400 transition-colors"
                />
              </div>

              {/* Drawer Header */}
              <div className="px-6 pb-4 flex items-center justify-between border-b border-neutral-200/50 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Grid className={`w-5 h-5 ${getAccentColorClass('text')}`} />
                  <span className="font-extrabold text-neutral-800 dark:text-white text-base tracking-tight">
                    Applications
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full bg-neutral-200 dark:bg-white/5 hover:bg-neutral-300 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Real-time search/filter inputs */}
              <div className="px-6 py-4">
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search applications..."
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300/50 dark:border-neutral-800 rounded-2xl pl-10 pr-10 py-3 text-sm text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 dark:focus:ring-violet-500/35 transition-shadow shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-white/5 text-neutral-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Apps grid (Scrollable) */}
              <div className="flex-1 overflow-y-auto px-6 pb-12 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {filteredApps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-400 dark:text-neutral-500">
                    <Grid className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm font-semibold">No apps found</p>
                    <p className="text-xs mt-1">Try searching for another keyword</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-y-6 gap-x-3 py-2">
                    {filteredApps.map((app) => {
                      const IconComponent = (LucideIcons as any)[app.icon] || LucideIcons.HelpCircle;
                      const iconStyle = getAppIconStyle(app.id);

                      return (
                        <motion.button
                          key={app.id}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => {
                            onOpenApp(app.id);
                            setIsDrawerOpen(false);
                          }}
                          className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none py-2 rounded-2xl hover:bg-neutral-200/40 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className={`w-[54px] h-[54px] rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105 ${iconStyle}`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-200 text-center px-1 truncate w-full">
                            {app.title}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
