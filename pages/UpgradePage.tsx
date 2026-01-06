
import React from 'react';
import { useApp } from '../store';
import { PlanType } from '../types';
import { PLANS, CURRENCY, PAYSTACK_PUBLIC_KEY } from '../constants';

const UpgradePage: React.FC = () => {
  const { currentUser, addTransaction, updateUser } = useApp();

  if (!currentUser) return null;

  const payWithPaystack = (pt: PlanType) => {
    const plan = PLANS[pt];
    // @ts-ignore
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: currentUser.email,
      amount: plan.fee * 100, // Paystack amount is in kobo
      currency: 'NGN',
      ref: 'ws_' + Math.floor((Math.random() * 1000000000) + 1),
      callback: function(response: any) {
        addTransaction({
          userId: currentUser.id,
          type: 'deposit',
          amount: plan.fee,
          status: 'approved', // Auto-approve on success
          method: 'Paystack',
          description: `Plan Upgrade to ${pt}`
        });
        updateUser(currentUser.id, { plan: pt });
        alert(`Payment successful! You are now a ${pt} member.`);
      },
      onClose: function() {
        alert('Transaction cancelled.');
      }
    });
    handler.openIframe();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black mb-4">Choose Your Path to Wealth</h1>
        <p className="text-slate-400">Upgrade your plan to unlock high-earning activities and instant withdrawals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[PlanType.STANDARD, PlanType.PREMIUM, PlanType.PRO].map((pt) => {
          const isActive = currentUser.plan === pt;
          return (
            <div key={pt} className={`card-glass p-8 rounded-3xl border flex flex-col h-full ${isActive ? 'border-yellow-500 bg-yellow-500/5' : 'border-slate-800'}`}>
              <h3 className="text-2xl font-bold mb-1">{PLANS[pt].name}</h3>
              <p className="text-slate-500 text-sm mb-6">{PLANS[pt].description}</p>
              
              <div className="text-4xl font-extrabold text-yellow-500 mb-8">
                {CURRENCY}{PLANS[pt].fee.toLocaleString()} <span className="text-base text-slate-500 font-normal">one-time</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow text-slate-300">
                {PLANS[pt].features.map((f, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => payWithPaystack(pt)}
                disabled={isActive}
                className={`w-full py-4 rounded-xl font-bold transition ${isActive ? 'bg-slate-800 text-slate-500 cursor-default' : 'bg-yellow-500 text-slate-900 hover:scale-[1.02]'}`}
              >
                {isActive ? 'Current Plan' : `Activate ${pt}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpgradePage;
