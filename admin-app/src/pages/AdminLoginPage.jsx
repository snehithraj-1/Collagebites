import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLoginPage() {
  const { loginAdmin, unauthorizedError } = useAdminAuth();

  const [identifier, setIdentifier] = useState('collagebites1@gmail.com');
  const [password, setPassword] = useState('Clgbites123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAdmin(identifier, password);
      if (!res.success) {
        setError(res.error || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setError(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-amber-500 shadow-xl shadow-orange-500/20 border border-orange-400/30 mb-2">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white">
            Collage Bites Admin
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Central Management & Order Dispatch • SRM University AP
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0F172A]/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Quick Info Pill */}
          <div className="p-3 rounded-2xl bg-orange-950/40 border border-orange-500/30 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#FF5722] shrink-0 mt-0.5" />
            <div className="text-[11px] text-orange-200 leading-relaxed">
              <strong>Official Access Portal:</strong> Live connection to Neon PostgreSQL database and SRM dispatch orders.
            </div>
          </div>

          {/* Error Banner */}
          {(error || unauthorizedError) && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error || unauthorizedError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Email / Username
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="collagebites1@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-amber-600 hover:from-[#F4511E] hover:to-amber-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Admin Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Role Fill Presets */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('collagebites1@gmail.com', 'Clgbites123')}
                className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-semibold border border-slate-700 transition-all text-left"
              >
                👑 <span className="text-white">Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('lhk_admin', 'LHK@Campus2026')}
                className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-semibold border border-slate-700 transition-all text-left"
              >
                🍳 <span className="text-white">Home Kitchen</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          Powered by Neon PostgreSQL & CampusBites Real-Time Engine
        </p>
      </div>
    </div>
  );
}
