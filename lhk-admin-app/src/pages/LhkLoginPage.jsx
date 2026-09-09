import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, User, Utensils, CheckCircle2 } from 'lucide-react';
import { useLhkAuth } from '../context/LhkAuthContext';

export default function LhkLoginPage() {
  const { loginLhkAdmin, unauthorizedError } = useLhkAuth();

  const [identifier, setIdentifier] = useState('lhk_admin');
  const [password, setPassword] = useState('LHK@Campus2026');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);
    const result = await loginLhkAdmin(identifier, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid staff credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080E1A] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-white font-sans">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 mb-3 border border-blue-400/30 text-3xl">
          🍲
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white">
          Local Home Kitchen
        </h1>
        <p className="mt-1 text-xs text-blue-400 font-bold uppercase tracking-wider">
          Staff Operations & Dispatch Portal (SRM-AP)
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 py-7 px-6 sm:px-8 rounded-3xl shadow-2xl border border-slate-800 space-y-5">
          
          {/* Kitchen Scope Notice */}
          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 flex items-start gap-2.5">
            <Utensils size={18} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Local Kitchen Staff Login:</strong> Manage incoming student orders, assign your delivery partners, and control kitchen availability.
            </div>
          </div>

          {unauthorizedError && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-start gap-2">
              <ShieldAlert size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{unauthorizedError}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User size={12} className="text-blue-400" />
                <span>Staff Username</span>
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="lhk_admin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <KeyRound size={12} className="text-blue-400" />
                <span>Staff Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-1 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Logging In...</span>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Login to Local Home Kitchen</span>
                </>
              )}
            </button>
          </form>

        </div>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          Dedicated Restaurant Portal • Isolated to Local Home Kitchen Data
        </p>
      </div>

    </div>
  );
}
