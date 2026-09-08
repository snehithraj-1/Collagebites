import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight, Sparkles, Mail, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLoginPage() {
  const { loginAdmin, demoAdminLogin, unauthorizedError, isConfigured } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);
    const result = await loginAdmin(email, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
      
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4 border border-blue-400/30">
          <Lock size={30} className="text-white" />
        </div>

        <h1 className="text-3xl font-black font-['Outfit'] tracking-tight">
          Admin Portal
        </h1>
        <p className="mt-1 text-sm text-slate-400 font-medium">
          CampusBites Central Operations & Management Dashboard
        </p>

        {!isConfigured && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 text-xs font-bold border border-blue-800">
            <Sparkles size={13} className="text-blue-400" />
            <span>Local Preview / Demo Admin Mode Ready</span>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111827] py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-700/80 space-y-5">
          
          {/* Unauthorized Alert if student tried to enter */}
          {unauthorizedError && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-start gap-2.5 animate-shake">
              <ShieldAlert size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Access Denied: </strong>
                <span>{unauthorizedError}</span>
              </div>
            </div>
          )}

          {/* Form Error */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-900/40 flex items-start gap-3">
            <ShieldCheck size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong>Restricted Administrative Access.</strong><br />
              Authorized exclusively for Campus Management, Master Toggles, and Order Records.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-blue-400" />
                <span>Admin Email</span>
              </label>
              <input
                type="email"
                required
                placeholder="admin@srmap.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-900/90 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <KeyRound size={13} className="text-blue-400" />
                <span>Admin Password</span>
              </label>
              <input
                type="password"
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-900/90 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Demo Key: <code className="text-amber-400 bg-black/40 px-1.5 py-0.5 rounded font-mono">admin123</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying Access...</span>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Unlock Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={demoAdminLogin}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/80 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles size={14} className="text-blue-400" />
              <span>Instant Demo Admin Access</span>
            </button>
          </div>

        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Role-Based Access Control enforced at database level with Supabase RLS.
        </p>
      </div>

    </div>
  );
}
