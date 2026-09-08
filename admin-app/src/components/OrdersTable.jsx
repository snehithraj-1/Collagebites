import React, { useState } from 'react';
import { Eye, Ban, Trash2, MapPin, Clock, Search, Filter, Phone, CheckCircle2, ChefHat, PackageCheck, Bike, CheckCheck } from 'lucide-react';

export default function OrdersTable({
  orders,
  deliveryPartners = [],
  onAssignPartner,
  onOpenDeliveryPartners,
  onInspectOrder,
  onUpdateStatus,
  onCancelOrder,
  onPromptDeleteOrder
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderToAssignPartner, setOrderToAssignPartner] = useState(null);

  const filteredOrders = orders.filter((order) => {
    const matchFilter = filterStatus === 'ALL' || order.status === filterStatus;
    const matchSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.student_email && order.student_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.student_phone && order.student_phone.includes(searchQuery)) ||
      (order.restaurant_name && order.restaurant_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold';
      case 'ACCEPTED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-black animate-pulse';
      case 'PREPARING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black animate-pulse';
      case 'READY':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-black';
      case 'OUT_FOR_DELIVERY':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-black animate-pulse';
      case 'DELIVERED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
      case 'CANCELLED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
      case 'EXPIRED':
        return 'bg-slate-700/40 text-slate-400 border-slate-600 font-bold';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700 font-bold';
    }
  };

  const getNextStageInfo = (currentStatus) => {
    switch (currentStatus) {
      case 'CONFIRMED':
        return {
          nextStatus: 'ACCEPTED',
          label: '✅ Accept Order',
          color: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/25'
        };
      case 'ACCEPTED':
        return {
          nextStatus: 'PREPARING',
          label: '🍳 Start Cooking',
          color: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-500/25'
        };
      case 'PREPARING':
        return {
          nextStatus: 'READY',
          label: '📦 Mark Ready',
          color: 'bg-purple-600 hover:bg-purple-500 text-white font-black shadow-purple-600/25'
        };
      case 'READY':
        return {
          nextStatus: 'OUT_FOR_DELIVERY',
          label: '🛵 Out for Delivery',
          color: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-cyan-500/25'
        };
      case 'OUT_FOR_DELIVERY':
        return {
          nextStatus: 'DELIVERED',
          label: '✅ Mark Delivered',
          color: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/25'
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Table Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-extrabold text-white font-['Outfit']">
            Student Orders Pipeline
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
            {filteredOrders.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, student, mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-60 touch-manipulation"
            />
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold cursor-pointer touch-manipulation"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="PREPARING">PREPARING</option>
            <option value="READY">READY</option>
            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE CARDS VIEW: Optimized for Android & iOS Phones   */}
      {/* ======================================================== */}
      <div className="block md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="admin-card p-8 text-center text-slate-500 text-xs">
            No orders found matching criteria.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const orderItems = order.order_items || order.items || [];
            const timeFormatted = new Date(order.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
            const nextInfo = getNextStageInfo(order.status);

            return (
              <div
                key={order.id}
                className="admin-card p-4 space-y-3 border-slate-800 bg-slate-900/90 rounded-2xl shadow-md touch-manipulation"
              >
                {/* Header: ID, Time, Status */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="font-mono font-black text-sm text-[#FF5722]">
                      #{order.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono ml-2">
                      {timeFormatted}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Customer:</span>
                    <span className="font-extrabold text-white text-xs block truncate">{order.student_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Mobile:</span>
                    {order.student_phone ? (
                      <a
                        href={`tel:${order.student_phone}`}
                        className="text-emerald-400 font-mono font-bold text-xs inline-flex items-center gap-1"
                      >
                        <Phone size={11} />
                        <span>{order.student_phone}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs">N/A</span>
                    )}
                  </div>
                </div>

                {/* Drop Location */}
                <div className="text-[11px] text-slate-300 flex items-center gap-1.5 bg-slate-800/40 p-2 rounded-xl">
                  <MapPin size={12} className="text-[#FF5722] shrink-0" />
                  <span className="truncate">{order.delivery_location || 'SRM University - Gate 3'}</span>
                </div>

                {/* Delivery Partner Assigned / Quick Assign */}
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm">🛵</span>
                    {order.delivery_partner_name ? (
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block leading-tight">Partner:</span>
                        <span className="font-extrabold text-white text-xs">{order.delivery_partner_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No partner</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {order.delivery_partner_phone && (
                      <a
                        href={`tel:${order.delivery_partner_phone}`}
                        className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold flex items-center gap-1"
                        title="Call Delivery Partner"
                      >
                        <Phone size={11} />
                        <span>Call</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setOrderToAssignPartner(order)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer border ${
                        order.delivery_partner_id
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          : 'bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border-cyan-500/40 shadow-sm'
                      }`}
                    >
                      <span>🛵</span>
                      <span>{order.delivery_partner_id ? 'Change' : 'Assign'}</span>
                    </button>
                  </div>
                </div>

                {/* Dishes Summary & Total */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 line-clamp-1 flex-1 pr-2">
                    {orderItems.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                  </span>
                  <span className="font-mono font-black text-emerald-400 text-sm shrink-0">
                    ₹{order.total_amount}
                  </span>
                </div>

                {/* Direct Stage Jump Pills on Dashboard Card */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Quick Status Update:</span>
                    <span className="font-mono text-emerald-400">Current: {order.status}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { key: 'ACCEPTED', label: '✅ Accept', color: 'bg-emerald-600 text-white' },
                      { key: 'PREPARING', label: '🍳 Cook', color: 'bg-amber-500 text-slate-950 font-black' },
                      { key: 'READY', label: '📦 Ready', color: 'bg-purple-600 text-white font-black' },
                      { key: 'OUT_FOR_DELIVERY', label: '🛵 Sent', color: 'bg-cyan-500 text-slate-950 font-black' },
                      { key: 'DELIVERED', label: '🎉 Done', color: 'bg-emerald-500 text-slate-950 font-black' }
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => onUpdateStatus && onUpdateStatus(order.id, st.key)}
                        className={`py-1.5 px-0.5 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer border touch-manipulation truncate ${
                          order.status === st.key
                            ? `${st.color} border-white/50 shadow-md ring-2 ring-blue-400/40 scale-[1.03]`
                            : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:bg-slate-700 hover:text-white'
                        }`}
                        title={`Set status to ${st.key}`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Action Buttons: Primary Progression + Inspect / Cancel / Delete */}
                <div className="pt-1.5 flex items-center gap-1.5">
                  {nextInfo ? (
                    <button
                      onClick={() => onUpdateStatus && onUpdateStatus(order.id, nextInfo.nextStatus)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer border-none active:scale-[0.98] ${nextInfo.color}`}
                    >
                      {nextInfo.label}
                    </button>
                  ) : order.status === 'DELIVERED' ? (
                    <span className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-center text-xs font-extrabold">
                      Delivered at Gate 3 ✅
                    </span>
                  ) : (
                    <span className="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-center text-xs font-bold">
                      {order.status}
                    </span>
                  )}

                  <button
                    onClick={() => onInspectOrder(order)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                    title="View Full Order Details"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    onClick={() => onCancelOrder(order)}
                    disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                    className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
                    title="Cancel Order"
                  >
                    <Ban size={16} />
                  </button>

                  <button
                    onClick={() => onPromptDeleteOrder(order)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800/60 cursor-pointer text-xs"
                    title="Permanently Delete Order"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* DESKTOP TABLE VIEW: For Tablets, Laptops & Desktops     */}
      {/* ======================================================== */}
      <div className="hidden md:block admin-card overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Order ID & Time</th>
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-4">Delivery Partner</th>
                <th className="py-3 px-4">Ordered Items</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const orderItems = order.order_items || order.items || [];
                  const timeFormatted = new Date(order.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      
                      {/* Order ID & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-black text-sm text-[#FF5722] block">
                          #{order.id}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {timeFormatted}
                        </span>
                      </td>

                      {/* Student Details */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div className="font-extrabold text-white text-xs">
                          {order.student_name}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px] truncate">
                          {order.student_email}
                        </div>
                        {order.student_phone && (
                          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                            <Phone size={10} />
                            <span>{order.student_phone}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-[#FF5722]" />
                          <span className="truncate">{order.delivery_location}</span>
                        </div>
                      </td>

                      {/* Restaurant */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-200">
                          {order.restaurant_name || 'Campus Kitchen'}
                        </span>
                      </td>

                      {/* Delivery Partner */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[170px]">
                        {order.delivery_partner_name ? (
                          <div className="space-y-1">
                            <div className="font-extrabold text-white text-xs flex items-center gap-1.5">
                              <span className="text-sm">🛵</span>
                              <span className="text-cyan-300 font-bold">{order.delivery_partner_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {order.delivery_partner_phone && (
                                <a
                                  href={`tel:${order.delivery_partner_phone}`}
                                  className="text-[11px] text-emerald-400 hover:underline font-mono font-bold flex items-center gap-1"
                                  title="Call Delivery Partner"
                                >
                                  <Phone size={10} />
                                  <span>{order.delivery_partner_phone}</span>
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => setOrderToAssignPartner(order)}
                                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 transition-colors cursor-pointer"
                              >
                                Change
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setOrderToAssignPartner(order)}
                            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 group"
                            title="Click to assign a delivery partner"
                          >
                            <span>🛵</span>
                            <span>Assign Partner</span>
                          </button>
                        )}
                      </td>

                      {/* Ordered Items */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-slate-300 line-clamp-2">
                          {orderItems.map((item, idx) => (
                            <span key={idx}>
                              {item.name} <strong className="text-white font-mono">x{item.quantity}</strong>
                              {idx < orderItems.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-mono font-black text-emerald-400 text-right whitespace-nowrap">
                        ₹{order.total_amount}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* 1-Click Quick Progression Button */}
                          {(() => {
                            const nextInfo = getNextStageInfo(order.status);
                            if (nextInfo) {
                              return (
                                <button
                                  onClick={() => onUpdateStatus && onUpdateStatus(order.id, nextInfo.nextStatus)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer border-none ${nextInfo.color}`}
                                  title={`Advance status to ${nextInfo.nextStatus}`}
                                >
                                  {nextInfo.label}
                                </button>
                              );
                            }
                            if (order.status === 'DELIVERED') {
                              return (
                                <span className="px-2.5 py-1 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-800 text-[10px] font-extrabold">
                                  Completed ✅
                                </span>
                              );
                            }
                            return null;
                          })()}

                          {/* View Details */}
                          <button
                            onClick={() => onInspectOrder(order)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Cancel Order */}
                          <button
                            onClick={() => onCancelOrder(order)}
                            disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Cancel Order"
                          >
                            <Ban size={14} />
                          </button>

                          {/* Delete Order */}
                          <button
                            onClick={() => onPromptDeleteOrder(order)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800/60 transition-colors cursor-pointer"
                            title="Permanently Delete Order"
                          >
                            <Trash2 size={14} />
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
      </div>

      {/* Sleek Interactive Delivery Partner Assignment Modal (Replaces all dropdown menus) */}
      {orderToAssignPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="admin-card w-full max-w-md p-6 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-3xl shadow-2xl space-y-5 animate-scale-in relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xl">
                  🛵
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-['Outfit']">
                    Assign Delivery Partner
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Order #{orderToAssignPartner.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrderToAssignPartner(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer border border-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Target Order Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span className="font-extrabold text-white">{orderToAssignPartner.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="text-emerald-400 font-bold">{orderToAssignPartner.delivery_location || 'SRM University - Gate 3'}</span>
              </div>
              {orderToAssignPartner.delivery_partner_name && (
                <div className="flex justify-between pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400">Currently Assigned:</span>
                  <span className="text-cyan-300 font-bold">{orderToAssignPartner.delivery_partner_name} ({orderToAssignPartner.delivery_partner_phone})</span>
                </div>
              )}
            </div>

            {/* Partners List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  Select Delivery Courier:
                </label>
                {onOpenDeliveryPartners && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderToAssignPartner(null);
                      onOpenDeliveryPartners();
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline font-bold cursor-pointer border-none bg-transparent"
                  >
                    + Add New Courier
                  </button>
                )}
              </div>

              {deliveryPartners.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                  <p>No delivery partners registered yet.</p>
                  {onOpenDeliveryPartners && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrderToAssignPartner(null);
                        onOpenDeliveryPartners();
                      }}
                      className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer border-none shadow-md shadow-cyan-500/20"
                    >
                      + Register Delivery Partner
                    </button>
                  )}
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {deliveryPartners.map((partner) => {
                    const isCurrent = orderToAssignPartner.delivery_partner_id === partner.id;
                    return (
                      <div
                        key={partner.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                          isCurrent
                            ? 'bg-cyan-500/15 border-cyan-500/50 shadow-sm'
                            : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-white text-xs sm:text-sm truncate">
                              {partner.name}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-black uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <Phone size={10} className="text-emerald-400" />
                            <span>{partner.phone}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onAssignPartner) {
                              onAssignPartner(orderToAssignPartner.id, partner);
                            }
                            setOrderToAssignPartner(null);
                          }}
                          className={`py-2 px-3.5 rounded-xl font-black text-xs cursor-pointer border-none transition-all shadow-md active:scale-95 flex items-center gap-1 shrink-0 ${
                            isCurrent
                              ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950'
                          }`}
                        >
                          <span>{isCurrent ? 'Reassign' : 'Assign'}</span>
                          <span>➔</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setOrderToAssignPartner(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer border border-slate-700"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
