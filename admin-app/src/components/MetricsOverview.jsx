import React from 'react';
import { ShoppingBag, CheckCircle2, XCircle, Store, Power } from 'lucide-react';

export default function MetricsOverview({ orders, restaurants, orderingEnabled }) {
  const totalOrders = orders.length;
  const confirmedOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;
  const activeRestaurants = restaurants.filter((r) => r.is_open !== false).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
      
      {/* 1. Total Orders */}
      <div className="admin-card p-3 sm:p-5 flex items-center gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-500/20 text-[#FF5722] flex items-center justify-center flex-shrink-0 border border-orange-500/30">
          <ShoppingBag size={18} />
        </div>
        <div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider font-['Outfit']">Total Orders</div>
          <div className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-white mt-0.5">
            {totalOrders}
          </div>
        </div>
      </div>

      {/* 2. Confirmed Orders */}
      <div className="admin-card p-3 sm:p-5 flex items-center gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider font-['Outfit']">Confirmed</div>
          <div className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-amber-400 mt-0.5">
            {confirmedOrders}
          </div>
        </div>
      </div>

      {/* 3. Delivered Orders */}
      <div className="admin-card p-3 sm:p-5 flex items-center gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider font-['Outfit']">Delivered</div>
          <div className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-emerald-400 mt-0.5">
            {deliveredOrders}
          </div>
        </div>
      </div>

      {/* 4. Active Restaurants */}
      <div className="admin-card p-3 sm:p-5 flex items-center gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
          <Store size={18} />
        </div>
        <div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider font-['Outfit']">Active Vendors</div>
          <div className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-white mt-0.5">
            {activeRestaurants} <span className="text-xs text-slate-500 font-normal">/ {restaurants.length}</span>
          </div>
        </div>
      </div>

      {/* 5. System Status */}
      <div className="col-span-2 lg:col-span-1 admin-card p-3 sm:p-5 flex items-center gap-3 border-orange-500/30">
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 border ${
          orderingEnabled 
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
        }`}>
          <Power size={18} className={orderingEnabled ? 'animate-pulse' : ''} />
        </div>
        <div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider font-['Outfit']">System State</div>
          <div className={`text-sm sm:text-base font-black uppercase font-['Outfit'] tracking-wide mt-0.5 ${
            orderingEnabled ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {orderingEnabled ? '🟢 Active' : '🔴 Paused'}
          </div>
        </div>
      </div>

    </div>
  );
}
