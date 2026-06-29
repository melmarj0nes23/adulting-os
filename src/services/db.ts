/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserPreferences } from '../types';
import { hashPassword, verifyPassword } from './crypto';

// Local storage keys
const USERS_KEY = 'lifedesk_os_users';
const PREFS_KEY_PREFIX = 'lifedesk_os_prefs_';

// Default Preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  wallpaper: 'light-spring',
  accentColor: 'violet',
  dockPosition: 'bottom',
  uiScale: 'standard',
  blurIntensity: 'medium',
  magnifyDock: true,
  showFullDate: true,
  widgets: ['tasks', 'health', 'bills', 'notes'],
  widgetPositions: {},
};

// Built-in Wallpapers list
export interface WallpaperOption {
  id: string;
  name: string;
  className: string; // Tailwind gradient/styling
}

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: 'dark-mesh',
    name: 'Midnight Mesh',
    className: 'bg-zinc-950 bg-gradient-to-tr from-slate-950 via-zinc-900 to-zinc-950',
  },
  {
    id: 'dark-grid',
    name: 'Cyber Blueprint',
    className: 'bg-slate-950 bg-gradient-to-br from-indigo-950 via-slate-950 to-neutral-950',
  },
  {
    id: 'dark-geo',
    name: 'Geometric Noir',
    className: 'bg-zinc-950 bg-gradient-to-tr from-black via-zinc-950 to-neutral-900',
  },
  {
    id: 'light-sand',
    name: 'Minimalist Sand',
    className: 'bg-stone-50 bg-gradient-to-tr from-amber-50 via-stone-100 to-orange-50/60',
  },
  {
    id: 'light-spring',
    name: 'Glassmorphic Spring',
    className: 'bg-zinc-50 bg-gradient-to-br from-sky-50 via-emerald-50/50 to-indigo-50/60',
  },
  {
    id: 'light-lines',
    name: 'Nordic Lines',
    className: 'bg-slate-50 bg-gradient-to-tr from-zinc-100 via-slate-50 to-zinc-200/30',
  }
];

// Accent colors list
export interface AccentColorOption {
  id: string;
  name: string;
  colorClass: string; // Background class (for previews)
  textClass: string; // Text styling
  borderClass: string; // Border accent
}

export const ACCENT_COLORS: AccentColorOption[] = [
  {
    id: 'violet',
    name: 'Royal Violet',
    colorClass: 'bg-violet-600',
    textClass: 'text-violet-400',
    borderClass: 'border-violet-500/30',
  },
  {
    id: 'emerald',
    name: 'Forest Emerald',
    colorClass: 'bg-emerald-600',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
  },
  {
    id: 'sky',
    name: 'Arc Sky',
    colorClass: 'bg-sky-500',
    textClass: 'text-sky-400',
    borderClass: 'border-sky-500/30',
  },
  {
    id: 'rose',
    name: 'Rose Quartz',
    colorClass: 'bg-rose-500',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
  },
  {
    id: 'amber',
    name: 'Amber Glow',
    colorClass: 'bg-amber-500',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
  },
];

interface StoredUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

/**
 * Gets all stored users.
 */
function getStoredUsers(): StoredUser[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse stored users:', error);
    return [];
  }
}

/**
 * Saves users list.
 */
function saveStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save stored users:', error);
  }
}

/**
 * Database and Auth API Service
 */
