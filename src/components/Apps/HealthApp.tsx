/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, Heart, Check, PlusCircle, Droplet, Dumbbell, Smile, ChevronRight, Activity, Sparkles, Scale } from 'lucide-react';
import { DbService } from '../../services/db';
import { User, HealthData, MedicationItem, WaterLog, WeightLog, ExerciseLog, MoodLog } from '../../types';

interface HealthAppProps {
  user: User;
}

export default function HealthApp({ user }: HealthAppProps) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [activeTab, setActiveTab] = useState<'meds' | 'water' | 'weight' | 'exercise' | 'mood'>('meds');

  // Addition Form States
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('Daily');
  const [newMedTime, setNewMedTime] = useState('08:00');

  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState('');

  const [newExerciseType, setNewExerciseType] = useState('');
  const [newExerciseDur, setNewExerciseDur] = useState('');
  const [newExerciseInt, setNewExerciseInt] = useState<'low' | 'medium' | 'high'>('medium');

  const [newMoodScore, setNewMoodScore] = useState<number>(5);
  const [newMoodNotes, setNewMoodNotes] = useState('');

  const loadHealth = () => {
    const data = DbService.getUserData(user.id);
    setHealth(data.health || {
      medications: [],
      waterIntake: [],
      weightHistory: [],
      exerciseLog: [],
      moodLog: [],
    });
  };

  useEffect(() => {
    loadHealth();

    const handleUpdate = () => {
      loadHealth();
    };

    window.addEventListener('lifedesk_os_db_update', handleUpdate);
    return () => {
      window.removeEventListener('lifedesk_os_db_update', handleUpdate);
    };
  }, [user.id]);

  const saveHealth = (updated: HealthData) => {
    const data = DbService.getUserData(user.id);
    data.health = updated;
    DbService.saveUserData(user.id, data);
    setHealth(updated);
  };

  // 1. Medications Handlers
  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!health || !newMedName.trim() || !newMedDosage) return;

    const newMed: MedicationItem = {
      id: `med_${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage,
      frequency: newMedFreq,
      time: newMedTime,
      takenToday: false,
    };

    const updated = {
      ...health,
      medications: [...health.medications, newMed],
    };
    saveHealth(updated);

    // Reset Form
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleToggleMedTaken = (id: string) => {
    if (!health) return;
    const updated = {
      ...health,
      medications: health.medications.map(m => {
        if (m.id === id) {
          const takenToday = !m.takenToday;
          if (takenToday) {
            DbService.addNotification(user.id, {
              title: 'Prescription Taken',
              message: `You marked "${m.name}" (${m.dosage}) as taken. Keep healthy!`,
              type: 'success',
              icon: 'Heart',
            });
          }
          return { ...m, takenToday };
        }
        return m;
      }),
    };
    saveHealth(updated);
  };

  const handleDeleteMed = (id: string) => {
    if (!health) return;
    const updated = {
      ...health,
      medications: health.medications.filter(m => m.id !== id),
    };
    saveHealth(updated);
  };

  // 2. Water Log Handlers
  const handleLogWater = (amountMl: number) => {
    if (!health) return;
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if water log for today exists
    const existingLogIdx = health.waterIntake.findIndex(w => w.date === todayStr);
    let updatedWater = [...health.waterIntake];

    if (existingLogIdx !== -1) {
      updatedWater[existingLogIdx] = {
        ...updatedWater[existingLogIdx],
        amountMl: Math.max(0, updatedWater[existingLogIdx].amountMl + amountMl),
      };
    } else {
      updatedWater.push({
        id: `wat_${Date.now()}`,
        date: todayStr,
        amountMl,
      });
    }

    saveHealth({
      ...health,
      waterIntake: updatedWater,
    });
  };

  const getTodayWaterAmount = () => {
    if (!health) return 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const log = health.waterIntake.find(w => w.date === todayStr);
    return log ? log.amountMl : 0;
  };

  // 3. Weight Handlers
  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!health || !newWeight || !newWeightDate) return;

    const newLog: WeightLog = {
      id: `wei_${Date.now()}`,
      date: newWeightDate,
      weightKg: parseFloat(newWeight),
    };

    const updated = {
      ...health,
      weightHistory: [newLog, ...health.weightHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
    saveHealth(updated);
    setNewWeight('');
    setNewWeightDate('');
  };

  const handleDeleteWeight = (id: string) => {
    if (!health) return;
    const updated = {
      ...health,
      weightHistory: health.weightHistory.filter(w => w.id !== id),
    };
    saveHealth(updated);
  };

  // 4. Exercise Handlers
  const handleLogExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!health || !newExerciseType.trim() || !newExerciseDur) return;

    const newLog: ExerciseLog = {
      id: `exe_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: newExerciseType.trim(),
      durationMinutes: parseInt(newExerciseDur) || 0,
      intensity: newExerciseInt,
    };

    const updated = {
      ...health,
      exerciseLog: [newLog, ...health.exerciseLog],
    };
    saveHealth(updated);
    setNewExerciseType('');
    setNewExerciseDur('');
  };

  const handleDeleteExercise = (id: string) => {
    if (!health) return;
    const updated = {
      ...health,
      exerciseLog: health.exerciseLog.filter(exe => exe.id !== id),
    };
    saveHealth(updated);
  };

  // 5. Mood Handlers
  const handleLogMood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!health) return;

    const newLog: MoodLog = {
      id: `moo_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      score: newMoodScore,
      notes: newMoodNotes.trim() || undefined,
    };

    const updated = {
      ...health,
      moodLog: [newLog, ...health.moodLog],
    };
    saveHealth(updated);
    setNewMoodNotes('');
  };

  const handleDeleteMood = (id: string) => {
    if (!health) return;
    const updated = {
      ...health,
      moodLog: health.moodLog.filter(m => m.id !== id),
    };
    saveHealth(updated);
  };

  const moodFaces: Record<number, string> = {
    1: '😢',
    2: '🙁',
    3: '😐',
    4: '🙂',
    5: '😄',
  };

  if (!health) return null;

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200">
      {/* 1. Header Toolbar Navigation */}
      <div className="flex items-center gap-1.5 p-3.5 border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 overflow-x-auto flex-shrink-0">
        <button
          onClick={() => setActiveTab('meds')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
            activeTab === 'meds' ? 'bg-violet-600 text-white shadow-sm font-bold' : 'hover:bg-zinc-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Medications</span>
        </button>

        <button
          onClick={() => setActiveTab('water')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
            activeTab === 'water' ? 'bg-violet-600 text-white shadow-sm font-bold' : 'hover:bg-zinc-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>Water Log</span>
        </button>

        <button
          onClick={() => setActiveTab('weight')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
            activeTab === 'weight' ? 'bg-violet-600 text-white shadow-sm font-bold' : 'hover:bg-zinc-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Weight Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('exercise')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
            activeTab === 'exercise' ? 'bg-violet-600 text-white shadow-sm font-bold' : 'hover:bg-zinc-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Workouts</span>
        </button>

        <button
          onClick={() => setActiveTab('mood')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
            activeTab === 'mood' ? 'bg-violet-600 text-white shadow-sm font-bold' : 'hover:bg-zinc-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>Mood Tracker</span>
        </button>
      </div>

      {/* 2. Primary Tabs Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        
        {/* TAB 1: Medications */}
        {activeTab === 'meds' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Meds addition list */}
            <form onSubmit={handleCreateMed} className="p-4 border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 rounded-2xl h-fit space-y-3 md:col-span-1">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-1.5">Add Medication</span>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Multivitamin, Claritin..."
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. 1 pill, 10mg"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Scheduled Time</label>
                  <input
                    type="time"
                    required
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Frequency</label>
                <select
                  value={newMedFreq}
                  onChange={(e) => setNewMedFreq(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 focus:outline-none"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="As Needed">As Needed / PRN</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700"
              >
                Log Medication
              </button>
            </form>

            {/* Meds list displays */}
            <div className="md:col-span-2 space-y-3">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block px-1">Prescription Tracker</span>
              
              {health.medications.length === 0 ? (
                <div className="py-12 text-center text-neutral-400">
                  <Heart className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                  <div className="text-xs font-semibold">No Medications Tracked</div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {health.medications.map(med => (
                    <div
                      key={med.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        med.takenToday
                          ? 'border-zinc-200 bg-zinc-100/30 dark:border-white/5 opacity-75'
                          : 'border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <button
                          onClick={() => handleToggleMedTaken(med.id)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            med.takenToday
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-neutral-300 hover:border-violet-500'
                          }`}
                        >
                          {med.takenToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div>
                          <span className={`text-xs font-bold ${med.takenToday ? 'line-through text-neutral-400' : ''}`}>{med.name}</span>
                          <div className="flex items-center gap-2 text-[9px] text-neutral-400 mt-1">
                            <span>Dosage: {med.dosage}</span>
                            <span>•</span>
                            <span>Time: {med.time}</span>
                            <span>•</span>
                            <span>Frequency: {med.frequency}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                          med.takenToday ? 'bg-emerald-500/15 text-emerald-600' : 'bg-neutral-100 dark:bg-white/5 text-neutral-400'
                        }`}>
                          {med.takenToday ? 'Taken Today' : 'Pending'}
                        </span>

                        <button
                          onClick={() => handleDeleteMed(med.id)}
                          className="p-1 rounded hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Water logging */}
        {activeTab === 'water' && (
          <div className="max-w-md mx-auto text-center py-8 space-y-6">
            <div className="p-6 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-3xl shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <Droplet className="w-8 h-8 text-blue-500 fill-blue-500/20" />
              </div>

              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Today's Intake</span>
              <div className="text-3xl font-bold font-mono text-neutral-800 dark:text-white mt-1">
                {getTodayWaterAmount()} <span className="text-sm font-semibold text-neutral-400 font-sans">ml</span>
              </div>
              <span className="text-[10px] text-neutral-400 mt-1.5">Hydration Target: 2000 ml</span>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden mt-6">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (getTodayWaterAmount() / 2000) * 100)}%` }}
                />
              </div>
            </div>

            {/* Quick adding water keys */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleLogWater(250)}
                className="p-3 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl text-xs font-bold hover:border-blue-500 transition-all flex flex-col items-center gap-1"
              >
                <Droplet className="w-4 h-4 text-blue-500" />
                <span>+250 ml</span>
              </button>

              <button
                onClick={() => handleLogWater(500)}
                className="p-3 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl text-xs font-bold hover:border-blue-500 transition-all flex flex-col items-center gap-1"
              >
                <Droplet className="w-4.5 h-4.5 text-blue-500" />
                <span>+500 ml</span>
              </button>

              <button
                onClick={() => handleLogWater(-250)}
                className="p-3 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl text-xs font-bold hover:border-red-500 transition-all flex flex-col items-center gap-1 text-neutral-400"
              >
                <Minus className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Weight Tracker */}
        {activeTab === 'weight' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form onSubmit={handleLogWeight} className="p-4 border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 rounded-2xl h-fit space-y-3">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Log Weight</span>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Weight (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="78.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Log Date</label>
                <input
                  type="date"
                  required
                  value={newWeightDate}
                  onChange={(e) => setNewWeightDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 focus:outline-none"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700">
                Record Weight
              </button>
            </form>

            <div className="md:col-span-2 space-y-3">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block px-1">Weight Logs History</span>
              <div className="flex flex-col gap-2">
                {health.weightHistory.length === 0 ? (
                  <div className="py-12 text-center text-neutral-400">No Weight Logs recorded.</div>
                ) : (
                  health.weightHistory.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 rounded-2xl"
                    >
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-violet-500" />
                        <span className="text-xs font-bold">{item.weightKg} kg</span>
                        <span className="text-[10px] text-neutral-400">({(item.weightKg * 2.20462).toFixed(1)} lbs)</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-neutral-400">{item.date}</span>
                        <button
                          onClick={() => handleDeleteWeight(item.id)}
                          className="p-1 rounded hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Exercises */}
        {activeTab === 'exercise' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form onSubmit={handleLogExercise} className="p-4 border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 rounded-2xl h-fit space-y-3">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Log Workout</span>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Exercise / Workout Type</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Strength Training, Running..."
                  value={newExerciseType}
                  onChange={(e) => setNewExerciseType(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    required
                    placeholder="45"
                    value={newExerciseDur}
                    onChange={(e) => setNewExerciseDur(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Intensity</label>
                  <select
                    value={newExerciseInt}
                    onChange={(e) => setNewExerciseInt(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-2 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700">
                Log Workout
              </button>
            </form>

            <div className="md:col-span-2 space-y-3">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block px-1">Exercise History Log</span>
              <div className="flex flex-col gap-2">
                {health.exerciseLog.length === 0 ? (
                  <div className="py-12 text-center text-neutral-400">No exercise logs found.</div>
                ) : (
                  health.exerciseLog.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                          <Dumbbell className="w-4 h-4 text-neutral-600" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block">{item.type}</span>
                          <span className="text-[9px] text-neutral-400 block mt-0.5">Duration: {item.durationMinutes} mins • Intensity: {item.intensity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-neutral-400">{item.date}</span>
                        <button
                          onClick={() => handleDeleteExercise(item.id)}
                          className="p-1 rounded hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Moods */}
        {activeTab === 'mood' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form onSubmit={handleLogMood} className="p-4 border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 rounded-2xl h-fit space-y-3">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">How are you feeling?</span>
              
              {/* Score select */}
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map(score => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setNewMoodScore(score)}
                    className={`w-9 h-9 rounded-full text-lg flex items-center justify-center transition-all ${
                      newMoodScore === score
                        ? 'bg-violet-600 text-white scale-110 shadow-md border-2 border-white'
                        : 'bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {moodFaces[score]}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Mood Notes / Journal Entry</label>
                <textarea
                  placeholder="What's causing this feeling? Quick journaling..."
                  value={newMoodNotes}
                  onChange={(e) => setNewMoodNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 focus:outline-none h-20 resize-none"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700">
                Log Mood Status
              </button>
            </form>

            <div className="md:col-span-2 space-y-3">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block px-1">Mood History Log</span>
              <div className="flex flex-col gap-2">
                {health.moodLog.length === 0 ? (
                  <div className="py-12 text-center text-neutral-400">No journal logs recorded.</div>
                ) : (
                  health.moodLog.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 rounded-2xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{moodFaces[item.score] || '😐'}</span>
                          <span className="text-[10px] font-semibold text-neutral-400">{item.date}</span>
                        </div>

                        <button
                          onClick={() => handleDeleteMood(item.id)}
                          className="p-1 rounded hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 italic leading-relaxed">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
