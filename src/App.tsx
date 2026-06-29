/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { User, UserPreferences, WindowInstance } from './types';
import { DbService, WALLPAPERS, DEFAULT_PREFERENCES } from './services/db';
import { APPS } from './services/apps';

// Component Imports
import LoginScreen from './components/Auth/LoginScreen';
import Taskbar from './components/Desktop/Taskbar';
import Dock from './components/Desktop/Dock';
import Window from './components/Desktop/Window';
import WallpaperDesigns from './components/Desktop/WallpaperDesigns';

// App Views
import ProfileApp from './components/Apps/ProfileApp';
import SettingsApp from './components/Apps/SettingsApp';
import AboutApp from './components/Apps/AboutApp';
import DailyBriefingApp from './components/Apps/DailyBriefingApp';
import NotesApp from './components/Apps/NotesApp';
import TasksApp from './components/Apps/TasksApp';
import CalendarApp from './components/Apps/CalendarApp';
import BillsApp from './components/Apps/BillsApp';
import SubscriptionsApp from './components/Apps/SubscriptionsApp';
import GroceryApp from './components/Apps/GroceryApp';
import PantryApp from './components/Apps/PantryApp';
import InventoryApp from './components/Apps/InventoryApp';
import DocumentsApp from './components/Apps/DocumentsApp';
import VehicleApp from './components/Apps/VehicleApp';
import HealthApp from './components/Apps/HealthApp';

