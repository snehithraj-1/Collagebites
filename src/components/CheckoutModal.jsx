import React, { useState } from 'react';
import { X, MapPin, Phone, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CAMPUS_LOCATIONS, STUDENT_PROFILE } from '../data/campusFoodData';

export default function CheckoutModal({ isOpen, onClose, onOrderPlaced, onOrderSuccess }) {
  const { cart, finalTotal, placeOrder, selectedLocation, setSelectedLocation } = useCart();

  const [roomNo, setRoomNo] = useState(STUDENT_PROFILE.roomNumber);
  const [phone, setPhone] = useState(STUDENT_PROFILE.phone);
  const [paymentMethod, setPaymentMethod] = useState('UPI on Delivery (GPay / PhonePe)');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || cart.length === 0) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      placeOrder({
        block: selectedLocation.name,
        room: roomNo,
        phone: phone,
        paymentMethod: paymentMethod,
        notes: instructions
      });
      setIsSubmitting(false);
      onClose();
      if (onOrderPlaced) onOrderPlaced();
      if (onOrderSuccess) onOrderSuccess();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#F1EAE4] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#0F172A] font-['Outfit']">Checkout & Delivery</h2>
            <p className="text-xs text-[#64748B]">Complete your campus food order</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E2D9D0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Order Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-[#FFF0EB] border border-[#FFD3C4] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#9A3412]">Total to Pay</span>
              <div className="text-xl font-black text-[#FF5722] font-['Outfit']">₹{finalTotal}</div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white text-[#9A3412] shadow-xs">
              {cart.reduce((a, b) => a + b.qty, 0)} Items
            </span>
          </div>

          {/* Delivery Location Selector */}
          <div>
            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin size={14} className="text-[#FF5722]" />
              <span>Campus Delivery Spot</span>
            </label>
            <select
              value={selectedLocation.id}
              onChange={(e) => {
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === e.target.value);
                if (loc) setSelectedLocation(loc);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9D0] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#FF5722]"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} (Free Delivery)
                </option>
              ))}
            </select>
          </div>

          {/* Room Number & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5">
                Hostel Room / Floor
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Room 412, 4th Floor"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9D0] text-xs text-[#0F172A] focus:outline-none focus:border-[#FF5722]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone size={12} className="text-[#94A3B8]" />
                <span>Contact Phone</span>
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9D0] text-xs text-[#0F172A] focus:outline-none focus:border-[#FF5722]"
              />
            </div>
          </div>

          {/* Special Delivery Instructions */}
          <div>
            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5">
              Drop-Off Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Call when reaching hostel gate / Leave with security"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D9D0] text-xs text-[#0F172A] focus:outline-none focus:border-[#FF5722]"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CreditCard size={14} className="text-[#FF5722]" />
              <span>Select Payment Method</span>
            </label>
            <div className="space-y-2">
              {[
                { id: 'UPI on Delivery (GPay / PhonePe)', label: '📱 UPI on Delivery (Google Pay / PhonePe)', desc: 'Pay via QR code when food reaches your hostel' },
                { id: 'Cash on Delivery (COD)', label: '💵 Cash on Delivery', desc: 'Pay exact cash to campus delivery partner' },
                { id: 'Campus Meal Card Simulation', label: '💳 Student Campus Card', desc: 'Simulated meal account balance' }
              ].map((m) => (
                <label
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-colors ${
                    paymentMethod === m.id
                      ? 'bg-[#FFF0EB] border-[#FF5722] shadow-xs'
                      : 'bg-white border-[#E2D9D0] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="mt-0.5 accent-[#FF5722]"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#0F172A]">{m.label}</p>
                    <p className="text-[11px] text-[#64748B]">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4EFEA] text-[#475569] text-[11px]">
            <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
            <span>Zero delivery charges · SRM-AP campus verified delivery</span>
          </div>

          {/* Place Order CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-[#FF5722]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Placing Your Order... 🍳</span>
            ) : (
              <>
                <span>Confirm Order • ₹{finalTotal}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
