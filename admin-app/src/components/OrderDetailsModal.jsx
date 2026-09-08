import React from 'react';
import { X, User, MapPin, Phone, Mail, Clock, Receipt, ShoppingBag } from 'lucide-react';

export default function OrderDetailsModal({ order, onClose, onUpdateStatus, onCancelOrder, onDeleteOrder }) {
  if (!order) return null;

  const orderItems = order.order_items || order.items || [];

  const statuses = [
    { key: 'CONFIRMED', label: 'CONFIRMED', color: 'bg-blue-600' },
    { key: 'PREPARING', label: '🍳 PREPARING', color: 'bg-amber-500 text-slate-950 font-black' },
    { key: 'READY', label: '📦 READY', color: 'bg-purple-600 text-white font-black' },
    { key: 'OUT_FOR_DELIVERY', label: '🚀 OUT_FOR_DELIVERY', color: 'bg-cyan-500 text-slate-950 font-black' },
    { key: 'DELIVERED', label: '✅ DELIVERED', color: 'bg-emerald-500 text-slate-950 font-black' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />

      <div className="relative bg-[#111827] border border-slate-700 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-white text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-[#FF5722]">
                #{order.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] uppercase border border-slate-700">
                {order.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Kitchen: <strong className="text-white">{order.restaurant_name || 'Campus Kitchen'}</strong>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Student Information */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User size={13} className="text-blue-400" />
            <span>Student Customer Information</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">Name:</span>
              <span className="font-bold">{order.student_name}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">Email:</span>
              <span className="font-mono truncate block">{order.student_email}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">Student ID:</span>
              <span className="font-mono">{order.student_id || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">Phone Contact:</span>
              {order.student_phone ? (
                <a
                  href={`tel:${order.student_phone}`}
                  className="text-emerald-400 hover:underline font-mono font-bold"
                >
                  {order.student_phone}
                </a>
              ) : (
                'Not provided'
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-500 block text-[10px]">Hostel Drop Location:</span>
            <div className="flex items-center gap-1.5 text-white font-bold mt-0.5">
              <MapPin size={13} className="text-[#FF5722]" />
              <span>{order.delivery_location}</span>
            </div>
          </div>

          {order.instructions && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-500 block text-[10px]">Student Cooking Instructions:</span>
              <p className="text-amber-300 italic mt-0.5">{order.instructions}</p>
            </div>
          )}
        </div>

        {/* Dishes List */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag size={13} className="text-blue-400" />
            <span>Ordered Dishes</span>
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60 divide-y divide-slate-800/80">
            {orderItems.map((item, idx) => (
              <div key={idx} className="p-2.5 px-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">{item.name}</span>
                  <span className="text-slate-400 ml-1.5 font-bold">x{item.quantity}</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between items-center text-sm font-black border-t border-slate-800">
            <span>Total Amount Paid</span>
            <span className="text-[#FF5722] font-mono text-base">₹{order.total_amount}</span>
          </div>
        </div>

        {/* Update Status Pipeline Controller */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Update Order Progress</span>
            <span className="text-blue-400 font-mono text-[10px]">Active: {order.status}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {statuses.map((st) => (
              <button
                key={st.key}
                onClick={() => onUpdateStatus && onUpdateStatus(order.id, st.key)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  order.status === st.key
                    ? `${st.color} border-white/40 shadow-md ring-2 ring-blue-500/50 scale-[1.02]`
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              onCancelOrder(order);
              onClose();
            }}
            disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
            className="py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            [ CANCEL ORDER ]
          </button>

          <button
            onClick={() => {
              onDeleteOrder(order);
              onClose();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 font-bold transition-colors cursor-pointer"
          >
            [ DELETE ORDER ]
          </button>
        </div>

      </div>
    </div>
  );
}
