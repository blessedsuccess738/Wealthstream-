
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { TASKS_DATA, CURRENCY } from '../constants';

const TasksPage: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  const categories = [
    { id: 'listen', name: 'Listen to Earn', icon: '🎧', color: 'blue' },
    { id: 'watch', name: 'Watch Videos', icon: '📺', color: 'purple' },
    { id: 'read', name: 'Read Articles', icon: '📖', color: 'green' },
    { id: 'quiz', name: 'Daily Quiz', icon: '🧠', color: 'yellow' },
    { id: 'play', name: 'Mini Games', icon: '🎮', color: 'pink' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Earning Missions</h1>
      <p className="text-slate-400 mb-10">Complete your daily quota to reach your withdrawal goals faster.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            to={`/activities/${cat.id}`}
            className="group card-glass p-8 rounded-3xl border border-slate-800 hover:border-yellow-500/50 transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className={`text-5xl mb-6 group-hover:scale-110 transition`}>
              {cat.icon}
            </div>
            <h2 className="text-xl font-bold mb-2">{cat.name}</h2>
            <p className="text-slate-500 text-sm mb-6">
              {TASKS_DATA.filter(t => t.type === cat.id).length} missions available today
            </p>
            <div className="w-full bg-slate-900 py-3 rounded-xl text-yellow-500 font-bold group-hover:bg-yellow-500 group-hover:text-slate-900 transition">
              Explore Missions
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 card-glass p-10 rounded-3xl border border-slate-800 text-center">
        <h2 className="text-2xl font-bold mb-4">Milestone Bonuses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-500 uppercase mb-1">Complete 10 Tasks</div>
                <div className="text-xl font-bold text-yellow-500">+{CURRENCY}500 Bonus</div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-500 uppercase mb-1">Reach Level 5</div>
                <div className="text-xl font-bold text-yellow-500">+{CURRENCY}2,500 Bonus</div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-500 uppercase mb-1">Weekly Streak</div>
                <div className="text-xl font-bold text-yellow-500">+{CURRENCY}10,000 Bonus</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
