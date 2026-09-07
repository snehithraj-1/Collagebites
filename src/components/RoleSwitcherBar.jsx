import React from 'react';
import { useApp } from '../context/AppContext';
import { Utensils, ShieldCheck } from 'lucide-react';

export default function RoleSwitcherBar({ activePortal }) {
  const { switchRole } = useApp();

  return (
    <div className="bg-[#0B1120] text-slate-300 border-b border-slate-800 text-xs py-2 px-4 select-none sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        {/* Campus Network Identity */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold text-white tracking-wide font-['Outfit']">
            SRM-AP CampusBites System
          </span>
          <span className="text-[10px] text-slate-400 hidden md:inline">
            • Instant Portal Switcher (Student & Admin)
          </span>
        </div>

        {/* 2 Role Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {/* 1. Student App */}
          <button
            onClick={() => switchRole('student')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer border-none ${
              activePortal === 'student'
                ? 'bg-gradient-to-r from-[#FF5722] to-[#FF7A50] text-white shadow-md shadow-[#FF5722]/30 scale-102'
                : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Utensils size={13} />
            <span>Student App</span>
          </button>

          {/* 2. Admin Portal */}
          <button
            onClick={() => switchRole('admin')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer border-none ${
              activePortal === 'admin'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 scale-102'
                : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <ShieldCheck size={13} />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}