import CommandPalette from './components/Desktop/CommandPalette';
import DesktopWidgets from './components/Desktop/DesktopWidgets';
import HomeScreenGrid from './components/Desktop/HomeScreenGrid';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCompact = windowWidth < 1024;
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Window Manager States
  const [openWindows, setOpenWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Desktop drag boundaries ref
  const desktopRef = useRef<HTMLDivElement | null>(null);

  // Ctrl + K shortcut to toggle command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isRestoredRef = useRef(false);

  // Check if user is already authenticated in session
  useEffect(() => {
    const cachedUser = localStorage.getItem('adulting_os_current_user');
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
        const prefs = DbService.getPreferences(parsedUser.id);
        setPreferences(prefs);

        // Restore saved window layout for this user
        const savedWindows = localStorage.getItem(`adulting_os_open_windows_${parsedUser.id}`);
        if (savedWindows) {
          setOpenWindows(JSON.parse(savedWindows));
        }
        const savedActive = localStorage.getItem(`adulting_os_active_window_${parsedUser.id}`);
        if (savedActive) {
          setActiveWindowId(savedActive);
        }
        const savedZ = localStorage.getItem(`adulting_os_next_z_index_${parsedUser.id}`);
        if (savedZ) {
          setNextZIndex(parseInt(savedZ, 10));
        }
      } catch (e) {
        console.error('Failed to parse cached session user:', e);
      }
    }
    isRestoredRef.current = true;
    setIsAuthLoading(false);
  }, []);

  // Automatically persist window state changes for the current user
  useEffect(() => {
    if (user && isRestoredRef.current) {
      localStorage.setItem(`adulting_os_open_windows_${user.id}`, JSON.stringify(openWindows));
    }
  }, [openWindows, user]);

  useEffect(() => {
    if (user && isRestoredRef.current) {
      if (activeWindowId) {
        localStorage.setItem(`adulting_os_active_window_${user.id}`, activeWindowId);
      } else {
        localStorage.removeItem(`adulting_os_active_window_${user.id}`);
      }
    }
  }, [activeWindowId, user]);

  useEffect(() => {
    if (user && isRestoredRef.current) {
      localStorage.setItem(`adulting_os_next_z_index_${user.id}`, nextZIndex.toString());
    }
  }, [nextZIndex, user]);

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem('adulting_os_current_user', JSON.stringify(authenticatedUser));
    const prefs = DbService.getPreferences(authenticatedUser.id);
    setPreferences(prefs);
    
    // Check if we already have saved windows we should restore
    const savedWindows = localStorage.getItem(`adulting_os_open_windows_${authenticatedUser.id}`);
    if (savedWindows) {
      try {
        const parsedWindows = JSON.parse(savedWindows);
        if (parsedWindows.length > 0) {
          setOpenWindows(parsedWindows);
          const savedActive = localStorage.getItem(`adulting_os_active_window_${authenticatedUser.id}`);
          if (savedActive) {
            setActiveWindowId(savedActive);
          }
          const savedZ = localStorage.getItem(`adulting_os_next_z_index_${authenticatedUser.id}`);
          if (savedZ) {
            setNextZIndex(parseInt(savedZ, 10));
          }
          return; // Skip opening About App if we are restoring previous window session
        }
      } catch (e) {
        console.error('Failed to restore windows during login:', e);
      }
    }

    // Automatically open the About App as a welcoming experience if no windows restored
    setTimeout(() => {
      openApp('about');
    }, 400);
  };

  const handleSignOut = () => {
    // Clear user session to lock the workspace, but preserve the window layout in localStorage for their next session
    setUser(null);
    setOpenWindows([]);
    setActiveWindowId(null);
    localStorage.removeItem('adulting_os_current_user');
  };

  // --------------------------------------------------------
  // Window Manager Handlers
  // --------------------------------------------------------

  const openApp = (appId: string) => {
    const manifest = APPS.find(a => a.id === appId);
    if (!manifest) return;

    // Check if single instance app is already open
    const existingWindow = openWindows.find(w => w.appId === appId);
    if (manifest.isSingleInstance && existingWindow) {
      // If minimized, restore it
      if (existingWindow.isMinimized) {
        setOpenWindows(prev =>
          prev.map(w => (w.id === existingWindow.id ? { ...w, isMinimized: false } : w))
        );
      }
      focusWindow(existingWindow.id);
      return;
    }

    // Centering window logic based on viewport or container
    const width = manifest.defaultWidth;
    const height = manifest.defaultHeight;
    const paddingX = 100;
    const paddingY = 80;

    // Standard waterfall position
    const offset = openWindows.length * 25;
    const x = Math.max(20, Math.min(window.innerWidth - width - 20, 100 + offset));
    const y = Math.max(20, Math.min(window.innerHeight - height - 120, 60 + offset));

    const newWindowId = `${appId}_${Date.now()}`;
    const newWindow: WindowInstance = {
      id: newWindowId,
      appId,
      title: manifest.title,
      isMinimized: false,
      isMaximized: false,
      x,
      y,
      width,
      height,
      zIndex: nextZIndex,
    };

    setNextZIndex(prev => prev + 1);
    setOpenWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindowId);
  };

  const closeWindow = (id: string) => {
    setOpenWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      // Focus the next available window
      const remaining = openWindows.filter(w => w.id !== id && !w.isMinimized);
      if (remaining.length > 0) {
        // Sort by zIndex descending to find the highest window
        const sorted = [...remaining].sort((a, b) => b.zIndex - a.zIndex);
        setActiveWindowId(sorted[0].id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const minimizeWindow = (id: string) => {
    setOpenWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));
    if (activeWindowId === id) {
      const remaining = openWindows.filter(w => w.id !== id && !w.isMinimized);
      if (remaining.length > 0) {
        const sorted = [...remaining].sort((a, b) => b.zIndex - a.zIndex);
        setActiveWindowId(sorted[0].id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const maximizeWindow = (id: string) => {
    setOpenWindows(prev => prev.map(w => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)));
    focusWindow(id);
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    // Move window to top z-index if not already top
    const win = openWindows.find(w => w.id === id);
    if (win && win.zIndex < nextZIndex - 1) {
      setOpenWindows(prev =>
        prev.map(w => (w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w))
      );
      setNextZIndex(prev => prev + 1);
    }
  };

  const resizeWindow = (id: string, width: number, height: number) => {
    setOpenWindows(prev => prev.map(w => (w.id === id ? { ...w, width, height } : w)));
  };

  const moveWindow = (id: string, x: number, y: number) => {
    // Clamp coordinates to keep window partially visible/inside desktop area
    const minVisible = 40;
    const clampedX = Math.max(-minVisible, Math.min(window.innerWidth - minVisible, x));
    const clampedY = Math.max(0, Math.min(window.innerHeight - minVisible, y));

    setOpenWindows(prev => prev.map(w => (w.id === id ? { ...w, x: clampedX, y: clampedY } : w)));
  };

  const handleDockIconClick = (appId: string) => {
    // If clicking an icon that is already open and minimized, restore it
    const existing = openWindows.find(w => w.appId === appId);
    if (existing) {
      if (existing.isMinimized) {
        setOpenWindows(prev => prev.map(w => (w.id === existing.id ? { ...w, isMinimized: false } : w)));
      }
      focusWindow(existing.id);
    } else {
      openApp(appId);
    }
  };

  // Theme support class
  const themeClass = preferences.theme === 'dark' || (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : '';

  // Get active wallpaper background gradient/color
  const activeWallpaper = WALLPAPERS.find(w => w.id === preferences.wallpaper) || WALLPAPERS[0];

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/25 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-xs text-neutral-400">Restoring Digital Environment...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${themeClass} min-h-screen w-full select-none overflow-hidden font-sans`}>
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <LoginScreen onSuccess={handleAuthSuccess} />
          </motion.div>
        ) : (
          <motion.div
            key="desktop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`relative w-full h-screen ${activeWallpaper.className} flex flex-col`}
          >
            {/* Dynamic Wallpaper Designs Overlay */}
            <WallpaperDesigns wallpaperId={activeWallpaper.id} />

            {/* Taskbar Top */}
            <Taskbar
              user={user}
              onSignOut={handleSignOut}
              onOpenApp={openApp}
              accentClass={preferences.accentColor}
              showFullDate={preferences.showFullDate !== false}
            />

            {/* Floating Desktop Area containing windows */}
            <div
              ref={desktopRef}
              id="desktop-canvas"
              className="flex-1 w-full relative overflow-hidden"
              onClick={(e) => {
                // If clicking directly on desktop canvas, unfocus current active window
                if (e.target === e.currentTarget) {
                  setActiveWindowId(null);
                }
              }}
            >
              {/* Interactive Desktop Widgets Layer */}
              {user && (
                <DesktopWidgets 
                  user={user}
                  preferences={preferences}
                  onOpenApp={openApp}
                  onUpdatePreferences={setPreferences}
                />
              )}

              {/* Home Screen App Grid for Mobile & Tablet */}
              {user && isCompact && (
                <HomeScreenGrid
                  apps={APPS}
                  onOpenApp={openApp}
                  accentClass={preferences.accentColor}
                />
              )}

              <AnimatePresence>
                {openWindows.map((win) => (
                  <Window
                    key={win.id}
                    windowState={win}
                    onClose={closeWindow}
                    onMinimize={minimizeWindow}
                    onMaximize={maximizeWindow}
                    onFocus={focusWindow}
                    onResize={resizeWindow}
                    onMove={moveWindow}
                    activeWindowId={activeWindowId}
                    uiScale={preferences.uiScale}
                    blurIntensity={preferences.blurIntensity}
                  >
                    {/* Render exact application view inside the draggable container */}
                    {win.appId === 'profile' && (
                      <ProfileApp user={user} onSignOut={handleSignOut} />
                    )}
                    {win.appId === 'settings' && (
                      <SettingsApp
                        userId={user.id}
                        preferences={preferences}
                        onUpdatePreferences={setPreferences}
                        currentUser={user}
                        onUpdateUser={(updatedUser) => {
                          setUser(updatedUser);
                          localStorage.setItem('adulting_os_current_user', JSON.stringify(updatedUser));
                        }}
                        openWindowsCount={openWindows.length}
                      />
                    )}
                    {win.appId === 'about' && (
                      <AboutApp />
                    )}
                    {win.appId === 'daily-briefing' && (
                      <DailyBriefingApp user={user} />
                    )}
                    {win.appId === 'notes' && (
                      <NotesApp user={user} />
                    )}
                    {win.appId === 'tasks' && (
                      <TasksApp user={user} />
                    )}
                    {win.appId === 'calendar' && (
                      <CalendarApp user={user} />
                    )}
                    {win.appId === 'bills' && (
                      <BillsApp user={user} />
                    )}
                    {win.appId === 'subscriptions' && (
                      <SubscriptionsApp user={user} />
                    )}
                    {win.appId === 'grocery' && (
                      <GroceryApp user={user} />
                    )}
                    {win.appId === 'pantry' && (
                      <PantryApp user={user} />
                    )}
                    {win.appId === 'inventory' && (
                      <InventoryApp user={user} />
                    )}
                    {win.appId === 'documents' && (
                      <DocumentsApp user={user} />
                    )}
                    {win.appId === 'vehicle' && (
                      <VehicleApp user={user} />
                    )}
                    {win.appId === 'health' && (
                      <HealthApp user={user} />
                    )}
                  </Window>
                ))}
              </AnimatePresence>
            </div>

            {/* Command Palette Overlay */}
            {user && (
              <CommandPalette
                user={user}
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                onOpenApp={openApp}
              />
            )}

            {/* Desktop Dock Tray */}
            <Dock
              apps={APPS}
              openAppIds={openWindows.map(w => w.appId)}
              activeAppId={
                openWindows.find(w => w.id === activeWindowId)?.appId || null
              }
              onOpenApp={handleDockIconClick}
              accentColorClass={preferences.accentColor}
              position={preferences.dockPosition || 'bottom'}
              magnifyDock={preferences.magnifyDock !== false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
