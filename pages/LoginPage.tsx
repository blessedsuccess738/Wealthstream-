
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, pass);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password / Account might be banned.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md card-glass p-10 rounded-3xl border border-slate-800">
        <h2 className="text-3xl font-bold mb-2 text-center text-yellow-500">Welcome Back</h2>
        <p className="text-slate-400 text-center mb-8">Continue your journey to wealth</p>

        {error && <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-yellow-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-yellow-500 transition"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-500 text-slate-900 py-4 rounded-xl font-bold hover:scale-[1.02] transition active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login Now'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm">
          Don't have an account? <Link to="/signup" className="text-yellow-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
