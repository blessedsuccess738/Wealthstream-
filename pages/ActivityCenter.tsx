
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { TASKS_DATA, CURRENCY } from '../constants';
import { PlanType } from '../types';

const ActivityCenter: React.FC = () => {
  const { type } = useParams();
  const { currentUser, updateUser, addTransaction } = useApp();
  const navigate = useNavigate();
  
  // Selection State
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

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

  // Lucky Spin States
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);

  // Speed Tap States
  const [tapCount, setTapCount] = useState(0);
  const [tapTimer, setTapTimer] = useState(0);
  const [tapActive, setTapActive] = useState(false);

  // Number Guesser States
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [guessMessage, setGuessMessage] = useState('Guess a number between 1 and 50');
  const [attempts, setAttempts] = useState(0);
  const [guessGameOver, setGuessGameOver] = useState(false);

  // Fortune Tiger States
  const [tigerStake, setTigerStake] = useState<string>('100');
  const [tigerSpinning, setTigerSpinning] = useState(false);
  const [tigerReels, setTigerReels] = useState(['🐯', '🐯', '🐯']);
  const [tigerResultMsg, setTigerResultMsg] = useState('');

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
    if (gameActive && selectedGame === 'run') {
      const loop = () => {
        setEntities(prev => {
          const next = prev.map(e => ({ ...e, y: e.y + 5 })).filter(e => e.y < 500);
          const collision = next.find(e => e.y > 380 && e.y < 440 && e.lane === lane);
          if (collision) {
            if (collision.type === 'obs') {
              setGameActive(false);
              alert("CRASHED! Game Over. You hit an obstacle.");
              return [];
            } else {
              setScore(s => s + 10);
              return next.filter(e => e.id !== collision.id);
            }
          }
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
        finishRun();
      }, 20000); // 20 second rounds
      return () => {
        cancelAnimationFrame(gameRef.current);
        clearTimeout(gameTimer);
      };
    }
  }, [gameActive, lane, selectedGame]);

  // Speed Tap Timer
  useEffect(() => {
    let interval: any;
    if (tapActive && tapTimer > 0) {
      interval = setInterval(() => setTapTimer(t => t - 1), 1000);
    } else if (tapTimer === 0 && tapActive) {
      setTapActive(false);
      finishTapGame();
    }
    return () => clearInterval(interval);
  }, [tapActive, tapTimer]);

  if (!currentUser) return null;

  const handleBack = () => {
    if (selectedGame) {
      setSelectedGame(null);
      setGameActive(false);
      setTapActive(false);
      setTigerResultMsg('');
    } else {
      navigate('/tasks');
    }
  };

  const startTask = (task: any) => {
    if (currentUser.plan === PlanType.FREE) {
        alert("You must activate a plan to earn rewards!");
        return;
    }
    setActiveTask(task);
    setTimer(task.duration);
    setIsCompleted(false);
  };

  // --- WealthRun ---
  const finishRun = () => {
    if (score > 0) {
      const finalAmount = score;
      updateUser(currentUser.id, { balance: currentUser.balance + finalAmount });
      addTransaction({
        userId: currentUser.id,
        type: 'earning',
        amount: finalAmount,
        status: 'approved',
        method: 'WealthRun',
        description: `Run collected ${score / 10} coins`
      });
      alert(`Run completed! Earned ${CURRENCY}${finalAmount.toLocaleString()}`);
    }
    setGameActive(false);
    setSelectedGame(null);
  };

  // --- Lucky Spin ---
  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);
    setTimeout(() => {
      const outcomes = [0, 50, 100, 200, 500, 1000];
      const prize = outcomes[Math.floor(Math.random() * outcomes.length)];
      setSpinResult(prize);
      setIsSpinning(false);
      if (prize > 0) {
        updateUser(currentUser.id, { balance: currentUser.balance + prize });
        addTransaction({
          userId: currentUser.id,
          type: 'earning',
          amount: prize,
          status: 'approved',
          method: 'Lucky Spin',
          description: `Won ${CURRENCY}${prize} from Spin Wheel`
        });
        alert(`Congratulations! You won ${CURRENCY}${prize}!`);
      } else {
        alert("Better luck next time!");
      }
    }, 2000);
  };

  // --- Speed Tap ---
  const startTapGame = () => {
    setTapCount(0);
    setTapTimer(10);
    setTapActive(true);
  };

  const finishTapGame = () => {
    const reward = tapCount * 2; // 2 Naira per tap
    if (reward > 0) {
      updateUser(currentUser.id, { balance: currentUser.balance + reward });
      addTransaction({
        userId: currentUser.id,
        type: 'earning',
        amount: reward,
        status: 'approved',
        method: 'Speed Tap',
        description: `Earned from ${tapCount} taps`
      });
      alert(`Time's up! You tapped ${tapCount} times and earned ${CURRENCY}${reward.toLocaleString()}.`);
    }
    setSelectedGame(null);
  };

  // --- Guess Number ---
  const startGuessGame = () => {
    setTargetNumber(Math.floor(Math.random() * 50) + 1);
    setAttempts(0);
    setGuess('');
    setGuessMessage('Guess a number between 1 and 50');
    setGuessGameOver(false);
  };

  const handleGuess = () => {
    const n = parseInt(guess);
    if (isNaN(n)) return;
    setAttempts(a => a + 1);
    if (n === targetNumber) {
      const reward = Math.max(10, 200 - (attempts * 20));
      updateUser(currentUser.id, { balance: currentUser.balance + reward });
      addTransaction({
        userId: currentUser.id,
        type: 'earning',
        amount: reward,
        status: 'approved',
        method: 'Guess Number',
        description: `Guessed ${targetNumber} in ${attempts + 1} tries`
      });
      setGuessMessage(`CORRECT! It was ${targetNumber}. You earned ${CURRENCY}${reward}!`);
      setGuessGameOver(true);
    } else if (n < targetNumber) {
      setGuessMessage('Too low! Try again.');
    } else {
      setGuessMessage('Too high! Try again.');
    }
    setGuess('');
  };

  // --- Fortune Tiger ---
  const handleTigerSpin = () => {
    const stake = parseFloat(tigerStake);
    if (isNaN(stake) || stake <= 0) {
      alert("Please enter a valid stake amount.");
      return;
    }
    if (stake > currentUser.balance) {
      alert("Insufficient funds to place this bet!");
      return;
    }

    if (tigerSpinning) return;
    setTigerSpinning(true);
    setTigerResultMsg('');

    // Deduct stake immediately
    updateUser(currentUser.id, { balance: currentUser.balance - stake });
    
    // Spinning animation logic
    const symbols = ['🐯', '🧧', '💰', '💎', '🍊', '🧧', '🐯', '💰'];
    let count = 0;
    const interval = setInterval(() => {
      setTigerReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        finalizeTigerResult(stake);
      }
    }, 100);
  };

  const finalizeTigerResult = (stake: number) => {
    const symbols = ['🐯', '🧧', '💰', '💎', '🍊'];
    const finalReels = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];
    setTigerReels(finalReels);
    setTigerSpinning(false);

    let multiplier = 0;
    const [s1, s2, s3] = finalReels;

    if (s1 === '🐯' && s2 === '🐯' && s3 === '🐯') {
      multiplier = 20; // Jackpot Tiger
    } else if (s1 === s2 && s2 === s3) {
      multiplier = 10; // 3 of any kind
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
      multiplier = 1.5; // Pair
    } else if (finalReels.includes('🐯')) {
      multiplier = 0.5; // Single Tiger pity win
    }

    const winAmount = stake * multiplier;
    if (winAmount > 0) {
      updateUser(currentUser.id, { balance: currentUser.balance + winAmount });
      addTransaction({
        userId: currentUser.id,
        type: 'earning',
        amount: winAmount,
        status: 'approved',
        method: 'Fortune Tiger',
        description: `Won x${multiplier} from ${CURRENCY}${stake} stake`
      });
      setTigerResultMsg(`WINNER! The Tiger favored you with ${CURRENCY}${winAmount.toLocaleString()} (x${multiplier})`);
    } else {
      setTigerResultMsg("The Tiger takes your offering. Better luck next time!");
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

  const tasks = TASKS_DATA.filter(t => t.type === type);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <button onClick={handleBack} className="mr-4 text-slate-400 hover:text-white flex items-center">
          <span className="mr-2">←</span> Back
        </button>
        <h1 className="text-3xl font-bold capitalize">{type}-to-Earn</h1>
      </div>

      {type === 'play' && !selectedGame && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => { setSelectedGame('tiger'); setTigerResultMsg(''); }} className="card-glass p-8 rounded-3xl border border-red-500/30 text-center hover:border-red-500 transition group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">High Stakes</div>
            <div className="text-5xl mb-4 group-hover:scale-110 transition">🐯</div>
            <h3 className="text-xl font-bold mb-2">Fortune Tiger</h3>
            <p className="text-slate-500 text-sm">Bet funds to win up to x20 multipliers! High volatility.</p>
          </button>

          <button onClick={() => { setSelectedGame('run'); setGameActive(true); setScore(0); setEntities([]); setLane(1); }} className="card-glass p-8 rounded-3xl border border-slate-800 text-center hover:border-yellow-500/50 transition group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition">🏃‍♂️</div>
            <h3 className="text-xl font-bold mb-2">WealthRun</h3>
            <p className="text-slate-500 text-sm">Collect coins, avoid obstacles. Fast-paced action!</p>
          </button>
          
          <button onClick={() => { setSelectedGame('spin'); setSpinResult(null); }} className="card-glass p-8 rounded-3xl border border-slate-800 text-center hover:border-yellow-500/50 transition group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition">🎡</div>
            <h3 className="text-xl font-bold mb-2">Lucky Spin</h3>
            <p className="text-slate-500 text-sm">Spin the wheel of fortune. Win up to {CURRENCY}1,000!</p>
          </button>

          <button onClick={() => { setSelectedGame('tap'); setTapCount(0); setTapTimer(0); setTapActive(false); }} className="card-glass p-8 rounded-3xl border border-slate-800 text-center hover:border-yellow-500/50 transition group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition">⚡</div>
            <h3 className="text-xl font-bold mb-2">Speed Tap</h3>
            <p className="text-slate-500 text-sm">How fast can you tap? Reward per tap in 10s.</p>
          </button>
        </div>
      )}

      {/* --- FORTUNE TIGER --- */}
      {selectedGame === 'tiger' && (
        <div className="card-glass p-8 md:p-12 rounded-[40px] border border-red-500/30 text-center bg-gradient-to-b from-red-950/20 to-slate-950/80">
          <div className="mb-6">
            <div className="text-sm text-red-500 font-bold uppercase tracking-widest mb-2">Ancient Fortune</div>
            <h2 className="text-4xl font-black text-white">FORTUNE TIGER</h2>
          </div>

          <div className="flex justify-center gap-4 mb-10">
            {tigerReels.map((symbol, idx) => (
              <div key={idx} className="w-20 h-28 md:w-24 md:h-32 bg-slate-900 border-2 border-yellow-600/50 rounded-2xl flex items-center justify-center text-5xl shadow-inner shadow-yellow-900/20">
                <span className={tigerSpinning ? 'animate-bounce' : ''}>{symbol}</span>
              </div>
            ))}
          </div>

          {tigerResultMsg && (
            <div className={`mb-8 p-4 rounded-2xl font-bold text-lg animate-fade-in ${tigerResultMsg.includes('WINNER') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {tigerResultMsg}
            </div>
          )}

          <div className="max-w-xs mx-auto space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-500 uppercase font-bold tracking-widest">Select Stake</label>
              <div className="flex gap-2">
                {['100', '500', '1000', '5000'].map(val => (
                  <button 
                    key={val} 
                    onClick={() => setTigerStake(val)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${tigerStake === val ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <input 
                type="number"
                placeholder="Custom Stake"
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-center font-bold focus:border-red-500 outline-none mt-2"
                value={tigerStake}
                onChange={(e) => setTigerStake(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleTigerSpin}
              disabled={tigerSpinning}
              className={`w-full py-5 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-95 ${tigerSpinning ? 'bg-slate-800 text-slate-600' : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500'}`}
            >
              {tigerSpinning ? 'SPINNING...' : 'RELEASE THE TIGER'}
            </button>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Your Balance: {CURRENCY}{currentUser.balance.toLocaleString()}</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-bold uppercase">
            <div className="border border-slate-800 p-2 rounded-lg">3x 🐯 = x20 Win</div>
            <div className="border border-slate-800 p-2 rounded-lg">3x Any = x10 Win</div>
            <div className="border border-slate-800 p-2 rounded-lg">Any Pair = x1.5 Win</div>
            <div className="border border-slate-800 p-2 rounded-lg">1x 🐯 = x0.5 Win</div>
          </div>
        </div>
      )}

      {/* --- WEALTH RUN --- */}
      {selectedGame === 'run' && gameActive && (
        <div className="relative w-full max-w-sm mx-auto h-[500px] bg-slate-900 border-x-4 border-slate-700 overflow-hidden select-none touch-none rounded-t-3xl shadow-2xl">
          <div className="absolute top-4 left-0 w-full text-center z-20">
            <div className="text-2xl font-black text-yellow-500 bg-black/50 inline-block px-4 py-1 rounded-full">{CURRENCY}{score}</div>
          </div>
          <div className="absolute inset-0 flex">
            <div className="w-1/3 border-r border-slate-800/50 h-full"></div>
            <div className="w-1/3 border-r border-slate-800/50 h-full"></div>
            <div className="w-1/3 h-full"></div>
          </div>
          <div className="absolute bottom-10 w-1/3 flex justify-center items-center transition-all duration-100 text-5xl z-10" style={{ left: `${lane * 33.33}%` }}>🏃‍♂️</div>
          {entities.map(e => (
            <div key={e.id} className="absolute w-1/3 flex justify-center items-center text-4xl" style={{ left: `${e.lane * 33.33}%`, top: `${e.y}px` }}>{e.type === 'coin' ? '💰' : '🚧'}</div>
          ))}
          <div className="absolute inset-0 flex z-30">
            <div className="w-1/2 h-full cursor-pointer" onClick={() => setLane(prev => Math.max(0, prev - 1))}></div>
            <div className="w-1/2 h-full cursor-pointer" onClick={() => setLane(prev => Math.min(2, prev + 1))}></div>
          </div>
        </div>
      )}

      {/* --- LUCKY SPIN --- */}
      {selectedGame === 'spin' && (
        <div className="card-glass p-12 rounded-3xl border border-slate-800 text-center">
          <h2 className="text-3xl font-bold mb-8">🎡 Lucky Spin Wheel</h2>
          <div className={`text-9xl mb-12 transition-all duration-[2000ms] ${isSpinning ? 'rotate-[1080deg]' : 'rotate-0'}`}>
            🎡
          </div>
          {spinResult !== null && (
            <div className="mb-8 text-2xl font-bold text-yellow-500 animate-bounce">
              You won {CURRENCY}{spinResult}!
            </div>
          )}
          <button 
            onClick={handleSpin}
            disabled={isSpinning}
            className={`bg-yellow-500 text-slate-900 px-10 py-4 rounded-xl font-bold text-xl hover:scale-105 transition shadow-lg ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSpinning ? 'SPINNING...' : 'SPIN FOR FREE'}
          </button>
        </div>
      )}

      {/* --- SPEED TAP --- */}
      {selectedGame === 'tap' && (
        <div className="card-glass p-12 rounded-3xl border border-slate-800 text-center">
          <h2 className="text-3xl font-bold mb-4">⚡ Speed Tap Challenge</h2>
          {!tapActive && tapTimer === 0 ? (
            <div>
              <p className="text-slate-400 mb-8">Tap the button as many times as possible in 10 seconds!</p>
              <button 
                onClick={startTapGame}
                className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-xl hover:scale-105 transition"
              >
                I'M READY!
              </button>
            </div>
          ) : (
            <div>
              <div className="text-6xl font-black text-yellow-500 mb-2">{tapTimer}s</div>
              <div className="text-2xl mb-8">Score: {tapCount}</div>
              <button 
                onClick={() => setTapCount(c => c + 1)}
                className="w-48 h-48 bg-yellow-500 text-slate-900 rounded-full font-black text-4xl shadow-2xl active:scale-90 transition-transform flex items-center justify-center mx-auto"
              >
                TAP!
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- GUESS NUMBER --- */}
      {selectedGame === 'guess' && (
        <div className="card-glass p-12 rounded-3xl border border-slate-800 text-center">
          <h2 className="text-3xl font-bold mb-4">🎲 Number Guesser</h2>
          <p className="text-lg font-semibold text-yellow-500 mb-6">{guessMessage}</p>
          {!guessGameOver ? (
            <div className="flex flex-col items-center gap-4">
              <input 
                type="number"
                placeholder="1-50"
                className="bg-slate-900 border border-slate-700 p-4 rounded-xl w-32 text-center text-2xl focus:outline-none focus:border-yellow-500"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
              />
              <button 
                onClick={handleGuess}
                className="bg-yellow-500 text-slate-900 px-8 py-3 rounded-xl font-bold hover:scale-105 transition"
              >
                GUESS
              </button>
              <p className="text-slate-500 text-sm">Attempts: {attempts}</p>
            </div>
          ) : (
            <button 
              onClick={handleBack}
              className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700 transition"
            >
              PLAY SOMETHING ELSE
            </button>
          )}
        </div>
      )}

      {/* --- STANDARD TASKS (Listen, Watch, Read, Quiz) --- */}
      {type !== 'play' && (
        activeTask ? (
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
