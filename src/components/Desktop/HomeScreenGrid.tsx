/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { AppManifest } from '../../types';

interface HomeScreenGridProps {
  apps: AppManifest[];
  onOpenApp: (appId: string) => void;
  accentClass: string;
}

export default function HomeScreenGrid({ apps, onOpenApp, accentClass }: HomeScreenGridProps) {
  const getAppStyle = (appId: string) => {
    switch (appId) {
      case 'daily-briefing':
        return {
          bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/15 dark:hover:bg-indigo-500/25',
          glow: 'shadow-indigo-500/5',
        };
      case 'notes':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 dark:hover:bg-amber-500/25',
          glow: 'shadow-amber-500/5',
        };
      case 'tasks':
        return {
          bg: 'bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/20 dark:border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/15 dark:hover:bg-violet-500/25',
          glow: 'shadow-violet-500/5',
        };
      case 'calendar':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/20 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 dark:hover:bg-rose-500/25',
          glow: 'shadow-rose-500/5',
        };
      case 'bills':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/25',
          glow: 'shadow-emerald-500/5',
        };
      case 'subscriptions':
        return {
          bg: 'bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/20 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/15 dark:hover:bg-cyan-500/25',
          glow: 'shadow-cyan-500/5',
        };
      case 'grocery':
        return {
          bg: 'bg-orange-500/10 dark:bg-orange-500/20 border-orange-500/20 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/15 dark:hover:bg-orange-500/25',
          glow: 'shadow-orange-500/5',
        };
      case 'pantry':
        return {
          bg: 'bg-amber-600/10 dark:bg-amber-600/20 border-amber-600/20 dark:border-amber-600/30 text-amber-600 dark:text-amber-400 hover:bg-amber-600/15 dark:hover:bg-amber-600/25',
          glow: 'shadow-amber-600/5',
        };
      case 'inventory':
        return {
          bg: 'bg-zinc-500/10 dark:bg-zinc-500/20 border-zinc-500/20 dark:border-zinc-500/30 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/15 dark:hover:bg-zinc-500/25',
          glow: 'shadow-zinc-500/5',
        };
      case 'documents':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/15 dark:hover:bg-blue-500/25',
          glow: 'shadow-blue-500/5',
        };
      case 'vehicle':
        return {
          bg: 'bg-slate-500/10 dark:bg-slate-500/20 border-slate-500/20 dark:border-slate-500/30 text-slate-600 dark:text-slate-400 hover:bg-slate-500/15 dark:hover:bg-slate-500/25',
          glow: 'shadow-slate-500/5',
        };
      case 'health':
        return {
          bg: 'bg-pink-500/10 dark:bg-pink-500/20 border-pink-500/20 dark:border-pink-500/30 text-pink-600 dark:text-pink-400 hover:bg-pink-500/15 dark:hover:bg-pink-500/25',
          glow: 'shadow-pink-500/5',
        };
      case 'profile':
        return {
          bg: 'bg-teal-500/10 dark:bg-teal-500/20 border-teal-500/20 dark:border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/15 dark:hover:bg-teal-500/25',
          glow: 'shadow-teal-500/5',
        };
      case 'settings':
        return {
          bg: 'bg-neutral-500/10 dark:bg-neutral-500/20 border-neutral-500/20 dark:border-neutral-500/30 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-500/15 dark:hover:bg-neutral-500/25',
          glow: 'shadow-neutral-500/5',
        };
      case 'about':
        return {
          bg: 'bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/20 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 hover:bg-sky-500/15 dark:hover:bg-sky-500/25',
          glow: 'shadow-sky-500/5',
        };
      default:
        return {
          bg: 'bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/20 dark:border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/15 dark:hover:bg-violet-500/25',
          glow: 'shadow-violet-500/5',
        };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const filteredApps = apps.filter((app) => !['profile', 'settings', 'about'].includes(app.id));

  return (
    <div className="absolute inset-0 px-4 sm:px-8 py-20 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pointer-events-auto flex flex-col">
      {/* Responsive frosted glass backing panel on mobile for excellent wallpaper contrast */}
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto sm:mx-0 flex flex-col max-sm:bg-white/40 max-sm:dark:bg-zinc-950/45 max-sm:backdrop-blur-xl max-sm:rounded-3xl max-sm:p-5 max-sm:border max-sm:border-white/15 max-sm:dark:border-white/5 max-sm:shadow-xl max-sm:shadow-black/5 max-sm:mt-2">
        {/* Title / Welcoming Message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 mt-2 text-center sm:text-left"
        >
          <h2 className="text-sm font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest [text-shadow:_0_1px_2px_rgba(255,255,255,0.7)] dark:[text-shadow:_0_1px_2px_rgba(0,0,0,0.6)]">
            Desktop Applications
          </h2>
        </motion.div>

        {/* Grid of Apps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-8 gap-x-4 pb-4 sm:pb-32"
        >
          {filteredApps.map((app) => {
            const IconComponent = (LucideIcons as any)[app.icon] || LucideIcons.HelpCircle;
            const style = getAppStyle(app.id);

            return (
              <motion.button
                key={app.id}
                variants={itemVariants}
                whileTap={{ scale: 0.92 }}
                onClick={() => onOpenApp(app.id)}
                className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                id={`home-app-${app.id}`}
              >
                {/* Launcher Icon Container */}
                <div
                  className={`w-[60px] h-[60px] sm:w-[64px] sm:h-[64px] rounded-2xl flex items-center justify-center border backdrop-blur-md shadow-sm transition-all duration-300 ${style.bg} ${style.glow} group-hover:scale-105 active:scale-95`}
                >
                  <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>

                {/* Application Title with high-contrast drop-shadow for peak wallpaper legibility */}
                <span className="text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-100 text-center px-1 truncate w-full group-hover:text-neutral-900 dark:group-hover:text-white transition-colors [text-shadow:_0_1px_2px_rgba(255,255,255,0.85)] dark:[text-shadow:_0_1px_2px_rgba(0,0,0,0.85)]">
                  {app.title}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
