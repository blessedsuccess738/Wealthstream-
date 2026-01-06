
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, PlanType } from './types';
import { ADMIN_EMAIL, MOCK_USERS } from './constants';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (username: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateTransactionStatus: (txId: string, status: Transaction['status']) => void;
  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ws_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ws_tx');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ws_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ws_tx', JSON.stringify(transactions));
  }, [transactions]);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const login = async (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user && !user.isBanned) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const signup = async (username: string, email: string, pass: string) => {
    if (users.find(u => u.email === email)) return false;
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      password: pass,
      plan: PlanType.FREE,
      balance: 0,
      lockedBalance: 0,
      xp: 0,
      level: 1,
      referrals: 0,
      streak: 1,
      lastLogin: new Date().toISOString(),
      isBanned: false,
      createdAt: new Date().toISOString()
    };
    setUsers([...users, newUser]);
    return true;
  };

  const logout = () => setCurrentUser(null);

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransactionStatus = (txId: string, status: Transaction['status']) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        if (status === 'approved') {
          const user = users.find(u => u.id === tx.userId);
          if (user) {
            if (tx.type === 'deposit') {
                updateUser(user.id, { balance: user.balance + tx.amount });
            }
          }
        }
        return { ...tx, status };
      }
      return tx;
    }));
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, users, transactions, 
      login, signup, logout, updateUser, 
      addTransaction, updateTransactionStatus,
      isAdmin 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
