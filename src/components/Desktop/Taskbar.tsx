/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Wifi, Battery, Sparkles, LogOut, User, ChevronDown, Check, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { User as UserType } from '../../types';
import { DbService } from '../../services/db';

interface TaskbarProps {
  user: UserType | null;
  onSignOut: () => void;
  onOpenApp: (appId: string) => void;
  accentClass: string;
  showFullDate?: boolean;
}

export default function Taskbar({ user, onSignOut, onOpenApp, accentClass, showFullDate = true }: TaskbarProps) {
  const [time, setTime] = useState(new Date());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDate = time.toLocaleDateString([], {
    weekday: showFullDate !== false ? 'long' : 'short',
    month: showFullDate !== false ? 'long' : 'short',
    day: 'numeric',
  });

  const userInitial = user?.username?.charAt(0).toUpperCase() || 'U';
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

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || Bell;
    return <IconComponent className="w-4 h-4 text-violet-500" />;
  };

  return (
    <div className="relative select-none z-[9990]">
      {/* Real-time system top bar */}
      <div className="w-full h-11 bg-white/70 dark:bg-zinc-950/25 border-b border-zinc-200/50 dark:border-white/5 backdrop-blur-xl flex items-center justify-between px-4 text-neutral-800 dark:text-white text-xs font-medium">
        
        {/* Left Side: LifeDeskOS Identity & Status */}
        <div className="flex items-center gap-3">
          <button
            id="taskbar-logo"
            onClick={() => onOpenApp('about')}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
          >
            <Sparkles className="w-4 h-4 text-violet-500 dark:text-violet-400" />
            <span className="font-display font-bold text-sm tracking-tight">
              LifeDesk<span className="text-violet-500 dark:text-violet-400">OS</span>
            </span>
          </button>
          
          <div className="h-4 w-px bg-neutral-200 dark:bg-white/10 hidden sm:block" />
          
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 bg-black/[0.04] dark:bg-white/[0.04] px-2 py-0.5 rounded-full hidden sm:inline-block border border-zinc-200/50 dark:border-white/5">
            Cloud Workspace Secure
          </span>
        </div>

        {/* Center: System Clock & Calendar */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-neutral-800 dark:text-neutral-200">
          <span className="font-mono font-semibold">{formattedTime}</span>
          <span className="text-neutral-300 dark:text-neutral-500 hidden sm:inline">•</span>
          <span className="hidden sm:inline">{formattedDate}</span>
        </div>

        {/* Right Side: Status indicators + User Profile menu */}
        <div className="flex items-center gap-4">
          {/* Mock status icons */}
          <div className="flex items-center gap-2.5 text-neutral-500 dark:text-neutral-400 hidden xs:flex">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>

          {/* Notifications bell */}
          <button
            id="notification-bell"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-500" />
              </>
            )}
          </button>

          {/* User Menu Trigger */}
          <div className="relative">
            <button
              id="user-menu-trigger"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white focus:outline-none"
            >
              <div className="w-6 h-6 rounded-lg bg-violet-500/10 dark:bg-violet-600/20 border border-violet-500/20 dark:border-violet-500/30 flex items-center justify-center font-display font-bold text-[11px] text-violet-600 dark:text-violet-300">
                {userInitial}
              </div>
              <ChevronDown className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
            </button>

            {/* User Dropdown Drawer */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-white/5 backdrop-blur-2xl shadow-2xl p-3 z-50 text-neutral-800 dark:text-white"
                  >
                    <div className="px-2 py-1.5 mb-2 border-b border-zinc-100 dark:border-white/5">
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{user?.username}</div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{user?.email}</div>
                    </div>

                    <button
                      id="dropdown-profile-link"
                      onClick={() => {
                        onOpenApp('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      View Profile
                    </button>

                    <button
                      id="dropdown-signout"
                      onClick={() => {
                        onSignOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs hover:bg-red-600/5 dark:hover:bg-red-600/10 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 transition-colors text-left mt-1.5"
                    >
                      <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
                      Lock Workspace
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Notifications Drawer */}
      <AnimatePresence>
        {isNotificationOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-14 right-4 w-80 max-h-[80vh] flex flex-col rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-white/5 backdrop-blur-2xl shadow-2xl p-4 z-50 text-neutral-800 dark:text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-violet-500 text-white px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMarkAllAsRead}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-white/5 text-[10px] text-neutral-500 hover:text-neutral-800 flex items-center gap-0.5 font-bold"
                      title="Mark all as read"
                    >
                      <Check className="w-3 h-3" />
                      <span>Read All</span>
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="p-1 rounded hover:bg-red-500/10 text-[10px] text-red-500 hover:text-red-600 flex items-center gap-0.5 font-bold"
                      title="Clear all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications list */}
              <div className="flex-1 overflow-y-auto py-2 divide-y divide-zinc-100 dark:divide-white/5 space-y-2">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-neutral-400">
                    <div className="p-2.5 bg-zinc-100 dark:bg-neutral-800/30 rounded-xl mb-2 border border-zinc-200/50 dark:border-white/5">
                      <Bell className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">No New Notifications</div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-500 mt-1 max-w-[180px]">
                      Your first-party productivity modules will push real-time alerts and due reminders here.
                    </div>
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div
                      key={notif.id}
                      className={`flex gap-3 py-2.5 transition-opacity ${notif.read ? 'opacity-60' : 'opacity-100'}`}
                    >
                      <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl h-fit">
                        {renderIcon(notif.icon)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold block leading-tight text-neutral-800 dark:text-neutral-200 truncate pr-1">
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal mt-0.5">
                          {notif.message}
                        </p>
                        <span className="text-[8px] text-neutral-400 dark:text-neutral-500 block mt-1 font-mono">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
