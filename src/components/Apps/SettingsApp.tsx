/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Palette, 
  Monitor, 
  Settings2, 
  Sliders, 
  Check, 
  User as UserIcon, 
  Info, 
  Gauge, 
  Sparkles,
  RefreshCw,
  AppWindow,
  MonitorCheck,
  LayoutGrid
} from 'lucide-react';
import { UserPreferences, ThemeMode, User } from '../../types';
import { WALLPAPERS, ACCENT_COLORS, DbService } from '../../services/db';
import WallpaperDesigns from '../Desktop/WallpaperDesigns';

interface SettingsAppProps {
  userId: string;
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: UserPreferences) => void;
  currentUser?: User | null;
  onUpdateUser?: (updatedUser: User) => void;
  openWindowsCount?: number;
}

export default function SettingsApp({ 
  userId, 
  preferences, 
  onUpdatePreferences,
  currentUser,
  onUpdateUser,
  openWindowsCount = 0
}: SettingsAppProps) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'dock-taskbar' | 'general' | 'display' | 'widgets'>('appearance');
  
  // States for user customization in "General"
  const [usernameInput, setUsernameInput] = useState(currentUser?.username || '');
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Preference update wrappers
  const handlePreferenceChange = (updatedFields: Partial<UserPreferences>) => {
    const updated = DbService.savePreferences(userId, updatedFields);
    onUpdatePreferences(updated);
  };

  // Profile Update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMessage(null);
    setUpdateError(null);

    if (!usernameInput.trim()) {
      setUpdateError('Username cannot be empty.');
      return;
    }

    try {
      const updatedUser = DbService.updateUser(userId, usernameInput);
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
      setUpdateMessage('Profile updated successfully.');
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update username.');
    }
  };

  // Display System Info Values
  const systemInfo = React.useMemo(() => {
    const userCount = DbService.getUserCount();
    return {
      osName: 'AdultingOS',
      osVersion: 'v1.0.0 (Stable)',
      platform: 'React 19 & WebAssembly Sandboxed Context',
      registeredUsers: userCount,
      viewport: `${window.innerWidth} x ${window.innerHeight} px`,
      memory: '256MB Virtual Sandbox VM',
    };
  }, []);

  return (
    <div className="flex h-full text-neutral-800 dark:text-zinc-100 font-sans select-none overflow-hidden bg-zinc-50 dark:bg-zinc-900/40">
      {/* Sidebar navigation */}
      <div className="w-1/3 border-r border-zinc-200/60 dark:border-white/5 bg-zinc-100/50 dark:bg-black/10 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider px-2.5 py-1.5">
          Personalization
        </div>
        
        <button 
          onClick={() => setActiveTab('appearance')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'appearance'
              ? 'bg-violet-500/10 dark:bg-white/[0.04] text-violet-600 dark:text-violet-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-white/[0.02]'
          }`}
        >
          <Palette className="w-4 h-4" />
          Appearance
        </button>

        <button 
          id="tab-dock-taskbar"
          onClick={() => setActiveTab('dock-taskbar')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'dock-taskbar'
              ? 'bg-violet-500/10 dark:bg-white/[0.04] text-violet-600 dark:text-violet-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-white/[0.02]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Dock & Taskbar
        </button>

        <button 
          id="tab-widgets"
          onClick={() => setActiveTab('widgets')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'widgets'
              ? 'bg-violet-500/10 dark:bg-white/[0.04] text-violet-600 dark:text-violet-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-white/[0.02]'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Desktop Widgets
        </button>
        
        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider px-2.5 py-3">
          System Options
        </div>
        
        <button 
          id="tab-general"
          onClick={() => setActiveTab('general')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'general'
              ? 'bg-violet-500/10 dark:bg-white/[0.04] text-violet-600 dark:text-violet-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-white/[0.02]'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          General
        </button>

        <button 
          id="tab-display"
          onClick={() => setActiveTab('display')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'display'
              ? 'bg-violet-500/10 dark:bg-white/[0.04] text-violet-600 dark:text-violet-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-white/[0.02]'
          }`}
        >
          <Monitor className="w-4 h-4" />
          Display
        </button>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-white/10">
        
        {/* ==================== APPEARANCE TAB ==================== */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Theme Mode</h3>
              <div className="grid grid-cols-3 gap-2.5">
                {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handlePreferenceChange({ theme: mode })}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border capitalize text-xs font-semibold transition-all ${
                      preferences.theme === mode
                        ? 'bg-violet-500/10 dark:bg-violet-600/10 border-violet-500 text-violet-600 dark:text-white shadow-md'
                        : 'bg-white dark:bg-white/[0.02] border-zinc-200 dark:border-white/5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {preferences.theme === mode && (
                      <span className="absolute top-1.5 right-1.5 bg-violet-500 text-white rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <span>{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Accent Color</h3>
              <div className="flex flex-wrap gap-2.5">
                {ACCENT_COLORS.map((accent) => (
                  <button
                    key={accent.id}
                    onClick={() => handlePreferenceChange({ accentColor: accent.id })}
                    title={accent.name}
                    className={`group relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${
                      preferences.accentColor === accent.id
                        ? 'border-violet-500 shadow-md scale-105 bg-white dark:bg-white/[0.06]'
                        : 'border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:scale-102'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-lg ${accent.colorClass} shadow-inner flex items-center justify-center`}>
                      {preferences.accentColor === accent.id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Desktop Wallpaper</h3>
              <div className="grid grid-cols-2 gap-3">
                {WALLPAPERS.map((wall) => (
                  <button
                    key={wall.id}
                    onClick={() => handlePreferenceChange({ wallpaper: wall.id })}
                    className={`relative flex flex-col items-start p-2 rounded-xl border transition-all text-left w-full ${
                      preferences.wallpaper === wall.id
                        ? 'border-violet-500 bg-violet-500/[0.03] dark:bg-white/[0.05]'
                        : 'border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`relative w-full h-16 rounded-lg ${wall.className} mb-2 shadow-inner border border-zinc-200/50 dark:border-white/5 overflow-hidden`}>
                      <WallpaperDesigns wallpaperId={wall.id} isThumbnail />
                    </div>
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">{wall.name}</span>
                      {preferences.wallpaper === wall.id && (
                        <span className="bg-violet-500 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== DOCK & TASKBAR TAB ==================== */}
        {activeTab === 'dock-taskbar' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Dock Screen Position</h3>
              <p className="text-[11px] text-neutral-400 mb-3.5">Choose where the persistent applications Dock rests on your screen canvas.</p>
              
              <div className="grid grid-cols-3 gap-2.5">
                {(['bottom', 'left', 'right'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => handlePreferenceChange({ dockPosition: pos })}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border capitalize text-xs font-semibold transition-all ${
                      preferences.dockPosition === pos
                        ? 'bg-violet-500/10 dark:bg-violet-600/10 border-violet-500 text-violet-600 dark:text-white shadow-md'
                        : 'bg-white dark:bg-white/[0.02] border-zinc-200 dark:border-white/5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {preferences.dockPosition === pos && (
                      <span className="absolute top-1.5 right-1.5 bg-violet-500 text-white rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <span className="text-xs font-semibold">{pos}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200/60 dark:border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Interface Features</h3>
              
              <button 
                onClick={() => handlePreferenceChange({ magnifyDock: preferences.magnifyDock === false ? true : false })}
                className="flex items-center justify-between w-full p-3 rounded-xl bg-white dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 text-left focus:outline-none cursor-pointer"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold">Magnify Dock Icons</span>
                  <span className="text-[10px] text-neutral-400">Scale up icons smoothly when your cursor hovers over the Dock tray.</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <div className={`w-9 h-5 rounded-full transition-colors ${preferences.magnifyDock !== false ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                  <div className={`absolute top-0.5 bg-white w-4 h-4 rounded-full shadow-md transition-all duration-200 ${preferences.magnifyDock !== false ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </button>

              <button 
                onClick={() => handlePreferenceChange({ showFullDate: preferences.showFullDate === false ? true : false })}
                className="flex items-center justify-between w-full p-3 rounded-xl bg-white dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 text-left focus:outline-none cursor-pointer"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold">Show Complete Calendar Date</span>
                  <span className="text-[10px] text-neutral-400">Display full weekday and month names in the middle of your Taskbar.</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <div className={`w-9 h-5 rounded-full transition-colors ${preferences.showFullDate !== false ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                  <div className={`absolute top-0.5 bg-white w-4 h-4 rounded-full shadow-md transition-all duration-200 ${preferences.showFullDate !== false ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ==================== GENERAL TAB ==================== */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Display Name / Username change form */}
            <div>
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Change Workspace Owner Name</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div className="flex gap-2.5">
                  <input
                    id="settings-username-input"
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="New display name"
                    className="flex-1 bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-neutral-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <button
                    id="settings-save-username"
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 py-2 text-xs font-medium transition-colors"
                  >
                    Save
                  </button>
                </div>
                
                {updateMessage && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> {updateMessage}
                  </div>
                )}
                {updateError && (
                  <div className="text-[11px] text-rose-500 flex items-center gap-1.5">
                    <span>⚠</span> {updateError}
                  </div>
                )}
              </form>
            </div>

            {/* Factory Reset button */}
            <div className="pt-4 border-t border-zinc-200/60 dark:border-white/5">
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Reset Desktop System</h3>
              <p className="text-[11px] text-neutral-400 mb-3">Revert all user preferences and UI adjustments to the clean factory default setup.</p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to restore all settings to default?")) {
                    const defaults = DbService.savePreferences(userId, {
                      theme: 'dark',
                      wallpaper: 'gradient-aurora',
                      accentColor: 'violet',
                      dockPosition: 'bottom',
                      uiScale: 'standard',
                      blurIntensity: 'medium',
                      magnifyDock: true,
                      showFullDate: true,
                    });
                    onUpdatePreferences(defaults);
                  }
                }}
                className="bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-800 dark:text-neutral-200 border border-zinc-200 dark:border-white/5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
              >
                Restore Factory Settings
              </button>
            </div>

            {/* Performance metrics */}
            <div className="pt-4 border-t border-zinc-200/60 dark:border-white/5">
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">System Information</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 rounded-xl">
                  <div className="text-[10px] text-neutral-400 uppercase">OS Environment</div>
                  <div className="text-xs font-bold mt-1 text-neutral-700 dark:text-neutral-200">{systemInfo.osName}</div>
                </div>
                <div className="p-3 bg-white dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 rounded-xl">
                  <div className="text-[10px] text-neutral-400 uppercase">OS Build Version</div>
                  <div className="text-xs font-bold mt-1 text-neutral-700 dark:text-neutral-200">{systemInfo.osVersion}</div>
                </div>
                <div className="p-3 bg-white dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 rounded-xl">
                  <div className="text-[10px] text-neutral-400 uppercase">Active Core Users</div>
                  <div className="text-xs font-bold mt-1 text-neutral-700 dark:text-neutral-200">{systemInfo.registeredUsers}</div>
                </div>
                <div className="p-3 bg-white dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 rounded-xl">
                  <div className="text-[10px] text-neutral-400 uppercase">Screen Dimensions</div>
                  <div className="text-xs font-bold mt-1 text-neutral-700 dark:text-neutral-200">{systemInfo.viewport}</div>
                </div>
                <div className="p-3 bg-white dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 rounded-xl col-span-2">
                  <div className="text-[10px] text-neutral-400 uppercase">Active Loaded Window Instances</div>
                  <div className="text-xs font-bold mt-1 text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5">
                    <AppWindow className="w-3.5 h-3.5 text-violet-500" />
                    <span>{openWindowsCount} apps active in memory</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== DISPLAY TAB ==================== */}
        {activeTab === 'display' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Display UI Scaling</h3>
              <p className="text-[11px] text-neutral-400 mb-3">Adjust the sizing of text, icons, and layout parameters inside all OS windows.</p>
              
              <div className="grid grid-cols-3 gap-2.5">
                {(['compact', 'standard', 'large'] as const).map((scale) => (
                  <button
                    key={scale}
                    onClick={() => handlePreferenceChange({ uiScale: scale })}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border capitalize text-xs font-semibold transition-all ${
                      (preferences.uiScale || 'standard') === scale
                        ? 'bg-violet-500/10 dark:bg-violet-600/10 border-violet-500 text-violet-600 dark:text-white shadow-md'
                        : 'bg-white dark:bg-white/[0.02] border-zinc-200 dark:border-white/5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {(preferences.uiScale || 'standard') === scale && (
                      <span className="absolute top-1.5 right-1.5 bg-violet-500 text-white rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <span>{scale}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200/60 dark:border-white/5">
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Glass Blurring Density</h3>
              <p className="text-[11px] text-neutral-400 mb-3">Tweak backdrop blurring values to fine-tune visual speed and translucency.</p>
              
              <div className="grid grid-cols-3 gap-2.5">
                {(['none', 'medium', 'high'] as const).map((blur) => (
                  <button
                    key={blur}
                    onClick={() => handlePreferenceChange({ blurIntensity: blur })}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border capitalize text-xs font-semibold transition-all ${
                      (preferences.blurIntensity || 'medium') === blur
                        ? 'bg-violet-500/10 dark:bg-violet-600/10 border-violet-500 text-violet-600 dark:text-white shadow-md'
                        : 'bg-white dark:bg-white/[0.02] border-zinc-200 dark:border-white/5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {(preferences.blurIntensity || 'medium') === blur && (
                      <span className="absolute top-1.5 right-1.5 bg-violet-500 text-white rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <span>{blur === 'none' ? 'Disabled' : blur}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== WIDGETS TAB ==================== */}
        {activeTab === 'widgets' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Desktop Widget System</h3>
              <p className="text-[11px] text-neutral-400 mb-4">Toggle which interactive widgets are pinned directly onto your desktop workspace canvas. Widgets update automatically as your modules receive updates.</p>
              
              <div className="space-y-3">
                {[
                  {
                    id: 'tasks',
                    title: 'Task Checklist',
                    desc: 'Real-time daily to-dos list with quick-add & completion check-offs directly from desktop.',
                    iconColor: 'text-violet-500'
                  },
                  {
                    id: 'health',
                    title: 'Daily Wellness (Health)',
                    desc: 'A tracker for checking off daily medications and logging water hydration targets.',
                    iconColor: 'text-emerald-500'
                  },
                  {
                    id: 'bills',
                    title: 'Upcoming Bills (Finance)',
                    desc: 'A financial dashboard widget showing upcoming due dates with direct Pay action.',
                    iconColor: 'text-rose-500'
                  },
                  {
                    id: 'notes',
                    title: 'Sticky Note pad',
                    desc: 'An auto-saving yellow notepad widget that syncs continuously with your Notes app.',
                    iconColor: 'text-amber-500'
                  },
                  {
                    id: 'subscriptions',
                    title: 'Subscription Spend',
                    desc: 'An automated financial overview of active subscriptions, monthly footprint & renewal alarms.',
                    iconColor: 'text-indigo-500'
                  },
                  {
                    id: 'pantry',
                    title: 'Pantry Monitor',
                    desc: 'Alarms for items with low stock or approaching expiration dates with custom +1 restock trigger.',
                    iconColor: 'text-orange-500'
                  }
                ].map((widget) => {
                  const currentWidgets = preferences.widgets || ['tasks', 'health', 'bills', 'notes'];
                  const isEnabled = currentWidgets.includes(widget.id);

                  const toggleWidget = () => {
                    const nextWidgets = isEnabled 
                      ? currentWidgets.filter(id => id !== widget.id)
                      : [...currentWidgets, widget.id];
                    handlePreferenceChange({ widgets: nextWidgets });
                  };

                  return (
                    <div 
                      key={widget.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 text-left"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0 pr-3">
                        <div className={`p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.04] mt-0.5 ${widget.iconColor}`}>
                          <LayoutGrid className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">{widget.title}</span>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-400 leading-normal">{widget.desc}</span>
                        </div>
                      </div>

                      <button 
                        onClick={toggleWidget}
                        className="relative inline-flex items-center cursor-pointer flex-shrink-0"
                      >
                        <div className={`w-9 h-5 rounded-full transition-colors ${isEnabled ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                        <div className={`absolute top-0.5 bg-white w-4 h-4 rounded-full shadow-md transition-all duration-200 ${isEnabled ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
