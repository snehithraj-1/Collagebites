import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Sparkles, ArrowRight, ShieldCheck, MapPin, Phone, Receipt } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OrderConfirmationModal() {
  const {
    isConfirmationModalOpen,
    setIsConfirmationModalOpen,
    pendingOrder,
    confirmOrder,
    cancelPendingOrder,
    confirmedOrderResult,
    setConfirmedOrderResult
  } = useApp();

  const [timeLeft, setTimeLeft] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeoutTriggered, setTimeoutTriggered] = useState(false);
  const [cancelledByStudent, setCancelledByStudent] = useState(false);
  const timerRef = useRef(null);

  // Reset timer whenever modal opens with a pending order
  useEffect(() => {
    if (isConfirmationModalOpen && pendingOrder) {
      setTimeLeft(30);
      setIsProcessing(false);
      setTimeoutTriggered(false);
      setCancelledByStudent(false);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isConfirmationModalOpen, pendingOrder]);

  const handleTimeout = () => {
    setTimeoutTriggered(true);
    cancelPendingOrder(true); // cancel with isTimeout = true
  };

  const handleConfirm = () => {
    if (isProcessing || timeLeft <= 0) return;
    setIsProcessing(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Call confirmOrder from AppContext
    confirmOrder();
    setIsProcessing(false);
  };

  const handleStudentCancel = () => {
    if (isProcessing) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setCancelledByStudent(true);
    cancelPendingOrder(false); // cancel with isTimeout = false
  };

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsConfirmationModalOpen(false);
    setConfirmedOrderResult(null);
    setTimeoutTriggered(false);
    setCancelledByStudent(false);
  };

  if (!isConfirmationModalOpen && !confirmedOrderResult) return null;

  // Percentage for progress ring / bar
  const progressPercent = (timeLeft / 30) * 100;
  const isUrgent = timeLeft <= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up my-8 border border-[#E2D9D0]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* SUCCESS STATE */}
        {confirmedOrderResult ? (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 border-2 border-emerald-300 mx-auto flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 size={44} />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs tracking-wider uppercase border border-emerald-200">
                Order Status: CONFIRMED ✅
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-['Outfit'] mt-3">
                Order Placed Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                The kitchen has received your order and started preparation.
              </p>
            </div>

            {/* Generated Order ID Highlight Card */}
            <div className="p-5 rounded-2xl bg-[#FFF8F5] border-2 border-[#FFD3C4] text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1EAE4]">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Order ID</span>
                  <div className="text-xl sm:text-2xl font-black text-[#FF5722] font-mono">
                    #{confirmedOrderResult.id}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Paid / COD</span>
                  <div className="text-xl font-black text-[#0F172A] font-['Outfit']">
                    ₹{confirmedOrderResult.totalAmount}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#334155]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#64748B]">Restaurant:</span>
                  <span className="font-extrabold text-[#0F172A]">{confirmedOrderResult.restaurantName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-[#FF5722]" />
                  <span><strong>Delivering to:</strong> {confirmedOrderResult.deliveryLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-[#10B981]" />
                  <span><strong>Contact:</strong> {confirmedOrderResult.studentPhone} ({confirmedOrderResult.studentName})</span>
                </div>
              </div>

              {/* Order items preview */}
              <div className="pt-2 border-t border-[#F1EAE4] text-xs">
                <span className="font-bold text-[#64748B]">Dishes Ordered:</span>
                <ul className="mt-1 space-y-1 text-slate-700 font-medium max-h-28 overflow-y-auto pr-1">
                  {confirmedOrderResult.items?.map((item, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>• {item.name} × {item.qty}</span>
                      <span className="font-bold">₹{item.price * item.qty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7A50] text-white font-extrabold text-sm shadow-xl shadow-[#FF5722]/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Back to Campus Kitchens</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : timeoutTriggered ? (
          /* TIMEOUT CANCELLED STATE */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-18 h-18 rounded-3xl bg-amber-100 border-2 border-amber-300 mx-auto flex items-center justify-center text-amber-600 shadow-lg shadow-amber-500/10">
              <Clock size={40} />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-extrabold text-xs tracking-wider uppercase border border-amber-200">
                Order Status: CANCELLED (TIMEOUT)
              </span>
              <h2 className="text-2xl font-black text-[#0F172A] font-['Outfit'] mt-3">
                30-Second Window Expired
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-2 max-w-sm mx-auto">
                Your order was automatically cancelled because it wasn't confirmed within the mandatory 30-second window. No charge has been applied.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 px-6 rounded-2xl bg-[#0F172A] text-white font-bold text-sm hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              Close & Review Cart
            </button>
          </div>
        ) : cancelledByStudent ? (
          /* STUDENT CANCELLED STATE */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-18 h-18 rounded-3xl bg-rose-100 border-2 border-rose-300 mx-auto flex items-center justify-center text-rose-600 shadow-lg shadow-rose-500/10">
              <XCircle size={40} />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-extrabold text-xs tracking-wider uppercase border border-rose-200">
                Order Status: CANCELLED
              </span>
              <h2 className="text-2xl font-black text-[#0F172A] font-['Outfit'] mt-3">
                Order Cancelled
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-2 max-w-sm mx-auto">
                You cancelled this order. The kitchen has not been notified and your cart remains safe.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 px-6 rounded-2xl bg-[#0F172A] text-white font-bold text-sm hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : pendingOrder ? (
          /* ACTIVE 30-SECOND CONFIRMATION STATE */
          <div>
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white p-6 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#FF5722]/20 blur-2xl" />
              
              <div className="flex items-center justify-between relative z-10 mb-4">
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#FF8A65] font-black text-xs uppercase tracking-wider border border-white/10">
                  Step: Final Verification
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {pendingOrder.restaurantName}
                </span>
              </div>

              {/* Requirement Text */}
              <div className="text-center relative z-10 space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#FF7A50]">
                  Required Confirmation
                </p>
                <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
                  You have 30 seconds to confirm your order.
                </h2>
              </div>

              {/* Circular / Big Timer Display */}
              <div className="mt-5 flex flex-col items-center justify-center relative z-10">
                <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 shadow-xl transition-all duration-500 ${
                  isUrgent 
                    ? 'border-rose-500 bg-rose-500/20 text-rose-300 animate-pulse scale-105' 
                    : 'border-[#FF5722] bg-[#FF5722]/20 text-white'
                }`}>
                  <span className="text-3xl font-black font-mono leading-none">
                    {timeLeft}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-slate-300">
                    seconds
                  </span>
                </div>

                {/* Linear progress bar */}
                <div className="w-full max-w-xs bg-slate-700/60 rounded-full h-2 mt-4 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      isUrgent ? 'bg-rose-500' : 'bg-gradient-to-r from-[#FF9800] to-[#FF5722]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Pending Order Summary Body */}
            <div className="p-6 space-y-4 bg-white">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4] space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#F1EAE4]">
                  <div>
                    <span className="text-[11px] text-[#64748B] font-bold">Student Name</span>
                    <div className="text-xs font-extrabold text-[#0F172A]">{pendingOrder.studentName}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#64748B] font-bold">Total Bill</span>
                    <div className="text-base font-black text-[#FF5722] font-['Outfit']">₹{pendingOrder.totalAmount}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#475569]">
                  <span><strong>Delivery:</strong> {pendingOrder.deliveryLocation}</span>
                  <span><strong>Items:</strong> {pendingOrder.items?.reduce((a, b) => a + b.qty, 0)}</span>
                </div>
              </div>

              {/* Action Buttons: [Confirm Order] and [Cancel Order] */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleStudentCancel}
                  disabled={isProcessing}
                  className="py-3 px-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-extrabold text-xs sm:text-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle size={16} />
                  <span>Cancel Order</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isProcessing || timeLeft <= 0}
                  className={`py-3 px-4 rounded-2xl text-white font-extrabold text-xs sm:text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isUrgent
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                      : 'bg-gradient-to-r from-[#FF5722] to-[#FF7A50] hover:brightness-105 shadow-[#FF5722]/30'
                  }`}
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Confirming...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Confirm Order ({timeLeft}s)</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-[11px] text-[#94A3B8] font-medium">
                Once confirmed, the order is registered and sent directly to {pendingOrder.restaurantName}.
              </p>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
