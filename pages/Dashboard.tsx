
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { PlanType } from '../types';
import { CURRENCY } from '../constants';

const Dashboard: React.FC = () => {
  const { currentUser, logout, isAdmin, updateUser, addTransaction } = useApp();

  if (!currentUser) return null;

  const canClaimBonus = () => {
    if (!currentUser.lastBonusClaim) return true;
    const lastClaim = new Date(currentUser.lastBonusClaim).getTime();
    const now = new Date().getTime();
    return now - lastClaim >= 24 * 60 * 60 * 1000;
  };

  const getTimeRemaining = () => {
    if (!currentUser.lastBonusClaim) return "";
    const lastClaim = new Date(currentUser.lastBonusClaim).getTime();
    const nextClaim = lastClaim + 24 * 60 * 60 * 1000;
    const remaining = nextClaim - new Date().getTime();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  const claimLoginBonus = () => {
    if (!canClaimBonus()) {
      alert(`Slow down! You can only claim once every 24 hours. ${getTimeRemaining()}`);
      return;
    }

    const bonus = 50; // 50 Naira
    updateUser(currentUser.id, { 
      balance: currentUser.balance + bonus,
      streak: (currentUser.streak || 0) + 1,
      lastBonusClaim: new Date().toISOString()
    });
    addTransaction({
      userId: currentUser.id,
      type: 'earning',
      amount: bonus,
      status: 'approved',
      method: 'Platform',
      description: 'Daily Login Bonus'
    });
    alert(`Claimed ${CURRENCY}${bonus} daily bonus! See you tomorrow.`);
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col space-y-6">
        <div className="text-2xl font-bold text-yellow-500 mb-8">WealthStream</div>
        <nav className="flex-grow space-y-2">
          <Link to="/dashboard" className="flex items-center px-4 py-3 bg-slate-800 rounded-lg text-yellow-500">
            <span className="mr-3">🏠</span> Dashboard
          </Link>
          <Link to="/tasks" className="flex items-center px-4 py-3 hover:bg-slate-800 rounded-lg transition">
            <span className="mr-3">🎯</span> Tasks
          </Link>
          <Link to="/wallet" className="flex items-center px-4 py-3 hover:bg-slate-800 rounded-lg transition">
            <span className="mr-3">💰</span> Wallet
          </Link>
          <Link to="/upgrade" className="flex items-center px-4 py-3 hover:bg-slate-800 rounded-lg transition">
            <span className="mr-3">🚀</span> Upgrade
          </Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition">
              <span className="mr-3">🛡️</span> Admin Panel
            </Link>
          )}
        </nav>
        <button onClick={logout} className="p-3 border border-slate-800 text-slate-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition">
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {currentUser.username}!</h1>
            <p className="text-slate-400">Level {currentUser.level} • {currentUser.xp} XP</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
              <span className="text-slate-500 text-sm">Plan:</span> 
              <span className={`ml-2 font-bold ${currentUser.plan === PlanType.PRO ? 'text-yellow-500' : 'text-slate-100'}`}>
                {currentUser.plan}
              </span>
            </div>
            {currentUser.plan === PlanType.FREE && (
              <Link to="/upgrade" className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg font-bold animate-pulse">
                Activate Plan
              </Link>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-glass p-6 rounded-2xl border border-slate-800">
            <div className="text-slate-400 mb-1">Total Balance</div>
            <div className="text-3xl font-extrabold text-yellow-500">{CURRENCY}{currentUser.balance.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-2">Available for withdrawal</div>
          </div>
          <div className="card-glass p-6 rounded-2xl border border-slate-800">
            <div className="text-slate-400 mb-1">Locked Earnings</div>
            <div className="text-3xl font-extrabold text-slate-100">{CURRENCY}{currentUser.lockedBalance.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-2">Unlock by activating a plan</div>
          </div>
          <div className="card-glass p-6 rounded-2xl border border-slate-800">
            <div className="text-slate-400 mb-1">Referrals</div>
            <div className="text-3xl font-extrabold text-blue-400">{currentUser.referrals}</div>
            <div className="text-xs text-slate-500 mt-2">Refer more to earn more</div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold mb-4">Quick Earning</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/activities/listen" className="p-4 bg-slate-800 rounded-xl text-center hover:scale-105 transition">
            <div className="text-3xl mb-2">🎧</div>
            <div className="font-semibold">Listen</div>
          </Link>
          <Link to="/activities/watch" className="p-4 bg-slate-800 rounded-xl text-center hover:scale-105 transition">
            <div className="text-3xl mb-2">📺</div>
            <div className="font-semibold">Watch</div>
          </Link>
          <Link to="/activities/play" className="p-4 bg-slate-800 rounded-xl text-center hover:scale-105 transition">
            <div className="text-3xl mb-2">🎮</div>
            <div className="font-semibold">Games</div>
          </Link>
          <Link to="/activities/quiz" className="p-4 bg-slate-800 rounded-xl text-center hover:scale-105 transition">
            <div className="text-3xl mb-2">🧠</div>
            <div className="font-semibold">Quiz</div>
          </Link>
        </div>

        {/* Bonus Card */}
        <div className={`p-8 rounded-2xl flex items-center justify-between ${canClaimBonus() ? 'bg-gradient-to-r from-blue-600 to-indigo-700' : 'bg-slate-800 opacity-80'}`}>
          <div>
            <h3 className="text-2xl font-bold mb-2">Daily Login Bonus</h3>
            <p className="opacity-90">
              {canClaimBonus() 
                ? `Current Streak: ${currentUser.streak || 0} days. Earn ${CURRENCY}50 now!`
                : `Next claim available in: ${getTimeRemaining()}`
              }
            </p>
          </div>
          <button 
            onClick={claimLoginBonus}
            disabled={!canClaimBonus()}
            className={`px-6 py-2 rounded-lg font-bold transition ${canClaimBonus() ? 'bg-white text-blue-700 hover:bg-slate-100' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
          >
            {canClaimBonus() ? 'Claim Reward' : 'Claimed'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
