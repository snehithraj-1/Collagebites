import React from 'react';
import { X, User, MapPin, Phone, Mail, Clock, ShieldCheck, Ban, Trash2, CheckCircle2 } from 'lucide-react';

export default function OrderDetailsModal({
  order,
  onClose,
  onCancelOrder,
  onDeleteOrder
}) {
  if (!order) return null;

  const rawItems = order.order_items || order.items || [];
  let itemsArr = [];
  if (typeof rawItems === 'string') {
    try { itemsArr = JSON.parse(rawItems); } catch { itemsArr = []; }
  } else if (Array.isArray(rawItems)) {
    itemsArr = rawItems;
  }

  const d = order.created_at ? new Date(order.created_at) : new Date();
  const dateFormatted = d.toLocaleDateString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg text-white shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-base text-[#FF5722]">
                #{order.id}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                order.status === 'CANCELLED'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {order.status || 'CONFIRMED'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Clock size={12} />
              <span>{dateFormatted}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Restaurant & Location */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Kitchen:</span>
              <strong className="text-white text-sm">{order.restaurant_name || 'Campus Kitchen'}</strong>
            </div>
            <div className="flex items-start gap-1.5 text-slate-300 pt-1 border-t border-slate-800/80">
              <MapPin size={14} className="text-[#FF5722] shrink-0 mt-0.5" />
              <span>{order.delivery_location || 'SRM University - Gate 3'}</span>
            </div>
            {order.instructions && (
              <div className="text-[11px] text-amber-300 italic pt-1">
                Note: "{order.instructions}"
              </div>
            )}
          </div>

          {/* Student Contact Details */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Student Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <User size={13} className="text-slate-400" />
                <span className="font-bold text-white truncate">{order.student_name}</span>
              </div>
              {order.student_phone && (
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-[#FF5722]" />
                  <a
                    href={`tel:${order.student_phone}`}
                    className="font-mono font-bold text-white hover:underline"
                  >
                    {order.student_phone}
                  </a>
                </div>
              )}
            </div>
            {order.student_email && (
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] pt-1 border-t border-slate-800/60 truncate">
                <Mail size={12} />
                <span>{order.student_email}</span>
              </div>
            )}
          </div>

          {/* Ordered Dishes Table */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Ordered Items ({itemsArr.length})
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 text-xs">
              {itemsArr.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between bg-slate-950/40">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 text-[11px]">{idx + 1}.</span>
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-slate-400 text-[10px]">
                        ₹{item.price} × {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-black text-white text-xs sm:text-sm">
                    ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount Summary */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Bill Amount</div>
              <div className="text-xs text-slate-400">Payment: {order.payment_method || 'Cash on Delivery'}</div>
            </div>
            <div className="font-mono font-black text-xl text-emerald-400">
              ₹{order.total_amount}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {order.status !== 'CANCELLED' && onCancelOrder && (
              <button
                onClick={() => {
                  onCancelOrder(order.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Ban size={13} />
                <span>Cancel Order</span>
              </button>
            )}

            {onDeleteOrder && (
              <button
                onClick={() => {
                  onDeleteOrder(order);
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 cursor-pointer transition-colors"
                title="Permanently Delete Order"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer border-none"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
