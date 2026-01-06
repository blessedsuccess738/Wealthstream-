
import React, { useState } from 'react';
import { useApp } from '../store';
import { PlanType, User, Transaction } from '../types';
import { CURRENCY } from '../constants';

const AdminPanel: React.FC = () => {
  const { users, transactions, updateUser, updateTransactionStatus, addTransaction } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'withdrawals' | 'deposits' | 'all-transactions'>('users');
  const [fundAmounts, setFundAmounts] = useState<{ [userId: string]: string }>({});

  // Filter states for All Transactions tab
  const [txnTypeFilter, setTxnTypeFilter] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  const upgradeUser = (userId: string, plan: PlanType) => {
    updateUser(userId, { plan });
  };

  const toggleBan = (user: User) => {
    updateUser(user.id, { isBanned: !user.isBanned });
  };

  const handleFundUser = (userId: string) => {
    const amountStr = fundAmounts[userId];
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount to fund.");
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    updateUser(userId, { balance: user.balance + amount });
    addTransaction({
      userId: userId,
      type: 'deposit',
      amount: amount,
      status: 'approved',
      method: 'Admin Credit',
      description: 'Account funded by Administrator'
    });

    setFundAmounts(prev => ({ ...prev, [userId]: '' }));
    alert(`Successfully credited ${CURRENCY}${amount.toLocaleString()} to ${user.username}'s account.`);
  };

  const handleDebitUser = (userId: string) => {
    const amountStr = fundAmounts[userId];
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount to debit.");
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    updateUser(userId, { balance: Math.max(0, user.balance - amount) });
    addTransaction({
      userId: userId,
      type: 'withdrawal',
      amount: amount,
      status: 'approved',
      method: 'Admin Adjustment',
      description: 'Account debited by Administrator'
    });

    setFundAmounts(prev => ({ ...prev, [userId]: '' }));
    alert(`Successfully debited ${CURRENCY}${amount.toLocaleString()} from ${user.username}'s account.`);
  };

  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = txnTypeFilter === 'all' || tx.type === txnTypeFilter;
    const user = users.find(u => u.id === tx.userId);
    const matchesUser = !userSearchQuery || 
                        user?.username.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                        user?.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        tx.userId.toLowerCase().includes(userSearchQuery.toLowerCase());
    return matchesType && matchesUser;
  });

  return (
    <div className="flex h-screen bg-slate-950">
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col space-y-4">
        <div className="text-xl font-bold text-red-500 mb-8 uppercase tracking-widest">Admin Control</div>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'users' ? 'bg-red-500/10 text-red-500' : 'hover:bg-slate-800 transition'}`}
        >
          Manage Users
        </button>
        <button 
          onClick={() => setActiveTab('withdrawals')}
          className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'withdrawals' ? 'bg-red-500/10 text-red-500' : 'hover:bg-slate-800 transition'}`}
        >
          Withdrawals ({pendingWithdrawals.length})
        </button>
        <button 
          onClick={() => setActiveTab('deposits')}
          className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'deposits' ? 'bg-red-500/10 text-red-500' : 'hover:bg-slate-800 transition'}`}
        >
          Deposits ({pendingDeposits.length})
        </button>
        <button 
          onClick={() => setActiveTab('all-transactions')}
          className={`flex items-center px-4 py-3 rounded-lg ${activeTab === 'all-transactions' ? 'bg-red-500/10 text-red-500' : 'hover:bg-slate-800 transition'}`}
        >
          Global Ledger
        </button>
      </aside>

      <main className="flex-grow p-8 overflow-y-auto">
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="bg-slate-800 px-4 py-2 rounded-lg text-sm">Total Users: {users.length}</div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {users.map(user => (
                <div key={user.id} className="card-glass p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-grow">
                    <div className="font-bold flex items-center text-lg">
                      {user.username} 
                      {user.isBanned && <span className="ml-2 text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">Banned</span>}
                    </div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                    <div className="mt-2 flex gap-4 text-xs font-medium uppercase tracking-wider">
                      <span className="text-yellow-500">Plan: {user.plan}</span>
                      <span className="text-green-500">Balance: {CURRENCY}{user.balance.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Funding UI */}
                    <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
                      <input 
                        type="number"
                        placeholder="Amount"
                        className="w-24 bg-transparent border-none focus:ring-0 text-sm p-1"
                        value={fundAmounts[user.id] || ''}
                        onChange={(e) => setFundAmounts(prev => ({ ...prev, [user.id]: e.target.value }))}
                      />
                      <button 
                        onClick={() => handleFundUser(user.id)}
                        className="bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition uppercase"
                      >
                        Fund
                      </button>
                      <button 
                        onClick={() => handleDebitUser(user.id)}
                        className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition uppercase border border-red-500/30"
                      >
                        Debit
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <select 
                        className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-500 outline-none"
                        value={user.plan}
                        onChange={(e) => upgradeUser(user.id, e.target.value as PlanType)}
                      >
                        {Object.values(PlanType).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <button 
                        onClick={() => toggleBan(user)}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition ${user.isBanned ? 'bg-slate-700 text-slate-300' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                      >
                        {user.isBanned ? 'Unban' : 'Ban User'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Pending Withdrawals</h2>
            {pendingWithdrawals.length === 0 ? <div className="text-center py-20 card-glass rounded-3xl opacity-50">No pending withdrawal requests.</div> : (
              <div className="space-y-4">
                {pendingWithdrawals.map(tx => (
                  <div key={tx.id} className="card-glass p-6 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-black text-white">{CURRENCY}{tx.amount.toLocaleString()}</div>
                      <div className="text-sm text-slate-400">User: {users.find(u => u.id === tx.userId)?.username} • Method: {tx.method}</div>
                      <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{new Date(tx.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateTransactionStatus(tx.id, 'approved')} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition">Approve</button>
                      <button onClick={() => updateTransactionStatus(tx.id, 'rejected')} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'deposits' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Pending Deposits</h2>
            {pendingDeposits.length === 0 ? <div className="text-center py-20 card-glass rounded-3xl opacity-50">No pending deposit confirmations.</div> : (
              <div className="space-y-4">
                {pendingDeposits.map(tx => (
                  <div key={tx.id} className="card-glass p-6 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-black text-white">{CURRENCY}{tx.amount.toLocaleString()}</div>
                      <div className="text-sm text-slate-400">User: {users.find(u => u.id === tx.userId)?.username} • Method: {tx.method}</div>
                      <div className="text-xs text-blue-400 font-medium">{tx.description}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateTransactionStatus(tx.id, 'approved')} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition">Confirm Payment</button>
                      <button onClick={() => updateTransactionStatus(tx.id, 'rejected')} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'all-transactions' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold">Global Ledger</h2>
              <div className="flex flex-wrap gap-2">
                <input 
                  type="text" 
                  placeholder="Search user or ID..." 
                  className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
                <select 
                  className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500"
                  value={txnTypeFilter}
                  onChange={(e) => setTxnTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="earning">Earnings</option>
                </select>
              </div>
            </div>

            <div className="card-glass rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-slate-500">No transactions found matching your criteria.</td>
                    </tr>
                  ) : filteredTransactions.map(tx => {
                    const user = users.find(u => u.id === tx.userId);
                    return (
                      <tr key={tx.id} className="hover:bg-white/5 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-200">{user?.username || 'Unknown'}</div>
                          <div className="text-[10px] text-slate-500">{user?.email || tx.userId}</div>
                        </td>
                        <td className="px-6 py-4 capitalize">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            tx.type === 'earning' ? 'text-blue-400 bg-blue-400/10' :
                            tx.type === 'deposit' ? 'text-green-400 bg-green-400/10' : 'text-orange-400 bg-orange-400/10'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-100">
                          {CURRENCY}{tx.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            tx.status === 'approved' ? 'text-green-500 bg-green-500/10' :
                            tx.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10' : 'text-red-500 bg-red-500/10'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className="px-6 py-4 text-[10px] text-slate-500 font-mono">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
