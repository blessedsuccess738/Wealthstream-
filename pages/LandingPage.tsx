
import React from 'react';
import { Link } from 'react-router-dom';
import { PlanType } from '../types';
import { PLANS, CURRENCY } from '../constants';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold text-yellow-500 tracking-tight">WealthStream</div>
        <div className="space-x-4">
          <Link to="/login" className="px-4 py-2 text-slate-300 hover:text-white transition">Login</Link>
          <Link to="/signup" className="px-6 py-2 bg-yellow-500 text-slate-900 rounded-full font-semibold hover:bg-yellow-400 transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          Earn by <span className="text-yellow-500">Listening</span>, Playing & Completing Tasks
        </h1>
        <p className="text-xl text-slate-400 mb-12 max-w-2xl">
          Join the world's most engaging earning platform. Watch videos, listen to music, and play games to fill your wallet every single day.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link to="/signup" className="px-8 py-4 bg-yellow-500 text-slate-900 rounded-xl font-bold text-lg hover:scale-105 transition-transform">Start Earning Now</Link>
          <a href="#plans" className="px-8 py-4 border border-slate-700 bg-slate-800/50 rounded-xl font-bold text-lg hover:bg-slate-800 transition">View Plans</a>
        </div>

        {/* Plan Section */}
        <section id="plans" className="w-full pt-20">
          <h2 className="text-3xl font-bold mb-12">Choose Your Earning Power</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[PlanType.STANDARD, PlanType.PREMIUM, PlanType.PRO].map((pt) => (
              <div key={pt} className={`card-glass p-8 rounded-2xl border ${pt === PlanType.PREMIUM ? 'border-yellow-500/50 scale-105 gold-glow' : 'border-slate-800'}`}>
                {pt === PlanType.PREMIUM && <div className="text-xs font-bold text-yellow-500 uppercase mb-2">Most Popular</div>}
                <h3 className="text-2xl font-bold mb-2">{PLANS[pt].name}</h3>
                <div className="text-4xl font-extrabold mb-6 text-yellow-500">{CURRENCY}{PLANS[pt].fee.toLocaleString()} <span className="text-sm text-slate-500 font-normal">One-time</span></div>
                <ul className="text-left space-y-4 mb-8 text-slate-400">
                  {PLANS[pt].features.map((f, i) => (
                    <li key={i} className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={`w-full py-3 rounded-lg font-bold ${pt === PlanType.PREMIUM ? 'bg-yellow-500 text-slate-900' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'} transition`}>
                  Choose {pt}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-10 border-t border-slate-800 text-center text-slate-500">
        &copy; 2024 WealthStream. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
