import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, MapPin, Receipt, ArrowRight, Home, ChefHat, PackageCheck, Bike, CheckCheck } from 'lucide-react';

export default function OrderSuccessPage({ order: initialOrder, onGoHome, onViewHistory }) {
  const [currentOrder, setCurrentOrder] = useState(initialOrder);

  // Poll shared backend every 2s for live status progression by Admin
  useEffect(() => {
    if (!initialOrder?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            const found = data.orders.find((o) => o.id === initialOrder.id);
            if (found) setCurrentOrder(found);
          }
        }
      } catch (e) {}
    }, 2000);

    return () => clearInterval(interval);
  }, [initialOrder?.id]);

  if (!currentOrder) return null;

  // Stages definition
  const STAGES = [
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'Cooking 🍳', icon: ChefHat },
    { key: 'READY', label: 'Ready 📦', icon: PackageCheck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery 🚀', icon: Bike },
    { key: 'DELIVERED', label: 'Delivered ✅', icon: CheckCheck }
  ];

  const currentIdx = STAGES.findIndex((s) => s.key === currentOrder.status);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6 animate-fade-in">
      
      {/* Top Success Badge */}
      <div className="card-elevated p-8 text-center space-y-4 border-emerald-500/30">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-4xl mx-auto shadow-md shadow-emerald-500/10 animate-bounce">
          {currentOrder.status === 'DELIVERED' ? '✅' : currentOrder.status === 'OUT_FOR_DELIVERY' ? '🛵' : '🎉'}
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
            {currentOrder.status === 'DELIVERED' ? 'Order Delivered!' : 'Live Order Tracking'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-['Outfit'] mt-2">
            {currentOrder.status === 'PREPARING'
              ? 'Chef is Preparing Your Food 🍳'
              : currentOrder.status === 'READY'
              ? 'Food is Packed & Ready for Pickup 📦'
              : currentOrder.status === 'OUT_FOR_DELIVERY'
              ? 'Delivery Partner is on the Way! 🚀'
              : currentOrder.status === 'DELIVERED'
              ? 'Meal Successfully Delivered to Your Room! 🎉'
              : currentOrder.status === 'CANCELLED'
              ? 'Order Has Been Cancelled'
              : 'Your Meal is Confirmed!'}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-md mx-auto">
            {currentOrder.status === 'OUT_FOR_DELIVERY'
              ? `Heading towards ${currentOrder.delivery_location}`
              : 'The kitchen and admin are processing your order in real time.'}
          </p>
        </div>

        {/* Live Stage Stepper Bar */}
        <div className="py-4 px-2 bg-[#FAF8F5] rounded-2xl border border-[#F1EAE4] my-2">
          <div className="flex items-center justify-between relative">
            {/* Connecting Bar */}
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-200 -z-0" />
            <div
              className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-[#FF5722] transition-all duration-700 -z-0"
              style={{ width: `${(activeIdx / (STAGES.length - 1)) * 90}%` }}
            />

            {STAGES.map((stage, idx) => {
              const isPassed = idx <= activeIdx;
              const isCurrent = idx === activeIdx;
              const Icon = stage.icon;

              return (
                <div key={stage.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCurrent
                        ? 'bg-[#FF5722] text-white ring-4 ring-[#FFE1D6] scale-110'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-slate-400 border-2 border-slate-300'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span className={`text-[10px] font-bold mt-1.5 hidden sm:block ${
                    isCurrent ? 'text-[#FF5722] font-black' : isPassed ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order ID & Estimated Time */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4]">
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Order Reference ID</div>
            <div className="text-sm sm:text-base font-black font-mono text-[#FF5722] mt-0.5">
              #{currentOrder.id}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4]">
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Current Status</div>
            <div className="text-sm sm:text-base font-black text-emerald-600 mt-0.5 uppercase tracking-wide">
              {currentOrder.status}
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
