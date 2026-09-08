import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SystemAlertBanner({ orderingEnabled }) {
  if (orderingEnabled) return null;

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={14} />
          </div>
          <span>
            <strong>Ordering is currently unavailable.</strong> Campus dining master ordering has been paused by administration. You can still browse menus!
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider hidden sm:inline-block">
          Paused
        </span>
      </div>
    </div>
  );
}
