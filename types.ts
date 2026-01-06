
export enum PlanType {
  FREE = 'Free',
  STANDARD = 'Standard',
  PREMIUM = 'Premium',
  PRO = 'Pro'
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  plan: PlanType;
  balance: number;
  lockedBalance: number;
  xp: number;
  level: number;
  referrals: number;
  streak: number;
  lastLogin: string;
  lastBonusClaim?: string;
  isBanned: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'earning';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  method: string;
  timestamp: string;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  reward: number;
  duration: number; // in seconds
  type: 'listen' | 'watch' | 'read' | 'quiz' | 'game';
  category?: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalPayouts: number;
  activeTasks: number;
  pendingWithdrawals: number;
}
