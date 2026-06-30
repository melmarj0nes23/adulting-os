/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Facebook, Github, Mail, Coffee } from 'lucide-react';

export default function AboutApp() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-neutral-800 dark:text-white font-sans select-none bg-zinc-50 dark:bg-transparent overflow-y-auto">
      <div className="flex flex-col items-center text-center max-w-sm w-full py-4">
        <h2 className="text-2xl font-bold tracking-tight font-display text-neutral-800 dark:text-white mt-4">
          LifeDesk<span className="text-violet-500 dark:text-violet-400">OS</span>
        </h2>
        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-1">
          v1.0.0
        </p>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-4 leading-relaxed">
          A premium, desktop-inspired digital workspace designed to help you organize, optimize, and master your daily adult responsibilities.
        </p>

        {/* Need Help Section */}
        <div className="w-full mt-6 pt-5 border-t border-zinc-200/50 dark:border-white/5 text-left">
          <h3 className="text-xs font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2.5">
            Need Help or Have Feedback?
          </h3>
          <div className="flex flex-col gap-2">
            <a 
              href="https://facebook.com/melmarj0nes23" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-violet-500 dark:hover:text-violet-400 transition-colors py-1 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              <Facebook className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium">Facebook:</span>
              <span className="font-mono text-neutral-500 dark:text-neutral-400 ml-auto">melmarj0nes23</span>
            </a>
            <a 
              href="https://github.com/melmarj0nes23" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-violet-500 dark:hover:text-violet-400 transition-colors py-1 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              <Github className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
              <span className="font-medium">GitHub:</span>
              <span className="font-mono text-neutral-500 dark:text-neutral-400 ml-auto">melmarj0nes23</span>
            </a>
            <a 
              href="mailto:melmarjvelasco@gmail.com"
              className="flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-violet-500 dark:hover:text-violet-400 transition-colors py-1 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              <Mail className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-medium">Email:</span>
              <span className="font-mono text-neutral-500 dark:text-neutral-400 ml-auto text-[10px]">melmarjvelasco@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Support GCash section */}
        <div className="w-full mt-5 p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/15 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Coffee className="w-4 h-4 animate-bounce" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Buy Me a Coffee</span>
          </div>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 max-w-[280px]">
            This operating system project will be free forever. Your support keeps updates rolling!
          </p>
          <div className="mt-1 px-3 py-1 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300 font-mono">
            <span>GCash:</span>
            <span>09562786351</span>
          </div>
        </div>

        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-6 pt-4 border-t border-zinc-200/50 dark:border-white/5 w-full">
          Designed with ♥ for a cohesive life experience.
        </div>
      </div>
    </div>
  );
}
