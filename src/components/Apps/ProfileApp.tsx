/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogOut, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../../types';

interface ProfileAppProps {
  user: UserType | null;
  onSignOut: () => void;
}

export default function ProfileApp({ user, onSignOut }: ProfileAppProps) {
  if (!user) return null;

  // Format creation date
  const creationDate = React.useMemo(() => {
    try {
      return new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  }, [user.createdAt]);

  // Extract initial for avatar
  const initial = user.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex flex-col h-full p-6 text-neutral-800 dark:text-white font-sans select-none bg-zinc-50 dark:bg-transparent">
      <div className="flex items-center gap-4 pb-6 border-b border-zinc-200/60 dark:border-white/5">
        {/* Avatar */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 dark:bg-violet-600/20 border border-violet-500/30 text-violet-600 dark:text-violet-300 font-display text-2xl font-bold shadow-lg shadow-violet-500/10">
          {initial}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
            <ShieldCheck className="w-3 h-3 text-white" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-800 dark:text-white">{user.username}</h2>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block mt-1">
            Active Workspace Owner
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4 mt-6">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 shadow-sm">
          <Mail className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-semibold">Email Address</span>
            <span className="text-sm text-neutral-700 dark:text-neutral-200 font-medium">{user.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 shadow-sm">
          <Calendar className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-semibold">Workspace Created</span>
            <span className="text-sm text-neutral-700 dark:text-neutral-200 font-medium">{creationDate}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-200/60 dark:border-white/5">
        <button
          id="sign-out-profile-btn"
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-600/10 hover:bg-red-100 dark:hover:bg-red-600/20 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-300 text-sm font-semibold transition-all hover:border-red-300 dark:hover:border-red-500/30"
        >
          <LogOut className="w-4 h-4" />
          Lock Workspace (Sign Out)
        </button>
      </div>
    </div>
  );
}