export const DbService = {
  /**
   * Initializes a demo/guest user with full sample database records.
   */
  createDemoUser(): User {
    const users = getStoredUsers();
    const demoId = 'demo_user';
    
    let demoUser = users.find(u => u.id === demoId);
    if (!demoUser) {
      demoUser = {
        id: demoId,
        username: 'Guest Demo',
        email: 'demo@lifedeskos.com',
        passwordHash: '',
        createdAt: new Date().toISOString(),
      };
      users.push(demoUser);
      saveStoredUsers(users);
      this.savePreferences(demoId, DEFAULT_PREFERENCES);
    }
    
    return {
      id: demoUser.id,
      username: demoUser.username,
      email: demoUser.email,
      createdAt: demoUser.createdAt,
    };
  },

  /**
   * Registers a brand new user with cryptographically secure hashed password.
   */
  async registerUser(username: string, email: string, password: string): Promise<User> {
    const users = getStoredUsers();
    
    // Validate email / username uniqueness
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();
    
    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }
    
    if (users.some(u => u.username.toLowerCase() === normalizedUsername.toLowerCase())) {
      throw new Error('This username is already taken.');
    }
    
    const passwordHash = await hashPassword(password);
    const id = window.crypto.randomUUID ? window.crypto.randomUUID() : 'usr_' + Math.random().toString(36).substr(2, 9);
    
    const newUser: StoredUser = {
      id,
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    saveStoredUsers(users);
    
    // Create default preferences for this user
    this.savePreferences(id, DEFAULT_PREFERENCES);
    
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  },

  /**
   * Authenticates a user and returns their profile.
   */
  async authenticateUser(emailOrUsername: string, password: string): Promise<User> {
    const users = getStoredUsers();
    const query = emailOrUsername.toLowerCase().trim();
    
    const foundUser = users.find(
      u => u.email.toLowerCase() === query || u.username.toLowerCase() === query
    );
    
    if (!foundUser) {
      throw new Error('Invalid email, username, or password.');
    }
    
    const isValid = await verifyPassword(password, foundUser.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email, username, or password.');
    }
    
    return {
      id: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      createdAt: foundUser.createdAt,
    };
  },

  /**
   * Gets preferences for a user, or defaults if not set.
   */
  getPreferences(userId: string): UserPreferences {
    try {
      const data = localStorage.getItem(`${PREFS_KEY_PREFIX}${userId}`);
      if (data) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error reading preferences:', e);
    }
    return { ...DEFAULT_PREFERENCES };
  },

  /**
   * Updates user profile (username).
   */
  updateUser(userId: string, username: string): User {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found.');
    }
    
    const normalizedUsername = username.trim();
    if (users.some(u => u.id !== userId && u.username.toLowerCase() === normalizedUsername.toLowerCase())) {
      throw new Error('This username is already taken.');
    }
    
    users[userIndex].username = normalizedUsername;
    saveStoredUsers(users);
    
    return {
      id: users[userIndex].id,
      username: users[userIndex].username,
      email: users[userIndex].email,
      createdAt: users[userIndex].createdAt,
    };
  },

  /**
   * Gets total count of users registered in the system.
   */
  getUserCount(): number {
    const count = getStoredUsers().length;
    return count > 0 ? count : 1;
  },

  /**
   * Saves preferences for a specific user.
   */
  savePreferences(userId: string, prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences(userId);
    const updated = { ...current, ...prefs };
    try {
      localStorage.setItem(`${PREFS_KEY_PREFIX}${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving preferences:', e);
    }
    return updated;
  },

  /**
   * Loads full LifeDeskOS application data for a user, initializing it with premium default records if none exists.
   */
  getUserData(userId: string): any {
    const key = `lifedesk_os_data_${userId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading user application data:', e);
    }

    // Default premium interactive mock data
    const now = new Date();
    const formatOffsetDate = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const formatOffsetDateTime = (days: number, timeStr: string) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return `${d.toISOString().split('T')[0]}T${timeStr}`;
    };

    const defaultData = {
      notifications: [
        {
          id: 'notif_1',
          title: 'Workspace Initialized',
          message: 'Welcome to LifeDeskOS! Your premium dashboard and personal productivity suite is active.',
          type: 'success',
          icon: 'Sparkles',
          timestamp: new Date(now.getTime() - 600000).toISOString(),
          read: false,
        },
        {
          id: 'notif_2',
          title: 'Upcoming Bill Alert',
          message: 'Your Electricity Bill ($120.00) is due in 5 days on ' + formatOffsetDate(5) + '.',
          type: 'warning',
          icon: 'CreditCard',
          timestamp: new Date(now.getTime() - 3600000).toISOString(),
          read: false,
        },
        {
          id: 'notif_3',
          title: 'Subscription Renewal',
          message: 'Spotify Premium ($10.99) will auto-renew in 3 days.',
          type: 'info',
          icon: 'Repeat',
          timestamp: new Date(now.getTime() - 7200000).toISOString(),
          read: true,
        },
      ],
      notes: [
        {
          id: 'note_1',
          title: '💡 Weekly Meal Planner Ideas',
          content: 'Monday: Lemon Herb Salmon with Quinoa and Roasted Asparagus.\nTuesday: Turkey Tacos on whole-wheat tortillas with fresh avocado salsa.\nWednesday: Big chopped Mediterranean chickpea salad (Prep extra dressing!).\nThursday: Garlic butter shrimp stir-fry with broccoli and white rice.\nFriday: Healthy homemade pizza using sourdough flatbread and fresh mozzarella.',
          pinned: true,
          favorite: true,
          tags: ['MealPrep', 'Healthy'],
          updatedAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
        },
        {
          id: 'note_2',
          title: '🏡 Weekend Cleaning Checklist',
          content: '- [x] Wash bed sheets & pillow covers\n- [ ] Vacuum living room rug and sweep under the sofa\n- [ ] Clean microwave and wipe kitchen countertops\n- [ ] Deep clean bathroom shower and mirrors\n- [ ] Empty all trash bins & wipe down recycling boxes',
          pinned: false,
          favorite: false,
          tags: ['Home', 'Chores'],
          updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 20).toISOString(),
        },
        {
          id: 'note_3',
          title: '🚘 Auto Maintenance Specs',
          content: 'Keep this handy for reference:\n\n- Oil Type: 0W-20 Full Synthetic\n- Tire Pressure (PSI): 35 Front / 35 Rear\n- Air Filter: Replace every 15,000 miles\n- Wiper Blade Sizes: 26" Driver / 18" Passenger\n- Spark Plugs: Replace at 100,000 miles',
          pinned: false,
          favorite: true,
          tags: ['Car', 'Specs'],
          updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
        },
      ],
      tasks: [
        {
          id: 'task_1',
          title: 'Schedule annual dental checkup & cleaning',
          completed: false,
          dueDate: formatOffsetDate(3),
          priority: 'high',
          category: 'Health',
          notes: 'Dr. Henderson Office: (555) 019-2834. Check if insurance network is still active.',
        },
        {
          id: 'task_2',
          title: 'Pay upcoming electricity bill ($120.00)',
          completed: false,
          dueDate: formatOffsetDate(5),
          priority: 'high',
          category: 'Finance',
          notes: 'Auto-draft is off. Pay online through Puget Sound Energy portal.',
        },
        {
          id: 'task_3',
          title: 'Rotate tires and check alignment',
          completed: false,
          dueDate: formatOffsetDate(10),
          priority: 'medium',
          category: 'Vehicle',
          notes: 'Schedule appointment at Costco Wholesale tire center.',
        },
        {
          id: 'task_4',
          title: 'Replenish pantry spices and baking soda',
          completed: true,
          dueDate: formatOffsetDate(-1),
          priority: 'low',
          category: 'Household',
          notes: 'Need: Garlic powder, Smoked paprika, Baking soda.',
        },
        {
          id: 'task_5',
          title: 'Review insurance policies for car & renters',
          completed: false,
          dueDate: formatOffsetDate(14),
          priority: 'low',
          category: 'Finance',
          notes: 'Compare quotes from GEICO vs Progressive.',
        },
      ],
      events: [
        {
          id: 'event_1',
          title: '⚡ Electricity Bill Due Date',
          description: 'PUGET_SOUND_ENERGY // Autopay disabled. Pay $120.00 online.',
          startDate: formatOffsetDateTime(5, '09:00'),
          endDate: formatOffsetDateTime(5, '10:00'),
          color: 'amber',
          reminder: '1d',
        },
        {
          id: 'event_2',
          title: '🚗 Tire Rotation Appointment',
          description: 'Costco Tire Center. Appt: #4092-A',
          startDate: formatOffsetDateTime(10, '11:00'),
          endDate: formatOffsetDateTime(10, '12:00'),
          color: 'indigo',
          reminder: '1h',
        },
        {
          id: 'event_3',
          title: '🩺 Annual Dental Cleaning',
          description: 'Henderson Dental. Call on arrival.',
          startDate: formatOffsetDateTime(3, '14:30'),
          endDate: formatOffsetDateTime(3, '15:30'),
          color: 'emerald',
          reminder: '1d',
        },
        {
          id: 'event_4',
          title: '🥕 Weekly Meal Prep Session',
          description: 'Prepare lunches and dinners for the work week. Pack in glass containers.',
          startDate: formatOffsetDateTime(6, '16:00'),
          endDate: formatOffsetDateTime(6, '18:00'),
          color: 'violet',
          reminder: 'none',
        },
      ],
      bills: [
        {
          id: 'bill_1',
          name: 'Electricity Bill',
          category: 'Utilities',
          amount: 120.00,
          currency: 'USD',
          dueDate: formatOffsetDate(5),
          frequency: 'monthly',
          paid: false,
          notes: 'Puget Sound Energy. Account: 394801-B',
        },
        {
          id: 'bill_2',
          name: 'Water & Sewer',
          category: 'Utilities',
          amount: 45.50,
          currency: 'USD',
          dueDate: formatOffsetDate(12),
          frequency: 'monthly',
          paid: true,
          notes: 'City Utility Dept. Paid via auto-draft.',
        },
        {
          id: 'bill_3',
          name: 'Home Rent / Mortgage',
          category: 'Housing',
          amount: 1650.00,
          currency: 'USD',
          dueDate: formatOffsetDate(1),
          frequency: 'monthly',
          paid: true,
          notes: 'Paid via direct bank transfer.',
        },
        {
          id: 'bill_4',
          name: 'Home Insurance Premium',
          category: 'Insurance',
          amount: 150.00,
          currency: 'USD',
          dueDate: formatOffsetDate(20),
          frequency: 'quarterly',
          paid: false,
          notes: 'State Farm policy SF-94021',
        },
      ],
      subscriptions: [
        {
          id: 'sub_1',
          serviceName: 'Netflix Premium',
          cost: 15.49,
          renewalDate: formatOffsetDate(8),
          billingCycle: 'monthly',
          category: 'Entertainment',
          autoRenew: true,
        },
        {
          id: 'sub_2',
          serviceName: 'Spotify Premium Family',
          cost: 10.99,
          renewalDate: formatOffsetDate(3),
          billingCycle: 'monthly',
          category: 'Music',
          autoRenew: true,
        },
        {
          id: 'sub_3',
          serviceName: 'Gym Membership',
          cost: 39.99,
          renewalDate: formatOffsetDate(15),
          billingCycle: 'monthly',
          category: 'Health',
          autoRenew: true,
        },
        {
          id: 'sub_4',
          serviceName: 'Adobe Creative Cloud',
          cost: 54.99,
          renewalDate: formatOffsetDate(25),
          billingCycle: 'monthly',
          category: 'Work',
          autoRenew: false,
        },
      ],
      groceryLists: [
        {
          id: 'list_1',
          name: 'Weekly Groceries',
          items: [
            { id: 'g_1', name: 'Greek Yogurt (Unsweetened)', category: 'Dairy', quantity: '2 tubs', checked: false },
            { id: 'g_2', name: 'Organic Spinach', category: 'Produce', quantity: '1 bag', checked: false },
            { id: 'g_3', name: 'Almond Milk', category: 'Dairy', quantity: '1 carton', checked: true, recentlyPurchased: true },
            { id: 'g_4', name: 'Fresh Sourdough Bread', category: 'Bakery', quantity: '1 loaf', checked: false },
            { id: 'g_5', name: 'Organic Chicken Breasts', category: 'Meat', quantity: '2 lbs', checked: false },
            { id: 'g_6', name: 'Fresh Avocadoes', category: 'Produce', quantity: '4 count', checked: true, recentlyPurchased: true },
          ],
        },
        {
          id: 'list_2',
          name: 'Home Depot Chores',
          items: [
            { id: 'g_7', name: 'LED Bulbs (Warm White)', category: 'Hardware', quantity: '1 pack', checked: false },
            { id: 'g_8', name: 'High-filtration AC Filters', category: 'HVAC', quantity: '2 count', checked: false },
          ],
        },
      ],
      pantry: [
        { id: 'pan_1', name: 'Extra Virgin Olive Oil', quantity: 1, unit: 'bottle', category: 'Oils & Vinegars', expirationDate: formatOffsetDate(10) },
        { id: 'pan_2', name: 'Steel Cut Oats', quantity: 2, unit: 'boxes', category: 'Grains & Cereals', expirationDate: formatOffsetDate(45) },
        { id: 'pan_3', name: 'Organic Quinoa', quantity: 1, unit: 'bag', category: 'Grains & Cereals', expirationDate: formatOffsetDate(120) },
        { id: 'pan_4', name: 'Garlic Powder Spices', quantity: 0, unit: 'jar', category: 'Spices & Seasonings', expirationDate: formatOffsetDate(4) },
        { id: 'pan_5', name: 'Canned Garbanzo Beans', quantity: 4, unit: 'cans', category: 'Canned Goods', expirationDate: formatOffsetDate(365) },
      ],
      inventory: [
        { id: 'inv_1', name: 'Living Room Smart TV 55"', category: 'Electronics', room: 'Living Room', purchaseDate: '2025-01-10', warrantyExpiration: '2027-01-10', notes: 'Model LG-55OLED. Purchase price: $1,200. Reciept in Doc Folder.' },
        { id: 'inv_2', name: 'Kitchen Air Fryer Pro', category: 'Appliances', room: 'Kitchen', purchaseDate: '2025-06-15', warrantyExpiration: '2026-06-15', notes: 'Ninja Air Fryer 4qt. Super reliable.' },
        { id: 'inv_3', name: 'Ergonomic Desk Chair', category: 'Furniture', room: 'Home Office', purchaseDate: '2024-03-22', warrantyExpiration: '2029-03-22', notes: 'Herman Miller Aeron Chair. Excellent lumbar support.' },
      ],
      documents: [
        { id: 'doc_1', title: "State Driver's License", category: 'Personal ID', expirationDate: formatOffsetDate(800), notes: 'Class D standard drivers license.', fileUrl: 'mock_license.pdf', fileSize: '1.2 MB' },
        { id: 'doc_2', title: 'Car Insurance Policy Binder', category: 'Finance', expirationDate: formatOffsetDate(78), notes: 'GEICO Auto binder policy #93041-A.', fileUrl: 'geico_binder.pdf', fileSize: '3.4 MB' },
        { id: 'doc_3', title: 'Home Rental Lease Agreement', category: 'Housing', expirationDate: formatOffsetDate(180), notes: 'Lease active through early 2027.', fileUrl: 'lease_agreement.pdf', fileSize: '4.8 MB' },
      ],
      vehicles: [
        {
          id: 'veh_1',
          makeModel: 'Honda Civic Sport',
          year: '2022',
          licensePlate: 'ABC-1234',
          registrationExpiry: formatOffsetDate(110),
          insuranceExpiry: formatOffsetDate(78),
          logs: [
            { id: 'log_1', type: 'oil', date: '2026-03-15', mileage: 24500, cost: 74.99, notes: 'Full Synthetic 0W-20 oil change & new filter at dealership.' },
            { id: 'log_2', type: 'tire', date: '2026-05-10', mileage: 27100, cost: 40.00, notes: 'Tire rotation & nitrogen balance pressure check.' },
            { id: 'log_3', type: 'inspection', date: '2026-01-05', mileage: 21200, cost: 0.00, notes: 'Complimentary multi-point vehicle safety checkup.' },
          ],
        },
      ],
      health: {
        medications: [
          { id: 'med_1', name: 'Daily Multivitamin', dosage: '1 tablet', frequency: 'Daily', time: '08:00', takenToday: true },
          { id: 'med_2', name: 'Allergy Claritin', dosage: '10mg', frequency: 'Daily', time: '20:00', takenToday: false },
        ],
        waterIntake: [
          { id: 'wat_1', date: formatOffsetDate(0), amountMl: 1250 },
          { id: 'wat_2', date: formatOffsetDate(-1), amountMl: 2000 },
          { id: 'wat_3', date: formatOffsetDate(-2), amountMl: 1500 },
        ],
        weightHistory: [
          { id: 'wei_1', date: formatOffsetDate(-14), weightKg: 78.5 },
          { id: 'wei_2', date: formatOffsetDate(-7), weightKg: 78.2 },
          { id: 'wei_3', date: formatOffsetDate(0), weightKg: 77.8 },
        ],
        exerciseLog: [
          { id: 'exe_1', date: formatOffsetDate(0), type: 'Jogging Outdoors', durationMinutes: 30, intensity: 'medium' },
          { id: 'exe_2', date: formatOffsetDate(-2), type: 'Strength Training', durationMinutes: 45, intensity: 'high' },
        ],
        moodLog: [
          { id: 'moo_1', date: formatOffsetDate(-2), score: 4, notes: 'Felt very productive and focused.' },
          { id: 'moo_2', date: formatOffsetDate(-1), score: 3, notes: 'A bit tired but had decent energy.' },
          { id: 'moo_3', date: formatOffsetDate(0), score: 5, notes: 'Amazing day, completed multiple chores!' },
        ],
      },
    };

    this.saveUserData(userId, defaultData);
    return defaultData;
  },

  /**
   * Persists updated LifeDeskOS application data for a user.
   */
  saveUserData(userId: string, data: any): void {
    const key = `lifedesk_os_data_${userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new Event('lifedesk_os_db_update'));
    } catch (e) {
      console.error('Error saving user application data:', e);
    }
  },

  /**
   * Helper to push a notification safely to the user's data store.
   */
  addNotification(userId: string, item: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; icon: string }): void {
    const data = this.getUserData(userId);
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: item.title,
      message: item.message,
      type: item.type,
      icon: item.icon,
      timestamp: new Date().toISOString(),
      read: false,
    };
    data.notifications = [newNotif, ...(data.notifications || [])];
    this.saveUserData(userId, data);
  }
};
