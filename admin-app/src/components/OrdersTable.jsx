import React, { useState } from 'react';
import { Eye, Ban, Trash2, MapPin, Clock, Search, Filter } from 'lucide-react';

export default function OrdersTable({
  orders,
  onInspectOrder,
  onCancelOrder,
  onPromptDeleteOrder
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchFilter = filterStatus === 'ALL' || order.status === filterStatus;
    const matchSearch =
      (order.id && order.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.student_name && order.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.student_email && order.student_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.restaurant_name && order.restaurant_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'PREPARING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
      case 'READY':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'OUT_FOR_DELIVERY':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse';
      case 'DELIVERED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'CANCELLED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'EXPIRED':
        return 'bg-slate-700/40 text-slate-400 border-slate-600';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
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
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, student, kitchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-52 sm:w-64"
            />
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PREPARING">PREPARING</option>
            <option value="READY">READY</option>
            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Order ID & Time</th>
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-4">Ordered Items</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
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
                        {order.student_id && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            ID: {order.student_id}
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

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-black text-emerald-400 text-sm">
                        ₹{order.total_amount}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
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
                            disabled={order.status === 'CANCELLED'}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Cancel Order"
                          >
                            Cancel
                          </button>

                          {/* Delete Order */}
                          <button
                            onClick={() => onPromptDeleteOrder(order)}
                            className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
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

    </div>
  );
}
