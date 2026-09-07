import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Phone, MessageSquare, MapPin, ChefHat, Bike, PackageCheck, AlertCircle, ArrowRight, RotateCw } from 'lucide-react';
import { useCart } from '../context/CartContext';

const STAGES = [
  { id: 1, title: "Order Placed", desc: "Your order has been received by the kitchen", icon: Clock },
  { id: 2, title: "Kitchen Confirmed", desc: "Restaurant accepted and confirmed your items", icon: ChefHat },
  { id: 3, title: "Cooking in Progress", desc: "Chef is preparing your fresh meal", icon: ChefHat },
  { id: 4, title: "Out for Delivery", desc: "Campus courier is heading to your hostel block", icon: Bike },
  { id: 5, title: "Delivered", desc: "Delivered to your room / hostel security", icon: PackageCheck }
];

export default function OrderTrackingPage({ onNavigateHome }) {
  const { activeOrder, setActiveOrder, showToast } = useCart();
  const [currentStage, setCurrentStage] = useState(activeOrder ? activeOrder.currentStage || 1 : 1);
  const [countdown, setCountdown] = useState(activeOrder ? activeOrder.estimatedMinutes || 20 : 20);

  // Sync stage to activeOrder
  useEffect(() => {
    if (activeOrder && activeOrder.currentStage) {
      setCurrentStage(activeOrder.currentStage);
    }
  }, [activeOrder]);

  // Next Stage simulation
  const handleAdvanceStage = () => {
    if (!activeOrder) return;
    const next = Math.min(5, currentStage + 1);
    setCurrentStage(next);
    setCountdown((prev) => Math.max(0, prev - 5));

    const updated = { ...activeOrder, currentStage: next };
    setActiveOrder(updated);

    if (next === 5) {
      showToast("Order Delivered! Enjoy your meal 🍔🎉");
    } else {
      showToast(`Order status updated to "${STAGES[next - 1].title}"!`);
    }
  };

  const handleCallPartner = () => {
    showToast("Calling Campus Delivery Rider (+91 7842960252)... 📞", "info");
  };

  const handleChatPartner = () => {
    showToast("Connecting to live campus chat support... 💬", "info");
  };

  if (!activeOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#FAF8F5] border border-[#F1EAE4] flex items-center justify-center text-4xl mx-auto mb-4">
          🛵
        </div>
        <h2 className="text-2xl font-black text-[#0F172A] font-['Outfit'] mb-2">No Active Order Right Now</h2>
        <p className="text-sm text-[#64748B] max-w-sm mx-auto mb-6">
          You haven't placed an active food order yet. Browse campus kitchens and get hot food delivered!
        </p>
        <button onClick={onNavigateHome} className="btn-primary">
          <span>Order Food Now</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 space-y-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header Summary Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white shadow-xl mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[11px] font-bold text-[#FF8A65] tracking-wider uppercase">Live Order Tracking</span>
              <h1 className="text-2xl sm:text-3xl font-black font-['Outfit']">
                Order #{activeOrder.id}
              </h1>
            </div>

            {/* Countdown Badge */}
            {currentStage < 5 ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <Clock size={16} className="text-[#F59E0B]" />
                <div>
                  <div className="text-xs font-semibold text-slate-300">Estimated Delivery</div>
                  <div className="text-base font-black text-amber-400 font-['Outfit']">~{countdown} mins</div>
                </div>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                ✅ ORDER DELIVERED
              </div>
            )}
          </div>

          <p className="text-xs text-slate-300">
            Delivering to: <strong className="text-white">{activeOrder.deliveredTo}</strong>
          </p>

          {/* Interactive Simulation Button for Demo Evaluation */}
          {currentStage < 5 && (
            <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Demo Simulator:</span>
              <button
                onClick={handleAdvanceStage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold transition-colors cursor-pointer border-none shadow-md"
              >
                <RotateCw size={13} />
                <span>Simulate Next Stage</span>
              </button>
            </div>
          )}
        </div>

        {/* 5-Stage Visual Progress Timeline */}
        <div className="p-6 bg-white rounded-3xl border border-[#F1EAE4] shadow-card space-y-6">
          <h2 className="text-lg font-extrabold text-[#0F172A] font-['Outfit']">
            Order Status Journey
          </h2>

          <div className="relative pl-6 space-y-7 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2D9D0]">
            {STAGES.map((stage) => {
              const isCompleted = currentStage >= stage.id;
              const isCurrent = currentStage === stage.id;
              const Icon = stage.icon;

              return (
                <div key={stage.id} className="relative flex items-start gap-4">
                  {/* Node Dot / Icon */}
                  <div
                    className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs transition-colors ${
                      isCompleted
                        ? 'bg-[#10B981] ring-4 ring-[#ECFDF5]'
                        : 'bg-[#CBD5E1]'
                    } ${isCurrent ? 'ring-4 ring-[#FFF0EB] bg-[#FF5722]' : ''}`}
                  >
                    {isCompleted && currentStage > stage.id ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Stage Text */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-bold ${
                          isCurrent
                            ? 'text-[#FF5722]'
                            : isCompleted
                            ? 'text-[#0F172A]'
                            : 'text-[#94A3B8]'
                        }`}
                      >
                        {stage.title}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#FFF0EB] text-[#FF5722] uppercase tracking-wider animate-pulse">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campus Courier Partner Card */}
        {currentStage >= 3 && (
          <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#F1EAE4] shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center font-bold text-xl font-['Outfit']">
                🛵
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0F172A]">Ramesh K.</h4>
                <p className="text-xs text-[#64748B]">SRM-AP Campus Courier Rider</p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
                  <span>★ 4.9 Rating</span>
                  <span>•</span>
                  <span>Vaccinated</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCallPartner}
                className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] flex items-center justify-center transition-colors cursor-pointer border-none"
                title="Call Rider"
              >
                <Phone size={18} />
              </button>
              <button
                onClick={handleChatPartner}
                className="w-10 h-10 rounded-2xl bg-[#FFF0EB] text-[#FF5722] hover:bg-[#FFE0D5] flex items-center justify-center transition-colors cursor-pointer border-none"
                title="Message Rider"
              >
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Order Receipt Breakdown */}
        <div className="p-6 bg-white rounded-3xl border border-[#F1EAE4] shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-[#0F172A] font-['Outfit']">
            Order Items
          </h3>

          <div className="divide-y divide-[#F1EAE4] text-xs">
            {activeOrder.items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#FF5722]">{item.qty}x</span>
                  <span className="font-medium text-[#0F172A]">{item.name}</span>
                </div>
                <span className="font-bold text-[#0F172A]">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#F1EAE4] space-y-1 text-xs text-[#475569]">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span>₹{activeOrder.subtotal}</span>
            </div>
            {activeOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Promo Discount</span>
                <span>-₹{activeOrder.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Campus Delivery</span>
              <span className="text-emerald-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span>₹{activeOrder.platformFee}</span>
            </div>
            <div className="pt-2 border-t border-[#F1EAE4] flex justify-between text-base font-extrabold text-[#0F172A]">
              <span>Total Paid ({activeOrder.paymentMethod})</span>
              <span className="text-[#FF5722]">₹{activeOrder.total}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
