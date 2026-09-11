import React from 'react';
import { Search, X, Download, Filter } from 'lucide-react';
import { exportOrdersToCSV } from '../lib/exportUtils';

export default function OrdersFilterBar({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  restaurantFilter,
  onRestaurantChange,
  restaurants = [],
  orders = [],
  isSuperAdmin = true
}) {
  const statuses = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusCount = (key) => {
    if (key === 'all') return orders.length;
    return orders.filter((o) => (o.status || 'pending').toLowerCase() === key).length;
  };

  return (
    <div className="space-y-3">
      {/* Controls Row: Search & Dropdowns */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search student name, phone, order #, or dish..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Restaurant Filter (Visible if Super Admin) */}
          {isSuperAdmin && (
            <div className="relative">
              <select
                value={restaurantFilter}
                onChange={(e) => onRestaurantChange(e.target.value)}
                className="px-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-white focus:outline-none focus:border-[#FF5722] cursor-pointer"
              >
                <option value="all">All Kitchens</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={() => exportOrdersToCSV(orders)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download CSV for Excel"
          >
            <Download size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map((s) => {
          const count = getStatusCount(s.key);
          const isActive = statusFilter === s.key;

          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onStatusChange(s.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                isActive
                  ? 'bg-[#FF5722] text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{s.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
