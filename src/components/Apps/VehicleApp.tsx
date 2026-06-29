/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Car, Calendar, DollarSign, PenSquare, FileText, Settings, ShieldAlert, Sparkles, PlusCircle } from 'lucide-react';
import { DbService } from '../../services/db';
import { User, VehicleItem, MaintenanceLog } from '../../types';

interface VehicleAppProps {
  user: User;
}

export default function VehicleApp({ user }: VehicleAppProps) {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Form States - Vehicle
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [newMakeModel, setNewMakeModel] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newRegExpiry, setNewRegExpiry] = useState('');
  const [newInsExpiry, setNewInsExpiry] = useState('');

  // Form States - Maintenance Log
  const [showAddLogForm, setShowAddLogForm] = useState(false);
  const [logType, setLogType] = useState<'oil' | 'tire' | 'repair' | 'inspection' | 'other'>('oil');
  const [logDate, setLogDate] = useState('');
  const [logMileage, setLogMileage] = useState('');
  const [logCost, setLogCost] = useState('');
  const [logNotes, setLogNotes] = useState('');

  const loadVehicles = () => {
    const data = DbService.getUserData(user.id);
    const loaded = data.vehicles || [];
    setVehicles(loaded);

    if (loaded.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(loaded[0].id);
    }
  };

  useEffect(() => {
    loadVehicles();

    const handleUpdate = () => {
      loadVehicles();
    };

    window.addEventListener('lifedesk_os_db_update', handleUpdate);
    return () => {
      window.removeEventListener('lifedesk_os_db_update', handleUpdate);
    };
  }, [user.id]);

  const saveVehicles = (updated: VehicleItem[]) => {
    const data = DbService.getUserData(user.id);
    data.vehicles = updated;
    DbService.saveUserData(user.id, data);
    setVehicles(updated);
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMakeModel.trim() || !newRegExpiry || !newInsExpiry) return;

    const newVehicle: VehicleItem = {
      id: `veh_${Date.now()}`,
      makeModel: newMakeModel.trim(),
      year: newYear.trim() || undefined,
      licensePlate: newPlate.trim() || undefined,
      registrationExpiry: newRegExpiry,
      insuranceExpiry: newInsExpiry,
      logs: [],
    };

    const updated = [...vehicles, newVehicle];
    saveVehicles(updated);
    setSelectedVehicleId(newVehicle.id);

    // Reset Form
    setNewMakeModel('');
    setNewYear('');
    setNewPlate('');
    setNewRegExpiry('');
    setNewInsExpiry('');
    setShowAddVehicleForm(false);

    DbService.addNotification(user.id, {
      title: 'Vehicle Cataloged',
      message: `"${newVehicle.makeModel}" has been added to your vehicle maintenance log.`,
      type: 'success',
      icon: 'Car',
    });
  };

  const handleDeleteVehicle = (id: string) => {
    const updated = vehicles.filter(v => v.id !== id);
    saveVehicles(updated);
    if (selectedVehicleId === id) {
      setSelectedVehicleId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !logDate || !logMileage) return;

    const newLog: MaintenanceLog = {
      id: `log_${Date.now()}`,
      type: logType,
      date: logDate,
      mileage: parseInt(logMileage) || 0,
      cost: parseFloat(logCost) || 0,
      notes: logNotes.trim(),
    };

    const updated = vehicles.map(v => {
      if (v.id === selectedVehicleId) {
        return {
          ...v,
          logs: [newLog, ...v.logs],
        };
      }
      return v;
    });

    saveVehicles(updated);

    // Reset log states
    setLogDate('');
    setLogMileage('');
    setLogCost('');
    setLogNotes('');
    setShowAddLogForm(false);

    DbService.addNotification(user.id, {
      title: 'Service Logged',
      message: `New maintenance entry (${newLog.type}) registered for your vehicle.`,
      type: 'info',
      icon: 'Settings',
    });
  };

  const handleDeleteLog = (logId: string) => {
    if (!selectedVehicleId) return;
    const updated = vehicles.map(v => {
      if (v.id === selectedVehicleId) {
        return {
          ...v,
          logs: v.logs.filter(l => l.id !== logId),
        };
      }
      return v;
    });
    saveVehicles(updated);
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Expiry checks
  const now = new Date();
  const formatToday = now.toISOString().split('T')[0];

  const totalMaintenanceCost = selectedVehicle
    ? selectedVehicle.logs.reduce((sum, log) => sum + log.cost, 0)
    : 0;

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-zinc-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200">
      {/* 1. Vehicles sidebar */}
      <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 p-3 flex flex-row md:flex-col gap-1.5 flex-shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center justify-between px-2 mb-1 flex-shrink-0">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-sans hidden md:block">Vehicles</span>
          <button
            onClick={() => setShowAddVehicleForm(!showAddVehicleForm)}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-white/5 text-violet-500 flex-shrink-0"
            title="Add Vehicle Profile"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Add Vehicle Form */}
        {showAddVehicleForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
            <form onSubmit={handleCreateVehicle} className="w-full max-w-sm p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl space-y-3 animate-in zoom-in-95 duration-150">
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Add Vehicle Profile</h3>
              
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Make & Model</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Tesla Model Y"
                  value={newMakeModel}
                  onChange={(e) => setNewMakeModel(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Year</label>
                  <input
                    type="text"
                    placeholder="2023"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Plate</label>
                  <input
                    type="text"
                    placeholder="X92-AB"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Reg Expiry</label>
                <input
                  type="date"
                  required
                  value={newRegExpiry}
                  onChange={(e) => setNewRegExpiry(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Ins Expiry</label>
                <input
                  type="date"
                  required
                  value={newInsExpiry}
                  onChange={(e) => setNewInsExpiry(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleForm(false)}
                  className="px-3 py-1.5 border border-zinc-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs hover:bg-zinc-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700"
                >
                  Add Profile
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex-1 md:flex-initial overflow-x-auto md:overflow-y-auto flex flex-row md:flex-col gap-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {vehicles.length === 0 ? (
            <div className="text-center py-6 text-[10px] text-neutral-400">No vehicles tracked.</div>
          ) : (
            vehicles.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className={`w-auto md:w-full flex-shrink-0 flex items-center justify-between gap-2 px-3 py-1.5 md:py-2.5 rounded-xl text-xs transition-all text-left ${
                  selectedVehicleId === v.id
                    ? 'bg-violet-600 text-white font-semibold shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Car className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{v.makeModel}</span>
                </div>
                {selectedVehicleId === v.id && vehicles.length > 1 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); handleDeleteVehicle(v.id); }}
                    className="w-3.5 h-3.5 rounded hover:bg-white/20 flex items-center justify-center text-[10px] text-white/80"
                  >
                    ×
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* 2. Workspace Profile Logs & Maintenance Deck */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white dark:bg-zinc-950">
        {selectedVehicle ? (
          <>
            {/* Top overview details card */}
            <div className="p-4 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold font-display">{selectedVehicle.year} {selectedVehicle.makeModel}</h2>
                  {selectedVehicle.licensePlate && (
                    <span className="text-[9px] font-mono font-bold bg-neutral-200 dark:bg-white/10 px-1.5 py-0.5 rounded uppercase">
                      Plate: {selectedVehicle.licensePlate}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-neutral-400 mt-1.5">
                  <span className={selectedVehicle.registrationExpiry < formatToday ? 'text-red-500 font-bold' : ''}>
                    Reg Expiry: {selectedVehicle.registrationExpiry}
                  </span>
                  <span className={selectedVehicle.insuranceExpiry < formatToday ? 'text-red-500 font-bold' : ''}>
                    Insurance Expiry: {selectedVehicle.insuranceExpiry}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-neutral-400 uppercase block">Total Expenses</span>
                <span className="font-mono text-base font-bold text-neutral-800 dark:text-white block mt-0.5">
                  ${totalMaintenanceCost.toLocaleString([], { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Logging actions and items lists */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-1">Maintenance History</span>
                <button
                  onClick={() => setShowAddLogForm(!showAddLogForm)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Log Service</span>
                </button>
              </div>

              {/* Log entry input form */}
              {showAddLogForm && (
                <form onSubmit={handleCreateLog} className="p-4 border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.01] rounded-2xl space-y-3 animate-in slide-in-from-top-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Service Type</label>
                      <select
                        value={logType}
                        onChange={(e) => setLogType(e.target.value as any)}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none"
                      >
                        <option value="oil">Oil Change</option>
                        <option value="tire">Tire Rotation / Replacement</option>
                        <option value="repair">Mechanical Repair</option>
                        <option value="inspection">Safety / Emissions Inspection</option>
                        <option value="other">Other Service</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Cost ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="80.00"
                          value={logCost}
                          onChange={(e) => setLogCost(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Mileage</label>
                        <input
                          type="number"
                          required
                          placeholder="24500"
                          value={logMileage}
                          onChange={(e) => setLogMileage(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Date</label>
                        <input
                          type="date"
                          required
                          value={logDate}
                          onChange={(e) => setLogDate(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Notes</label>
                      <textarea
                        required
                        placeholder="E.g. Replaced filter, check pressure, brand details..."
                        value={logNotes}
                        onChange={(e) => setLogNotes(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 focus:outline-none h-16 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowAddLogForm(false)}
                      className="px-3 py-1.5 border border-zinc-200 text-neutral-500 rounded-xl text-xs hover:bg-neutral-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700"
                    >
                      Save Service Log
                    </button>
                  </div>
                </form>
              )}

              {/* Render logs list */}
              {selectedVehicle.logs.length === 0 ? (
                <div className="py-12 text-center text-neutral-400">
                  <Settings className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                  <div className="text-xs font-semibold">No Service History</div>
                  <p className="text-[10px] text-neutral-400 mt-1">Log oil changes, inspection deadlines or mechanical repairs above.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {selectedVehicle.logs.map(log => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 hover:shadow-sm transition-all flex items-start justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-md">
                            {log.type}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-neutral-500">
                            {log.mileage.toLocaleString()} mi
                          </span>
                        </div>

                        <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-2">
                          {log.notes}
                        </p>

                        <div className="text-[9px] text-neutral-400 mt-1.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          <span>Performed: {log.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-neutral-800 dark:text-white">
                          ${log.cost.toFixed(2)}
                        </span>

                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400">
            <Car className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-3" />
            <div className="text-xs font-semibold">No Vehicle Profile</div>
            <p className="text-[10px] text-neutral-400 max-w-xs mt-1">
              Add details of your family vehicles in the sidebar to maintain robust service logs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
