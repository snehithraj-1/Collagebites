import React, { useState } from 'react';
import { Store, CheckCircle2, XCircle, MapPin, Power } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function RestaurantToggles({ restaurants, orderingEnabled, onRestaurantUpdate, assignedRestaurantId = null }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [stockUpdatingId, setStockUpdatingId] = useState(null);
  const [stockFeedback, setStockFeedback] = useState({});

  const visibleRestaurants = assignedRestaurantId
    ? restaurants.filter((r) => r.id === assignedRestaurantId)
    : restaurants;

  const handleBulkStock = async (restaurantId, isAvailable) => {
    setStockUpdatingId(restaurantId);
    try {
      const res = await fetch('/api/menu/bulk-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          is_available: isAvailable
        })
      });
      if (res.ok) {
        setStockFeedback((prev) => ({
          ...prev,
          [restaurantId]: isAvailable ? 'All In Stock ✓' : 'All Sold Out ✕'
        }));
        setTimeout(() => {
          setStockFeedback((prev) => ({ ...prev, [restaurantId]: null }));
        }, 3000);
      }
    } catch (e) {
      console.warn('[Bulk Stock Error]:', e);
    } finally {
      setStockUpdatingId(null);
    }
  };

  const handleToggle = async (restaurant) => {
    const nextState = !(restaurant.is_open !== false);
    setUpdatingId(restaurant.id);

    try {
      // 1. Update Neon PostgreSQL shared backend
      const payload = JSON.stringify({ 
        id: restaurant.id, 
        restaurantId: restaurant.id, 
        is_open: nextState 
      });

      let res = await fetch(`/api/restaurants/${encodeURIComponent(restaurant.id)}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });

      if (!res.ok) {
        res = await fetch('/api/restaurants/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
      }
      
      if (!res.ok) {
        await fetch('/api/restaurants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
      }

      // 2. Also sync to Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase
            .from('restaurants')
            .update({ is_open: nextState })
            .eq('id', restaurant.id);
        } catch (supaErr) {
          console.warn('[Supabase Restaurant Sync Warning]:', supaErr.message);
        }
      }

      // 3. Fallback localStorage and optimistic update
      const updated = restaurants.map((r) =>
        r.id === restaurant.id ? { ...r, is_open: nextState } : r
      );
      localStorage.setItem('cb_shared_restaurants', JSON.stringify(updated));
      onRestaurantUpdate(restaurant.id, nextState);
    } catch (err) {
      console.error('[Restaurant Toggle Error]:', err);
      onRestaurantUpdate(restaurant.id, nextState);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-white font-['Outfit'] flex items-center gap-2">
          <Store size={18} className="text-blue-400" />
          <span>{assignedRestaurantId ? 'Kitchen Availability & Acceptance' : 'Individual Restaurant Controls'}</span>
        </h3>
        <span className="text-xs text-slate-400">
          Syncs instantly to Student Portal
        </span>
      </div>

      <div className={`grid grid-cols-1 ${assignedRestaurantId ? 'md:grid-cols-1 max-w-xl' : 'md:grid-cols-2'} gap-4`}>
        {visibleRestaurants.map((restaurant) => {
          const isMasterOpen = orderingEnabled !== false;
          const isOpen = isMasterOpen && (restaurant.is_open !== false);
          const isBusy = updatingId === restaurant.id;

          return (
            <div
              key={restaurant.id}
              className="admin-card p-5 flex items-center justify-between gap-4 border-slate-700/70"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                  <img
                    src={restaurant.image_url || 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm sm:text-base text-white truncate font-['Outfit']">
                    {restaurant.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      isOpen
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      Status: {isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
                      {restaurant.location || 'Neerukonda'}
                    </span>
                    {stockFeedback[restaurant.id] && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                        {stockFeedback[restaurant.id]}
                      </span>
                    )}
                  </div>

                  {/* Menu Stock Bulk Toggles */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dishes:</span>
                    <button
                      onClick={() => handleBulkStock(restaurant.id, true)}
                      disabled={stockUpdatingId === restaurant.id}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-slate-700 hover:border-emerald-500 text-[10px] font-bold transition-all cursor-pointer"
                      title={`Assign all dishes in ${restaurant.name} as In Stock`}
                    >
                      All In Stock
                    </button>
                    <button
                      onClick={() => handleBulkStock(restaurant.id, false)}
                      disabled={stockUpdatingId === restaurant.id}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white border border-slate-700 hover:border-rose-500 text-[10px] font-bold transition-all cursor-pointer"
                      title={`Assign all dishes in ${restaurant.name} as Sold Out`}
                    >
                      All Sold Out
                    </button>
                  </div>
                </div>
              </div>

              {/* On / Off Switch Button */}
              <button
                onClick={() => handleToggle(restaurant)}
                disabled={isBusy}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50 ${
                  isOpen
                    ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-800'
                    : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-800'
                }`}
              >
                <Power size={13} />
                <span>{isBusy ? 'Saving...' : isOpen ? 'TURN OFF' : 'TURN ON'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
