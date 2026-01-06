
import React, { useState } from 'react';
import { useApp } from '../store';
import { PlanType } from '../types';
import { CURRENCY, PAYSTACK_PUBLIC_KEY } from '../constants';

const WalletPage: React.FC = () => {
  const { currentUser, transactions, addTransaction, updateUser } = useApp();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  // New state for confirmation dialog
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!currentUser) return null;

  const handleWithdrawInitiate = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 2000) {
      alert(`Minimum withdrawal is ${CURRENCY}2,000`);
      return;
    }
    if (amount > currentUser.balance) {
      alert("Insufficient balance!");
      return;
    }
    if (!accountName || !accountNumber) {
      alert("Please provide your account name and account number.");
      return;
    }
    if (currentUser.plan === PlanType.FREE) {
      alert("You must activate a plan (Standard, Premium, or Pro) before you can withdraw.");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmWithdrawal = () => {
    const amount = parseFloat(withdrawAmount);
    const withdrawalDetails = `Withdrawal to ${method} | ${accountName} (${accountNumber})`;

    addTransaction({
      userId: currentUser.id,
      type: 'withdrawal',
      amount: amount,
      status: 'pending',
      method: method,
      description: withdrawalDetails
    });
    
    updateUser(currentUser.id, { balance: currentUser.balance - amount });
    
    // Reset fields
    setWithdrawAmount('');
    setAccountName('');
    setAccountNumber('');
    setShowConfirmModal(false);
    
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
    <div className="p-8 max-w-6xl mx-auto relative">
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
              <label className="block text-xs text-slate-500 uppercase font-bold px-1">Withdrawal Method</label>
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
              
              <label className="block text-xs text-slate-500 uppercase font-bold px-1 mt-2">Payout Details</label>
              <input 
                type="text" 
                placeholder="Account Holder Name"
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-yellow-500 transition text-sm"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Account / Wallet Number"
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-yellow-500 transition text-sm"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />

              <label className="block text-xs text-slate-500 uppercase font-bold px-1 mt-2">Amount</label>
               <input 
                type="number" 
                placeholder={`Min ${CURRENCY}2,000`}
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-yellow-500 transition"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <button 
                onClick={handleWithdrawInitiate}
                className="w-full bg-yellow-500 text-slate-900 py-3 rounded-xl font-bold hover:scale-[1.02] transition"
              >
                Request Withdrawal
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

      {/* Confirmation Modal Overlay */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-glass max-w-md w-full p-8 rounded-[32px] border border-yellow-500/30 shadow-2xl animate-scale-up">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Confirm Withdrawal</h3>
              <p className="text-slate-400 text-sm mt-2">Please verify your payout details carefully. Transactions are final once approved.</p>
            </div>

            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 space-y-4 mb-8">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Amount</span>
                <span className="text-xl font-black text-yellow-500">{CURRENCY}{parseFloat(withdrawAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Method</span>
                <span className="text-slate-200 font-semibold">{method}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Payout To:</span>
                <div className="text-slate-100 font-medium break-all">{accountName}</div>
                <div className="text-slate-400 font-mono text-sm">{accountNumber}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmWithdrawal}
                className="w-full bg-yellow-500 text-slate-900 py-4 rounded-2xl font-black text-lg hover:bg-yellow-400 transition-colors shadow-lg"
              >
                CONFIRM & SUBMIT
              </button>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="w-full bg-slate-800 text-slate-300 py-4 rounded-2xl font-bold hover:bg-slate-700 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
