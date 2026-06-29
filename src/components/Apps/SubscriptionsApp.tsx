/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Repeat, DollarSign, Calendar, TrendingUp, AlertCircle, ToggleLeft, ToggleRight, Sparkles, Filter } from 'lucide-react';
import { DbService } from '../../services/db';
import { User, SubscriptionItem } from '../../types';

interface SubscriptionsAppProps {
  user: User;
}

export default function SubscriptionsApp({ user }: SubscriptionsAppProps) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newRenewalDate, setNewRenewalDate] = useState('');
  const [newBillingCycle, setNewBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [newCategory, setNewCategory] = useState('Entertainment');
  const [newAutoRenew, setNewAutoRenew] = useState(true);

  const loadSubscriptions = () => {
    const data = DbService.getUserData(user.id);
    setSubscriptions(data.subscriptions || []);
  };

  useEffect(() => {
    loadSubscriptions();

    const handleUpdate = () => {
      loadSubscriptions();
    };

    window.addEventListener('adulting_os_db_update', handleUpdate);
    return () => {
      window.removeEventListener('adulting_os_db_update', handleUpdate);
    };
  }, [user.id]);

  const saveSubscriptions = (updated: SubscriptionItem[]) => {
    const data = DbService.getUserData(user.id);
    data.subscriptions = updated;
    DbService.saveUserData(user.id, data);
    setSubscriptions(updated);
  };

  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newCost || !newRenewalDate) return;

    const newSub: SubscriptionItem = {
      id: `sub_${Date.now()}`,
      serviceName: newServiceName.trim(),
      cost: parseFloat(newCost),
      renewalDate: newRenewalDate,
      billingCycle: newBillingCycle,
      category: newCategory,
      autoRenew: newAutoRenew,
    };

    const updated = [...subscriptions, newSub];
    saveSubscriptions(updated);

    // Reset Form
    setNewServiceName('');
    setNewCost('');
    setNewRenewalDate('');
    setShowAddForm(false);

    DbService.addNotification(user.id, {
      title: 'Subscription Added',
      message: `"${newSub.serviceName}" is now being managed.`,
      type: 'info',
      icon: 'Repeat',
    });
  };

  const handleToggleAutoRenew = (id: string) => {
    const updated = subscriptions.map(sub => {
      if (sub.id === id) {
        const autoRenew = !sub.autoRenew;
        return { ...sub, autoRenew };
      }
      return sub;
    });
    saveSubscriptions(updated);
  };

  const handleDeleteSubscription = (id: string) => {
    const updated = subscriptions.filter(sub => sub.id !== id);
    saveSubscriptions(updated);
  };

  // Metrics calculations
  const monthlyTotal = subscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === 'monthly') return sum + sub.cost;
    return sum + (sub.cost / 12);
  }, 0);

  const annualTotal = monthlyTotal * 12;

  const categories = ['All', ...Array.from(new Set(subscriptions.map(s => s.category)))];

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' ? true : sub.category === selectedCategory;
    const matchesActive = showActiveOnly ? sub.autoRenew : true;
    return matchesSearch && matchesCat && matchesActive;
  });

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200">
      {/* 1. Subscription Cost Stats */}
      <div className="flex sm:grid flex-row sm:grid-cols-2 overflow-x-auto sm:overflow-x-visible gap-3 p-3 bg-white dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-white/5 flex-shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="bg-violet-500/5 dark:bg-violet-500/[0.02] border border-violet-500/10 rounded-2xl p-3 flex items-center justify-between min-w-[240px] sm:min-w-0 flex-shrink-0 flex-1">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Monthly Cost</span>
            <div className="text-sm font-bold font-mono text-violet-600 dark:text-violet-400 mt-0.5">
              ${monthlyTotal.toFixed(2)}
            </div>
            <span className="text-[9px] text-neutral-400">Prorated across all active subscriptions</span>
          </div>
          <TrendingUp className="w-6 h-6 text-violet-500/30" />
        </div>

        <div className="bg-emerald-500/5 dark:bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl p-3 flex items-center justify-between min-w-[240px] sm:min-w-0 flex-shrink-0 flex-1">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Yearly Projection</span>
            <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              ${annualTotal.toFixed(2)}
            </div>
            <span className="text-[9px] text-neutral-400">Total annual financial footprint</span>
          </div>
          <Repeat className="w-6 h-6 text-emerald-500/30" />
        </div>
      </div>

      {/* 2. Control Toolbar */}
      <div className="p-3 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex items-center bg-zinc-100 dark:bg-white/[0.04] rounded-xl px-2.5 py-1 w-full sm:w-52">
            <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none p-0 border-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-xl focus:outline-none w-full sm:w-auto"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Toggle Active Filter */}
          <button
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs border font-medium flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto ${
              showActiveOnly
                ? 'bg-violet-100/60 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30'
                : 'border-zinc-200 dark:border-white/10 text-neutral-500'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Active Only</span>
          </button>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* 3. Subscriptions Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Subscription Registration form */}
        {showAddForm && (
          <form onSubmit={handleCreateSubscription} className="p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg space-y-3 animate-in slide-in-from-top-4 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Netflix, Spotify, iCloud..."
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="15.49"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Next Renewal</label>
                  <input
                    type="date"
                    required
                    value={newRenewalDate}
                    onChange={(e) => setNewRenewalDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Billing Cycle</label>
                  <select
                    value={newBillingCycle}
                    onChange={(e) => setNewBillingCycle(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="Entertainment">Entertainment</option>
                    <option value="Music">Music</option>
                    <option value="Health">Health</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Cloud Storage">Cloud Storage</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewAutoRenew(!newAutoRenew)}
                  className="flex-shrink-0 text-neutral-500 hover:text-neutral-800"
                >
                  {newAutoRenew ? <ToggleRight className="w-8 h-8 text-violet-500" /> : <ToggleLeft className="w-8 h-8 text-neutral-400" />}
                </button>
                <div>
                  <span className="text-xs font-semibold block leading-none">Auto-Renew Status</span>
                  <span className="text-[10px] text-neutral-400">If toggled off, subscription won't auto-draft.</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 border border-zinc-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs hover:bg-zinc-100 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700"
              >
                Save Subscription
              </button>
            </div>
          </form>
        )}

        {/* Subscriptions List Grid */}
        {filteredSubscriptions.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 dark:text-neutral-500">
            <Repeat className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
            <div className="text-xs font-semibold">No Subscriptions Found</div>
            <p className="text-[10px] text-neutral-400 mt-1">Review your filters or add a new subscription service above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSubscriptions.map(sub => {
              const daysLeft = Math.ceil((new Date(sub.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isRenewingSoon = daysLeft >= 0 && daysLeft <= 3;

              return (
                <div
                  key={sub.id}
                  className={`flex flex-col justify-between p-4 rounded-2xl border transition-all hover:shadow-sm bg-white dark:bg-zinc-900/30 ${
                    isRenewingSoon
                      ? 'border-amber-500/30 bg-amber-500/[0.01] dark:border-amber-500/20'
                      : 'border-zinc-200 dark:border-white/5'
                  }`}
                >
                  {/* Card top */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <span className="text-xs font-bold truncate block">{sub.serviceName}</span>
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mt-0.5">{sub.category}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold block">${sub.cost.toFixed(2)}</span>
                      <span className="text-[9px] text-neutral-400 uppercase tracking-widest block capitalize">{sub.billingCycle}</span>
                    </div>
                  </div>

                  {/* Card bottom */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-white/5 text-[10px] text-neutral-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAutoRenew(sub.id)}
                        title={sub.autoRenew ? 'Deactivate Auto-Renew' : 'Activate Auto-Renew'}
                      >
                        {sub.autoRenew ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                            Auto-Renew
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-neutral-500 bg-neutral-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md">
                            Manual
                          </span>
                        )}
                      </button>

                      <span className={isRenewingSoon ? 'text-amber-500 font-semibold' : ''}>
                        {daysLeft > 0 ? `Renews in ${daysLeft} days` : daysLeft === 0 ? 'Renews today!' : 'Renewed / Expired'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteSubscription(sub.id)}
                      className="p-1 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
