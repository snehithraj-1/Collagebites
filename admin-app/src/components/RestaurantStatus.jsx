import React, { useState } from 'react';
import { Power, UtensilsCrossed, AlertTriangle, CheckCircle, Store } from 'lucide-react';
import { api } from '../services/api';

export default function RestaurantStatus({
  orderingEnabled,
  onToggleOrdering,
  restaurants = [],
  onRestaurantUpdated,
  isSuperAdmin = true
}) {
  const [togglingRestId, setTogglingRestId] = useState(null);
  const [togglingSystem, setTogglingSystem] = useState(false);

  const handleToggleSystem = async () => {
    if (!isSuperAdmin) {
      alert('Only Super Administrators can toggle master campus ordering.');
      return;
    }
    setTogglingSystem(true);
    try {
      const nextState = !orderingEnabled;
      await api.updateSystemSettings(nextState, nextState ? '' : 'Ordering is temporarily paused by campus admin.');
      onToggleOrdering(nextState);
    } catch (err) {
      alert(`Failed to update system settings: ${err.message}`);
    } finally {
      setTogglingSystem(false);
    }
  };

  const handleToggleRestaurant = async (rest) => {
    setTogglingRestId(rest.id);
    try {
      const nextState = !rest.is_open;
      await api.toggleRestaurant(rest.id, nextState);
      if (onRestaurantUpdated) {
        onRestaurantUpdated(rest.id, nextState);
      }
    } catch (err) {
      alert(`Failed to toggle kitchen status: ${err.message}`);
    } finally {
      setTogglingRestId(null);
    }
  };

  return (
    <div className="bg-[#0F172A]/80 border border-slate-800 rounded-3xl p-4 sm:p-5 backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Store size={18} className="text-[#FF5722]" />
            <span>Kitchen & Campus Status</span>
          </h3>
          <p className="text-xs text-slate-400">
            Control kitchen operating hours and emergency ordering shutdown
          </p>
        </div>

        {/* Master Emergency Switch (Super Admin Only) */}
        {isSuperAdmin && (
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900 border border-slate-700/80">
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-300 block">
                Master Ordering
              </span>
              <span className={`text-[10px] font-extrabold ${orderingEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                {orderingEnabled ? 'ACTIVE (Accepting)' : 'EMERGENCY SHUTDOWN'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleSystem}
              disabled={togglingSystem}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer border-none ${
                orderingEnabled ? 'bg-emerald-500' : 'bg-rose-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-sm ${
                  orderingEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Individual Kitchen Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {restaurants.map((rest) => {
          const isOpen = rest.is_open !== false;
          const isToggling = togglingRestId === rest.id;

          return (
            <div
              key={rest.id}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border ${
                  isOpen ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  <UtensilsCrossed size={16} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {rest.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                    <span className={isOpen ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      {isOpen ? 'Open • Taking Orders' : 'Closed • Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleRestaurant(rest)}
                disabled={isToggling}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isOpen
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/60'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                }`}
              >
                {isToggling ? 'Updating...' : isOpen ? 'Close Kitchen' : 'Open Kitchen'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
