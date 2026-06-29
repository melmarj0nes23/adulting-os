/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ShoppingCart, Check, List, Tag, Sparkles, FolderPlus, Grid, RefreshCw } from 'lucide-react';
import { DbService } from '../../services/db';
import { User, GroceryList, GroceryItem } from '../../types';

interface GroceryAppProps {
  user: User;
}

export default function GroceryApp({ user }: GroceryAppProps) {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form States
  const [newListName, setNewListName] = useState('');
  const [showAddListForm, setShowAddListForm] = useState(false);

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemCategory, setNewItemCategory] = useState('Produce');

  const loadLists = () => {
    const data = DbService.getUserData(user.id);
    const loadedLists = data.groceryLists || [];
    setLists(loadedLists);

    if (loadedLists.length > 0 && !selectedListId) {
      setSelectedListId(loadedLists[0].id);
    }
  };

  useEffect(() => {
    loadLists();

    const handleUpdate = () => {
      loadLists();
    };

    window.addEventListener('adulting_os_db_update', handleUpdate);
    return () => {
      window.removeEventListener('adulting_os_db_update', handleUpdate);
    };
  }, [user.id]);

  const saveLists = (updatedLists: GroceryList[]) => {
    const data = DbService.getUserData(user.id);
    data.groceryLists = updatedLists;
    DbService.saveUserData(user.id, data);
    setLists(updatedLists);
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const newList: GroceryList = {
      id: `list_${Date.now()}`,
      name: newListName.trim(),
      items: [],
    };

    const updated = [...lists, newList];
    saveLists(updated);
    setSelectedListId(newList.id);
    setNewListName('');
    setShowAddListForm(false);
  };

  const handleDeleteList = (listId: string) => {
    const updated = lists.filter(l => l.id !== listId);
    saveLists(updated);
    if (selectedListId === listId) {
      setSelectedListId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !selectedListId) return;

    const newItem: GroceryItem = {
      id: `g_${Date.now()}`,
      name: newItemName.trim(),
      quantity: newItemQty.trim() || '1',
      category: newItemCategory,
      checked: false,
    };

    const updated = lists.map(l => {
      if (l.id === selectedListId) {
        return {
          ...l,
          items: [newItem, ...l.items],
        };
      }
      return l;
    });

    saveLists(updated);
    setNewItemName('');
    setNewItemQty('1');
  };

  const handleToggleItem = (itemId: string) => {
    const updated = lists.map(l => {
      if (l.id === selectedListId) {
        return {
          ...l,
          items: l.items.map(item => {
            if (item.id === itemId) {
              const checked = !item.checked;
              return {
                ...item,
                checked,
                recentlyPurchased: checked ? true : item.recentlyPurchased,
              };
            }
            return item;
          }),
        };
      }
      return l;
    });
    saveLists(updated);
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = lists.map(l => {
      if (l.id === selectedListId) {
        return {
          ...l,
          items: l.items.filter(item => item.id !== itemId),
        };
      }
      return l;
    });
    saveLists(updated);
  };

  const handleClearCompleted = () => {
    if (!selectedListId) return;
    const updated = lists.map(l => {
      if (l.id === selectedListId) {
        return {
          ...l,
          items: l.items.filter(item => !item.checked),
        };
      }
      return l;
    });
    saveLists(updated);
  };

  const selectedList = lists.find(l => l.id === selectedListId);

  // Filter items based on search query
  const filteredItems = selectedList
    ? selectedList.items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const activeItems = filteredItems.filter(item => !item.checked);
  const completedItems = filteredItems.filter(item => item.checked);

  // Extract recently purchased items
  const recentlyPurchased = selectedList
    ? selectedList.items.filter(item => item.recentlyPurchased && !item.checked)
    : [];

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-zinc-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200">
      {/* 1. Lists Sidebar Selection */}
      <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 p-3 flex flex-row md:flex-col gap-1.5 flex-shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center justify-between px-2 mb-1 flex-shrink-0">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest hidden md:block">My Lists</span>
          <button
            onClick={() => setShowAddListForm(!showAddListForm)}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-violet-500"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Create list input field */}
        {showAddListForm && (
          <form onSubmit={handleCreateList} className="p-1.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-white/5 flex gap-1 flex-shrink-0 min-w-[130px]">
            <input
              type="text"
              required
              placeholder="List Name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full bg-transparent text-[11px] placeholder-neutral-400 focus:outline-none px-1 p-0 border-none"
            />
            <button type="submit" className="px-2 py-1 bg-violet-600 text-white rounded-lg text-[10px] font-bold">
              OK
            </button>
          </form>
        )}

        {/* Available lists */}
        <div className="flex-1 md:flex-initial overflow-x-auto md:overflow-y-auto flex flex-row md:flex-col gap-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {lists.length === 0 ? (
            <div className="text-center py-6 text-[10px] text-neutral-400">No lists created.</div>
          ) : (
            lists.map(list => {
              const pendingCount = list.items.filter(item => !item.checked).length;
              return (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`w-auto md:w-full flex-shrink-0 flex items-center justify-between gap-2 px-3 py-1.5 md:py-2 rounded-xl text-xs transition-all text-left ${
                    selectedListId === list.id
                      ? 'bg-violet-600 text-white font-semibold shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="truncate max-w-[100px] md:max-w-[120px]">{list.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${selectedListId === list.id ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-white/5 text-neutral-400'}`}>
                      {pendingCount}
                    </span>
                    {selectedListId === list.id && lists.length > 1 && (
                      <span
                        onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                        className="w-3.5 h-3.5 rounded hover:bg-white/20 flex items-center justify-center text-[10px] text-white/80"
                      >
                        ×
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Workspace Items Board */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white dark:bg-zinc-950">
        {selectedList ? (
          <>
            {/* Board Header Toolbar */}
            <div className="p-3 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-3">
              <div className="relative flex items-center bg-zinc-100 dark:bg-white/[0.04] rounded-xl px-2.5 py-1.5 w-52">
                <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none p-0 border-none"
                />
              </div>

              {completedItems.length > 0 && (
                <button
                  onClick={handleClearCompleted}
                  className="px-3 py-1.5 text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Clear Completed
                </button>
              )}
            </div>

            {/* Board Items Scroll container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Add item field */}
              <form onSubmit={handleAddItem} className="p-3 bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 rounded-2xl flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="Item name (e.g. Greek Yogurt)..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500 min-w-[120px]"
                />

                <input
                  type="text"
                  placeholder="Qty (e.g. 2 tubs)..."
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  className="w-24 text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />

                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="Produce">Produce</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Meat">Meat & Seafood</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Pantry">Pantry Staples</option>
                  <option value="Frozen">Frozen Foods</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Household">Household</option>
                  <option value="Other">Other</option>
                </select>

                <button
                  type="submit"
                  className="px-3.5 py-2 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 shadow-sm"
                >
                  Add
                </button>
              </form>

              {/* Items display divided by active and bought */}
              <div className="space-y-4">
                {/* Active Section */}
                {activeItems.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 px-1">To Buy ({activeItems.length})</div>
                    <div className="flex flex-col gap-1.5">
                      {activeItems.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleItem(item.id)}
                              className="w-4 h-4 rounded border border-neutral-300 dark:border-neutral-700 hover:border-violet-500 flex items-center justify-center text-white"
                            >
                              {item.checked && <Check className="w-3 h-3 text-violet-500" />}
                            </button>
                            <span className="text-xs font-semibold">{item.name}</span>
                            <span className="text-[9px] font-bold text-neutral-400 bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                              {item.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">{item.quantity}</span>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed bought Section */}
                {completedItems.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 px-1">Bought ({completedItems.length})</div>
                    <div className="flex flex-col gap-1.5 opacity-65">
                      {completedItems.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 border border-zinc-200/50 bg-neutral-50 dark:border-white/5 dark:bg-white/[0.01] rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleItem(item.id)}
                              className="w-4 h-4 rounded border border-emerald-500 bg-emerald-500 flex items-center justify-center text-white"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold line-through text-neutral-400">{item.name}</span>
                            <span className="text-[8px] font-bold text-neutral-400 bg-neutral-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                              {item.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-neutral-400">{item.quantity}</span>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty check */}
                {activeItems.length === 0 && completedItems.length === 0 && (
                  <div className="py-16 text-center text-neutral-400">
                    <ShoppingCart className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                    <div className="text-xs font-semibold">List is Empty</div>
                    <p className="text-[10px] text-neutral-400 mt-1">Add items above to start constructing your grocery list.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400">
            <ShoppingCart className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-3" />
            <div className="text-xs font-semibold">No Lists Available</div>
            <p className="text-[10px] text-neutral-400 max-w-xs mt-1">
              Create a new shopping folder list in the sidebar to organize grocery stores or chores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
