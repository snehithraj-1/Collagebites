import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ onOpenCheckout, onProceedToCheckout }) {
  const handleProceed = onOpenCheckout || onProceedToCheckout;
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    deliveryFee,
    platformFee,
    discountAmount,
    finalTotal,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    selectedLocation
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const success = applyCoupon(couponInput);
    if (success) setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-up sm:animate-slide-left">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#F1EAE4] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#FF5722]">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0F172A] font-['Outfit']">Your Campus Cart</h2>
              <p className="text-xs text-[#64748B]">{cart.length} unique dishes</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-white border border-[#F1EAE4] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drop-Off Location Pill */}
        <div className="px-6 py-3 bg-[#FFF0EB] border-b border-[#FFD3C4] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#9A3412] font-semibold">
            <MapPin size={15} className="text-[#FF5722] flex-shrink-0" />
            <span className="truncate">Delivering to: <strong>{selectedLocation.name}</strong></span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
            Free Delivery
          </span>
        </div>

        {/* Cart Items List or Empty State */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#F1EAE4]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 rounded-3xl bg-[#FAF8F5] border border-[#F1EAE4] flex items-center justify-center text-4xl mb-4 shadow-sm">
                🍽️
              </div>
              <h3 className="font-extrabold text-lg text-[#0F172A] mb-1 font-['Outfit']">Your Cart is Empty</h3>
              <p className="text-xs text-[#64748B] max-w-xs mb-6">
                Explore popular biryanis, rolls, and midnight snacks from campus food corners!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-primary"
              >
                <span>Browse Campus Menu</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center gap-3.5">
                {/* Item Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#F1EAE4] flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={item.isVeg ? 'veg-badge' : 'nonveg-badge'} />
                    <h4 className="font-bold text-sm text-[#0F172A] truncate">{item.name}</h4>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] truncate">{item.vendorName}</p>
                  <div className="font-black text-sm text-[#0F172A] font-['Outfit'] mt-1">
                    ₹{item.price * item.qty}
                  </div>
                </div>

                {/* Steppers */}
                <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E2D9D0] rounded-xl px-2 py-1 flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.qty - 1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-[#475569] hover:bg-white transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="font-bold text-xs text-[#0F172A] min-w-[14px] text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.qty + 1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-[#FF5722] hover:bg-white transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Plus size={11} />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-[#94A3B8] hover:text-[#EF4444] p-1 border-none bg-transparent cursor-pointer transition-colors"
                  title="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bottom Checkout & Bill Section */}
        {cart.length > 0 && (
          <div className="border-t border-[#F1EAE4] bg-[#FAF8F5] p-6 flex flex-col gap-4">
            
            {/* Coupon Code Input & Chips */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs">
                  <div className="flex items-center gap-2 text-[#065F46] font-bold">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> Applied!</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[#EF4444] font-bold hover:underline border-none bg-transparent cursor-pointer text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. CAMPUS50)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2D9D0] bg-white focus:outline-none focus:border-[#FF5722] uppercase font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-colors cursor-pointer border-none"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-[#EF4444] font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{couponError}</span>
                </p>
              )}

              {/* Quick Coupon Chip */}
              {!appliedCoupon && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => applyCoupon('CAMPUS50')}
                    className="text-[10px] font-bold px-2 py-1 rounded-md bg-white border border-[#E2D9D0] text-[#D97706] hover:border-[#FF5722] cursor-pointer flex items-center gap-1"
                  >
                    <span>⚡ Use <strong>CAMPUS50</strong> (50% OFF)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bill Summary */}
            <div className="space-y-1.5 text-xs text-[#475569]">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="font-semibold text-[#0F172A]">₹{cartSubtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Campus Delivery Fee</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Platform & Packaging Fee</span>
                <span className="font-semibold text-[#0F172A]">₹{platformFee}</span>
              </div>
              <div className="pt-2 border-t border-[#E2D9D0] flex justify-between text-base font-extrabold text-[#0F172A] font-['Outfit']">
                <span>Grand Total</span>
                <span className="text-[#FF5722]">₹{finalTotal}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                if (handleProceed) handleProceed();
              }}
              className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-[#FF5722]/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
