/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Terminal, Shield } from 'lucide-react';

export default function AboutApp() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-neutral-800 dark:text-white font-sans select-none bg-zinc-50 dark:bg-transparent">
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Animated custom logo icon */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 shadow-inner mb-4">
          <Sparkles className="w-8 h-8 text-violet-500 dark:text-violet-400 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl bg-violet-500/10 blur-md -z-10" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight font-display text-neutral-800 dark:text-white">
          LifeDesk<span className="text-violet-500 dark:text-violet-400">OS</span>
        </h2>
        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-1">
          v1.0.0 (Phase 1 Foundation)
        </p>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-4 leading-relaxed">
          A premium, desktop-inspired digital workspace designed to help you organize, optimize, and master your daily adult responsibilities.
        </p>

        <div className="grid grid-cols-2 gap-3 w-full mt-6">
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 text-center shadow-sm">
            <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mb-1" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Isolated Cloud</span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">Zero Data Leaks</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 text-center shadow-sm">
            <Terminal className="w-4 h-4 text-sky-500 dark:text-sky-400 mb-1" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Micro-Kernel</span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">Plug & Play Apps</span>
          </div>
        </div>

        <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-6 pt-4 border-t border-zinc-200/50 dark:border-white/5 w-full">
          Designed with ♥ for a cohesive life experience.
        </div>
      </div>
    </div>
  );
}
