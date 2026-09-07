import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Power, 
  Store, 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Ban, 
  Search, 
  Filter, 
  AlertTriangle, 
  ArrowLeft, 
  RefreshCw,
  Eye,
  LogOut,
  MapPin,
  Phone,
  DollarSign,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RESTAURANTS } from '../data/campusData';

export default function AdminDashboardPage({ onSwitchToStudentView }) {
  const {
    overallOrderingEnabled,
    toggleOverallOrdering,
    restaurantStatuses,
    toggleRestaurantStatus,
    orders,
    advanceOrderStatus,
    cancelOrderByAdmin,
    deleteOrderByAdmin,
    refreshCloudData,
    logout,
    isNeonConnected
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  
  // Modal state for delete order confirmation
  const [orderToDelete, setOrderToDelete] = useState(null);
  // Modal state for viewing order details
  const [viewingOrder, setViewingOrder] = useState(null);

  // Metrics Calculation (Phase 5 Lifecycle)
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING_CONFIRMATION').length;
  const activeOrdersCount = orders.filter((o) => ['CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
  const confirmedOrdersCount = orders.filter((o) => ['CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.status)).length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const cancelledOrdersCount = orders.filter((o) => ['CANCELLED', 'EXPIRED'].includes(o.status)).length;
  const totalRevenue = orders
    .filter((o) => !['CANCELLED', 'EXPIRED', 'PENDING_CONFIRMATION'].includes(o.status))
    .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus = selectedStatusFilter === 'ALL' || order.status === selectedStatusFilter;
      
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        (order.id && order.id.toLowerCase().includes(query)) ||
        (order.studentName && order.studentName.toLowerCase().includes(query)) ||
        (order.studentId && order.studentId.toLowerCase().includes(query)) ||
        (order.restaurantName && order.restaurantName.toLowerCase().includes(query)) ||
        (order.items && order.items.some((i) => (i.name || i.item_name || '').toLowerCase().includes(query)));

      return matchStatus && matchSearch;
    });
  }, [orders, selectedStatusFilter, searchQuery]);

  const confirmDelete = () => {
    if (orderToDelete) {
      deleteOrderByAdmin(orderToDelete.id);
      setOrderToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold mb-2 border border-blue-500/30">
              <ShieldCheck size={14} />
              <span>Campus Management & Dispatch Control</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight text-white">
              Administrator Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live orders, master switch control, and individual restaurant availability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Neon Cloud Database Status Pill */}
            {isNeonConnected ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Database size={13} className="text-emerald-400" />
                <span>Neon Postgres: Connected</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold" title="Add DATABASE_URL to .env to connect Neon Cloud Database">
                <Database size={13} className="text-amber-400" />
                <span>Storage: Local Cache</span>
              </div>
            )}

            {/* Cloud Refresh Action */}
            <button
              onClick={() => {
                refreshCloudData();
              }}
              title="Refresh / Sync Cloud Database"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw size={15} />
            </button>

            <button
              onClick={onSwitchToStudentView}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
            >
              <Eye size={15} />
              <span>View Student App</span>
            </button>

            <button
              onClick={() => {
                window.location.hash = '';
                if (window.location.pathname.toLowerCase().includes('/admin')) {
                  window.history.pushState(null, '', '/');
                }
                logout();
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-rose-800/60"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* SECTION 1: SYSTEM & RESTAURANT TOGGLES */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* OVERALL ORDERING ON/OFF MASTER TOGGLE */}
          <div className={`p-6 rounded-3xl border transition-all ${
            overallOrderingEnabled 
              ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
              : 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-950/30'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold tracking-wider uppercase text-slate-400">
                Master System Control
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                overallOrderingEnabled 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${overallOrderingEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{overallOrderingEnabled ? 'SYSTEM ACTIVE' : 'ORDERING PAUSED'}</span>
              </span>
            </div>

            <h3 className="text-xl font-black text-white font-['Outfit'] mb-2">
              Overall Ordering
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              When OFF, students can browse restaurants and menus, but cannot place orders. Displays <em className="text-amber-300 font-semibold">"Ordering is currently unavailable."</em>
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300">
                {overallOrderingEnabled ? 'Master Switch: ON' : 'Master Switch: OFF'}
              </span>

              <button
                onClick={() => toggleOverallOrdering(!overallOrderingEnabled)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  overallOrderingEnabled ? 'bg-emerald-500 focus:ring-emerald-400' : 'bg-slate-700 focus:ring-slate-500'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    overallOrderingEnabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* INDIVIDUAL RESTAURANT 1: Local Home Kitchen */}
          {RESTAURANTS.map((rest) => {
            const status = restaurantStatuses[rest.id] || 'OPEN';
            const isOpen = status === 'OPEN';

            return (
              <div 
                key={rest.id}
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <Store size={14} className="text-[#FF5722]" />
                      <span>{rest.cuisine}</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase ${
                      isOpen 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {status}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white font-['Outfit'] mb-1">
                    {rest.name}
                  </h3>
                  <div className="space-y-1 text-xs text-slate-400 mb-4">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-slate-500 flex-shrink-0" />
                      <span className="truncate">{rest.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-emerald-500 flex-shrink-0" />
                      <span>{rest.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-300">
                      Restaurant Status
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {isOpen ? 'Accepting Orders' : 'Marked CLOSED for students'}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleRestaurantStatus(rest.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isOpen 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    <Power size={13} />
                    <span>{isOpen ? 'SET CLOSED' : 'SET OPEN'}</span>
                  </button>
                </div>
              </div>
            );
          })}

        </section>

        {/* SECTION 2: METRICS CARDS */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
              <ShoppingBag size={18} className="text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
              {totalOrdersCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Recorded on Campus</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Confirmed</span>
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-['Outfit']">
              {confirmedOrdersCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Ready / Delivered</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Cancelled</span>
              <XCircle size={18} className="text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 font-['Outfit']">
              {cancelledOrdersCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Manual & Timeout</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending</span>
              <Clock size={18} className="text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-['Outfit']">
              {pendingOrdersCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">In 30s Countdown</div>
          </div>
        </section>

        {/* SECTION 3: ADMIN ORDER MANAGEMENT */}
        <section className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          
          {/* Table Header Controls */}
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white font-['Outfit']">
                Campus Order Management
              </h2>
              <p className="text-xs text-slate-400">
                View all orders, monitor real-time status, cancel or delete entries
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID, student, dish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-full sm:w-60"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-800 border border-slate-700">
                {['ALL', 'PENDING_CONFIRMATION', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'EXPIRED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      selectedStatusFilter === status
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Restaurant</th>
                  <th className="py-3.5 px-4">Ordered Items</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Order Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <ShoppingBag size={32} className="mx-auto mb-2 text-slate-600" />
                      <p className="font-semibold">No campus orders matching criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const totalQty = order.items?.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0) || 1;
                    const itemsSummary = order.items
                      ?.map((item) => `${item.name} (${item.qty || item.quantity || 1})`)
                      .join(', ') || 'Item';

                    return (
                      <tr key={order.id || order.tempId} className="hover:bg-slate-800/40 transition-colors">
                        
                        {/* Order ID */}
                        <td className="py-3.5 px-4 font-mono font-black text-blue-400 whitespace-nowrap">
                          #{order.id || order.tempId}
                        </td>

                        {/* Student Details */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white whitespace-nowrap">{order.studentName}</div>
                          <div className="text-[11px] text-slate-400">{order.studentId || 'ID N/A'} • {order.studentPhone}</div>
                        </td>

                        {/* Restaurant */}
                        <td className="py-3.5 px-4 font-semibold text-slate-300 whitespace-nowrap">
                          {order.restaurantName}
                        </td>

                        {/* Ordered Items */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="truncate text-slate-300" title={itemsSummary}>
                            {itemsSummary}
                          </p>
                        </td>

                        {/* Quantity */}
                        <td className="py-3.5 px-4 font-bold text-slate-300">
                          {totalQty}
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-4 font-black text-emerald-400 whitespace-nowrap font-mono text-sm">
                          ₹{order.totalAmount}
                        </td>

                        {/* Order Time */}
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {order.orderTimeFormatted || (order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent')}
                        </td>

                        {/* Order Status (Phase 5 Badges) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {order.status === 'PENDING_CONFIRMATION' ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                              PENDING (30s)
                            </span>
                          ) : order.status === 'CONFIRMED' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                              CONFIRMED
                            </span>
                          ) : order.status === 'PREPARING' ? (
                            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-black uppercase tracking-wider">
                              PREPARING 🍳
                            </span>
                          ) : order.status === 'READY' ? (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 text-[10px] font-black uppercase tracking-wider">
                              READY 📦
                            </span>
                          ) : order.status === 'PICKED_UP' ? (
                            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider">
                              PICKED UP 🛵
                            </span>
                          ) : order.status === 'OUT_FOR_DELIVERY' ? (
                            <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider">
                              ON THE WAY 🚚
                            </span>
                          ) : order.status === 'DELIVERED' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 text-[10px] font-black uppercase tracking-wider">
                              DELIVERED ✅
                            </span>
                          ) : order.status === 'EXPIRED' ? (
                            <span className="px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600 text-[10px] font-black uppercase tracking-wider" title={order.cancelledReason}>
                              EXPIRED ⌛
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider" title={order.cancelledReason}>
                              CANCELLED ❌
                            </span>
                          )}
                        </td>

                        {/* Actions: [Advance Status], [Cancel Order], [Delete Order] */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Stage Stepper Buttons */}
                            {order.status === 'CONFIRMED' && (
                              <button
                                onClick={() => advanceOrderStatus(order.id, 'PREPARING')}
                                title="Start Cooking / Preparing"
                                className="px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                <span>🍳 Cook</span>
                              </button>
                            )}
                            {order.status === 'PREPARING' && (
                              <button
                                onClick={() => advanceOrderStatus(order.id, 'READY')}
                                title="Mark as Ready"
                                className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                <span>📦 Ready</span>
                              </button>
                            )}
                            {order.status === 'READY' && (
                              <>
                                <button
                                  onClick={() => advanceOrderStatus(order.id, 'PICKED_UP')}
                                  title="Mark as Picked Up by Delivery Boy"
                                  className="px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  <span>🛵 Pick Up</span>
                                </button>
                                <button
                                  onClick={() => advanceOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                                  title="Send Out for Delivery"
                                  className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  <span>🚚 Deliver</span>
                                </button>
                              </>
                            )}
                            {order.status === 'PICKED_UP' && (
                              <button
                                onClick={() => advanceOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                                title="Send Out for Delivery"
                                className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                <span>🚚 Deliver</span>
                              </button>
                            )}
                            {order.status === 'OUT_FOR_DELIVERY' && (
                              <button
                                onClick={() => advanceOrderStatus(order.id, 'DELIVERED')}
                                title="Mark as Delivered to Student"
                                className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                <span>✅ Done</span>
                              </button>
                            )}

                            {!['DELIVERED', 'CANCELLED', 'EXPIRED'].includes(order.status) && (
                              <button
                                onClick={() => cancelOrderByAdmin(order.id)}
                                title="Cancel Order"
                                className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Ban size={11} />
                                <span>Cancel</span>
                              </button>
                            )}

                            <button
                              onClick={() => setOrderToDelete(order)}
                              title="Delete Order"
                              className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 size={11} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </section>

      </div>

      {/* MODAL: DELETE CONFIRMATION DIALOG */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white font-['Outfit']">
                Are you sure you want to delete this order?
              </h3>
              <p className="text-xs text-slate-400">
                Order <span className="text-white font-mono font-bold">#{orderToDelete.id}</span> by {orderToDelete.studentName} will be permanently removed from records.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                No, Keep It
              </button>

              <button
                onClick={confirmDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Yes, Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
