
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { TASKS_DATA, CURRENCY } from '../constants';
import { PlanType } from '../types';

const ActivityCenter: React.FC = () => {
  const { type } = useParams();
  const { currentUser, updateUser, addTransaction } = useApp();
  const navigate = useNavigate();
  
  // Standard Task States
  const [activeTask, setActiveTask] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // WealthRun Game States
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [lane, setLane] = useState(1); // 0, 1, 2
  const [entities, setEntities] = useState<{ id: number, type: 'coin' | 'obs', lane: number, y: number }[]>([]);
  const gameRef = useRef<number>(0);
  const entityIdRef = useRef(0);

  useEffect(() => {
    if (activeTask && timer > 0 && type !== 'play') {
      const id = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(id);
    } else if (activeTask && timer === 0 && type !== 'play') {
      setIsCompleted(true);
    }
  }, [activeTask, timer, type]);

  // WealthRun Logic
  useEffect(() => {
    if (gameActive) {
      const loop = () => {
        setEntities(prev => {
          const next = prev.map(e => ({ ...e, y: e.y + 5 })).filter(e => e.y < 500);
          
          // Collision check
          const collision = next.find(e => e.y > 380 && e.y < 440 && e.lane === lane);
          if (collision) {
            if (collision.type === 'obs') {
              setGameActive(false);
              alert("CRASHED! Game Over. You hit an obstacle and lost all potential earnings for this run.");
              return [];
            } else {
              setScore(s => s + 10);
              return next.filter(e => e.id !== collision.id);
            }
          }

          // Spawn new
          if (Math.random() < 0.05) {
            entityIdRef.current++;
            next.push({
              id: entityIdRef.current,
              type: Math.random() < 0.3 ? 'obs' : 'coin',
              lane: Math.floor(Math.random() * 3),
              y: -50
            });
          }
          return next;
        });
        gameRef.current = requestAnimationFrame(loop);
      };
      gameRef.current = requestAnimationFrame(loop);
      
      const gameTimer = setTimeout(() => {
        setGameActive(false);
      }, 30000); // 30 second rounds

      return () => {
        cancelAnimationFrame(gameRef.current);
        clearTimeout(gameTimer);
      };
    }
  }, [gameActive, lane]);

  if (!currentUser) return null;

  const startTask = (task: any) => {
    if (currentUser.plan === PlanType.FREE) {
        alert("You must activate a plan to earn rewards!");
        return;
    }
    if (type === 'play') {
      setGameActive(true);
      setScore(0);
      setEntities([]);
      setLane(1);
    } else {
      setActiveTask(task);
      setTimer(task.duration);
      setIsCompleted(false);
    }
  };

  const claimReward = () => {
    if (!activeTask) return;
    const bonusMultiplier = currentUser.plan === PlanType.PRO ? 2.0 : (currentUser.plan === PlanType.PREMIUM ? 1.5 : 1);
    const reward = activeTask.reward * bonusMultiplier;
    
    updateUser(currentUser.id, { 
      balance: currentUser.balance + reward,
      xp: currentUser.xp + 10
    });
    addTransaction({
      userId: currentUser.id,
      type: 'earning',
      amount: reward,
      status: 'approved',
      method: 'Platform Reward',
      description: `Earned from ${activeTask.type}: ${activeTask.title}`
    });
    setActiveTask(null);
    setIsCompleted(false);
    alert(`Successfully claimed ${CURRENCY}${reward.toFixed(2)}!`);
  };

  const finishRun = () => {
    if (score <= 0) {
      setGameActive(false);
      return;
    }
    const finalAmount = score;
    updateUser(currentUser.id, { balance: currentUser.balance + finalAmount });
    addTransaction({
      userId: currentUser.id,
      type: 'earning',
      amount: finalAmount,
      status: 'approved',
      method: 'WealthRun',
      description: `Game earnings: ${score / 10} coins collected`
    });
    setGameActive(false);
    alert(`Run completed! You collected ${score / 10} coins for a total of ${CURRENCY}${finalAmount.toLocaleString()}.`);
  };

  const tasks = TASKS_DATA.filter(t => t.type === type);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate('/dashboard')} className="mr-4 text-slate-400 hover:text-white">← Back</button>
        <h1 className="text-3xl font-bold capitalize">{type}-to-Earn</h1>
      </div>

      {type === 'play' && gameActive && (
        <div className="relative w-full max-w-sm mx-auto h-[500px] bg-slate-900 border-x-4 border-slate-700 overflow-hidden select-none touch-none rounded-t-3xl shadow-2xl">
          <div className="absolute top-4 left-0 w-full text-center z-20">
            <div className="text-2xl font-black text-yellow-500 bg-black/50 inline-block px-4 py-1 rounded-full">{CURRENCY}{score}</div>
          </div>
          
          {/* Lanes */}
          <div className="absolute inset-0 flex">
            <div className="w-1/3 border-r border-slate-800/50 h-full"></div>
            <div className="w-1/3 border-r border-slate-800/50 h-full"></div>
            <div className="w-1/3 h-full"></div>
          </div>

          {/* Player */}
          <div 
            className="absolute bottom-10 w-1/3 flex justify-center items-center transition-all duration-100 text-5xl z-10"
            style={{ left: `${lane * 33.33}%` }}
          >
            🏃‍♂️
          </div>

          {/* Entities */}
          {entities.map(e => (
            <div 
              key={e.id}
              className="absolute w-1/3 flex justify-center items-center text-4xl"
              style={{ left: `${e.lane * 33.33}%`, top: `${e.y}px` }}
            >
              {e.type === 'coin' ? '💰' : '🚧'}
            </div>
          ))}

          {/* Controls Overlay */}
          <div className="absolute inset-0 flex z-30">
            <div className="w-1/2 h-full cursor-pointer" onClick={() => setLane(prev => Math.max(0, prev - 1))}></div>
            <div className="w-1/2 h-full cursor-pointer" onClick={() => setLane(prev => Math.min(2, prev + 1))}></div>
          </div>

          <button 
            onClick={finishRun} 
            className="absolute bottom-2 right-2 bg-green-600 text-xs p-2 rounded z-40 font-bold"
          >
            END RUN & CLAIM
          </button>
        </div>
      )}

      {type === 'play' && !gameActive && (
        <div className="card-glass p-12 rounded-3xl border border-slate-800 text-center">
          <h2 className="text-4xl mb-4">🚆 WealthRun</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Collect coins to earn money! Each coin is worth <span className="text-yellow-500 font-bold">{CURRENCY}10</span>. 
            Tap left/right sides of the screen to move lanes. 
            <br/><br/>
            <span className="text-red-500 font-bold uppercase">Warning:</span> If you hit an obstacle, you lose everything for that run!
          </p>
          <button 
            onClick={() => startTask({ type: 'play' })}
            className="bg-yellow-500 text-slate-900 px-10 py-4 rounded-xl font-bold text-xl hover:scale-105 transition shadow-lg shadow-yellow-500/20"
          >
            START RUNNING
          </button>
        </div>
      )}

      {activeTask && type !== 'play' ? (
        <div className="card-glass p-12 rounded-3xl border border-yellow-500/30 text-center">
          <h2 className="text-2xl font-bold mb-4">{activeTask.title}</h2>
          <div className="text-6xl font-black mb-8 text-yellow-500">
            {timer > 0 ? `${timer}s` : 'DONE!'}
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-8">
            <div 
              className="bg-yellow-500 h-full transition-all duration-1000" 
              style={{ width: `${(timer / activeTask.duration) * 100}%` }}
            />
          </div>
          {isCompleted ? (
            <button 
              onClick={claimReward} 
              className="bg-yellow-500 text-slate-900 px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transition"
            >
              Claim Reward
            </button>
          ) : (
            <p className="text-slate-400">Keep the window open to receive your reward...</p>
          )}
        </div>
      ) : (
        type !== 'play' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className="card-glass p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">{task.title}</h3>
                  <p className="text-sm text-slate-500">{task.duration} seconds • {CURRENCY}{task.reward.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => startTask(task)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Start
                </button>
              </div>
            )) : (
              <div className="col-span-2 text-center p-20 card-glass rounded-3xl">
                  <p className="text-slate-500">No active tasks for this category right now. Check back later!</p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default ActivityCenter;
