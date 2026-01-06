
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useApp();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await signup(username, email, pass);
    if (success) {
      navigate('/login');
    } else {
      setError('Email already registered or registration failed.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md card-glass p-10 rounded-3xl border border-slate-800">
        <h2 className="text-3xl font-bold mb-2 text-center text-yellow-500">Create Account</h2>
        <p className="text-slate-400 text-center mb-8">Start your engagement journey</p>

        {error && <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Username</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-yellow-500 transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
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
            {loading ? 'Creating Account...' : 'Sign Up Free'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm">
          Already have an account? <Link to="/login" className="text-yellow-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
