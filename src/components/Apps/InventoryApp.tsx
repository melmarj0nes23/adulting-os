/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Package, MapPin, Calendar, Receipt, Edit3, Image, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { DbService } from '../../services/db';
import { User, InventoryItem } from '../../types';

interface InventoryAppProps {
  user: User;
}

export default function InventoryApp({ user }: InventoryAppProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('All');

  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [newRoom, setNewRoom] = useState('Living Room');
  const [newPurchaseDate, setNewPurchaseDate] = useState('');
  const [newWarranty, setNewWarranty] = useState('');
  const [newNotes, setNewNotes] = useState('');
  
  // simulated attachments
  const [mockReceiptName, setMockReceiptName] = useState<string | null>(null);
  const [mockPhotoName, setMockPhotoName] = useState<string | null>(null);

  const loadInventory = () => {
    const data = DbService.getUserData(user.id);
    setInventory(data.inventory || []);
  };

  useEffect(() => {
    loadInventory();

    const handleUpdate = () => {
      loadInventory();
    };

    window.addEventListener('adulting_os_db_update', handleUpdate);
    return () => {
      window.removeEventListener('adulting_os_db_update', handleUpdate);
    };
  }, [user.id]);

  const saveInventory = (updated: InventoryItem[]) => {
    const data = DbService.getUserData(user.id);
    data.inventory = updated;
    DbService.saveUserData(user.id, data);
    setInventory(updated);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPurchaseDate || !newWarranty) return;

    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      room: newRoom,
      purchaseDate: newPurchaseDate,
      warrantyExpiration: newWarranty,
      notes: newNotes.trim() || undefined,
      receiptUrl: mockReceiptName || undefined,
      photoUrl: mockPhotoName || undefined,
    };

    const updated = [...inventory, newItem];
    saveInventory(updated);

    // Reset Form
    setNewName('');
    setNewPurchaseDate('');
    setNewWarranty('');
    setNewNotes('');
    setMockReceiptName(null);
    setMockPhotoName(null);
    setShowAddForm(false);

    DbService.addNotification(user.id, {
      title: 'Item Inventoried',
      message: `"${newItem.name}" is now cataloged in your Home Inventory under "${newItem.room}".`,
      type: 'success',
      icon: 'Package',
    });
  };

  const handleDeleteItem = (id: string) => {
    const updated = inventory.filter(item => item.id !== id);
    saveInventory(updated);
  };

  // Helper file simulations
  const triggerMockReceipt = () => {
    setMockReceiptName('receipt_scanned_pdf.png');
  };

  const triggerMockPhoto = () => {
    setMockPhotoName('appliance_setup_hq.jpg');
  };

  const now = new Date();
  const formatToday = now.toISOString().split('T')[0];

  const activeWarranties = inventory.filter(item => item.warrantyExpiration >= formatToday);
  const rooms = ['All', ...Array.from(new Set(inventory.map(item => item.room)))];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRoom = selectedRoom === 'All' ? true : item.room === selectedRoom;
    return matchesSearch && matchesRoom;
  });

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-zinc-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200">
      {/* 1. Room Filters Sidebar */}
      <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 p-3 flex flex-row md:flex-col gap-1.5 flex-shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2 mb-1 hidden md:block">Rooms</span>
        {rooms.map(room => {
          const roomCount = room === 'All' ? inventory.length : inventory.filter(item => item.room === room).length;
          return (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`flex-shrink-0 flex items-center justify-between gap-2 px-3 py-1.5 md:py-2 rounded-xl text-xs transition-all text-left ${
                selectedRoom === room
                  ? 'bg-violet-600 text-white font-semibold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-white/5'
              }`}
            >
              <span>{room}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${selectedRoom === room ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-white/5 text-neutral-400'}`}>
                {roomCount}
              </span>
            </button>
          );
        })}

        {/* Dynamic Warranty Stats */}
        <div className="hidden md:block mt-auto border-t border-zinc-100 dark:border-white/5 pt-4 px-2 text-[11px]">
          <div className="text-neutral-500 font-semibold mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Active Warranties</span>
          </div>
          <div className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {activeWarranties.length} / {inventory.length}
          </div>
          <span className="text-[9px] text-neutral-400 leading-none">Items currently insured/under coverage</span>
        </div>
      </div>

      {/* 2. Primary Workspace Panel */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white dark:bg-zinc-950">
        {/* Workspace Toolbar */}
        <div className="p-3 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="relative flex items-center bg-zinc-100 dark:bg-white/[0.04] rounded-xl px-2.5 py-1.5 w-60">
            <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search home items..."
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
            <span>Catalog Item</span>
          </button>
        </div>

        {/* Catalog Items Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Catalog input form */}
          {showAddForm && (
            <form onSubmit={handleCreateItem} className="p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg space-y-3 animate-in slide-in-from-top-4 duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Smart TV, Air Fryer, Sofa..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Appliances">Appliances</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Tools">Hardware & Tools</option>
                      <option value="Valuables">Valuables</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Room Placement</label>
                    <input
                      type="text"
                      placeholder="Kitchen, Living Room..."
                      value={newRoom}
                      onChange={(e) => setNewRoom(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Purchase Date</label>
                    <input
                      type="date"
                      required
                      value={newPurchaseDate}
                      onChange={(e) => setNewPurchaseDate(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Warranty Expiry</label>
                    <input
                      type="date"
                      required
                      value={newWarranty}
                      onChange={(e) => setNewWarranty(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Receipt attachment</span>
                    <button
                      type="button"
                      onClick={triggerMockReceipt}
                      className="w-full text-xs p-2.5 rounded-lg border border-dashed border-zinc-200 dark:border-white/10 flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 text-neutral-500 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{mockReceiptName ? 'Receipt Attached!' : 'Upload Receipt'}</span>
                    </button>
                    {mockReceiptName && <span className="text-[9px] text-emerald-500 block mt-1">{mockReceiptName}</span>}
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Item Photograph</span>
                    <button
                      type="button"
                      onClick={triggerMockPhoto}
                      className="w-full text-xs p-2.5 rounded-lg border border-dashed border-zinc-200 dark:border-white/10 flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 text-neutral-500 transition-all"
                    >
                      <Image className="w-3.5 h-3.5" />
                      <span>{mockPhotoName ? 'Photo Attached!' : 'Upload Image'}</span>
                    </button>
                    {mockPhotoName && <span className="text-[9px] text-emerald-500 block mt-1">{mockPhotoName}</span>}
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Notes</label>
                  <textarea
                    placeholder="E.g. Purchase price, model specs, setup comments..."
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
                  Save Item
                </button>
              </div>
            </form>
          )}

          {/* List items displaying cataloged specs */}
          {filteredInventory.length === 0 ? (
            <div className="py-12 text-center text-neutral-400">
              <Package className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
              <div className="text-xs font-semibold">No Cataloged Items</div>
              <p className="text-[10px] text-neutral-400 mt-1">Add details of electronics, appliances, or furniture above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredInventory.map(item => {
                const isUnderWarranty = item.warrantyExpiration >= formatToday;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between p-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{item.name}</span>
                          <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest block mt-0.5">{item.category}</span>
                        </div>

                        <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                          isUnderWarranty ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                        }`}>
                          {isUnderWarranty ? 'Under Warranty' : 'Expired'}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">
                          {item.notes}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-neutral-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{item.room}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Purchased: {item.purchaseDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-white/5 text-[9px] text-neutral-400">
                      <div className="flex items-center gap-3">
                        {item.receiptUrl && (
                          <span className="inline-flex items-center gap-0.5 text-violet-600 dark:text-violet-400 font-semibold bg-violet-500/10 px-1.5 py-0.5 rounded">
                            <Receipt className="w-3 h-3" /> Receipt
                          </span>
                        )}
                        {item.photoUrl && (
                          <span className="inline-flex items-center gap-0.5 text-violet-600 dark:text-violet-400 font-semibold bg-violet-500/10 px-1.5 py-0.5 rounded">
                            <Image className="w-3 h-3" /> Photo
                          </span>
                        )}
                        <span>Warranty Ends: {item.warrantyExpiration}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
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
    </div>
  );
}
