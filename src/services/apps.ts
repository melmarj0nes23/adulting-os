/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppManifest } from '../types';

export const APPS: AppManifest[] = [
  {
    id: 'daily-briefing',
    title: 'Daily Briefing',
    icon: 'Compass',
    defaultWidth: 700,
    defaultHeight: 520,
    isSingleInstance: true,
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: 'FileText',
    defaultWidth: 740,
    defaultHeight: 500,
    isSingleInstance: false,
  },
  {
    id: 'tasks',
    title: 'Tasks',
    icon: 'CheckSquare',
    defaultWidth: 540,
    defaultHeight: 460,
    isSingleInstance: true,
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: 'Calendar',
    defaultWidth: 720,
    defaultHeight: 540,
    isSingleInstance: true,
  },
  {
    id: 'bills',
    title: 'Bills',
    icon: 'CreditCard',
    defaultWidth: 680,
    defaultHeight: 480,
    isSingleInstance: true,
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    icon: 'Repeat',
    defaultWidth: 680,
    defaultHeight: 480,
    isSingleInstance: true,
  },
  {
    id: 'grocery',
    title: 'Grocery List',
    icon: 'ShoppingCart',
    defaultWidth: 560,
    defaultHeight: 480,
    isSingleInstance: true,
  },
  {
    id: 'pantry',
    title: 'Pantry Inventory',
    icon: 'Box',
    defaultWidth: 640,
    defaultHeight: 480,
    isSingleInstance: true,
  },
  {
    id: 'inventory',
    title: 'Home Inventory',
    icon: 'Package',
    defaultWidth: 660,
    defaultHeight: 480,
    isSingleInstance: true,
  },
  {
    id: 'documents',
    title: 'Secure Documents',
    icon: 'Folder',
    defaultWidth: 620,
    defaultHeight: 460,
    isSingleInstance: true,
  },
  {
    id: 'vehicle',
    title: 'Vehicle Tracker',
    icon: 'Car',
    defaultWidth: 680,
    defaultHeight: 480,
    isSingleInstance: true,
  },
  {
    id: 'health',
    title: 'Health & Wellness',
    icon: 'Heart',
    defaultWidth: 640,
    defaultHeight: 500,
    isSingleInstance: true,
  },
  {
    id: 'profile',
    title: 'Profile',
    icon: 'User',
    defaultWidth: 440,
    defaultHeight: 380,
    isSingleInstance: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'Settings',
    defaultWidth: 600,
    defaultHeight: 500,
    isSingleInstance: true,
  },
  {
    id: 'about',
    title: 'About AdultingOS',
    icon: 'Info',
    defaultWidth: 460,
    defaultHeight: 340,
    isSingleInstance: true,
  }
];
