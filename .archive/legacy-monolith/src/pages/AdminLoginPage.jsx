import React, { useState } from 'react';
import { Lock, ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminLoginPage({ onSwitchToStudent }) {
  const { loginAdmin } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setError('');

    const success = loginAdmin(password);
    if (!success) {
      setError('Invalid administrator credentials. (Hint: admin123 or clgbites@admin2024)');
    } else {
      window.location.hash = 'admin';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#3B82F6] to-[#1D4ED8] mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4">
          <Lock size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-black font-['Outfit'] tracking-tight">
          Admin Portal
        </h1>
        <p className="mt-1 text-sm text-slate-400 font-medium">
          CampusBites Control & Order Management Dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1E293B] py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-700/60">
          <div className="mb-6 p-3.5 rounded-2xl bg-blue-950/60 border border-blue-800/50 flex items-start gap-3">
            <ShieldAlert size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong>Restricted Administrative Access.</strong><br />
              Authorized for Campus Operations, Master Ordering Toggles, and Order Records.
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs font-semibold text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <KeyRound size={13} className="text-blue-400" />
                <span>Admin Master Password</span>
              </label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full px-3.5 py-3 rounded-xl border border-slate-600 bg-slate-900/90 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Demo Key: <code className="text-amber-400 bg-black/40 px-1.5 py-0.5 rounded">admin123</code> or <code className="text-amber-400 bg-black/40 px-1.5 py-0.5 rounded">clgbites@admin2024</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
            >
              <span>Unlock Admin Controls</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
            <button
              type="button"
              onClick={onSwitchToStudent}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer border-none bg-transparent"
            >
              <ArrowLeft size={14} />
              <span>Return to Student Dining Portal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
