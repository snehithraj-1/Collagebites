import React from 'react';
import { CheckCircle2, Clock, MapPin, Receipt, ArrowRight, Home } from 'lucide-react';

export default function OrderSuccessPage({ order, onGoHome, onViewHistory }) {
  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6 animate-fade-in">
      
      {/* Top Success Badge */}
      <div className="card-elevated p-8 text-center space-y-4 border-emerald-500/30">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-4xl mx-auto shadow-md shadow-emerald-500/10 animate-bounce">
          🎉
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
            Order Confirmed Successfully
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-['Outfit'] mt-2">
            Your Meal is Cooking!
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-md mx-auto">
            The kitchen has received your order and started preparation. It will be delivered directly to your hostel room.
          </p>
        </div>

        {/* Order ID & Estimated Time */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4]">
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Order Reference ID</div>
            <div className="text-sm sm:text-base font-black font-mono text-[#FF5722] mt-0.5">
              #{order.id}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4]">
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Estimated Arrival</div>
            <div className="text-sm sm:text-base font-black text-emerald-600 mt-0.5">
              20 - 30 Minutes
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Receipt */}
      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1EAE4] pb-3">
          <h3 className="font-extrabold text-sm text-[#0F172A] font-['Outfit'] flex items-center gap-2">
            <Receipt size={16} className="text-[#FF5722]" />
            <span>Digital Order Receipt</span>
          </h3>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Delivery Address Details */}
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4] text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
            <MapPin size={13} className="text-[#FF5722]" />
            <span>Delivery Destination</span>
          </div>
          <div className="text-[#64748B] pl-4">
            {order.delivery_location}
          </div>
          {order.student_phone && (
            <div className="text-[#64748B] pl-4">
              Phone: {order.student_phone}
            </div>
          )}
        </div>

        {/* Dish Items */}
        <div className="divide-y divide-[#F1EAE4] text-xs">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0F172A]">{item.name}</span>
                <span className="text-slate-400 font-bold ml-1.5">x{item.quantity}</span>
              </div>
              <span className="font-mono font-bold text-[#0F172A]">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="pt-3 border-t border-[#F1EAE4] space-y-1.5 text-xs text-[#64748B]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-[#0F172A]">₹{Math.max(0, order.total_amount - 5)}</span>
          </div>
          <div className="flex justify-between">
            <span>Campus Platform Fee</span>
            <span className="font-mono text-[#0F172A]">₹5</span>
          </div>
          <div className="flex justify-between">
            <span>Hostel Doorstep Delivery</span>
            <span className="font-bold text-emerald-600">FREE</span>
          </div>
          <div className="pt-2 border-t border-[#F1EAE4] flex justify-between items-center text-sm font-black text-[#0F172A]">
            <span>Total Paid</span>
            <span className="text-[#FF5722] font-mono text-base">₹{order.total_amount}</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onViewHistory}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border-none shadow-md"
        >
          <Clock size={16} className="text-amber-400" />
          <span>View My Order History</span>
        </button>

        <button
          onClick={onGoHome}
          className="btn-primary w-full py-3.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border-none"
        >
          <Home size={16} />
          <span>Order From Another Kitchen</span>
        </button>
      </div>

    </div>
  );
}
