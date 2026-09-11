import React from 'react';
import {
  X,
  Printer,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Utensils,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  XCircle,
  Clock
} from 'lucide-react';

export default function OrderDetailsModal({
  order,
  onClose,
  onStatusUpdate
}) {
  if (!order) return null;

  const items = Array.isArray(order.items)
    ? order.items
    : typeof order.items === 'string'
    ? JSON.parse(order.items || '[]')
    : [];

  const studentName = order.student_name || order.studentName || 'Student';
  const studentPhone = order.student_phone || order.studentPhone || '—';
  const studentEmail = order.student_email || order.studentEmail || '—';
  const restaurantName = order.restaurant_name || order.restaurantName || (order.restaurant_id === 'clg-bites-biryani-nation' ? 'CLG Bites' : 'Local Home Kitchen');
  const deliveryLocation = order.delivery_location || order.deliveryLocation || 'SRM AP Gate 3 Checkpoint';
  const totalAmount = Number(order.total_amount || order.totalAmount) || 0;
  const status = (order.status || 'pending').toLowerCase();
  const dateFormatted = order.created_at
    ? new Date(order.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#111C34] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black font-['Outfit'] text-white">
                Order #{order.id?.toString().slice(-8).toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-[#FF5722] text-[10px] font-extrabold uppercase border border-orange-500/30">
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{dateFormatted}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Print Order Receipt"
            >
              <Printer size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Customer & Location Details */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Customer Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div className="font-bold text-white text-sm">{studentName}</div>
              <div className="flex items-center gap-1.5 text-orange-400">
                <Phone size={13} />
                <a href={`tel:${studentPhone}`} className="hover:underline">{studentPhone}</a>
              </div>
              {studentEmail && studentEmail !== '—' && (
                <div className="flex items-center gap-1.5 text-slate-400 sm:col-span-2">
                  <Mail size={13} />
                  <span>{studentEmail}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-slate-300 sm:col-span-2">
                <MapPin size={13} className="text-rose-400 shrink-0" />
                <span>{deliveryLocation}</span>
              </div>
            </div>
          </div>

          {/* Kitchen Identity */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Utensils size={15} className="text-[#FF5722]" />
              <span className="font-bold text-white">{restaurantName}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <CreditCard size={13} />
              <span>Paid Online (UPI)</span>
            </div>
          </div>

          {/* Itemized Receipt Table */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Order Summary ({items.length} Items)
            </span>
            <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              {items.map((item, idx) => {
                const itemPrice = Number(item.price || 0);
                const qty = Number(item.quantity || 1);
                return (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">{item.name || item.dish_name}</div>
                      <div className="text-[11px] text-slate-400">₹{itemPrice} × {qty}</div>
                    </div>
                    <div className="font-extrabold text-white text-xs">
                      ₹{(itemPrice * qty).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Campus Delivery</span>
              <span className="text-emerald-400 font-semibold">FREE</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-sm text-white">
              <span>Total Bill</span>
              <span className="text-[#FF5722]">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#111C34] flex flex-wrap gap-2">
          {status !== 'accepted' && status !== 'delivered' && (
            <button
              type="button"
              onClick={() => {
                onStatusUpdate(order.id, 'accepted');
                onClose();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer border-none"
            >
              Accept Order
            </button>
          )}

          {status !== 'preparing' && status !== 'delivered' && (
            <button
              type="button"
              onClick={() => {
                onStatusUpdate(order.id, 'preparing');
                onClose();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer border-none"
            >
              Mark Preparing
            </button>
          )}

          {status !== 'ready' && status !== 'delivered' && (
            <button
              type="button"
              onClick={() => {
                onStatusUpdate(order.id, 'ready');
                onClose();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer border-none"
            >
              Ready for Pickup
            </button>
          )}

          {status !== 'delivered' && (
            <button
              type="button"
              onClick={() => {
                onStatusUpdate(order.id, 'delivered');
                onClose();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer border-none"
            >
              Mark Delivered
            </button>
          )}

          {status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this order?')) {
                  onStatusUpdate(order.id, 'cancelled');
                  onClose();
                }
              }}
              className="py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
