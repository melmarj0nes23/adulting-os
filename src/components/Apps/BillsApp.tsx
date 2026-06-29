/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, CreditCard, DollarSign, Calendar, RefreshCcw, Check, Clock, AlertTriangle, PieChart } from 'lucide-react';
import { DbService } from '../../services/db';
import { User, BillItem } from '../../types';

interface BillsAppProps {
  user: User;
}

export default function BillsApp({ user }: BillsAppProps) {
  const [bills, setBills] = useState<BillItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Bill Creation form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Utilities');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newFrequency, setNewFrequency] = useState<'once' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [newNotes, setNewNotes] = useState('');

  const loadBills = () => {
    const data = DbService.getUserData(user.id);
    setBills(data.bills || []);
  };

  useEffect(() => {
    loadBills();

    const handleUpdate = () => {
      loadBills();
    };

    window.addEventListener('adulting_os_db_update', handleUpdate);
    return () => {
      window.removeEventListener('adulting_os_db_update', handleUpdate);
    };
  }, [user.id]);

  const saveBills = (updatedBills: BillItem[]) => {
    const data = DbService.getUserData(user.id);
    data.bills = updatedBills;
    DbService.saveUserData(user.id, data);
    setBills(updatedBills);
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAmount || !newDueDate) return;

    const newBill: BillItem = {
      id: `bill_${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      amount: parseFloat(newAmount),
      currency: 'USD',
      dueDate: newDueDate,
      frequency: newFrequency,
      paid: false,
      notes: newNotes.trim() || undefined,
    };

    const updated = [...bills, newBill];
    saveBills(updated);

    // Reset form
    setNewName('');
    setNewAmount('');
    setNewDueDate('');
    setNewNotes('');
    setShowAddForm(false);

    DbService.addNotification(user.id, {
      title: 'New Bill Tracked',
      message: `"${newBill.name}" (${newBill.amount.toLocaleString([], { style: 'currency', currency: 'USD' })}) has been added to your bills tracker.`,
      type: 'info',
      icon: 'CreditCard',
    });
  };

  const handleTogglePaid = (id: string) => {
    const updated = bills.map(b => {
      if (b.id === id) {
        const paid = !b.paid;
        if (paid) {
          // Push notification when paid
          DbService.addNotification(user.id, {
            title: 'Bill Paid',
            message: `"${b.name}" was marked as paid!`,
            type: 'success',
            icon: 'Check',
          });
        }
        return { ...b, paid };
      }
      return b;
    });
    saveBills(updated);
  };

  const handleDeleteBill = (id: string) => {
    const updated = bills.filter(b => b.id !== id);
    saveBills(updated);
  };

  // Metrics Analytics
  const now = new Date();
  const formatToday = now.toISOString().split('T')[0];

  const totalMonthlySpending = bills
    .filter(b => b.frequency === 'monthly')
    .reduce((sum, b) => sum + b.amount, 0);

  const upcomingUnpaidBills = bills.filter(b => !b.paid && b.dueDate >= formatToday);
  const overdueBills = bills.filter(b => !b.paid && b.dueDate < formatToday);
  const paidBills = bills.filter(b => b.paid);

  const totalOverdueAmount = overdueBills.reduce((sum, b) => sum + b.amount, 0);
  const totalUpcomingAmount = upcomingUnpaidBills.reduce((sum, b) => sum + b.amount, 0);

  // Filter lists
  const categories = ['All', ...Array.from(new Set(bills.map(b => b.category)))];

  const filteredBills = bills.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || (b.notes && b.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' ? true : b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200">
      {/* 1. Dashboard Stats Rows */}
      <div className="flex sm:grid flex-row sm:grid-cols-3 overflow-x-auto sm:overflow-x-visible gap-3 p-3 bg-white dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-white/5 flex-shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="bg-rose-500/5 dark:bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl p-3 flex items-center justify-between min-w-[240px] sm:min-w-0 flex-shrink-0 flex-1">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Overdue Bills</span>
            <div className="text-sm font-bold font-mono text-rose-500 mt-0.5">
              ${totalOverdueAmount.toLocaleString([], { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[9px] text-neutral-400 font-medium">{overdueBills.length} unpaid bill{overdueBills.length !== 1 && 's'} past due</span>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-500/30" />
        </div>

        <div className="bg-amber-500/5 dark:bg-amber-500/[0.02] border border-amber-500/10 rounded-2xl p-3 flex items-center justify-between min-w-[240px] sm:min-w-0 flex-shrink-0 flex-1">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Upcoming Unpaid</span>
            <div className="text-sm font-bold font-mono text-amber-500 mt-0.5">
              ${totalUpcomingAmount.toLocaleString([], { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[9px] text-neutral-400 font-medium">{upcomingUnpaidBills.length} bill{upcomingUnpaidBills.length !== 1 && 's'} due soon</span>
          </div>
          <Clock className="w-6 h-6 text-amber-500/30" />
        </div>

        <div className="bg-violet-500/5 dark:bg-violet-500/[0.02] border border-violet-500/10 rounded-2xl p-3 flex items-center justify-between min-w-[240px] sm:min-w-0 flex-shrink-0 flex-1">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Total Monthly Cost</span>
            <div className="text-sm font-bold font-mono text-violet-500 dark:text-violet-400 mt-0.5">
              ${totalMonthlySpending.toLocaleString([], { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[9px] text-neutral-400 font-medium">Standard monthly commitments</span>
          </div>
          <RefreshCcw className="w-6 h-6 text-violet-500/30" />
        </div>
      </div>

      {/* 2. Workspace Filter Toolbar */}
      <div className="p-3 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex items-center bg-zinc-100 dark:bg-white/[0.04] rounded-xl px-2.5 py-1 w-full sm:w-52">
            <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none p-0 border-none"
            />
          </div>

          {/* Category Select Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-xl focus:outline-none w-full sm:w-auto"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Track Bill</span>
        </button>
      </div>

      {/* 3. Primary Bills Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Bill Registration form */}
        {showAddForm && (
          <form onSubmit={handleCreateBill} className="p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg space-y-3 animate-in slide-in-from-top-4 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Bill Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Electricity, Rent, Car Insurance..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="120.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="Utilities">Utilities</option>
                  <option value="Housing">Housing</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Finance">Finance</option>
                  <option value="Medical">Medical</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Frequency</label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="once">One-Time</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Notes</label>
                <textarea
                  placeholder="Account numbers, portal link or custom comments..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500 h-16 resize-none"
                />
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
                Save Bill
              </button>
            </div>
          </form>
        )}

        {/* Bills list */}
        {filteredBills.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 dark:text-neutral-500">
            <CreditCard className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
            <div className="text-xs font-semibold">No Bills Found</div>
            <p className="text-[10px] text-neutral-400 mt-1">Great job! You have zero recurring bills configured for this filter.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredBills.map(bill => {
              const isPastDue = !bill.paid && bill.dueDate < formatToday;
              return (
                <div
                  key={bill.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    bill.paid
                      ? 'border-zinc-200 bg-zinc-100/30 dark:border-white/5 dark:bg-white/[0.01] opacity-75'
                      : isPastDue
                      ? 'border-red-500/30 bg-red-500/[0.02] dark:border-red-500/20'
                      : 'border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => handleTogglePaid(bill.id)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                        bill.paid
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : isPastDue
                          ? 'border-red-500 hover:bg-red-500/10'
                          : 'border-neutral-300 hover:border-violet-500'
                      }`}
                    >
                      {bill.paid && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold truncate ${bill.paid ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-white'}`}>
                          {bill.name}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-widest bg-zinc-100 dark:bg-white/5 text-neutral-500 px-1.5 py-0.5 rounded-md">
                          {bill.category}
                        </span>
                      </div>

                      {bill.notes && (
                        <p className={`text-[10px] mt-0.5 ${bill.paid ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                          {bill.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 mt-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className={isPastDue ? 'text-red-500 font-bold' : ''}>
                          Due {bill.dueDate} {isPastDue && '(Past Due!)'}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{bill.frequency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs font-bold ${isPastDue ? 'text-red-500' : bill.paid ? 'text-neutral-400' : 'text-neutral-800 dark:text-white'}`}>
                      ${bill.amount.toFixed(2)}
                    </span>

                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      className="p-1 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
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
