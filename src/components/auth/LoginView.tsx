import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Lock, User, ArrowRight, CheckCircle2, Sparkles, Key } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, users, setCurrentUser } = useApp();

  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(identifier, password);
    if (!success) {
      setError('Invalid username/email or password credentials. (Default password: password123)');
    }
  };

  const handleQuickLogin = (userId: string) => {
    const u = users.find((user) => user.id === userId);
    if (u) {
      setCurrentUser(u);
      login(u.username || u.email, u.password || 'password123');
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#07090E] p-4 font-sans select-none relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0D111A] border border-white/[0.12] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative z-10 backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl shadow-lg shadow-blue-500/30">
            P
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Sign In to ProductRail
          </h1>
          <p className="text-xs text-slate-400">
            Single operational source of truth for delivery, QA, and release management.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs text-center animate-shake">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Username or Work Email
            </label>
            <div className="relative">
              <User size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. admin or sarah@bdtickets.com"
                required
                className="w-full bg-[#121622] border border-white/[0.1] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#121622] border border-white/[0.1] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <span>Authenticate &amp; Enter</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Demo Role Logins */}
        <div className="pt-4 border-t border-white/[0.08] space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="font-semibold uppercase tracking-wider text-slate-500">
              Quick 1-Click Demo Profiles
            </span>
            <span className="font-mono text-slate-500">pass: password123</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'usr-9', label: 'Super Admin', sub: 'IT / DevOps', color: 'border-blue-500/40 text-blue-300' },
              { id: 'usr-4', label: 'Project Manager', sub: 'Backend', color: 'border-amber-500/40 text-amber-300' },
              { id: 'usr-1', label: 'Product Owner', sub: 'Delivery', color: 'border-purple-500/40 text-purple-300' },
              { id: 'usr-2', label: 'Developer', sub: 'Mobile Eng', color: 'border-emerald-500/40 text-emerald-300' },
              { id: 'usr-3', label: 'QA Specialist', sub: 'Verification', color: 'border-cyan-500/40 text-cyan-300' },
              { id: 'usr-5', label: 'Business UAT', sub: 'Acceptance', color: 'border-teal-500/40 text-teal-300' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleQuickLogin(p.id)}
                className={`p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border transition-all text-left flex flex-col justify-between cursor-pointer ${p.color}`}
              >
                <div className="font-bold text-xs truncate text-white">{p.label}</div>
                <div className="text-[10px] text-slate-400">{p.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
