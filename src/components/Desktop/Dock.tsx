/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { AppManifest } from '../../types';

interface DockProps {
  apps: AppManifest[];
  openAppIds: string[];
  activeAppId: string | null;
  onOpenApp: (appId: string) => void;
  accentColorClass: string;
  position?: 'bottom' | 'left' | 'right';
  magnifyDock?: boolean;
  onOpenMobileDrawer?: () => void;
}

export default function Dock({ 
  apps, 
  openAppIds, 
  activeAppId, 
  onOpenApp, 
  accentColorClass,
  position = 'bottom',
  magnifyDock = true,
  onOpenMobileDrawer
}: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force bottom position and disable magnification on mobile
  const finalPosition = isMobile ? 'bottom' : position;
  const shouldMagnify = magnifyDock && !isMobile;

  // Compute container and inner layouts based on position
  let containerClass = 'fixed bottom-4 sm:bottom-6 left-0 right-0 flex justify-center pointer-events-none z-40 select-none px-4 transition-all duration-300';
  let innerClass = 'flex items-end gap-3 px-3 py-2 rounded-[24px] max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
  let tooltipClass = 'absolute bottom-[66px] whitespace-nowrap hidden sm:block';
  let indicatorLayout = 'absolute bottom-0 flex justify-center w-full';
  let indicatorStyle = (isActive: boolean): string => isActive ? 'w-4 h-1.5' : 'w-1.5 h-1.5';

  if (finalPosition === 'left') {
    containerClass = 'fixed left-6 top-11 bottom-0 flex items-center pointer-events-none z-40 select-none transition-all duration-300';
    innerClass = 'flex flex-col items-center gap-3.5 px-2.5 py-4 rounded-[24px]';
    tooltipClass = 'absolute left-[66px] top-1/2 -translate-y-1/2 whitespace-nowrap';
    indicatorLayout = 'absolute right-0 top-0 bottom-0 flex items-center h-full pr-1';
    indicatorStyle = (isActive: boolean): string => isActive ? 'h-4 w-1.5' : 'h-1.5 w-1.5';
  } else if (finalPosition === 'right') {
    containerClass = 'fixed right-6 top-11 bottom-0 flex items-center pointer-events-none z-40 select-none transition-all duration-300';
    innerClass = 'flex flex-col items-center gap-3.5 px-2.5 py-4 rounded-[24px]';
    tooltipClass = 'absolute right-[66px] top-1/2 -translate-y-1/2 whitespace-nowrap';
    indicatorLayout = 'absolute left-0 top-0 bottom-0 flex items-center h-full pl-1';
    indicatorStyle = (isActive: boolean): string => isActive ? 'h-4 w-1.5' : 'h-1.5 w-1.5';
  }

  // Slide down and fade out on mobile when apps are open
  if (isMobile && openAppIds.length > 0) {
    containerClass += ' translate-y-24 opacity-0 pointer-events-none';
  }

  return (
    <div className={containerClass}>
      <div className={`${innerClass} bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-white/5 backdrop-blur-2xl shadow-2xl pointer-events-auto transition-all duration-300`}>
        {(() => {
          let visibleApps = isMobile
            ? apps.filter(app => ['profile', 'settings', 'about'].includes(app.id))
            : apps;
          
          if (isMobile && onOpenMobileDrawer) {
            visibleApps = [
              { id: 'mobile-drawer', title: 'App Drawer', icon: 'Grid' } as AppManifest,
              ...visibleApps
            ];
          }

          return visibleApps.map((app, index) => {
            const isDrawer = app.id === 'mobile-drawer';
            // Dynamic Lucide Icon rendering
            const IconComponent = (LucideIcons as any)[app.icon] || LucideIcons.HelpCircle;
            const isOpen = isDrawer ? false : openAppIds.includes(app.id);
            const isActive = isDrawer ? false : activeAppId === app.id;

            // Compute magnification factors
            let scale = 1;
            if (shouldMagnify && hoveredIndex !== null) {
              const distance = Math.abs(index - hoveredIndex);
              if (distance === 0) scale = 1.25;
              else if (distance === 1) scale = 1.12;
            }

            return (
              <button
                key={app.id}
                onClick={() => {
                  if (isDrawer) {
                    onOpenMobileDrawer?.();
                  } else {
                    onOpenApp(app.id);
                  }
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative flex flex-col items-center justify-end focus:outline-none group pb-1 flex-shrink-0"
                style={{ height: isMobile ? '44px' : '54px', width: isMobile ? '44px' : '54px' }}
                title={app.title}
                id={`dock-app-${app.id}`}
              >
                {/* Tooltip */}
                <div className={`${tooltipClass} bg-white/95 dark:bg-zinc-950/85 border border-zinc-200 dark:border-white/5 px-2.5 py-1 rounded-xl text-[10px] font-semibold text-neutral-800 dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-150 backdrop-blur-md pointer-events-none scale-90 group-hover:scale-100 shadow-md`}>
                  {app.title}
                </div>

                {/* Icon Holder */}
                <motion.div
                  animate={{ scale }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                    isMobile ? 'w-9 h-9 rounded-xl' : 'w-12 h-12 rounded-2xl'
                  } ${
                    isDrawer
                      ? 'bg-violet-500/10 dark:bg-violet-500/25 border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 shadow-inner'
                      : isActive
                        ? 'bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/20 shadow-lg text-violet-600 dark:text-violet-400'
                        : 'bg-black/[0.04] dark:bg-white/[0.04] border-zinc-200/60 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 hover:bg-black/[0.08] dark:hover:bg-white/[0.06] text-neutral-600 dark:text-white'
                  }`}
                >
                  <IconComponent className={`${isMobile ? 'w-4.5 h-4.5' : 'w-5 h-5'} transition-colors group-hover:text-violet-500 dark:group-hover:text-violet-400`} />
                </motion.div>

                {/* Active Indicator dot */}
                <div className={indicatorLayout}>
                  {isOpen && (
                    <motion.div
                      layoutId={`dock-indicator-${app.id}`}
                      className={`rounded-full transition-all duration-300 ${indicatorStyle(isActive)} ${
                        isActive ? 'bg-violet-600 dark:bg-violet-400' : 'bg-neutral-400 dark:bg-neutral-500'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          });
        })()}
      </div>
    </div>
  );
}
