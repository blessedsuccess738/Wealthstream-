
import React, { useState } from 'react';
import { useApp } from '../store';
import { PlanType } from '../types';
import { CURRENCY, PAYSTACK_PUBLIC_KEY } from '../constants';

const WalletPage: React.FC = () => {
  const { currentUser, transactions, addTransaction, updateUser } = useApp();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer');

  if (!currentUser) return null;

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 2000) {
      alert(`Minimum withdrawal is ${CURRENCY}2,000`);
      return;
    }
    if (amount > currentUser.balance) {
      alert("Insufficient balance!");
      return;
    }
    if (currentUser.plan === PlanType.FREE) {
      alert("You must activate a plan (Standard, Premium, or Pro) before you can withdraw.");
      return;
    }

    addTransaction({
      userId: currentUser.id,
      type: 'withdrawal',
      amount: amount,
      status: 'pending',
      method: method,
      description: `Withdrawal request via ${method}`
    });
    updateUser(currentUser.id, { balance: currentUser.balance - amount });
    setWithdrawAmount('');
    alert("Withdrawal request submitted! Pending admin approval.");
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 500) {
      alert(`Minimum deposit is ${CURRENCY}500`);
      return;
    }

    // @ts-ignore
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: currentUser.email,
      amount: amount * 100, // kobo
      currency: 'NGN',
      ref: 'dep_' + Math.floor((Math.random() * 1000000000) + 1),
      callback: function(response: any) {
        addTransaction({
          userId: currentUser.id,
          type: 'deposit',
          amount: amount,
          status: 'approved',
          method: 'Paystack',
          description: 'Wallet Deposit'
        });
        updateUser(currentUser.id, { balance: currentUser.balance + amount });
        setDepositAmount('');
        alert(`Deposit successful! ${CURRENCY}${amount.toLocaleString()} added to your wallet.`);
      },
      onClose: function() {
        alert('Transaction cancelled.');
      }
    });
    handler.openIframe();
  };

  const userTransactions = transactions.filter(t => t.userId === currentUser.id);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Financial Center</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left Side: Balance & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-glass p-8 rounded-3xl border border-yellow-500/20 bg-yellow-500/5">
            <div className="text-slate-400 mb-1">Total Available Balance</div>
            <div className="text-5xl font-black text-yellow-500 mb-4">{CURRENCY}{currentUser.balance.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Fast and secure payments processed daily.</p>
          </div>

          <div className="card-glass p-6 rounded-3xl border border-slate-800">
            <h3 className="text-lg font-bold mb-4">Deposit Funds</h3>
            <div className="space-y-3">
               <input 
                type="number" 
                placeholder="Amount to Deposit"
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-green-500 transition"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <button 
                onClick={handleDeposit}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-500 transition"
              >
                Deposit via Paystack
              </button>
            </div>
          </div>

          <div className="card-glass p-6 rounded-3xl border border-slate-800">
            <h3 className="text-lg font-bold mb-4">Withdraw Funds</h3>
            <div className="space-y-3">
              <select 
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-yellow-500 transition"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="Bank Transfer">Local Bank Transfer</option>
                <option value="OPay / Kuda">OPay / Kuda</option>
                <option value="Palmpay">Palmpay</option>
                <option value="USDT (TRC20)">USDT (TRC20)</option>
              </select>
               <input 
                type="number" 
                placeholder="Withdrawal Amount"
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-yellow-500 transition"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <button 
                onClick={handleWithdraw}
                className="w-full bg-yellow-500 text-slate-900 py-3 rounded-xl font-bold hover:scale-[1.02] transition"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed History */}
        <div className="lg:col-span-2 card-glass p-8 rounded-3xl border border-slate-800 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Transaction History</h2>
            <div className="text-sm text-slate-500">Showing all records</div>
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-4 pr-2 max-h-[600px]">
            {userTransactions.length === 0 ? (
              <div className="text-center py-32">
                <div className="text-4xl mb-4">📄</div>
                <p className="text-slate-500">You haven't made any transactions yet.</p>
              </div>
            ) : userTransactions.map(tx => (
              <div key={tx.id} className="flex justify-between items-center p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition">
                <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                        tx.type === 'earning' ? 'bg-blue-500/10 text-blue-500' : 
                        tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                        {tx.type === 'earning' ? '⭐' : tx.type === 'deposit' ? '📥' : '📤'}
                    </div>
                    <div>
                        <div className="font-bold text-slate-100">{tx.description}</div>
                        <div className="text-xs text-slate-500 font-medium">{new Date(tx.timestamp).toLocaleString()} • {tx.method}</div>
                    </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black ${tx.type === 'earning' || tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'earning' || tx.type === 'deposit' ? '+' : '-'}{CURRENCY}{tx.amount.toLocaleString()}
                  </div>
                  <div className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                    tx.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
