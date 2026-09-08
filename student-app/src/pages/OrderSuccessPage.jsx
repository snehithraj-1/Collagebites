import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Receipt,
  ArrowRight,
  Home,
  ChefHat,
  PackageCheck,
  Bike,
  CheckCheck,
  Printer,
  ShoppingBag,
  Store,
  Phone,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function OrderSuccessPage({ order: initialOrder, onGoHome, onViewHistory }) {
  // Start on 'bill' view as requested: student sees the bill right away
  const [activeTab, setActiveTab] = useState('bill'); // 'bill' | 'tracking'
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
    { key: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2, desc: 'Order placed and waiting for kitchen acceptance.' },
    { key: 'ACCEPTED', label: 'Kitchen Accepted', icon: CheckCircle2, desc: 'Kitchen accepted your order and is preparing the cooking station.' },
    { key: 'PREPARING', label: 'Cooking in Kitchen', icon: ChefHat, desc: 'Chef is freshly cooking and packing your meal.' },
    { key: 'READY', label: 'Packed & Ready', icon: PackageCheck, desc: 'Your food is packaged and waiting at the dispatch counter.' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Bike, desc: 'Courier is heading directly to SRM University Gate 3!' },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCheck, desc: 'Food safely delivered to SRM University Gate 3. Enjoy your meal!' }
  ];

  const currentIdx = STAGES.findIndex((s) => s.key === currentOrder.status);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;
  const currentStageInfo = STAGES[activeIdx] || STAGES[0];

  const orderDate = currentOrder.created_at
    ? new Date(currentOrder.created_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const orderItems = currentOrder.items || currentOrder.order_items || [];
  const subtotal = Math.max(0, (Number(currentOrder.total_amount) || 0) - 5);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 animate-fade-in">
      
      {/* Top Navigation Tabs: Bill vs Track */}
      <div className="flex items-center justify-center">
        <div className="bg-white p-1.5 rounded-2xl border border-[#F1EAE4] shadow-xs flex items-center gap-1">
          <button
            onClick={() => setActiveTab('bill')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'bill'
                ? 'bg-[#FF5722] text-white shadow-md shadow-[#FF5722]/20'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5]'
            }`}
          >
            <Receipt size={16} />
            <span>Order Bill & Receipt</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-[#FF5722] text-white shadow-md shadow-[#FF5722]/20'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5]'
            }`}
          >
            <div className="relative">
              <Bike size={16} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span>Live Food Tracking</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase">
              {currentOrder.status}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ORDER BILL & RECEIPT (Default on redirect)        */}
      {/* ========================================================= */}
      {activeTab === 'bill' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Success Banner */}
          <div className="card-elevated p-6 sm:p-8 text-center bg-gradient-to-b from-white to-[#FAF8F5] border-emerald-500/30 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-3xl mx-auto shadow-sm">
              🎉
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                Order Placed Successfully
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-['Outfit'] mt-2">
                Thank You for Ordering!
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-md mx-auto">
                Your order has been transmitted to <strong className="text-[#0F172A]">{currentOrder.restaurant_name}</strong> and is being prepared.
              </p>
            </div>
          </div>

          {/* Itemized Printable Bill Box */}
          <div className="card-elevated bg-white p-6 sm:p-8 rounded-3xl border border-[#F1EAE4] shadow-lg space-y-6 relative overflow-hidden">
            
            {/* Bill Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F1EAE4] pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-[#0F172A] font-['Outfit']">CampusBites</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FFF0EB] text-[#FF5722] text-[10px] font-extrabold uppercase">
                    Invoice
                  </span>
                </div>
                <div className="text-xs text-[#64748B] mt-1">
                  Kitchen: <strong className="text-[#0F172A]">{currentOrder.restaurant_name}</strong>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Placed: {orderDate}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Reference ID</div>
                <div className="text-lg sm:text-xl font-black font-mono text-[#FF5722]">
                  #{currentOrder.id}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 mt-1">
                  <ShieldCheck size={12} />
                  <span>Confirmed & Paid</span>
                </div>
              </div>
            </div>

            {/* Student & Delivery Destination Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4] text-xs">
              <div>
                <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                  Student Details
                </div>
                <div className="font-bold text-[#0F172A] text-sm">{currentOrder.student_name}</div>
                {currentOrder.student_email && (
                  <div className="text-[#64748B] text-[11px] font-mono mt-0.5">{currentOrder.student_email}</div>
                )}
                {currentOrder.student_phone && (
                  <div className="text-[#64748B] flex items-center gap-1 mt-1">
                    <Phone size={11} className="text-[#FF5722]" />
                    <span>{currentOrder.student_phone}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                  Campus Drop Location
                </div>
                <div className="flex items-start gap-1.5 text-[#0F172A] font-bold">
                  <MapPin size={14} className="text-[#FF5722] shrink-0 mt-0.5" />
                  <span>{currentOrder.delivery_location || 'SRM University - Gate 3'}</span>
                </div>
                {currentOrder.instructions && (
                  <div className="text-[#64748B] italic mt-1.5 text-[11px] bg-white p-2 rounded-xl border border-[#E2D9D0]">
                    "{currentOrder.instructions}"
                  </div>
                )}
              </div>
            </div>

            {/* Itemized Table of Dishes */}
            <div className="space-y-3">
              <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                Ordered Dishes & Quantity
              </div>

              <div className="border border-[#F1EAE4] rounded-2xl overflow-hidden divide-y divide-[#F1EAE4]">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs bg-white hover:bg-[#FAF8F5] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-[#FFF0EB] text-[#FF5722] font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-[#0F172A]">{item.name}</div>
                        <div className="text-slate-400 text-[11px]">
                          ₹{item.price} × {item.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="font-mono font-black text-sm text-[#0F172A]">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Calculations */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4] space-y-2 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Food Items Subtotal</span>
                <span className="font-mono font-bold text-[#0F172A]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Campus Packaging & Platform Fee</span>
                <span className="font-mono font-bold text-[#0F172A]">₹5</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Hostel Doorstep Delivery</span>
                <span className="font-bold text-emerald-600 uppercase text-[11px]">Free Campus Delivery</span>
              </div>

              <div className="pt-2 border-t border-[#E2D9D0] flex justify-between items-center text-base sm:text-lg font-black text-[#0F172A]">
                <span>Total Amount Paid</span>
                <span className="text-[#FF5722] font-mono font-black text-xl">
                  ₹{currentOrder.total_amount}
                </span>
              </div>
            </div>

          </div>

          {/* Delivery Partner Details & 1-Tap Calling Card (Bill View) */}
          {currentOrder.delivery_partner_name && (
            <div className="card-elevated p-5 sm:p-6 bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-2 border-emerald-500/50 rounded-3xl text-white shadow-xl space-y-3 relative overflow-hidden animate-slide-down">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-md shrink-0">
                    🛵
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                        Your Delivery Partner
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <h3 className="text-lg font-black text-white font-['Outfit'] mt-0.5">
                      {currentOrder.delivery_partner_name}
                    </h3>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                      Mobile: {currentOrder.delivery_partner_phone || 'Available'}
                    </p>
                  </div>
                </div>

                {currentOrder.delivery_partner_phone && (
                  <a
                    href={`tel:${currentOrder.delivery_partner_phone}`}
                    className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer border-none shrink-0"
                  >
                    <Phone size={16} className="animate-bounce" />
                    <span>Call Delivery Partner</span>
                  </a>
                )}
              </div>

              <div className="text-[11px] text-emerald-300/90 bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-800/60 flex items-center gap-2">
                <MapPin size={13} className="text-emerald-400 shrink-0" />
                <span>Delivery Location: <strong>SRM University - Gate 3</strong> (Doorstep handover)</span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* USER REQUESTED ACTION BOX: TRACK ORDER & GO TO HOME PAGE  */}
          {/* ========================================================= */}
          <div className="card-elevated p-6 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white rounded-3xl shadow-xl space-y-4 border border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
              <div>
                <h4 className="text-base sm:text-lg font-black font-['Outfit'] flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  <span>What would you like to do next?</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track your food delivery progress live or return to browse more menus.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-300">Live Status:</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                  {currentOrder.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Button 1: Track the Order */}
              <button
                onClick={() => setActiveTab('tracking')}
                className="btn-primary py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer border-none shadow-lg shadow-[#FF5722]/30 group"
              >
                <Bike size={18} className="group-hover:translate-x-1 transition-transform" />
                <span>Track Your Food Live</span>
                <ArrowRight size={14} />
              </button>

              {/* Button 2: Go to Home Page */}
              <button
                onClick={onGoHome}
                className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition-colors"
              >
                <Home size={17} />
                <span>Go to Home Page</span>
              </button>
            </div>

            {/* Print button */}
            <div className="pt-2 text-center">
              <button
                onClick={() => window.print()}
                className="text-xs text-slate-400 hover:text-white font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={13} />
                <span>Print / Save Receipt as PDF</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LIVE FOOD TRACKING VIEW                            */}
      {/* ========================================================= */}
      {activeTab === 'tracking' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Tracking Main Card */}
          <div className="card-elevated p-6 sm:p-8 text-center space-y-6 border-emerald-500/30 bg-white">
            
            {/* Status Animation Icon */}
            <div className="w-20 h-20 rounded-3xl bg-[#FFF0EB] text-[#FF5722] border border-[#FFD3C4] flex items-center justify-center text-4xl mx-auto shadow-md">
              {currentOrder.status === 'DELIVERED'
                ? '🎉'
                : currentOrder.status === 'OUT_FOR_DELIVERY'
                ? '🛵'
                : currentOrder.status === 'READY'
                ? '📦'
                : currentOrder.status === 'PREPARING'
                ? '🍳'
                : '📋'}
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-Time Kitchen Feed</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-['Outfit'] mt-2">
                {currentOrder.status === 'PREPARING'
                  ? 'Chef is Cooking Your Food 🍳'
                  : currentOrder.status === 'READY'
                  ? 'Food is Packed & Ready for Pickup 📦'
                  : currentOrder.status === 'OUT_FOR_DELIVERY'
                  ? 'Delivery Partner is on the Way! 🛵'
                  : currentOrder.status === 'DELIVERED'
                  ? 'Meal Delivered to Your Room! Enjoy! 🎉'
                  : currentOrder.status === 'CANCELLED'
                  ? 'Order Has Been Cancelled'
                  : 'Order Confirmed by Kitchen!'}
              </h2>

              <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-md mx-auto">
                {currentStageInfo.desc}
              </p>
            </div>

            {/* 5-Stage Visual Stepper */}
            <div className="py-6 px-3 bg-[#FAF8F5] rounded-3xl border border-[#F1EAE4]">
              <div className="flex items-center justify-between relative">
                {/* Background Connecting Line */}
                <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1.5 bg-slate-200 -z-0 rounded-full" />
                {/* Active Filled Line */}
                <div
                  className="absolute top-1/2 left-4 -translate-y-1/2 h-1.5 bg-gradient-to-r from-[#FF5722] to-emerald-500 transition-all duration-700 -z-0 rounded-full"
                  style={{ width: `${(activeIdx / (STAGES.length - 1)) * 90}%` }}
                />

                {STAGES.map((stage, idx) => {
                  const isPassed = idx <= activeIdx;
                  const isCurrent = idx === activeIdx;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.key} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCurrent
                            ? 'bg-[#FF5722] text-white ring-4 ring-[#FFE1D6] scale-110 shadow-md shadow-[#FF5722]/30'
                            : isPassed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-slate-400 border-2 border-slate-300'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <span className={`text-[10px] sm:text-xs font-bold mt-2 ${
                        isCurrent
                          ? 'text-[#FF5722] font-black'
                          : isPassed
                          ? 'text-slate-800 font-bold'
                          : 'text-slate-400'
                      }`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4]">
                <div className="text-[10px] uppercase font-bold text-[#64748B]">Order ID</div>
                <div className="text-sm font-black font-mono text-[#FF5722] mt-0.5">
                  #{currentOrder.id}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4]">
                <div className="text-[10px] uppercase font-bold text-[#64748B]">Destination</div>
                <div className="text-xs font-bold text-[#0F172A] truncate mt-0.5">
                  {currentOrder.delivery_location}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4]">
                <div className="text-[10px] uppercase font-bold text-[#64748B]">Est. Time</div>
                <div className="text-xs font-bold text-emerald-600 mt-0.5">
                  {currentOrder.status === 'DELIVERED'
                    ? 'Delivered ✅'
                    : currentOrder.status === 'OUT_FOR_DELIVERY'
                    ? '5-10 mins away'
                    : '15-20 mins prep'}
                </div>
              </div>
            </div>

            {/* Delivery Partner Details & 1-Tap Calling Card (Tracking View) */}
            {currentOrder.delivery_partner_name && (
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-2 border-emerald-500/50 rounded-3xl text-white shadow-xl space-y-3 relative overflow-hidden text-left animate-slide-down">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-md shrink-0">
                      🛵
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                          Assigned Delivery Partner
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <h3 className="text-lg font-black text-white font-['Outfit'] mt-0.5">
                        {currentOrder.delivery_partner_name}
                      </h3>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        Mobile: {currentOrder.delivery_partner_phone || 'Available'}
                      </p>
                    </div>
                  </div>

                  {currentOrder.delivery_partner_phone && (
                    <a
                      href={`tel:${currentOrder.delivery_partner_phone}`}
                      className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer border-none shrink-0"
                    >
                      <Phone size={16} className="animate-bounce" />
                      <span>Call Delivery Partner</span>
                    </a>
                  )}
                </div>

                <div className="text-[11px] text-emerald-300/90 bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-800/60 flex items-center gap-2">
                  <MapPin size={13} className="text-emerald-400 shrink-0" />
                  <span>Doorstep Handover Destination: <strong>SRM University - Gate 3</strong></span>
                </div>
              </div>
            )}

          </div>

          {/* Quick Action Navigation Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('bill')}
              className="py-3.5 px-5 rounded-2xl bg-white hover:bg-[#FAF8F5] text-[#0F172A] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer border border-[#E2D9D0] shadow-sm transition-colors"
            >
              <Receipt size={16} className="text-[#FF5722]" />
              <span>View Order Bill & Receipt</span>
            </button>

            <button
              onClick={onGoHome}
              className="btn-primary py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer border-none shadow-md"
            >
              <Home size={16} />
              <span>Go to Home Page</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
