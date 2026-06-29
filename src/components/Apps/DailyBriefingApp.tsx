/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, DollarSign, Heart, AlertTriangle, ShieldCheck, Sparkles, Sunrise, Compass, RefreshCw, Car } from 'lucide-react';
import { DbService } from '../../services/db';
import { User, NotificationItem } from '../../types';

interface DailyBriefingAppProps {
  user: User;
}

export default function DailyBriefingApp({ user }: DailyBriefingAppProps) {
  const [briefingData, setBriefingData] = useState<any>(null);

  const assembleBriefing = () => {
    const data = DbService.getUserData(user.id);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Calendar events today
    const eventsToday = (data.events || []).filter((e: any) => e.date === todayStr);

    // 2. Pending tasks
    const pendingTasks = (data.tasks || []).filter((t: any) => !t.completed);

    // 3. Bills upcoming (within next 7 days)
    const upcomingBills = (data.bills || []).filter((b: any) => {
      const diffTime = new Date(b.dueDate).getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return !b.paid && diffDays >= 0 && diffDays <= 7;
    });

    // 4. Meds pending today
    const health = data.health || { medications: [] };
    const pendingMeds = health.medications.filter((m: any) => !m.takenToday);

    // 5. Expiring Documents (within 90 days)
    const expiringDocs = (data.documents || []).filter((d: any) => {
      const diffTime = new Date(d.expirationDate).getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 90;
    });

    // 6. Low stock pantry items
    const lowStockPantry = (data.pantry || []).filter((p: any) => p.quantity <= 1);

    // 7. Vehicle expiry issues
    const vehicleIssues = (data.vehicles || []).filter((v: any) => {
      return v.registrationExpiry < todayStr || v.insuranceExpiry < todayStr;
    });

    setBriefingData({
      eventsToday,
      pendingTasks,
      upcomingBills,
      pendingMeds,
      expiringDocs,
      lowStockPantry,
      vehicleIssues,
    });
  };

  useEffect(() => {
    assembleBriefing();

    const handleUpdate = () => {
      assembleBriefing();
    };

    window.addEventListener('lifedesk_os_db_update', handleUpdate);
    return () => {
      window.removeEventListener('lifedesk_os_db_update', handleUpdate);
    };
  }, [user.id]);

  if (!briefingData) return null;

  const totalActionItems =
    briefingData.eventsToday.length +
    briefingData.pendingTasks.length +
    briefingData.upcomingBills.length +
    briefingData.pendingMeds.length +
    briefingData.expiringDocs.length +
    briefingData.lowStockPantry.length +
    briefingData.vehicleIssues.length;

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200">
      {/* 1. Header Banner */}
      <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-b-3xl shadow-md flex-shrink-0 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-violet-100 uppercase tracking-widest font-bold">
            <Sunrise className="w-4.5 h-4.5 text-amber-300 animate-pulse" />
            <span>Good Morning, {user.username}</span>
          </div>
          <h1 className="text-xl font-bold font-display mt-1">Your Personal Briefing</h1>
          <p className="text-[11px] text-violet-200 mt-1">
            {totalActionItems === 0
              ? 'Excellent! You have zero pending actions today. Relax!'
              : `You have ${totalActionItems} active priorities requiring your alignment today.`}
          </p>
        </div>

        <button
          onClick={assembleBriefing}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Action priority feeds */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {totalActionItems === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <Compass className="w-12 h-12 text-violet-500/20 mx-auto mb-3" />
            <div className="text-xs font-semibold">Everything is Clear</div>
            <p className="text-[10px] text-neutral-400 max-w-xs mx-auto mt-1">
              Your calendar, tasks, bills, medications, and home inventories are completely up to date. Keep up the high alignment!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Column A: Schedule & Meds */}
            <div className="space-y-4">
              {/* Calendar Events today */}
              {briefingData.eventsToday.length > 0 && (
                <div className="p-4 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4.5 h-4.5 text-violet-500" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Schedule Today</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {briefingData.eventsToday.map((e: any) => (
                      <div key={e.id} className="text-xs font-semibold p-2 rounded-lg bg-neutral-100 dark:bg-white/5 border border-zinc-200 dark:border-transparent flex items-center justify-between">
                        <span>{e.title}</span>
                        <span className="text-[10px] text-neutral-400">{e.reminder}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications pending today */}
              {briefingData.pendingMeds.length > 0 && (
                <div className="p-4 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4.5 h-4.5 text-red-500" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Prescriptions Pending</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {briefingData.pendingMeds.map((m: any) => (
                      <div key={m.id} className="text-xs font-semibold p-2 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-between">
                        <span>{m.name} - {m.dosage}</span>
                        <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">{m.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks pending */}
              {briefingData.pendingTasks.length > 0 && (
                <div className="p-4 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Tasks Overview ({briefingData.pendingTasks.length})</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {briefingData.pendingTasks.slice(0, 3).map((t: any) => (
                      <div key={t.id} className="text-xs p-2 rounded-lg bg-neutral-100 dark:bg-white/5 border border-zinc-200 dark:border-transparent flex items-center justify-between">
                        <span className="truncate">{t.title}</span>
                        <span className={`text-[8px] font-bold uppercase px-1 rounded ${
                          t.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-neutral-200'
                        }`}>{t.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Column B: Financials & Warnings */}
            <div className="space-y-4">
              {/* Bills due */}
              {briefingData.upcomingBills.length > 0 && (
                <div className="p-4 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4.5 h-4.5 text-violet-500" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Upcoming Bills</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {briefingData.upcomingBills.map((b: any) => (
                      <div key={b.id} className="text-xs p-2 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-between border-l-2 border-l-amber-500">
                        <span className="font-semibold">{b.name}</span>
                        <span className="font-mono font-bold">${b.amount} (Due {b.dueDate})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expiring documents and vehicle issues */}
              {(briefingData.expiringDocs.length > 0 || briefingData.vehicleIssues.length > 0) && (
                <div className="p-4 bg-amber-500/[0.02] border border-amber-500/10 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Registry / Insurance Expiring</span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    {briefingData.expiringDocs.map((d: any) => (
                      <div key={d.id} className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-amber-500/20 text-neutral-700 dark:text-neutral-300 font-semibold">
                        Document Expires Soon: "{d.title}" ({d.expirationDate})
                      </div>
                    ))}
                    {briefingData.vehicleIssues.map((v: any) => (
                      <div key={v.id} className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-amber-500/20 text-neutral-700 dark:text-neutral-300 font-semibold flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-amber-500" />
                        <span>Vehicle Registry or Insurance Expired: {v.makeModel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Low stock pantry */}
              {briefingData.lowStockPantry.length > 0 && (
                <div className="p-4 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-sans">Low Pantry Stock</span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    {briefingData.lowStockPantry.slice(0, 3).map((p: any) => (
                      <div key={p.id} className="p-2 bg-neutral-100 dark:bg-white/5 rounded-lg flex justify-between font-semibold">
                        <span>{p.name} ({p.category})</span>
                        <span className="text-amber-500 font-bold">Qty: {p.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
