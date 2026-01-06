
import { PlanType } from './types';

export const ADMIN_EMAIL = 'blessedsuccess538@gmail.com';
export const ADMIN_PASSWORD = 'Blessed2007@';
export const CURRENCY = '₦';
export const PAYSTACK_PUBLIC_KEY = 'pk_live_f504acddecaa332ffb8a8835085b67adbbf007cd';

export const PLANS = {
  [PlanType.FREE]: {
    name: 'Inactive/Free',
    fee: 0,
    features: ['Basic Dashboard', 'View Tasks'],
    limit: 0,
    description: 'Start your earning journey'
  },
  [PlanType.STANDARD]: {
    name: 'Standard',
    fee: 5000,
    features: ['Listen-to-Earn', 'Watch Videos', 'Daily Login Bonus'],
    limit: 500,
    description: 'Perfect for starters'
  },
  [PlanType.PREMIUM]: {
    name: 'Premium',
    fee: 15000,
    features: ['Everything in Standard', 'Mini Games', 'Daily Quiz', 'Read-to-Earn', 'Referral System'],
    limit: 2500,
    description: 'Most popular choice'
  },
  [PlanType.PRO]: {
    name: 'Pro',
    fee: 50000,
    features: ['VIP Priority Withdrawals', 'Boosted Earnings', 'Unlimited Games', 'Admin Bonuses', 'Referral Multiplier'],
    limit: 10000,
    description: 'The Ultimate VIP Experience'
  }
};

export const TASKS_DATA = [
  { id: 'l1', title: 'Top 40 Hits', reward: 50, duration: 30, type: 'listen', category: 'Music' },
  { id: 'l2', title: 'Jazz Evening', reward: 60, duration: 45, type: 'listen', category: 'Music' },
  { id: 'v1', title: 'Learn Crypto', reward: 120, duration: 60, type: 'watch', category: 'Education' },
  { id: 'v2', title: 'New Movie Trailer', reward: 80, duration: 30, type: 'watch', category: 'Entertainment' },
  { id: 'r1', title: 'Future of AI', reward: 70, duration: 30, type: 'read', category: 'Article' },
  { id: 'r2', title: 'Healthy Living', reward: 50, duration: 20, type: 'read', category: 'Article' },
];

export const MOCK_USERS = [
  {
    id: 'admin-001',
    username: 'SuperAdmin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    plan: PlanType.PRO,
    balance: 500000,
    lockedBalance: 0,
    xp: 9999,
    level: 100,
    referrals: 120,
    streak: 365,
    lastLogin: new Date().toISOString(),
    isBanned: false,
    createdAt: '2023-01-01'
  }
];
