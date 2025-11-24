import React, { useState } from 'react';
import { UserMode } from '../types';
import { Music, ArrowRight, Lock, User } from 'lucide-react';

interface LoginPageProps {
  onLogin: (mode: UserMode) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'artist' && password === 'artist') {
      onLogin(UserMode.DJ);
    } else if (username === 'client' && password === 'client') {
      onLogin(UserMode.CLIENT);
    } else if (username === 'promoter' && password === 'promoter') {
      onLogin(UserMode.PROMOTER);
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[100px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/20 blur-[100px]"></div>

      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-8 z-10 animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-3 rounded-xl shadow-lg shadow-indigo-500/30">
            <Music className="text-white w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-2">Welcome to GigFlow</h1>
        <p className="text-center text-slate-400 mb-8">Sign in to manage bookings, events, or view proposals.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-600 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-600 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 mt-2"
          >
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p className="mb-3 uppercase tracking-wider font-semibold text-slate-600">Quick Login (Demo)</p>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => onLogin(UserMode.DJ)}
              className="bg-slate-900 hover:bg-indigo-900/30 hover:border-indigo-500/50 px-3 py-2 rounded-lg border border-slate-700 transition-all cursor-pointer flex justify-between items-center group"
            >
              <span className="font-medium text-slate-300 group-hover:text-indigo-400">Artist</span>
              <span className="text-slate-600 group-hover:text-indigo-500/50 font-mono">artist / artist</span>
            </button>
            <button 
              onClick={() => onLogin(UserMode.CLIENT)}
              className="bg-slate-900 hover:bg-emerald-900/30 hover:border-emerald-500/50 px-3 py-2 rounded-lg border border-slate-700 transition-all cursor-pointer flex justify-between items-center group"
            >
              <span className="font-medium text-slate-300 group-hover:text-emerald-400">Client</span>
              <span className="text-slate-600 group-hover:text-emerald-500/50 font-mono">client / client</span>
            </button>
            <button 
              onClick={() => onLogin(UserMode.PROMOTER)}
              className="bg-slate-900 hover:bg-amber-900/30 hover:border-amber-500/50 px-3 py-2 rounded-lg border border-slate-700 transition-all cursor-pointer flex justify-between items-center group"
            >
              <span className="font-medium text-slate-300 group-hover:text-amber-400">Promoter</span>
              <span className="text-slate-600 group-hover:text-amber-500/50 font-mono">promoter / promoter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};