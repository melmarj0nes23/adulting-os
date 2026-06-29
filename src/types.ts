/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface UserPreferences {
  theme: ThemeMode;
  wallpaper: string; // URL or identifier
  accentColor: string; // color name / tailwind color class
  dockPosition: 'bottom' | 'left' | 'right';
  uiScale?: 'compact' | 'standard' | 'large';
  blurIntensity?: 'none' | 'medium' | 'high';
  magnifyDock?: boolean;
  showFullDate?: boolean;
  widgets?: string[];
  widgetPositions?: Record<string, { x: number; y: number }>;
}

export interface WindowInstance {
  id: string; // Unique window instance ID
  appId: string; // Refers to the AppManifest.id
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  // Position and size for normal state
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface AppManifest {
  id: string;
  title: string;
  icon: string; // Lucide icon name
  defaultWidth: number;
  defaultHeight: number;
  isSingleInstance?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Core Application Ecosystem Interfaces
// ============================================================================

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon: string; // Lucide icon name
  timestamp: string; // ISO string
  read: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  favorite: boolean;
  tags: string[];
  updatedAt: string; // ISO string
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  category: string;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DDTHH:MM
  endDate: string; // YYYY-MM-DDTHH:MM
  color: string; // color name/class
  reminder: 'none' | '15m' | '1h' | '1d' | '1w';
}

export interface BillItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  dueDate: string; // YYYY-MM-DD
  frequency: 'once' | 'monthly' | 'quarterly' | 'yearly';
  paid: boolean;
  notes?: string;
}

export interface SubscriptionItem {
  id: string;
  serviceName: string;
  cost: number;
  renewalDate: string; // YYYY-MM-DD
  billingCycle: 'monthly' | 'yearly';
  category: string;
  autoRenew: boolean;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
  recentlyPurchased?: boolean;
}

export interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // pcs, boxes, oz, g, etc.
  category: string;
  expirationDate: string; // YYYY-MM-DD
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  room: string;
  purchaseDate: string; // YYYY-MM-DD
  warrantyExpiration: string; // YYYY-MM-DD
  receiptUrl?: string; // Base64 or mock file path
  photoUrl?: string; // Base64 or mock file path
  notes?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  expirationDate: string; // YYYY-MM-DD
  notes?: string;
  fileUrl?: string; // Base64 or filename
  fileSize?: string;
}

export interface MaintenanceLog {
  id: string;
  type: 'oil' | 'tire' | 'repair' | 'inspection' | 'other';
  date: string; // YYYY-MM-DD
  mileage: number;
  cost: number;
  notes: string;
}

export interface VehicleItem {
  id: string;
  makeModel: string;
  year?: string;
  licensePlate?: string;
  registrationExpiry: string; // YYYY-MM-DD
  insuranceExpiry: string; // YYYY-MM-DD
  logs: MaintenanceLog[];
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  takenToday: boolean;
}

export interface WaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
}

export interface ExerciseLog {
  id: string;
  date: string; // YYYY-MM-DD
  type: string;
  durationMinutes: number;
  intensity: 'low' | 'medium' | 'high';
}

export interface MoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  score: number; // 1-5
  notes?: string;
}

export interface HealthData {
  medications: MedicationItem[];
  waterIntake: WaterLog[];
  weightHistory: WeightLog[];
  exerciseLog: ExerciseLog[];
  moodLog: MoodLog[];
}

export interface LifeDeskOSData {
  notifications: NotificationItem[];
  notes: NoteItem[];
  tasks: TaskItem[];
  events: CalendarEvent[];
  bills: BillItem[];
  subscriptions: SubscriptionItem[];
  groceryLists: GroceryList[];
  pantry: PantryItem[];
  inventory: InventoryItem[];
  documents: DocumentItem[];
  vehicles: VehicleItem[];
  health: HealthData;
}

