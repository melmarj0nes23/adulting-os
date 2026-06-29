/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, Box, ShoppingCart, Calendar, AlertTriangle, Sparkles, AlertCircle } from 'lucide-react';
import { DbService } from '../../services/db';
import { User, PantryItem } from '../../types';

interface PantryAppProps {
  user: User;
}

export default function PantryApp({ user }: PantryAppProps) {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'low' | 'expiring'>('all');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newUnit, setNewUnit] = useState('pcs');
  const [newCategory, setNewCategory] = useState('Condiments');
  const [newExpiration, setNewExpiration] = useState('');

  const loadPantry = () => {
    const data = DbService.getUserData(user.id);
    setPantry(data.pantry || []);
  };

  useEffect(() => {
    loadPantry();

    const handleUpdate = () => {
      loadPantry();
    };

    window.addEventListener('adulting_os_db_update', handleUpdate);
    return () => {
      window.removeEventListener('adulting_os_db_update', handleUpdate);
    };
  }, [user.id]);

  const savePantry = (updated: PantryItem[]) => {
    const data = DbService.getUserData(user.id);
    data.pantry = updated;
    DbService.saveUserData(user.id, data);
    setPantry(updated);
  };

  const handleCreatePantryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newQty || !newExpiration) return;

    const newItem: PantryItem = {
      id: `pan_${Date.now()}`,
      name: newName.trim(),
      quantity: parseInt(newQty) || 1,
      unit: newUnit,
      category: newCategory,
      expirationDate: newExpiration,
    };

    const updated = [...pantry, newItem];
    savePantry(updated);

    // Reset Form
    setNewName('');
    setNewQty('1');
    setNewExpiration('');
    setShowAddForm(false);

    DbService.addNotification(user.id, {
      title: 'Pantry Logged',
      message: `"${newItem.name}" added to pantry inventory.`,
      type: 'success',
      icon: 'Box',
    });
  };

  const handleAdjustQuantity = (id: string, amount: number) => {
    const updated = pantry.map(item => {
      if (item.id === id) {
        const nextQty = Math.max(0, item.quantity + amount);
        return { ...item, quantity: nextQty };
      }
      return item;
    });
    savePantry(updated);
  };

  const handleDeletePantryItem = (id: string) => {
    const updated = pantry.filter(item => item.id !== id);
    savePantry(updated);
  };

  // Add item directly to grocery lists! (Integration!)
  const handleAddToGrocery = (item: PantryItem) => {
    const data = DbService.getUserData(user.id);
    const groceryLists = data.groceryLists || [];

    if (groceryLists.length === 0) {
      // Create default list if none
      groceryLists.push({
        id: `list_${Date.now()}`,
        name: 'Weekly Groceries',
        items: [],
      });
    }

    // Add item
    groceryLists[0].items = [
      {
        id: `g_${Date.now()}`,
        name: item.name,
        category: item.category,
        quantity: `1 ${item.unit}`,
        checked: false,
      },
      ...groceryLists[0].items,
    ];

    data.groceryLists = groceryLists;
    DbService.saveUserData(user.id, data);

    DbService.addNotification(user.id, {
      title: 'Added to Grocery List',
      message: `"${item.name}" was appended to your "${groceryLists[0].name}" grocery list.`,
      type: 'success',
      icon: 'ShoppingCart',
    });
  };

  // Status computation
  const now = new Date();
  const formatOffsetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const lowStockThreshold = 1;
  const expiringSoonThresholdDays = 7;

  const lowStockItems = pantry.filter(item => item.quantity <= lowStockThreshold);
  const expiringSoonItems = pantry.filter(item => {
    const diffTime = new Date(item.expirationDate).getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= expiringSoonThresholdDays;
  });

  const filteredPantry = pantry.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'low') {
      return matchesSearch && item.quantity <= lowStockThreshold;
    }
    if (selectedFilter === 'expiring') {
      const diffTime = new Date(item.expirationDate).getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return matchesSearch && diffDays >= 0 && diffDays <= expiringSoonThresholdDays;
    }

    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200">
      {/* 1. Stat overview tabs */}
      <div className="flex sm:grid flex-row sm:grid-cols-3 overflow-x-auto sm:overflow-x-visible gap-3 p-3 bg-white dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-white/5 flex-shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`p-3 rounded-2xl border text-left transition-all min-w-[240px] sm:min-w-0 flex-shrink-0 flex-1 ${
            selectedFilter === 'all'
              ? 'border-violet-500 bg-violet-500/[0.02]'
              : 'border-zinc-200 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Total Stock</span>
          <div className="text-sm font-bold font-mono text-violet-500 mt-0.5">{pantry.length}</div>
          <span className="text-[9px] text-neutral-400">Items tracked inside pantry</span>
        </button>

        <button
          onClick={() => setSelectedFilter('low')}
          className={`p-3 rounded-2xl border text-left transition-all min-w-[240px] sm:min-w-0 flex-shrink-0 flex-1 ${
            selectedFilter === 'low'
              ? 'border-amber-500 bg-amber-500/[0.02]'
              : 'border-zinc-200 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Low Stock Alert</span>
          <div className="text-sm font-bold font-mono text-amber-500 mt-0.5">{lowStockItems.length}</div>
          <span className="text-[9px] text-neutral-400">Quantity of {lowStockThreshold} or less</span>
        </button>

        <button
          onClick={() => setSelectedFilter('expiring')}
          className={`p-3 rounded-2xl border text-left transition-all min-w-[240px] sm:min-w-0 flex-shrink-0 flex-1 ${
            selectedFilter === 'expiring'
              ? 'border-rose-500 bg-rose-500/[0.02]'
              : 'border-zinc-200 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Expiring Soon</span>
          <div className="text-sm font-bold font-mono text-rose-500 mt-0.5">{expiringSoonItems.length}</div>
          <span className="text-[9px] text-neutral-400">Within {expiringSoonThresholdDays} calendar days</span>
        </button>
      </div>

      {/* 2. Controls Toolbar */}
      <div className="p-3 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="relative flex items-center bg-zinc-100 dark:bg-white/[0.04] rounded-xl px-2.5 py-1.5 w-60">
          <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search pantry items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none p-0 border-none"
          />
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Item</span>
        </button>
      </div>

      {/* 3. Pantry Items Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Log item input form */}
        {showAddForm && (
          <form onSubmit={handleCreatePantryItem} className="p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg space-y-3 animate-in slide-in-from-top-4 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Olive Oil, Garlic Powder, Rice..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="2"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="pcs, bottles, cans, boxes..."
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
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
                  <option value="Condiments">Condiments</option>
                  <option value="Oils & Vinegars">Oils & Vinegars</option>
                  <option value="Spices & Seasonings">Spices & Seasonings</option>
                  <option value="Grains & Cereals">Grains & Cereals</option>
                  <option value="Canned Goods">Canned Goods</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={newExpiration}
                  onChange={(e) => setNewExpiration(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
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
                Log Item
              </button>
            </div>
          </form>
        )}

        {/* Pantry items list */}
        {filteredPantry.length === 0 ? (
          <div className="py-12 text-center text-neutral-400">
            <Box className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
            <div className="text-xs font-semibold">No Pantry Items</div>
            <p className="text-[10px] text-neutral-400 mt-1">Add items or clear filters to manage your pantry staples.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredPantry.map(item => {
              const diffTime = new Date(item.expirationDate).getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isExpired = diffDays < 0;
              const isExpiringSoon = diffDays >= 0 && diffDays <= expiringSoonThresholdDays;
              const isLowStock = item.quantity <= lowStockThreshold;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border gap-3 transition-all bg-white dark:bg-zinc-900/30 ${
                    isExpired
                      ? 'border-red-500/30 bg-red-500/[0.01]'
                      : isExpiringSoon
                      ? 'border-amber-500/30 bg-amber-500/[0.01]'
                      : 'border-zinc-200 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                      <Box className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    </div>

                    <div>
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="text-xs font-bold">{item.name}</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-white/5 text-neutral-500 px-1.5 py-0.5 rounded-md">
                          {item.category}
                        </span>

                        {isLowStock && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded-md">
                            <AlertTriangle className="w-2 h-2" />
                            <span>Low Stock</span>
                          </span>
                        )}

                        {isExpired ? (
                          <span className="text-[8px] font-bold text-red-600 bg-red-500/10 px-1 py-0.5 rounded-md">
                            Expired
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="text-[8px] font-bold text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded-md">
                            Expiring Soon
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-1 text-[9px] text-neutral-400 mt-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>Expires {item.expirationDate} ({isExpired ? 'expired' : `${diffDays} days left`})</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity adjustments and actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100 dark:border-white/5">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-white/5 p-1 rounded-xl">
                      <button
                        onClick={() => handleAdjustQuantity(item.id, -1)}
                        className="w-5 h-5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-xs text-neutral-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold font-mono px-1 w-8 text-center leading-none">
                        {item.quantity} <span className="text-[9px] text-neutral-400 font-normal block mt-0.5">{item.unit}</span>
                      </span>
                      <button
                        onClick={() => handleAdjustQuantity(item.id, 1)}
                        className="w-5 h-5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-xs text-neutral-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Restock to grocery list */}
                    {isLowStock && (
                      <button
                        onClick={() => handleAddToGrocery(item)}
                        className="p-1.5 rounded-xl border border-violet-200 hover:bg-violet-600 hover:text-white dark:border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center gap-1 text-[10px] font-semibold transition-all"
                        title="Add restock to Grocery"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeletePantryItem(item.id)}
                      className="p-1 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
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
