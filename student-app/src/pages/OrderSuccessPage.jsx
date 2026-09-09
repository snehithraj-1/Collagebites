import React from 'react';
import { CheckCircle2, MapPin, ArrowRight, Home, Receipt, Phone, ShieldCheck, Printer, Clock } from 'lucide-react';

export default function OrderSuccessPage({ order, onGoHome, onViewHistory }) {
  if (!order) return null;

  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const orderItems = order.items || order.order_items || [];
  const subtotal = Math.max(0, (Number(order.total_amount) || 0) - 5);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 animate-fade-in pb-28 md:pb-16">
      
      {/* 1. Verified Order Confirmation Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-[#E2D9D0] shadow-sm space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 size={32} />
        </div>
        
        <div>
          <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider border border-emerald-200">
            Order Confirmed
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-['Outfit'] mt-2 tracking-tight">
            Thank You for Your Order!
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Your order has been confirmed and received by <strong className="text-[#0F172A]">{order.restaurant_name}</strong>.
          </p>
        </div>
      </div>

      {/* 2. Itemized Bill & Receipt Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E2D9D0] shadow-sm space-y-5">
        
        {/* Receipt Meta */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F1EAE4] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-[#0F172A] font-['Outfit']">CampusBites</span>
              <span className="px-2 py-0.5 rounded bg-[#FFF0EB] text-[#FF5722] text-[10px] font-black uppercase">
                Invoice
              </span>
            </div>
            <div className="text-xs text-[#0F172A] font-bold mt-1">
              {order.restaurant_name}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5 flex items-center gap-1">
              <Clock size={12} />
              <span>{orderDate}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Order ID
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-[#FF5722]">
              #{order.id}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 mt-1">
              <ShieldCheck size={11} />
              <span>Status: CONFIRMED</span>
            </div>
          </div>
        </div>

        {/* Student and Delivery Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2D9D0] text-xs">
          <div>
            <div className="font-bold text-[#64748B] uppercase text-[10px] tracking-wider mb-1">
              Student Details
            </div>
            <div className="font-bold text-[#0F172A] text-sm">{order.student_name}</div>
            {order.student_email && (
              <div className="text-[#64748B] text-[11px] font-mono mt-0.5">{order.student_email}</div>
            )}
            {order.student_phone && (
              <div className="text-[#64748B] flex items-center gap-1 mt-1 font-mono">
                <Phone size={11} className="text-[#FF5722]" />
                <span>{order.student_phone}</span>
              </div>
            )}
          </div>

          <div>
            <div className="font-bold text-[#64748B] uppercase text-[10px] tracking-wider mb-1">
              Delivery Drop Location
            </div>
            <div className="flex items-start gap-1.5 text-[#0F172A] font-bold">
              <MapPin size={14} className="text-[#FF5722] shrink-0 mt-0.5" />
              <span>{order.delivery_location || 'SRM University - Gate 3'}</span>
            </div>
            {order.instructions && (
              <div className="text-[#64748B] italic mt-1.5 text-[11px] bg-white p-2 rounded-lg border border-[#E2D9D0]">
                "{order.instructions}"
              </div>
            )}
          </div>
        </div>

        {/* Itemized Dishes List */}
        <div className="space-y-2">
          <div className="font-bold text-[#64748B] uppercase text-[10px] tracking-wider">
            Ordered Items
          </div>

          <div className="border border-[#E2D9D0] rounded-xl overflow-hidden divide-y divide-[#F1EAE4]">
            {orderItems.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded bg-[#FAF8F5] text-[#64748B] font-black text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-[#0F172A]">{item.name}</div>
                    <div className="text-[#64748B] text-[11px]">
                      ₹{item.price} × {item.quantity}
                    </div>
                  </div>
                </div>

                <div className="font-mono font-black text-xs sm:text-sm text-[#0F172A]">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2D9D0] space-y-1.5 text-xs">
          <div className="flex justify-between text-[#64748B]">
            <span>Items Subtotal</span>
            <span className="font-mono font-bold text-[#0F172A]">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Campus Platform Fee</span>
            <span className="font-mono font-bold text-[#0F172A]">₹5</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Campus Delivery</span>
            <span className="font-bold text-emerald-700 uppercase text-[11px]">Free Campus Delivery</span>
          </div>

          <div className="pt-2 border-t border-[#E2D9D0] flex justify-between items-center text-base font-black text-[#0F172A]">
            <span>Total Amount</span>
            <span className="text-[#FF5722] font-mono font-black text-xl">
              ₹{order.total_amount}
            </span>
          </div>
        </div>

        {/* Print / Save Receipt Action */}
        <div className="pt-1 flex justify-end">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E2D9D0] bg-white text-[#0F172A] text-xs font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Receipt</span>
          </button>
        </div>

      </div>

      {/* 3. Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={onGoHome}
          className="py-3 px-4 rounded-xl border border-[#E2D9D0] bg-white hover:bg-[#FAF8F5] text-[#0F172A] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Home size={15} />
          <span>Back to Home</span>
        </button>

        <button
          onClick={onViewHistory}
          className="py-3 px-4 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border-none shadow-sm transition-colors"
        >
          <span>View My Orders</span>
          <ArrowRight size={15} />
        </button>
      </div>

    </div>
  );
}
